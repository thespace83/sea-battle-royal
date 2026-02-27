import {CellType, getYouUuid, Player, players, PlayerStatus} from "./index.js";
import {verifyYouField} from "./connector.js";

const letters: string[] = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К']

const params = new URLSearchParams(window.location.search)
const youUsername: string = params.get('username') as string
let selectedPlayer: string | null = null

document.querySelector('#start-game-button')?.addEventListener('click', () => {
    verifyYouField()
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
        }
    }
}

export function addPlayerIntoBattlefields(uuid: string) {
    document.querySelector('#list-of-modes')?.insertAdjacentHTML('beforeend', createPlayerBattlefieldItem(uuid))
    document.getElementById(`mode-player-${uuid}`)?.addEventListener('click', function () {
        selectedPlayer = uuid
    })
}

function createPlayerBattlefieldItem(uuid: string) {
    const username = players.get(uuid)?.username as string
    return `
<button type="button" class="btn btn-outline-primary disabled" id="mode-player-${uuid}">Поле "<span>${username}</span>"
</button>
`
}