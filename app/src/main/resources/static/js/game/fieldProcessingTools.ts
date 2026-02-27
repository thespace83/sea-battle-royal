import {CellType, type Field, Position} from "./index.js";

export function getShipsSet(field: Field): Set<Set<Position>> {
    const ships: Set<Set<Position>> = new Set<Set<Position>>()
    for (let y = 0; y < field.sizeY; y++) {
        for (let x = 0; x < field.sizeX; x++) {
            let found: boolean = false;
            for (let ship of ships) {
                for (let cell of ship) {
                    if (cell.x == x && cell.y == y) {
                        found = true
                        break
                    }
                }
            }
            if (found) continue
            if (field.getCell(x, y) == CellType.SHIP.valueOf()) {
                ships.add(findTheShip(field, x, y))
            }
        }
    }
    return ships
}

function findTheShip(field: Field, x: number, y: number): Set<Position> {
    const positions = new Set<Position>

    let direction: number = 0

    if (field.getCell(x, y + 1) == CellType.SHIP.valueOf()) {
        direction = 1
    } else {
        positions.add(new Position(x, y))
        return positions
    }

    while (field.getCell(x, y) === CellType.SHIP.valueOf()) {
        positions.add(new Position(x, y))
        if (direction == 0)
            x += 1
        else
            y += 1
    }

    return positions
}
