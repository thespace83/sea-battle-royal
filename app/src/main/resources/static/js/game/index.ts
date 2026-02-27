import {connect} from "./connector.js";
import {initBattlefield} from "./field.js";
import './chat.js'

export const players: Map<string, Player> = new Map()


const params = new URLSearchParams(window.location.search)
const gameId: string = params.get('gameId') as string
const youUsername: string = params.get('username') as string
let youUuid: string | null = null

document.addEventListener("DOMContentLoaded", () => {
    connect()
    initBattlefield()
})

export function getGameId(): string {
    return gameId
}

export function getYouUsername(): string {
    return youUsername
}

export function getYouUuid(): string | null {
    return youUuid
}

export function setYouUuid(uuid: string) {
    youUuid = uuid
}

export class Player {
    private readonly _username: string
    public status: PlayerStatus
    public field: Field

    constructor(username: string) {
        this._username = username
        this.status = PlayerStatus.PREPARING
        this.field = new Field()
    }

    get username(): string {
        return this._username;
    }
}

export class Field {
    private readonly _field: CellType[][]
    private readonly sizeX = 10;
    private readonly sizeY = 10;

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

    get field(): CellType[][] {
        return this._field;
    }
}

export class Position {
    private _x: number
    private _y: number

    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
    }
}

export enum PlayerStatus {
    CONNECTING,
    PREPARING,
    READY,
    MOVE,
    WAIT,
    LOOSE,
    WON,
}

export enum CellType {
    UNKNOWN,
    SHIP,
    EMPTY,
    WOUNDED,
    DEAD
}
