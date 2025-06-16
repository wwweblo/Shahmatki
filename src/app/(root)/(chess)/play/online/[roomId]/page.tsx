"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import WaitingScreen from "./waiting-screen";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const preferredColor = searchParams.get("preferredColor");

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [game, setGame] = useState(new Chess());
  const [playerColor, setPlayerColor] = useState<"white" | "black" | null>(
    null
  );
  const [isSpectator, setIsSpectator] = useState(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState(true);
  const [gameUrl, setGameUrl] = useState<string | null>(null);
  const [boardSize, setBoardSize] = useState(600); // Начальный размер доски
  const wsRef = useRef<WebSocket | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  // Добавим состояния для отображения результата игры
  const [isGameOverDialogOpen, setIsGameOverDialogOpen] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [gameResultReason, setGameResultReason] = useState<string | null>(null);
  // Добавляем новые состояния для обработки запросов на реванш
  const [rematchRequested, setRematchRequested] = useState(false);
  const [rematchDialogOpen, setRematchDialogOpen] = useState(false);
  const [opponentRematchRequest, setOpponentRematchRequest] = useState(false);

  // Функция для показа ошибки на 3 секунды
  const showError = (message: string) => {
    toast(message);
  };

  // 🚀 Загружаем playerId ТОЛЬКО в браузере
  useEffect(() => {
    let id = localStorage.getItem("playerId");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("playerId", id);
    }
    setPlayerId(id);
  }, []);

  // ✅ Безопасно получаем URL в браузере
  useEffect(() => {
    if (typeof window !== "undefined") {
      setGameUrl(window.location.href);
    }
  }, []);

  // 📏 Устанавливаем адаптивный размер доски
  useEffect(() => {
    const updateBoardSize = () => {
      const minSize = Math.min(window.innerWidth, window.innerHeight) * 0.8;
      setBoardSize(minSize > 600 ? 600 : minSize);
    };

    updateBoardSize();
    window.addEventListener("resize", updateBoardSize);
    return () => window.removeEventListener("resize", updateBoardSize);
  }, []);

  useEffect(() => {
    if (!roomId || !playerId) return;

    const wsProtocol =
      typeof window !== "undefined" && window.location.protocol === "https:"
        ? "wss"
        : "ws";
    const wsUrl = `${wsProtocol}://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:4000?roomId=${roomId}&playerId=${playerId}&preferredColor=${preferredColor}`;

    console.log(`🔌 Подключение к WebSocket: ${wsUrl}`);

    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.error) {
        console.error("❌ Ошибка:", data.error);
        if (data.error === "Игра уже заполнена") setIsSpectator(true);
        return;
      }

      if (data.type === "init") {
        setPlayerColor(data.color);
        setIsSpectator(data.color === "spectator");
        setGameStarted(data.gameStarted);

        if (data.opponentConnected) {
          setWaitingForOpponent(false);
        }

        setGame(() => {
          const newGame = new Chess();
          data.moves.forEach((move: string) => {
            try {
              newGame.move(move);
            } catch (error) {
              console.warn("⚠️ Ошибка применения хода (init):", move, error);
            }
          });
          return newGame;
        });
      } else if (data.type === "game_started") {
        setGameStarted(true);
        setWaitingForOpponent(false);
        showError("Игра началась! ⚔️");
      } else if (data.type === "move") {
        setGame((prevGame) => {
          const newGame = new Chess(prevGame.fen());
          try {
            newGame.move(data.move);
            console.log("♟️ Применен ход:", data.move);

            // Проверяем окончание игры после каждого хода
            checkGameOver(newGame);
          } catch (error) {
            console.error("❌ Невалидный ход от сервера:", data.move, error);
            return prevGame;
          }
          return newGame;
        });
      } else if (data.type === "opponent_joined") {
        setWaitingForOpponent(false);
      } else if (data.type === "game_over") {
        // Обрабатываем окончание игры от сервера
        handleGameOver(data.result, data.reason);
      } else if (data.type === "rematch_request") {
        // Обрабатываем запрос на реванш от оппонента
        console.log("Получен запрос на реванш");
        setOpponentRematchRequest(true);
        setRematchDialogOpen(true);
        showError("Противник предлагает реванш! ⚔️");
      } else if (data.type === "rematch_started") {
        // Новая игра после реванша
        console.log("Начинаем реванш");
        setIsGameOverDialogOpen(false);
        setRematchDialogOpen(false);
        setGameStarted(true);
        setRematchRequested(false);
        setOpponentRematchRequest(false);

        // Обновляем цвет игрока, если он изменился
        if (data.color) {
          setPlayerColor(data.color);
        }

        // Сбрасываем игру
        setGame(new Chess());
        showError("Реванш начался! ⚔️");
      } else if (data.type === "rematch_declined") {
        // Противник отклонил реванш
        setRematchRequested(false);
        showError("Противник отклонил предложение реванша 😢");
      }
    };

    return () => socket.close();
  }, [roomId, playerId, preferredColor]);

  // Функция проверки окончания игры
  const checkGameOver = (gameInstance: Chess) => {
    if (gameInstance.isGameOver()) {
      let result = "";
      let reason = "";

      if (gameInstance.isCheckmate()) {
        const winner = gameInstance.turn() === "w" ? "Черные" : "Белые";
        result = `${winner} победили`;
        reason = "Мат";
      } else if (gameInstance.isDraw()) {
        result = "Ничья";
        if (gameInstance.isStalemate()) {
          reason = "Пат";
        } else if (gameInstance.isThreefoldRepetition()) {
          reason = "Троекратное повторение позиции";
        } else if (gameInstance.isInsufficientMaterial()) {
          reason = "Недостаточно материала";
        } else {
          reason = "Правило 50 ходов";
        }
      }

      handleGameOver(result, reason);
    }
  };

  const handleGameOver = (result: string, reason: string) => {
    setGameResult(result);
    setGameResultReason(reason);
    setIsGameOverDialogOpen(true);
  };

  const makeMove = (move: { from: string; to: string; promotion?: string }) => {
    if (!wsRef.current || isSpectator || game.turn() !== playerColor?.[0])
      return;

    setGame((prevGame) => {
      const newGame = new Chess(prevGame.fen());

      // ✅ Проверяем валидность хода ДО его применения
      try {
        const moveResult = newGame.move(move);
        if (!moveResult) {
          throw new Error("Невозможный ход");
        }

        // Проверяем окончание игры после своего хода
        checkGameOver(newGame);
      } catch {
        console.warn("⚠️ Ошибка: невозможный ход", move);
        showError("❌ Этот ход невозможен!");
        return prevGame;
      }

      console.log(`📤 Отправка хода:`, move);
      wsRef.current?.send(JSON.stringify({ type: "move", move }));
      return newGame;
    });
  };

  // Функция для запроса реванша
  const requestRematch = () => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: "rematch_request" }));
      setRematchRequested(true);
      showError("Запрос на реванш отправлен");
      setIsGameOverDialogOpen(false);
    }
  };

  // Функция для принятия предложения о реванше
  const acceptRematch = () => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: "rematch_accept" }));
      setRematchDialogOpen(false);
      showError("Вы приняли предложение реванша");
    }
  };

  // Функция для отклонения предложения о реванше
  const declineRematch = () => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: "rematch_decline" }));
      setRematchDialogOpen(false);
      setOpponentRematchRequest(false);
    }
  };

  // Функция для скачивания PGN
  const downloadPGN = () => {
    const pgn = game.pgn();
    const blob = new Blob([pgn], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chess-game-${new Date().toISOString().slice(0, 10)}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Обновляем экран ожидания
  if (waitingForOpponent) {
    return <WaitingScreen />;
  }

  return (
    <div className="flex flex-col items-center h-screen">
      <div className="mb-4 text-center">
        <h1 className="text-2xl">
          {isSpectator
            ? "Вы зритель"
            : gameStarted
              ? `Вы играете за ${playerColor === "white" ? "белых" : "черных"}`
              : "Ожидание начала игры..."}
        </h1>
        {gameStarted && (
          <Badge variant="secondary" className="px-3 py-1">
            <div className="w-2 h-2 bg-blue-300 rounded-full mr-2 animate-pulse" />
            {game.turn() === playerColor?.[0] ? "Ваш ход!" : "Ход противника"}
          </Badge>
        )}
        {opponentRematchRequest && !rematchDialogOpen && (
          <p className="text-yellow-400 mt-2">
            Противник хочет сыграть еще раз!
          </p>
        )}
      </div>

      <div>
        <Chessboard
          position={game.fen()}
          onPieceDrop={(s, t) => {
            if (!gameStarted) {
              showError("❌ Дождитесь начала игры!");
              return false;
            }

            const move = { from: s, to: t, promotion: "q" };

            if (!isSpectator && game.turn() === playerColor?.[0]) {
              makeMove(move);
              return true;
            }

            showError("❌ Сейчас не ваш ход!");
            return false;
          }}
          boardOrientation={playerColor || "white"}
          boardWidth={boardSize}
        />
      </div>

      {/* Диалоговое окно с результатом игры */}
      <Dialog
        open={isGameOverDialogOpen}
        onOpenChange={setIsGameOverDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Игра окончена</DialogTitle>
            <DialogDescription>
              {gameResult}: {gameResultReason}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-between gap-2 sm:justify-between">
            <Button onClick={() => setIsGameOverDialogOpen(false)}>
              Закрыть
            </Button>
            <Button onClick={downloadPGN}>Скачать партию</Button>
            <Button onClick={requestRematch} disabled={rematchRequested}>
              {rematchRequested ? "Ожидание..." : "Реванш"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалоговое окно с запросом на реванш */}
      <Dialog open={rematchDialogOpen} onOpenChange={setRematchDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Запрос на реванш</DialogTitle>
            <DialogDescription>
              Противник предлагает сыграть еще одну партию. Принять вызов?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-between gap-2 sm:justify-between">
            <Button onClick={declineRematch} variant="outline">
              Отклонить
            </Button>
            <Button onClick={acceptRematch}>Принять вызов</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
}
