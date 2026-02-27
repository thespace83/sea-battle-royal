import {CellType, getYouUuid, Player, players, PlayerStatus} from "./index.js";
import {attack, verifyYouField} from "./connector.js";

const letters: string[] = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К']

let selectedPlayer: string | null = null

document.querySelector('#start-game-button')?.addEventListener('click', () => {
    verifyYouField()
})

document.querySelector('#mode-main')?.addEventListener('click', () => {
    selectedPlayer = null
    updateDisplay()
})
document.querySelector('#mode-player-you')?.addEventListener('click', () => {
    selectedPlayer = getYouUuid()
    updateDisplay()
})

export function initBattlefield() {
    const battlefield: HTMLDivElement = document.getElementById('battlefield') as HTMLDivElement

    battlefield.innerHTML = ''

    const topLeftCell = document.createElement('div')
    topLeftCell.className = 'cell coordinate'
    battlefield.appendChild(topLeftCell)


    for (let i = 0; i < 10; i++) {
        const letterCell: HTMLDivElement = document.createElement('div') as HTMLDivElement
        letterCell.className = 'cell coordinate'
        letterCell.textContent = letters[i] as string
        battlefield.appendChild(letterCell)
    }

    for (let row = 0; row < 10; row++) {
        const numberCell = document.createElement('div')
        numberCell.className = 'cell coordinate'
        numberCell.textContent = (row + 1).toString()
        battlefield.appendChild(numberCell)

        for (let col = 0; col < 10; col++) {
            const cell: HTMLDivElement = document.createElement('div')
            cell.className = 'cell'
            cell.dataset.row = row.toString()
            cell.dataset.col = col.toString()

            cell.addEventListener('click', function () {
                handleCellClick(this)
            })

            battlefield.appendChild(cell)
        }
    }

    function handleCellClick(cell: HTMLDivElement) {
        const player: Player = players.get(getYouUuid() as string) as Player
        const x: number = parseInt(cell.dataset.col as string)
        const y: number = parseInt(cell.dataset.row as string)

        if (player.status === PlayerStatus.PREPARING) {
            if (cell.classList.contains('ship')) {
                cell.classList.remove('ship')
                player.field.setCell(x, y, CellType.EMPTY)
            } else {
                cell.classList.add('ship')
                player.field.setCell(x, y, CellType.SHIP)
            }
        } else if (player.status === PlayerStatus.MOVE) {
            attack(x, y)
        }
    }
}

function updateDisplay() {
    document.querySelector('#mode-main')?.classList.remove('active', 'mode-active')
    document.querySelector('#mode-player-you')?.classList.remove('active', 'mode-active')
    players.keys().forEach(uuid => {
        document.querySelector(`#mode-player-${uuid}`)?.classList.remove('active', 'mode-active')
    })

    if (selectedPlayer === null) {
        document.querySelector('#mode-main')?.classList.add('active', 'mode-active')
        document.querySelector('#current-mode-title')!.innerHTML = 'Все корабли на одном поле'
    } else if (selectedPlayer === getYouUuid()) {
        document.querySelector('#mode-player-you')?.classList.add('active', 'mode-active')
        document.querySelector('#current-mode-title')!.innerHTML = 'Твои корабли'
    } else {
        document.querySelector(`#mode-player-${selectedPlayer}`)?.classList.add('active', 'mode-active')
        document.querySelector('#current-mode-title')!.innerHTML = `Твои капитана <b>${players.get(selectedPlayer)}</b>`
    }


}


export function addPlayerIntoBattlefields(uuid: string) {
    document.querySelector('#list-of-modes')?.insertAdjacentHTML('beforeend', createPlayerBattlefieldItem(uuid))
    document.getElementById(`mode-player-${uuid}`)?.addEventListener('click', function () {
        selectedPlayer = uuid
        updateDisplay()
    })
}

export function updateFields(fields: Record<string, Record<string, Array<Array<number>> | number>>) {
    Object.keys(fields).forEach(uuid => {
        if (getYouUuid() === uuid)
            return
        const player = players.get(uuid) as Player
        const field = (fields[uuid] as Record<string, Array<Array<number>> | number>)['field'] as number[][]
        player.field.setField(field)
    })
    console.log(players)
}

function createPlayerBattlefieldItem(uuid: string) {
    const username = players.get(uuid)?.username as string
    return `
<button type="button" class="btn btn-outline-primary disabled" id="mode-player-${uuid}">Поле "<span>${username}</span>"
</button>
`
}