import { WebSocketServer } from "ws";
import http from "http";
import { Chess } from "chess.js";

const PORT = 4000;
const rooms = {};

const server = http.createServer();
const wss = new WebSocketServer({ server });

console.log(`🚀 WebSocket сервер стартует на порту ${PORT}...`);

wss.on("connection", (ws, req) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const roomId = url.searchParams.get("roomId");
    const playerId = url.searchParams.get("playerId");
    const preferredColor = url.searchParams.get("preferredColor");

    if (!roomId || !playerId) {
      console.warn("❌ Отклонено подключение: отсутствуют roomId или playerId.");
      ws.send(JSON.stringify({ error: "Неверные параметры подключения" }));
      ws.close();
      return;
    }

    if (!rooms[roomId]) {
      rooms[roomId] = {
        game: new Chess(),
        players: {},
        moveHistory: [],
        clients: new Set(),
        gameStarted: false,
        creatorPreference: preferredColor || 'random'
      };
    }

    const room = rooms[roomId];
    room.clients.add(ws);

    if (!room.players.white && !room.players.black) {
      if (room.creatorPreference === 'white') {
        room.players.white = playerId;
      } else if (room.creatorPreference === 'black') {
        room.players.black = playerId;
      } else {
        if (Math.random() < 0.5) {
          room.players.white = playerId;
        } else {
          room.players.black = playerId;
        }
      }
    } else {
      if (!room.players.white) {
        room.players.white = playerId;
      } else if (!room.players.black) {
        room.players.black = playerId;
      }
      room.gameStarted = true;
    }

    const assignedColor =
      room.players.white === playerId
        ? "white"
        : room.players.black === playerId
        ? "black"
        : "spectator";

    console.log(`🟢 Игрок ${playerId} (${assignedColor}) подключился к комнате ${roomId}`);

    // Проверяем, есть ли оба игрока
    const opponentConnected = !!room.players.white && !!room.players.black;

    // Отправляем игроку его цвет и статус игры
    ws.send(
      JSON.stringify({
        type: "init",
        moves: room.moveHistory,
        color: assignedColor,
        opponentConnected,
        gameStarted: room.gameStarted,
        playerId,
      })
    );

    // Если второй игрок подключился, оповещаем всех о начале игры
    if (opponentConnected && room.gameStarted) {
      room.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ 
            type: "game_started",
            whitePlayer: room.players.white,
            blackPlayer: room.players.black
          }));
        }
      });
    }

    // Получаем ходы от игроков
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === "move") {
          if (assignedColor === "spectator") {
            console.warn(`❌ Наблюдатель ${playerId} попытался сделать ход!`);
            return;
          }

          const currentTurn = room.game.turn() === "w" ? "white" : "black";

          if (room.players[currentTurn] !== playerId) {
            console.warn(`❌ Игрок ${playerId} (${assignedColor}) пытается ходить не в свой ход!`);
            return;
          }

          const moveResult = room.game.move(data.move);
          if (!moveResult) {
            console.error(`❌ Некорректный ход от ${playerId}:`, data.move);
            return;
          }

          room.moveHistory.push(data.move);
          console.log(`♟️ Принят ход ${data.move.from} → ${data.move.to}`);

          // Отправляем ход ВСЕМ игрокам, КРОМЕ отправителя
          room.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: "move", move: data.move }));
            }
          });
        }
      } catch (error) {
        console.error("❌ Ошибка обработки сообщения:", error);
      }
    });

    // Проверка активности клиентов и удаление неактивных каждые 30 секунд
    ws.isAlive = true;
    ws.on("pong", () => (ws.isAlive = true));

    const interval = setInterval(() => {
      room.clients.forEach((client) => {
        if (!client.isAlive) {
          console.warn("❌ Отключение неактивного клиента.");
          return client.terminate();
        }
        client.isAlive = false;
        client.ping();
      });
    }, 30000);

    // Отключение игроков
    ws.on("close", () => {
      console.warn(`🔴 Игрок ${playerId} (${assignedColor}) покинул комнату ${roomId}`);
      room.clients.delete(ws);
      clearInterval(interval);

      if (room.players.white === playerId) delete room.players.white;
      else if (room.players.black === playerId) delete room.players.black;

      if (room.clients.size === 0) {
        console.log(`🗑 Комната ${roomId} удалена.`);
        delete rooms[roomId];
      }
    });

    ws.on("error", (error) => {
      console.error("❌ Ошибка WebSocket:", error.message);
    });
  } catch (error) {
    console.error("❌ Ошибка WebSocket-соединения:", error);
    ws.close();
  }
});

server.listen(PORT, () => {
  console.log(`✅ WebSocket сервер запущен на порту ${PORT}`);
});
