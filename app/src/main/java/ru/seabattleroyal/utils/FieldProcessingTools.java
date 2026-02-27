package ru.seabattleroyal.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import ru.seabattleroyal.game.Field;

import java.util.HashSet;
import java.util.Set;

@Component
@Slf4j
public class FieldProcessingTools {

    public boolean isFieldCorrect(Field field) {
        try {
            Set<Set<Field.Position>> ships = getShipsSet(field);
            log.debug("Ships. Input {}, output {}", field, ships);
            log.debug("Ships count: {}. 4-cells: {}, 3-cells: {}, 2-cells: {}, 1-cell: {}. Is others: {}",
                    ships.size(),
                    ships.stream().filter(ship -> ship.size() == 4).count(),
                    ships.stream().filter(ship -> ship.size() == 3).count(),
                    ships.stream().filter(ship -> ship.size() == 2).count(),
                    ships.stream().filter(ship -> ship.size() == 1).count(),
                    ships.stream().noneMatch(ship -> ship.size() != 4 && ship.size() != 3 && ship.size() != 2 && ship.size() != 1)
            );

            return ships.size() == 10
                    && ships.stream().filter(ship -> ship.size() == 4).count() == 1
                    && ships.stream().filter(ship -> ship.size() == 3).count() == 2
                    && ships.stream().filter(ship -> ship.size() == 2).count() == 3
                    && ships.stream().filter(ship -> ship.size() == 1).count() == 4
                    && ships.stream().noneMatch(ship -> ship.size() != 4 && ship.size() != 3 && ship.size() != 2 && ship.size() != 1);
        } catch (Exception e) {
            log.error("", e);
            return false;
        }
    }

    public Set<Set<Field.Position>> getShipsSet(Field field) throws InvalidShipException {
        Set<Set<Field.Position>> ships = new HashSet<>();
        for (int y = 0; y < field.getSizeY(); y++) {
            for (int x = 0; x < field.getSizeX(); x++) {
                boolean found = false;
                for (Set<Field.Position> ship : ships) {
                    if (ship.contains(new Field.Position(x, y))) {
                        found = true;
                        break;
                    }
                }
                if (found) continue;
                if (isShip(field, x, y)) {
                    Set<Field.Position> newShip = findTheShip(field, new Field.Position(x, y));
                    ships.add(newShip);
                }
            }
        }
        return ships;
    }

    private Set<Field.Position> findTheShip(Field field, Field.Position start) throws InvalidShipException {
        Set<Field.Position> positions = new HashSet<>();

        Field.Position target = new Field.Position(start.getX(), start.getY());
        Direction direction = null;

        if (isShip(field, target.getX() + 1, target.getY())) {
            direction = Direction.LEFT;
        }
        if (isShip(field, target.getX(), target.getY() + 1)) {
            if (direction == Direction.LEFT)
                throw new InvalidShipException();
            direction = Direction.DOWN;
        } else if (direction == null) {
            if (isShip(field, target.getX() + 1, target.getY() + 1))
                throw new InvalidShipException();
            if (isShip(field, target.getX() - 1, target.getY() + 1))
                throw new InvalidShipException();

            positions.add(new Field.Position(target.getX(), target.getY()));
            return positions;
        }

        while (isShip(field, target.getX(), target.getY())) {
            if (isShip(field, target.getX() + 1, target.getY() + 1))
                throw new InvalidShipException();
            if (isShip(field, target.getX() - 1, target.getY() + 1))
                throw new InvalidShipException();

            positions.add(new Field.Position(target.getX(), target.getY()));
            if (direction == Direction.LEFT)
                target.setX(target.getX() + 1);
            else
                target.setY(target.getY() + 1);
        }
        return positions;
    }

    private boolean isShip(Field field, int x, int y) {
        return field.getCell(x, y) == Field.CellType.SHIP || field.getCell(x, y) == Field.CellType.WOUNDED || field.getCell(x, y) == Field.CellType.DEAD;
    }

    public static class InvalidShipException extends RuntimeException {
        public InvalidShipException() {
            super();
        }
    }

    private enum Direction {
        DOWN, LEFT
    }

}