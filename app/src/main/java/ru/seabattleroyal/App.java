package ru.seabattleroyal;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import ru.seabattleroyal.game.Game;
import ru.seabattleroyal.game.Player;
import ru.seabattleroyal.repositories.GameRepository;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;
import java.util.UUID;

@SpringBootApplication
@Controller
public class App {

    private final GameRepository repository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper mapper;

    public App(GameRepository repository, SimpMessagingTemplate messagingTemplate) {
        this.repository = repository;
        this.messagingTemplate = messagingTemplate;
        this.mapper = new ObjectMapper();
    }

    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }

    @PostMapping("/api/create-game")
    @ResponseBody
    public Map<String, String> createGame(
            @RequestBody Map<String, Integer> body
    ) {
        int numberOfPlayers = body.get("number-of-players");
        if (numberOfPlayers > 5 || numberOfPlayers < 2)
            return Map.of("error", "Invalid number of players");

        String gameId = repository.createGame(numberOfPlayers);

        messagingTemplate.convertAndSend("/topic/updating-the-list-of-games", "");

        return Map.of("gameId", gameId);
    }

    @GetMapping("/api/list-of-games")
    @ResponseBody
    public String getGames() {
        return mapper.writeValueAsString(repository.getGames());
    }

    @GetMapping("/game")
    public String getGame(
            @CookieValue(value = "session", defaultValue = "") String session,
            HttpServletResponse response,
            Model model,
            @RequestParam String gameId,
            @RequestParam String username
    ) {
        Game game = repository.getGame(gameId);
        model.addAttribute("gameId", gameId.toUpperCase());
        if (game == null)
            return "unknown-game";

        model.addAttribute("number_of_players", game.getNumberOfPlayers());
        if (session.isEmpty()) {
            Cookie cookie = new Cookie("session", UUID.randomUUID().toString());
            cookie.setHttpOnly(false);
            cookie.setPath("/");
            response.addCookie(cookie);
        }
        return "battlefield";
    }

    @PostMapping("/api/try-to-join")
    @ResponseBody
    public String tryToJoin(
            @CookieValue(value = "session", defaultValue = "") String session,
            @RequestBody Map<String, String> body
    ) {
        String gameId = body.get("gameId");
        String username = body.get("username");

        Game game = repository.getGame(gameId);
        if (game == null)
            return mapper.writeValueAsString(Map.of("status", "error", "description", "Unknown game"));
        if (username.isEmpty())
            return mapper.writeValueAsString(Map.of("status", "error", "description", "Empty username"));

        for (Player player : game.getPlayers()) {
            if (player.getUsername().equals(username)) {
                if (player.getSessionUuid().equals(session)) {
                    return mapper.writeValueAsString(Map.of("status", "successful"));
                } else {
                    return mapper.writeValueAsString(Map.of("status", "error", "description", "A player with that username is already in the game"));
                }
            } else if (player.getSessionUuid().equals(session)) {
                return mapper.writeValueAsString(Map.of("status", "successful", "username", player.getUsername()));
            }
        }
        return mapper.writeValueAsString(Map.of("status", "successful"));
    }

}
