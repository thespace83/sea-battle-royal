// @ts-ignore
import {Client} from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client'

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

    public activate() {
        this.client.onConnect = () => {
            this.client.subscribe(`/topic/game-${gameId}`, () => {

            })
        }

        this.client.activate()
    }

}

const webSocketService = new WebSocketService()

export function connect() {
    webSocketService.activate()
}
