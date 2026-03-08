import {CellType, getGameId, getYouUsername, getYouUuid, Player, players, PlayerStatus, setYouUuid} from "./index.js";
import {basicLog, importantLog} from "./logging.js";
import {addPlayerIntoList, addYouInList, updateStatuses} from "./list-of-players.js";
import {addChatMessage} from "./chat.js";
import {addPlayerIntoBattlefields, updateFields, updateYouField} from "./field.js";
import {updateStatus} from "./status.js";

let webSocketService: WebSocketService | null = null

const WEBSOCKET_URL = '/websocket'
let isGameStarted: boolean = false;

function getCookie(name: string) {
    const matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1] as string) : undefined;
}

class WebSocketService {
    // @ts-ignore
    private client: StompJs.Client

    constructor() {
        const session = getCookie('session')
        // @ts-ignore
        this.client = new StompJs.Client({
            // @ts-ignore
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
        this.client.onConnect = () => {
            basicLog('Ты подключился к игре.')
            this.client.subscribe(`/topic/game.${getGameId()}.join`, (message: any) => {
                const body: any = JSON.parse(message.body)
                const username: string = body.username
                const uuid: string = body.uuid
                onPlayerJoin(uuid, username)
            })
            this.client.subscribe(`/topic/game.${getGameId()}.reconnect`, (message: any) => {
                const uuid: string = message.body as string
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
                if (!isGameStarted) onGameStart()
            })
            this.client.subscribe(`/topic/game.${getGameId()}.move`, (message: any) => {
                const uuid = message.body as string
                if (players.get(uuid)!.status !== PlayerStatus.MOVE) onPlayerMove(uuid)
            })
            this.client.subscribe(`/topic/game.${getGameId()}.attack`, () => {
                onPlayerAttack()
            })
            this.client.subscribe(`/topic/game.${getGameId()}.dead`, (message: any) => {
                const uuid = message.body as string
                onPlayerDead(uuid)
            })
            this.client.subscribe(`/topic/game.${getGameId()}.won`, (message: any) => {
                const uuid = message.body as string
                onPlayerWon(uuid)
            })
            this.client.subscribe(`/topic/game.${getGameId()}.update-fields`, (message: any) => {
                const body = JSON.parse(message.body)
                updateFields(body)
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

    public attack(x: number, y: number) {
        this.client.publish({
            destination: `/app/game.${getGameId()}.attack`,
            body: JSON.stringify({
                'x': x,
                'y': y
            })
        })
    }

    public subscribeToPrivateFieldDestination() {
        this.client.subscribe(`/topic/game.${getGameId()}.private-field.${getYouUuid()}`, (message: any) => {
            const body = JSON.parse(message.body)
            updateYouField(body.field)
        })

        this.client.publish({
            destination: `/app/game.${getGameId()}.info-is-needed`
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

export function attack(x: number, y: number) {
    webSocketService?.attack(x, y)
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
    importantLog(`Капитан ${uuid} подключился к бою!`)
}

function informationAboutPlayers(body: Record<string, string>) {
    Object.keys(body).forEach((uuid: string) => {
        const username: string = body[uuid] as string
        if (players.get(uuid) === undefined) {
            if (username === getYouUsername()) {
                setYouUuid(uuid)
                webSocketService!.subscribeToPrivateFieldDestination()
            }

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
    updateStatus()
    if (uuid === getYouUuid()) {
        document.querySelector('#start-game-button')?.remove()
    }
    importantLog(`Капитан ${uuid} расставил свой флот`)
}

function onGameStart() {
    importantLog('Бойня началась!')
    document.querySelector('#mode-player-you')?.classList.remove('disabled')
    document.querySelector('#mode-main')!.innerHTML = 'Все на одном'
    document.querySelector('#current-mode-description')!.remove()
    players.keys().forEach((uuid: string) => {
        document.querySelector(`#mode-player-${uuid}`)?.classList.remove('disabled')
    })
    isGameStarted = true
}

function onPlayerMove(uuid: string) {
    basicLog(`Капитан ${uuid} готовит пушки`)

    players.keys().forEach((_uuid: string) => {
        const player = players.get(_uuid)
        player!.status = ((): PlayerStatus => {
            if (players.get(_uuid)!.status == PlayerStatus.LOOSE
                || players.get(_uuid)!.status == PlayerStatus.WON) return players.get(_uuid)!.status
            if (_uuid === uuid) return PlayerStatus.MOVE
            else return PlayerStatus.WAIT
        })()
    })
    updateStatuses()
    updateStatus()
}

function onPlayerAttack() {
    players.keys().forEach((uuid) => {
        if (players.get(uuid)?.status == PlayerStatus.MOVE) {
            basicLog(`Капитан ${uuid} сделал свой залп`)
        }
    })
}

function onPlayerDead(uuid: string) {
    importantLog(`Капитан ${uuid} потерял весь свой флот`)
    players.get(uuid)!.status = PlayerStatus.LOOSE
    updateStatuses()
}

function onPlayerWon(uuid: string) {
    importantLog(`Капитан ${uuid} одержал победу`)
    players.get(uuid)!.status = PlayerStatus.WON
    updateStatuses()
}
