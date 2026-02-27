package ru.seabattleroyal.connector;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import ru.seabattleroyal.game.Field;
import ru.seabattleroyal.game.Game;
import ru.seabattleroyal.game.Player;
import ru.seabattleroyal.repositories.GameRepository;
import ru.seabattleroyal.utils.FieldVerify;
import tools.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Controller
public class MessageController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper mapper = new ObjectMapper();
    private final GameRepository repository;

    public MessageController(
            SimpMessagingTemplate messagingTemplate,
            GameRepository repository
    ) {
        this.messagingTemplate = messagingTemplate;
        this.repository = repository;
    }

    @MessageMapping("/game.{gameId}.info-is-needed")
    public void infoIsNeeded(
            @DestinationVariable String gameId
    ) {
        Game game = repository.getGame(gameId);
        if (game == null) {
            return;
        }

        Map<String, String> players = new HashMap<>();
        for (Player player : game.getPlayers()) {
            players.put(player.getUuid(), player.getUsername());
        }
        messagingTemplate.convertAndSend("/topic/game." + gameId + ".information-about-players",
                mapper.writeValueAsString(players));
    }

    @MessageMapping("/game.{gameId}.verify-field")
    public void verifyField(
            Message<?> message,
            @DestinationVariable String gameId,
            @Payload Field.CellType[][] field
    ) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        Game game = repository.getGame(gameId);
        Player player = null;
        for (Player p : game.getPlayers()) {
            if (p.getWebSocketSessionId().equals(accessor.getSessionId())) {
                player = p;
            }
        }

        // TODO - вернуть логику проверки поля на корректность.
        assert player != null;
        player.setField(new Field(field));
        messagingTemplate.convertAndSend("/topic/game." + gameId + ".ready", player.getUuid());


        log.info("Is players ready: {}", game.isPlayersReady());
    }

    @MessageMapping("/game.{gameId}.chat")
    public void chat(
            Message<?> message,
            @DestinationVariable String gameId,
            @Payload Map<String, String> body
    ) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        Game game = repository.getGame(gameId);
        if (game == null)
            return;

        String content = body.get("content");

        String uuid = "";
        for (Player player : game.getPlayers()) {
            if (player.getWebSocketSessionId().equals(accessor.getSessionId())) {
                uuid = player.getUuid();
            }
        }
        messagingTemplate.convertAndSend("/topic/game." + gameId + ".chat",
                mapper.writeValueAsString(Map.of("uuid", uuid, "content", content)));
    }

}
