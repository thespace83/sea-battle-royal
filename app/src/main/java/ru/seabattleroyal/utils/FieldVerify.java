package ru.seabattleroyal.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import ru.seabattleroyal.game.Field;

import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class FieldVerify {

    public boolean isFieldCorrect(Field field) {
        try {
            List<List<Field.Position>> ships = getShipsList(field);
            System.out.println(ships);
            return false;
        } catch (Exception e) {
            log.warn(e.fillInStackTrace().toString());
            e.fillInStackTrace();
            return false;
        }
    }

    private List<List<Field.Position>> getShipsList(Field field) throws InvalidShipException {
        List<List<Field.Position>> ships = new ArrayList<>();
        for (int y = 0; y < field.getSizeY(); y++) {
            for (int x = 0; x < field.getSizeX(); x++) {
                boolean found = false;
                for (List<Field.Position> ship : ships) {
                    if (ship.contains(new Field.Position(x, y))) {
                        found = true;
                        break;
                    }
                }
                if (found) continue;
                if (field.getCell(x, y) == Field.CellType.SHIP) {
                    List<Field.Position> newShip = findTheShip(field, new Field.Position(x, y));
                    ships.add(newShip);
                }
            }
        }
        return ships;
    }

    private List<Field.Position> findTheShip(Field field, Field.Position start) throws InvalidShipException {
        List<Field.Position> positions = new ArrayList<>();

        Field.Position target = new Field.Position(start.getX(), start.getY());
        Direction direction = null;

        if (field.getCell(target.getX() + 1, target.getY()) == Field.CellType.SHIP) {
            direction = Direction.LEFT;
        }
        if (field.getCell(target.getX(), target.getY() + 1) == Field.CellType.SHIP) {
            if (direction == Direction.LEFT)
                throw new InvalidShipException();
            direction = Direction.DOWN;
        } else if (direction == null) {
            if (field.getCell(target.getX() + 1, target.getY() + 1) == Field.CellType.SHIP)
                throw new InvalidShipException();
            if (field.getCell(target.getX() - 1, target.getY() + 1) == Field.CellType.SHIP)
                throw new InvalidShipException();

            positions.add(new Field.Position(target.getX(), target.getY()));
            return positions;
        }
        while (field.getCell(target.getX(), target.getY()) == Field.CellType.SHIP) {
            if (field.getCell(target.getX() + 1, target.getY() + 1) == Field.CellType.SHIP)
                throw new InvalidShipException();
            if (field.getCell(target.getX() - 1, target.getY() + 1) == Field.CellType.SHIP)
                throw new InvalidShipException();

            positions.add(new Field.Position(target.getX(), target.getY()));
            if (direction == Direction.LEFT)
                target.setX(target.getX() + 1);
            else
                target.setY(target.getY() + 1);
        }
        return positions;
    }

    private static class InvalidShipException extends Exception {
        public InvalidShipException() {
            super();
        }
    }

    private enum Direction {
        DOWN, LEFT
    }

}