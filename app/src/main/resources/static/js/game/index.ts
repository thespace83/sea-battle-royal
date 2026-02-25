import {connect} from "./connector.js";

export const players: Map<string, Player> = new Map()

export class Player {
    private readonly _username: string
    public field: Field

    constructor(username: string) {
        this._username = username
        this.field = new Field()
    }
}

class Field {
    private readonly _field: CellType[][]

    constructor() {
        this._field = Array.from({length: 10}, () => Array(10).fill(CellType.UNKNOWN))
    }

    public setCell(x: number, y: number, type: CellType) {
        // @ts-ignore
        this._field[y][x] = type
    }

    public getCell(x: number, y: number): CellType {
        // @ts-ignore
        return this._field[y][x]
    }
}

enum CellType {
    UNKNOWN,
    EMPTY,
    WOUNDED,
    DEAD
}

connect()
