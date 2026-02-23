package ru.seabattleroyal.connector;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import ru.seabattleroyal.game.Field;
import ru.seabattleroyal.game.Game;
import ru.seabattleroyal.game.Player;
import ru.seabattleroyal.repositories.GameRepository;

import java.util.Map;
import java.util.Vector;


@Controller
@Slf4j
public class ConnectionController {

    private final GameRepository repository;
    private final SimpMessagingTemplate messagingTemplate;

    public ConnectionController(GameRepository repository, SimpMessagingTemplate messagingTemplate) {
        this.repository = repository;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/game.{gameId}.join")
    public void onGameJoin(
            @Payload GameJoinRequest request,
            @DestinationVariable String gameId
    ) {
        Game game = repository.getGame(gameId);
        if (request.username.isEmpty() || game == null)
            return;
        log.info("{} try to join game {}", request.username, gameId);

        for (Player player : game.getPlayers()) {
            if (player.getUsername().equals(request.username)) {
                return;
            }
        }
        game.addPlayer(new Player(request.username));
        messagingTemplate.convertAndSend("/topic/game." + gameId, new Action(
                Action.ActionType.PLAYER_JOIN, request.username, null
        ));
        log.info("{} joined game {}", request.username, gameId);
    }

    public static class GameJoinRequest {
        public String username;

        public GameJoinRequest(String username) {
            this.username = username;
        }
    }

    public static class Action {
        public ActionType type;
        public String username;
        public Field.Position position;

        public Action(ActionType type, String username, Field.Position position) {
            this.type = type;
            this.username = username;
            this.position = position;
        }

        public enum ActionType {
            PLAYER_JOIN,
            PLAYER_LEAVE,
            PLAYER_READY,
            PLAYER_MOVE,
            PLAYER_ATTACK,
            PLAYER_LOOSE,
            PLAYER_WON,
            GAME_STATED,
            GAME_FINISHED,
        }
    }

}
