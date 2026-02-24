// @ts-ignore
import {Client} from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client'

enum ActionType {
    PLAYER_JOIN,
    PLAYER_LEAVE,
    PLAYER_READY,
    PLAYER_MOVE,
    PLAYER_ATTACK,
    PLAYER_LOOSE,
    PLAYER_WON,
    GAME_STATED,
    GAME_FINISHED,
    UNKNOWN
}

class Position {
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

class Acton {
    private _action: number
    private _username: string | null
    private _message: string | null
    private _position: Position | null

    constructor(action: number, username: string | null, message: string | null, position: Position | null) {
        this._action = action;
        this._username = username;
        this._message = message
        this._position = position;
    }

    static parse(body: object): Acton {
        const type: number = ActionType[(body as any).type] as any as number
        const username: string | null = (body as any).username
        const message: string | null = (body as any).message
        let position: Position | null = null
        if ((body as any).position !== null)
            position = new Position((body as any).position.x, (body as any).position.y)
        return new Acton(type, username, message, position)
    }


    get action(): number {
        return this._action;
    }

    set action(value: number) {
        this._action = value;
    }

    get username(): string | null {
        return this._username;
    }

    set username(value: string | null) {
        this._username = value;
    }

    get position(): Position | null {
        return this._position;
    }

    set position(value: Position | null) {
        this._position = value;
    }
}

const WEBSOCKET_URL = 'http://localhost:8080/websocket'

const params = new URLSearchParams(window.location.search)
const gameId: string = params.get('gameId') as string
const username: string = params.get('username') as string

function getCookie(name: string) {
    const matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1] as string) : undefined;
}

class WebSocketService {
    private client: Client

    constructor() {
        const session = getCookie('session')
        this.client = new Client({
            webSocketFactory: () => new SockJS(WEBSOCKET_URL),
            debug: (msg: string) => {
                console.log(msg)
            }
        })
    }

    private join(username: string) {
        console.log('Join as ' + username)
        this.client.publish({
            destination: `/app/game.${gameId}.join`,
            body: JSON.stringify({
                'username': username
            })
        })
    }

    public activate() {
        this.client.onConnect = () => {
            this.client.subscribe(`/topic/game.${gameId}`, (message: any) => {
                const action: Acton = Acton.parse(JSON.parse(message.body))
                console.log(action)
                console.log(`Data from /topic/game.${gameId}. Message is: ${message.body}`)
            })

            this.join(username)
        }

        this.client.activate()
    }

}

const webSocketService = new WebSocketService()

export function connect() {
    webSocketService.activate()
}
