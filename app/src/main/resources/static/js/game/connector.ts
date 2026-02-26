// @ts-ignore
import {Client} from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client'

import {players, Player} from "./index.js";
import {basicLog, importantActionLog, playerActionLog} from "./logging.js";
import {addPlayerIntoList, addYouInList} from "./list-of-players.js";

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
const youUsername: string = params.get('username') as string
let youUuid: string | null = null

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
                'username': youUsername,
                'session': session
            },
            debug: (msg: string) => {
                console.log(msg)
            }
        })
    }

    public activate() {
        this.client.onConnect = (frame: any) => {
            basicLog('Ты подключился к игре.')
            this.client.subscribe(`/topic/game.${gameId}.join`, (message: any) => {
                const body: any = JSON.parse(message.body)
                const username: string = body.username
                const uuid: string = body.uuid
                onPlayerJoin(uuid, username)
            })
            this.client.subscribe(`/topic/game.${gameId}.reconnect`, (message: any) => {
                const uuid: string = message.body as string
                const username = players.get(uuid)?.username as string
                playerActionLog(username, 'переподключился к игре.')
            })
            this.client.subscribe(`/topic/game.${gameId}.information-about-players`, (message: any) => {
                const body: Record<string, string> = JSON.parse(message.body)
                informationAboutPlayers(body)
            })

            this.client.publish({
                destination: `/app/info-is-needed`,
                body: gameId
            })
        }

        this.client.activate()
    }

}

const webSocketService = new WebSocketService()

export function connect() {
    webSocketService.activate()
}

function addPlayer(uuid: string, username: string) {
    if (players.get(uuid) !== undefined) {
        console.warn('Adding an existing player')
        return
    }
    players.set(uuid, new Player(username))
    if (uuid === youUuid)
        addYouInList(uuid)
    else
        addPlayerIntoList(uuid)
}

function onPlayerJoin(uuid: string, username: string) {
    importantActionLog(username, 'подключился к бою!')
    addPlayer(uuid, username)
}

function informationAboutPlayers(body: Record<string, string>) {
    Object.keys(body).forEach((uuid: string) => {
        const username: string = body[uuid] as string
        if (players.get(uuid) === undefined) {
            if (username === youUsername)
                youUuid = uuid

            addPlayer(uuid, username)
        } else if ((players.get(uuid) as Player).username !== username) {
            console.error('Uuid and username mismatch')
        }
    })
}
