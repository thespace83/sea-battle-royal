import {players, PlayerStatus} from "./index.js";

export function addPlayerIntoList(uuid: string) {
    document.querySelector('#list-of-players')?.insertAdjacentHTML('beforeend', createItem(uuid))
    updatePlayersCounter()
}

export function addYouInList(uuid: string) {
    document.querySelector('#list-of-players')?.insertAdjacentHTML('beforeend', createYouItem(uuid))
    updatePlayersCounter()
}

export function setPlayerStatusInList(uuid: string, status: PlayerStatus) {
    let name = '?Status?'
    if (status === PlayerStatus.PREPARING)
        name = 'Готовит флот'
    else if (status === PlayerStatus.READY)
        name = 'Готов к бою'
    else if (status === PlayerStatus.LOOSE)
        name = 'Без кораблей'
    else if (status === PlayerStatus.WON)
        name = 'Всех победил'
    document.querySelector(`#status-${uuid}`)!.innerHTML = name;
}

function updatePlayersCounter() {
    document.querySelector('#player-count')!.innerHTML = players.size.toString()
}

function createItem(uuid: string) {
    const index: number = players.size + 1
    const username: string = players.get(uuid)?.username as string
    return `
<li class="list-group-item d-flex justify-content-between align-items-center">
    <div>
        <span class="player-color-dot player-${index}-color"></span>
        <span>${username}</span>
    </div>
    <div class="ship-count" id="status-${uuid}">Готовит флот</div>
</li>
`
}

function createYouItem(uuid: string) {
    const username: string = players.get(uuid)?.username as string
    return `
<li class="list-group-item d-flex justify-content-between align-items-center player-active">
    <div>
        <span class="player-color-dot player-1-color"></span>
        <span id="the-username-of-the-main-player-in-the-list">${username}</span>
        <span class="badge bg-primary ms-2">Ты</span>
    </div>
    <div class="ship-count" id="status-you">Готовит флот</div>
</li>
`
}