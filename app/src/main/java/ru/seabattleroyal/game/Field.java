package ru.seabattleroyal.game;

import lombok.Getter;
import lombok.Setter;

public class Field {

    private final CellType[][] field;
    @Getter
    private final int sizeX;
    @Getter
    private final int sizeY;

    public Field(CellType defaultField) {
        sizeX = 10;
        sizeY = 10;
        field = new CellType[10][10];
        for (int y = 0; y < 10; y++) {
            for (int x = 0; x < 10; x++) {
                field[y][x] = defaultField;
            }
        }
    }

    public Field(CellType[][] field) {
        sizeX = 10;
        sizeY = 10;
        this.field = field;
    }

    public void setCell(int x, int y, CellType cell) {
        field[y][x] = cell;
    }

    public CellType getCell(int x, int y) {
        return field[y][x];
    }

    @Getter
    public enum CellType {
        UNKNOWN(1),
        SHIP(2),
        EMPTY(3),
        WOUNDED(4),
        DEAD(5);

        private final int code;

        CellType(int code) {
            this.code = code;
        }
    }

    @Getter
    @Setter
    public static class Position {
        private int x;
        private int y;

        public Position(int x, int y) {
            this.x = x;
            this.y = y;
        }

        @Override
        public String toString() {
            return "(" + x + "," + y + ")";
        }

        @Override
        public boolean equals(Object obj) {
            if (obj instanceof Position) {
                return (((Position) obj).getX() == this.x && ((Position) obj).getY() == this.y);
            }
            return super.equals(obj);
        }
    }
}
