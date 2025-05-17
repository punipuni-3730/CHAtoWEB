package prj.salmon.chattoweb;

import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.AsyncPlayerChatEvent;
import org.bukkit.plugin.java.JavaPlugin;
import java.io.FileWriter;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.json.simple.JSONObject;

public class CHAtoWEB extends JavaPlugin implements Listener {

    private static final String CHAT_FILE = "plugins/CHAtoWEB/Chat.json";
    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    @Override
    public void onEnable() {
        getServer().getPluginManager().registerEvents(this, this);
        getLogger().info("CHAtoWEB enabled!");
        try {
            new java.io.File(CHAT_FILE).getParentFile().mkdirs();
            new java.io.File(CHAT_FILE).createNewFile();
        } catch (IOException e) {
            getLogger().severe(e.getMessage());
        }
    }

    @EventHandler
    public void onPlayerChat(AsyncPlayerChatEvent event) {
        String player = event.getPlayer().getName();
        String message = event.getMessage();
        String timestamp = DATE_FORMAT.format(new Date());

        JSONObject chatEntry = new JSONObject();
        chatEntry.put("timestamp", timestamp);
        chatEntry.put("player", player);
        chatEntry.put("message", message);

        synchronized (this) {
            try (FileWriter file = new FileWriter(CHAT_FILE, true)) {
                file.write(chatEntry.toJSONString() + "\n");
                file.flush();
            } catch (IOException e) {
                getLogger().severe(e.getMessage());
            }
        }
    }
}