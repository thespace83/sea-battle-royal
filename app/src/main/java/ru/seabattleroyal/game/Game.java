package ru.seabattleroyal.game;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import java.util.*;

@Getter
@Setter
@Slf4j
public class Game {

    private static final Random random = new Random();

    private final List<Player> players = new ArrayList<>();
    private final int numberOfPlayers;
    private final Set<Field.Position> openCells = new HashSet<>();
    private int currentPlayerIndex;

    public Game(int numberOfPlayers) {
        this.numberOfPlayers = numberOfPlayers;
    }

    public void addPlayer(Player player) {
        players.add(player);
    }

    public void removePlayer(Player player) {
        players.remove(player);
    }

    public Player getPlayer(String uuid) {
        for (Player player : players) {
            if (player.getUuid().equals(uuid)) {
                return player;
            }
        }
        return null;
    }

    public void attack(Field.Position position) throws InvalidAttackException {
        if (position.getX() < 0 || position.getY() < 0 || position.getX() >= 10 || position.getY() >= 10 || openCells.contains(position))
            throw new InvalidAttackException();
        openCells.add(position);
        for (Player player : players) {
            player.attack(position);
        }

        for (Player player : players) {
            if (player.field.getCell(position) != Field.CellType.EMPTY)
                return;
        }

        if (currentPlayerIndex == numberOfPlayers - 1) {
            currentPlayerIndex = 0;
        } else {
            currentPlayerIndex++;
        }
    }

    public boolean isPlayersReady() {
        return players.size() == numberOfPlayers && players.stream().allMatch(player -> player.getField() != null);
    }

    public void start() {
        assert !isPlayersReady();
        currentPlayerIndex = 0;
    }

    public static String generateId() {
        char[] code = new char[6];
        for (int i = 0; i < 6; i++) {
            code[i] = "abcdefghijklmnopqrstuvwxyz0123456789".charAt(random.nextInt(36));
        }
        return new String(code);
    }

    public static class InvalidAttackException extends Exception {
        public InvalidAttackException() {
        }
    }

}
