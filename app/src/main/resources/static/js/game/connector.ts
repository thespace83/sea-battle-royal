// @ts-ignore
import {Client} from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client'

import {players, Player} from "./index.js";
import {basicLog, importantActionLog, playerActionLog} from "./logging.js";

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
            connectHeaders: {
                'gameId': gameId,
                'username': username,
                'session': session
            },
            debug: (msg: string) => {
                console.log(msg)
            }
        })
    }

    public activate() {
        this.client.onConnect = () => {
            basicLog('Ты подключился к игре.')
            this.client.subscribe(`/topic/game.${gameId}.join`, (message: any) => {
                const body: any = JSON.parse(message.body)
                const username: string = body.username
                const uuid: string = body.uuid
                onPlayerJoin(username, uuid)
            })
            this.client.subscribe(`/topic/game.${gameId}.reconnect`, (message: any) => {
                const body: any = JSON.parse(message.body)
                const username: string = body.username
                const uuid: string = body.uuid
                playerActionLog(username, 'переподключился к игре.')
            })

        }

        this.client.activate()
    }

}

const webSocketService = new WebSocketService()

export function connect() {
    webSocketService.activate()
}

function onPlayerJoin(username: string, uuid: string) {
    players.set(uuid, new Player(username))

}
