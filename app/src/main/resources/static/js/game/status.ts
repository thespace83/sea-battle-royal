import {getYouUuid, Player, players, PlayerStatus} from "./index.js";

export function updateStatus() {
    const statusInfo: HTMLDivElement = document.querySelector('#status-info') as HTMLDivElement

    if (players.get(getYouUuid() as string)?.status === PlayerStatus.PREPARING) {
        statusInfo.innerHTML = getStatusDescriptionItem(`Расставь, ${getYouUuid()}, свой флот`)
        return
    }

    players.keys().forEach((uuid: string) => {
        const player = players.get(uuid) as Player
        if (player.status === PlayerStatus.MOVE) {
            statusInfo.innerHTML = getStatusDescriptionItem(`Прямо сейчас ${uuid} ходит`)
            return
        }
    })
}

function getStatusDescriptionItem(content: string) {
    //<span class="badge bg-primary">Морской Волк</span>
    return `
<div class="mb-2 mb-md-0" id="status-info">
    <strong>Статус:</strong> <span>Ожидание хода игрока </span>
    ${getModifiedContent(content)}
</div>
`
}

function getModifiedContent(content: string): string {
    players.keys().forEach((uuid: string) => {
        const player = players.get(uuid) as Player
        content = content.replace(uuid, `<span class="badge bg-primary">${player?.username}</span>`)
    })
    return content
}
