import {CellType, Field, getYouUuid, Player, players, PlayerStatus} from "./index.js";
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
    const cells: NodeListOf<HTMLDivElement> = document.querySelector('#battlefield')!.querySelectorAll('.cell:not(.coordinate)')

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
        document.querySelector('#current-mode-title')!.innerHTML = `Поле капитана <b>${players.get(selectedPlayer)?.username}</b>`
    }

    if (selectedPlayer === null) {
        cells.forEach(cell => {
            const x = parseInt(cell.dataset.col as string)
            const y = parseInt(cell.dataset.row as string)
            cell.classList.remove('dead', 'wounded', 'ship', 'empty')
            players.keys().forEach(uuid => {
                const field = players.get(uuid)!.field as Field
                if (field.getCell(x, y) === CellType.EMPTY
                    && uuid !== getYouUuid()
                    && !cell.classList.contains('ship')
                    && !cell.classList.contains('wounded')
                    && !cell.classList.contains('dead')
                ) {
                    cell.classList.add('empty')
                } else if (field.getCell(x, y) === CellType.SHIP
                    && !cell.classList.contains('wounded')
                    && !cell.classList.contains('dead')) {
                    cell.classList.add('ship')
                } else if (field.getCell(x, y) === CellType.DEAD
                    && !cell.classList.contains('wounded')) {
                    cell.classList.add('dead')
                } else if (field.getCell(x, y) === CellType.WOUNDED) {
                    cell.classList.add('wounded')
                }
            })
        })
        return
    }

    const player: Player = players.get(selectedPlayer) as Player
    cells.forEach(cell => {
        const x = parseInt(cell.dataset.col as string)
        const y = parseInt(cell.dataset.row as string)
        cell.classList.remove('dead', 'wounded', 'ship', 'empty')
        if (player.field.getCell(x, y) === CellType.DEAD) {
            cell.classList.add('dead')
        } else if (player.field.getCell(x, y) === CellType.WOUNDED) {
            cell.classList.add('wounded')
        } else if (player.field.getCell(x, y) === CellType.SHIP) {
            cell.classList.add('ship')
        } else if (player.field.getCell(x, y) === CellType.EMPTY) {
            cell.classList.add('empty')
        }
    })

}

export function addPlayerIntoBattlefields(uuid: string) {
    document.querySelector('#list-of-modes')?.insertAdjacentHTML('beforeend', createPlayerBattlefieldItem(uuid))
    document.getElementById(`mode-player-${uuid}`)?.addEventListener('click', function () {
        selectedPlayer = uuid
        updateDisplay()
    })
}

export function updateFields(fields: Record<string, Record<string, Array<Array<string>> | string>>) {
    Object.keys(fields).forEach(uuid => {
        if (uuid === getYouUuid())
            return
        const field = (fields[uuid] as Record<string, Array<Array<string>> | string>)['field'] as string[][]
        const player = players.get(uuid) as Player
        for (let y = 0; y < field.length; y++) {
            for (let x = 0; x < (field.at(y) as string[]).length; x++) {
                player.field.setCell(x, y, parseInt(field.at(y)?.at(x) as string))
            }
        }
    })
}

export function updateYouField(field: Array<Array<string>>) {
    const player = players.get(getYouUuid() as string) as Player
    for (let y = 0; y < field.length; y++) {
        for (let x = 0; x < (field.at(y) as string[]).length; x++) {
            player.field.setCell(x, y, parseInt(field.at(y)!.at(x) as string))
        }
    }
    updateDisplay()
}

function createPlayerBattlefieldItem(uuid: string) {
    const username = players.get(uuid)?.username as string
    return `
<button type="button" class="btn btn-outline-primary disabled" id="mode-player-${uuid}">Поле "<span>${username}</span>"
</button>
`
}