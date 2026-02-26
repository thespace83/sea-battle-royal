package ru.seabattleroyal.connector;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import ru.seabattleroyal.game.Game;
import ru.seabattleroyal.game.Player;
import ru.seabattleroyal.repositories.GameRepository;
import tools.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Controller
public class MessageController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper mapper = new ObjectMapper();
    private final GameRepository repository;

    public MessageController(SimpMessagingTemplate messagingTemplate, GameRepository repository) {
        this.messagingTemplate = messagingTemplate;
        this.repository = repository;
    }

    @MessageMapping("/game.{gameId}.info-is-needed")
    public void infoIsNeeded(@DestinationVariable String gameId) {
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
    public void verifyField(@Payload String field, @DestinationVariable String gameId) {
        log.info("verify-field {}", field);
    }

}
