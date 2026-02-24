package ru.seabattleroyal.connector;

import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;
import ru.seabattleroyal.game.Game;
import ru.seabattleroyal.repositories.GameRepository;

@Slf4j
@Component
public class AuthChannelInterceptor implements ChannelInterceptor {

    private GameRepository repository;

    public AuthChannelInterceptor() {
    }

    public GameRepository getRepository() {
        return repository;
    }

    @Autowired
    public void setRepository(GameRepository repository) {
        this.repository = repository;
    }

    @Override
    public @Nullable Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            if (accessor.getNativeHeader("username") != null && accessor.getNativeHeader("gameId") != null) {
                String gameId = accessor.getNativeHeader("gameId").get(0);
                String username = accessor.getNativeHeader("username").get(0);
                log.info("GameId is {}, username is {}", gameId, username);
                return null;
            }
        }
        return message;
    }
}
