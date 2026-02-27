// @ts-ignore
import {Client} from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client'

document.querySelector('#create-game')?.addEventListener('click', create_game)
document.addEventListener("DOMContentLoaded", () => {
    generateListOfGames().then()
})

const WEBSOCKET_URL = 'http://localhost:8080/websocket'

class WebSocketService {
    private client: Client

    constructor() {
        this.client = new Client({
            webSocketFactory: () => new SockJS(WEBSOCKET_URL),
            debug: (msg: string) => {
                console.log(msg)
            }
        })
    }

    public activate() {
        this.client.onConnect = () => {
            this.client.subscribe('/topic/updating-the-list-of-games', () => {
                generateListOfGames().then()
            })
            generateListOfGames().then()
        }

        this.client.activate()
    }

    public disconnect() {
        this.client.deactivate(true).then()
    }

}

const webSocketService: WebSocketService = new WebSocketService();

document.addEventListener("DOMContentLoaded", () => {
    webSocketService.activate()
})

async function generateListOfGames() {
    try {
        const response = await fetch('/api/list-of-games', {
            method: 'GET'
        })
        if (!response.ok) {
            console.error(response.statusText)
        }
        const data: Array<{ [gameId: string]: object }> = await response.json()

        const listOfGames = document.querySelector('#list-of-games')
        while (listOfGames?.firstChild) {
            listOfGames.removeChild(listOfGames?.firstChild)
        }
        for (const [gameId, game] of Object.entries(data)) {
            addGameToListOfGames(gameId, (game['players'] as []).length, game['number-of-players'] as unknown as number)
        }
    } catch (error) {
        console.error(error)
    }
}

function addGameToListOfGames(gameId: string, players: number, numberOfPlayers: number) {
    document.querySelector('#list-of-games')?.insertAdjacentHTML('beforeend', createItem(gameId, players, numberOfPlayers))
    document.querySelector(`#game-${gameId}`)?.addEventListener('click', () => {
        joinInToGame(gameId)
    })
}

function createItem(gameId: string, players: number, numberOfPlayers: number): string {
    return `
<li class="list-group-item align-items-center justify-content-between d-flex">
    <a href="#" id="game-${gameId}" class="text-decoration-none">Бой #${gameId.toUpperCase()}</a>
    <span class="badge bg-primary rounded-pill">${players} / ${numberOfPlayers}</span>
</li>
`
}

async function create_game() {
    const numberOfPlayers = (document.querySelector('#players-count') as HTMLSelectElement).value
    const username = (document.querySelector('#username') as HTMLInputElement).value
    if (username === '') {
        const usernameError = document.querySelector('#write-username-error')
        if (usernameError)
            usernameError.innerHTML = 'Чтобы зайти в игру, введите позывной!'
        return false
    }

    const response = await fetch('/api/create-game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'number-of-players': numberOfPlayers
        })
    })

    if (!response.ok) {
        console.error(response.statusText)
    }

    joinInToGame((await response.json())['gameId'])
}

function joinInToGame(gameId: string) {
    let username: string = (document.querySelector('#username') as HTMLInputElement).value
    const usernameError = document.querySelector('#write-username-error')
    if (gameId === '')
        return false
    canJoin(gameId).then((value: Record<string, string | undefined>) => {
        if (value['status'] === 'successful') {
            if (value['username'] !== undefined) {
                username = value['username']
            }
            webSocketService.disconnect()
            window.location.href = `/game?gameId=${gameId}&username=${encodeURIComponent(username)}`
        } else if (value['status'] === 'error') {
            switch (value['description']) {
                case 'Empty username': {
                    usernameError!.innerHTML = 'Чтобы зайти в игру, введи позывной'
                    break
                }
                case 'A player with that username is already in the game': {
                    usernameError!.innerHTML = 'Игрок с таким именем уже есть в игре'
                    break
                }
                default: {
                    usernameError!.innerHTML = value['description'] as string
                    break
                }
            }
        } else {
            console.error('Unknown status: ' + value['status'])
        }
    })

}

async function canJoin(gameId: string): Promise<Record<string, string | undefined>> {
    const username = (document.querySelector('#username') as HTMLInputElement).value
    try {
        const response = await fetch('/api/try-to-join', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'gameId': gameId,
                'username': username
            })
        })
        if (!response.ok) {
            console.error(response.statusText)
        }
        const data: Record<string, string> = await response.json()
        const status: string = data['status'] as string
        return {'status': status, 'username': data['username'], 'description': data['description']};
    } catch (error) {
        console.error(error)
    }

    return {'status': 'error'}
}
