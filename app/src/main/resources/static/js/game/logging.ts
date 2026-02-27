import {Player, players} from "./index.js";

export function basicLog(content: string) {
    document.querySelector('#logs')?.insertAdjacentHTML('afterbegin', createBasicLogItem(content))
}

export function importantLog(content: string) {
    document.querySelector('#logs')?.insertAdjacentHTML('afterbegin', createImportantLogItem(content))
}

function createBasicLogItem(content: string) {
    return `
<div class="mb-2">
    <span class="badge bg-secondary">${getNowTime()}</span>
    <span>${getModifiedContent(content)}</span>
</div>
`
}

function createImportantLogItem(content: string) {
    return `
<div class="mb-2">
    <span class="badge bg-primary">${getNowTime()}</span>
    <span>${getModifiedContent(content)}</span>
</div>
`
}

function getModifiedContent(content: string): string {
    players.keys().forEach((uuid: string) => {
        const player = players.get(uuid) as Player
        content = content.replace(uuid, `<b>${player?.username}</b>`)
    })
    return content
}

function getNowTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}
