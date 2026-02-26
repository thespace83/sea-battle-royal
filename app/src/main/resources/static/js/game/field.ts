import {CellType, getYouUuid, Player, players, PlayerStatus} from "./index.js";

const letters: string[] = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К']

const params = new URLSearchParams(window.location.search)
const youUsername: string = params.get('username') as string

document.querySelector('#the-username-of-the-main-player-in-the-fields')!.innerHTML = youUsername

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

        console.log(player.status, PlayerStatus.PREPARING)
        if (player.status === PlayerStatus.PREPARING) {
            if (cell.classList.contains('ship')) {
                cell.classList.remove('ship')
                player.field.setCell(x, y, CellType.EMPTY)
            } else {
                cell.classList.add('ship')
                player.field.setCell(x, y, CellType.SHIP)
            }
        }// else if (getStatus() === gameStatusTypes.WAITING_SELF_MOVE) {
        //     attack(x, y);
        // }
    }
}