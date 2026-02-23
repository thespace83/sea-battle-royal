// @ts-ignore
import {Client} from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client'

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
            this.client.subscribe('/topic/game')
        }

        this.client.activate()
    }

}