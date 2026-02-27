// @ts-ignore
import {Client} from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client'

import {CellType, getGameId, getYouUsername, getYouUuid, Player, players, PlayerStatus, setYouUuid} from "./index.js";
import {basicLog, importantLog} from "./logging.js";
import {addPlayerIntoList, addYouInList, updateStatuses} from "./list-of-players.js";
import {addChatMessage} from "./chat.js";
import {addPlayerIntoBattlefields} from "./field.js";

let webSocketService: WebSocketService | null = null

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
                'gameId': getGameId(),
                'username': getYouUsername(),
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
            this.client.subscribe(`/topic/game.${getGameId()}.join`, (message: any) => {
                const body: any = JSON.parse(message.body)
                const username: string = body.username
                const uuid: string = body.uuid
                onPlayerJoin(uuid, username)
            })
            this.client.subscribe(`/topic/game.${getGameId()}.reconnect`, (message: any) => {
                const uuid: string = message.body as string
                const username = players.get(uuid)?.username as string
                importantLog(`Игрок ${uuid} переподключился к игре.`)
            })
            this.client.subscribe(`/topic/game.${getGameId()}.information-about-players`, (message: any) => {
                const body: Record<string, string> = JSON.parse(message.body)
                informationAboutPlayers(body)
            })
            this.client.subscribe(`/topic/game.${getGameId()}.chat`, (message: any) => {
                const body: Record<string, string> = JSON.parse(message.body)
                const uuid = body['uuid'] as string
                const content = body['content'] as string
                addChatMessage(players.get(uuid)?.username as string, content)
            })
            this.client.subscribe(`/topic/game.${getGameId()}.ready`, (message: any) => {
                const uuid = message.body as string
                onPlayerReady(uuid)
            })
            this.client.subscribe(`/topic/game.${getGameId()}.start`, () => {
                onGameReady()
            })

            this.client.publish({
                destination: `/app/game.${getGameId()}.info-is-needed`
            })
        }

        this.client.activate()
    }

    public verifyYouField() {
        const field = players.get(getYouUuid() as string)!.field
        this.client.publish({
            destination: `/app/game.${getGameId()}.verify-field`,
            body: JSON.stringify(field.field)
        })
    }

    public sendMessage(content: string) {
        this.client.publish({
            destination: `/app/game.${getGameId()}.chat`,
            body: JSON.stringify({
                'content': content
            })
        })
    }
}

export function connect() {
    webSocketService = new WebSocketService()
    webSocketService.activate()
}

export function verifyYouField() {
    webSocketService?.verifyYouField()
}

export function sendMessage(message: string) {
    webSocketService?.sendMessage(message)
}

function addPlayer(uuid: string, username: string) {
    if (players.get(uuid) !== undefined) {
        console.warn('Adding an existing player')
        return
    }
    players.set(uuid, new Player(username))
    if (uuid === getYouUuid()) {
        addYouInList(uuid)
        const player = players.get(getYouUuid() as string) as Player
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                player.field.setCell(x, y, CellType.EMPTY)
            }
        }
        players.get(getYouUuid() as string)!.status = PlayerStatus.PREPARING
    } else {
        addPlayerIntoList(uuid)
        addPlayerIntoBattlefields(uuid)
    }
}

function onPlayerJoin(uuid: string, username: string) {
    addPlayer(uuid, username)
    importantLog(`Игрок ${uuid} подключился к бою!`)
}

function informationAboutPlayers(body: Record<string, string>) {
    Object.keys(body).forEach((uuid: string) => {
        const username: string = body[uuid] as string
        if (players.get(uuid) === undefined) {
            if (username === getYouUsername())
                setYouUuid(uuid)

            addPlayer(uuid, username)
        } else if ((players.get(uuid) as Player).username !== username) {
            console.error('Uuid and username mismatch')
        }
    })
}

function onPlayerReady(uuid: string) {
    const player = players.get(uuid) as Player
    player.status = PlayerStatus.READY
    updateStatuses()
    if (uuid === getYouUuid()) {
        document.querySelector('#start-game-button')?.remove()
    }
    importantLog(`Игрок ${uuid} расставил свой флот`)
}

function onGameReady() {

}
