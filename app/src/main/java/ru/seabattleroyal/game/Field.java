package ru.seabattleroyal.game;

import lombok.Getter;
import lombok.Setter;

public class Field {

    private final CellType[][] field;

    public Field(CellType defaultField) {
        field = new CellType[10][10];
        for (int y = 0; y < 10; y++) {
            for (int x = 0; x < 10; x++) {
                field[y][x] = defaultField;
            }
        }
    }

    public Field(CellType[][] field) {
        this.field = field;
    }

    public void setCell(int x, int y, CellType cell) {
        field[y][x] = cell;
    }

    public CellType getCell(int x, int y) {
        return field[y][x];
    }

    public enum CellType {
        UNKNOWN,
        EMPTY,
        WOUNDED,
        DEAD
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
    }
}
