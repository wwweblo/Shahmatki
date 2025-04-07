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
        creatorPreference: preferredColor || 'random',
        rematchRequests: new Set(),
      };
    }

    const room = rooms[roomId];
    room.clients.add(ws);
    ws.playerId = playerId;

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

    // Проверяем, завершилась ли игра
    const checkGameOver = () => {
      const game = room.game;
      if (game.isGameOver()) {
        let result = "";
        let reason = "";

        if (game.isCheckmate()) {
          const winner = game.turn() === 'w' ? "Черные" : "Белые";
          result = `${winner} победили`;
          reason = "Мат";
        } else if (game.isDraw()) {
          result = "Ничья";
          if (game.isStalemate()) {
            reason = "Пат";
          } else if (game.isThreefoldRepetition()) {
            reason = "Троекратное повторение позиции";
          } else if (game.isInsufficientMaterial()) {
            reason = "Недостаточно материала";
          } else {
            reason = "Правило 50 ходов";
          }
        }

        // Отправляем всем уведомление о завершении игры
        room.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: "game_over",
              result,
              reason
            }));
          }
        });

        return true;
      }
      return false;
    };

    // Функция для сброса игры при реванше
    const resetGame = () => {
      room.game = new Chess();
      room.moveHistory = [];
      room.rematchRequests.clear();
      room.gameStarted = true;

      // Меняем цвета игроков
      const tempWhite = room.players.white;
      room.players.white = room.players.black;
      room.players.black = tempWhite;

      // Уведомляем всех о новой игре
      room.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          const playerColor = 
            room.players.white === client.playerId
              ? "white"
              : room.players.black === client.playerId
              ? "black"
              : "spectator";
              
          client.send(JSON.stringify({
            type: "rematch_started",
            color: playerColor,
            whitePlayer: room.players.white,
            blackPlayer: room.players.black
          }));
        }
      });
    };

    // Получаем ходы и другие сообщения от игроков
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

          // Проверяем, завершилась ли игра
          checkGameOver();
        } 
        // Обработка запроса на реванш
        else if (data.type === "rematch_request") {
          // Добавляем игрока в список запросивших реванш
          room.rematchRequests.add(playerId);
          console.log(`⚔️ Игрок ${playerId} запросил реванш`);

          // Найдем id оппонента
          let opponentId = null;
          if (room.players.white === playerId) {
            opponentId = room.players.black;
          } else if (room.players.black === playerId) {
            opponentId = room.players.white;
          }

          if (!opponentId) {
            console.warn(`❌ Не удалось найти оппонента для ${playerId}`);
            return;
          }

          // Отправляем запрос на реванш противнику
          room.clients.forEach((client) => {
            if (client.playerId === opponentId && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: "rematch_request",
                fromPlayerId: playerId,
                message: "Противник хочет сыграть реванш"
              }));
            }
          });

          // Если оба игрока запросили реванш, начинаем новую игру
          if (room.rematchRequests.size === 2) {
            console.log(`🔄 Реванш начат в комнате ${roomId}`);
            resetGame();
          }
        }
        // Принятие реванша
        else if (data.type === "rematch_accept") {
          room.rematchRequests.add(playerId);
          console.log(`✅ Игрок ${playerId} принял реванш`);

          // Если оба игрока согласны, начинаем новую игру
          if (room.rematchRequests.size === 2) {
            console.log(`🔄 Реванш начат в комнате ${roomId}`);
            resetGame();
          }
        }
        // Отклонение реванша
        else if (data.type === "rematch_decline") {
          console.log(`❌ Игрок ${playerId} отклонил реванш`);
          room.rematchRequests.clear(); // Очищаем все запросы

          // Сообщаем другому игроку об отклонении
          room.clients.forEach((client) => {
            if (client.playerId !== playerId && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: "rematch_declined",
                message: "Противник отклонил предложение реванша"
              }));
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

      // Очищаем запрос на реванш, если игрок отключился
      room.rematchRequests.delete(playerId);

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
