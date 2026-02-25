package ru.seabattleroyal.game;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Random;
import java.util.UUID;

@Getter
@Setter
public class Player {

    private static final Random random = new Random();

    String username;
    int color;
    String uuid;
    String sessionUuid;
    Field field;

    public Player(String username, String session) {
        this.username = username;
        this.uuid = UUID.randomUUID().toString();
        this.sessionUuid = session;
        this.field = new Field(Field.CellType.UNKNOWN);
        this.color = List.of(0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff).get(random.nextInt(0, 5));
    }

}
