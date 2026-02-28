package ru.seabattleroyal.game;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import ru.seabattleroyal.utils.FieldProcessingTools;

import java.util.*;

@Slf4j
@Getter
@Setter
public class Player {

    private static final Random random = new Random();
    private static final FieldProcessingTools fieldProcessingTools = new FieldProcessingTools();

    String username;
    int color;
    String uuid;
    String cookieSessionUuid;
    String webSocketSessionId;
    Field field;

    public Player(String username, String cookieSessionUuid, String webSocketSessionId) {
        this.username = username;
        this.uuid = UUID.randomUUID().toString();
        this.cookieSessionUuid = cookieSessionUuid;
        this.webSocketSessionId = webSocketSessionId;
        this.field = null;
        this.color = List.of(0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff).get(random.nextInt(0, 5));
    }

    public boolean isAlive() {
        for (int y = 0; y < field.getSizeY();  y++) {
            for (int x = 0; x < field.getSizeX(); x++) {
                if (field.getCell(x, y) == Field.CellType.SHIP)
                    return true;
            }
        }
        return false;
    }

    public void attack(Field.Position position) {
        Set<Set<Field.Position>> ships = fieldProcessingTools.getShipsSet(field);
        if (field.getCell(position) == Field.CellType.SHIP) {
            field.setCell(position, Field.CellType.WOUNDED);
        }

        ships.forEach(ship -> {
            if (!ship.contains(position)) return;

            for (Field.Position cell : ship) {
                if (field.getCell(cell) == Field.CellType.SHIP)
                    return;
            }

            ship.forEach(cell -> field.setCell(cell, Field.CellType.DEAD));
        });
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof Player) {
            return ((Player) obj).uuid.equals(this.uuid);
        }
        return super.equals(obj);
    }

    @Override
    public int hashCode() {
        return Objects.hash(uuid);
    }
}
