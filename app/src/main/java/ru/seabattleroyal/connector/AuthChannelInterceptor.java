package ru.seabattleroyal.connector;

import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;
import ru.seabattleroyal.game.Game;
import ru.seabattleroyal.game.Player;
import ru.seabattleroyal.repositories.GameRepository;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

@Slf4j
@Component
public class AuthChannelInterceptor implements ChannelInterceptor {

    private final GameRepository repository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper mapper = new ObjectMapper();

    public AuthChannelInterceptor(GameRepository repository, @Lazy SimpMessagingTemplate messagingTemplate) {
        this.repository = repository;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public @Nullable Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            if (accessor.getNativeHeader("username") != null && accessor.getNativeHeader("gameId") != null) {
                String gameId = accessor.getNativeHeader("gameId").get(0);
                String username = accessor.getNativeHeader("username").get(0);
                String cookieSession = accessor.getNativeHeader("session").get(0);

                Game game = repository.getGame(gameId);
                if (game == null)
                    return null;
                for (Player player : game.getPlayers()) {
                    if (player.getCookieSessionUuid().equals(cookieSession)) {
                        if (player.getUsername().equals(username)) {
                            player.setWebSocketSessionId(accessor.getSessionId());
                            messagingTemplate.convertAndSend("/topic/game." + gameId + ".reconnect", player.getUuid());
                            return message;
                        }
                        return null;
                    }
                }

                Player player = new Player(username, cookieSession, accessor.getSessionId());
                game.addPlayer(player);
                messagingTemplate.convertAndSend("/topic/game." + gameId + ".join",
                        mapper.writeValueAsString(Map.of(
                                "username", username,
                                "uuid", player.getUuid()
                        )));
            }
        } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String destination = accessor.getNativeHeader("destination").get(0).split("/")[2];
            if (destination.split("\\.").length == 4) {
                String gameId = destination.split("\\.")[1];
                String uuid = destination.split("\\.")[3];
                Game game = repository.getGame(gameId);
                for (Player player : game.getPlayers()) {
                    if (player.getUuid().equals(uuid)) {
                        if (!player.getWebSocketSessionId().equals(accessor.getSessionId()))
                            return null;
                        else
                            return message;
                    } else {
                        return null;
                    }
                }
            }

        }
        return message;
    }
}
