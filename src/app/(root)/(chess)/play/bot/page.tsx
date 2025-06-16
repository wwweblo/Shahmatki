"use client";

import { useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Button } from "@/components/ui/button";
import { EvaluationChart } from "@/components/EvaluationChart";

const STOCKFISH_PATH = "/stockfish/stockfish.js";

type PlayerColor = "w" | "b";

type Difficulty = {
  label: string;
  depth: number;
};

const difficulties: Difficulty[] = [
  { label: "🐤 Начинающий", depth: 5 },
  { label: "😎 Средний", depth: 10 },
  { label: "🤓 Продвинутый", depth: 15 },
];

const ChessPage = () => {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [stockfish, setStockfish] = useState<Worker | null>(null);
  const [evaluation, setEvaluation] = useState(0);
  const [depth, setDepth] = useState(10);
  const [history, setHistory] = useState<number[]>([]);
  const [currentMove, setCurrentMove] = useState(0);
  const [boardSize, setBoardSize] = useState(500);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [playerColor, setPlayerColor] = useState<PlayerColor>("w");
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(
    difficulties[1]
  );

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
    const engine = new Worker(STOCKFISH_PATH);
    engine.postMessage("uci");
    setStockfish(engine);
    return () => engine.terminate();
  }, []);

  const updateEvaluation = useCallback(() => {
    if (!stockfish || game.isGameOver()) return;

    stockfish.postMessage(`position fen ${game.fen()}`);
    stockfish.postMessage(`go depth ${depth}`);

    stockfish.onmessage = (event) => {
      const response = event.data;
      if (response.includes("score cp")) {
        const match = response.match(/score cp (-?\d+)/);
        if (match) {
          const evalValue = parseInt(match[1], 10) / 100;
          const adjustedEval = playerColor === "w" ? evalValue : -evalValue;

          setHistory((prev) => [...prev.slice(0, currentMove), adjustedEval]);
          setEvaluation(adjustedEval);
        }
      }
    };
  }, [game, stockfish, depth, currentMove, playerColor]);

  const makeBotMove = useCallback(() => {
    if (!stockfish || game.isGameOver()) {
      setIsBotThinking(false);
      return;
    }

    setIsBotThinking(true);
    const currentFen = game.fen();
    stockfish.postMessage(`position fen ${currentFen}`);
    stockfish.postMessage(`go depth ${depth}`);

    const handleMessage = (event: MessageEvent) => {
      const response = event.data;
      if (response.includes("bestmove")) {
        const bestMove = response.split("bestmove ")[1].split(" ")[0];

        if (bestMove && bestMove.length >= 4) {
          try {
            const tempGame = new Chess(currentFen);
            const move = tempGame.move({
              from: bestMove.substring(0, 2),
              to: bestMove.substring(2, 4),
              promotion: "q",
            });

            if (move) {
              game.move(move);
              setFen(game.fen());
              setCurrentMove((prev) => prev + 1);
              updateEvaluation();
            }
          } catch (error) {
            console.error("Ошибка хода бота:", error);
          }
        }

        setIsBotThinking(false);
        stockfish.removeEventListener("message", handleMessage);
      }
    };

    stockfish.addEventListener("message", handleMessage);
  }, [game, stockfish, depth, updateEvaluation]);

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (isBotThinking || !gameStarted) return false;

    if (playerColor !== game.turn()) {
      console.log("Сейчас не ваш ход");
      return false;
    }

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
      if (!move) return false;

      setFen(game.fen());
      setCurrentMove((prev) => prev + 1);
      updateEvaluation();
      setTimeout(makeBotMove, 500);
      return true;
    } catch (error) {
      console.error("Ошибка при выполнении хода:", error);
      return false;
    }
  };

  const undoMove = () => {
    if (game.history().length > 0) {
      game.undo();
      setFen(game.fen());
      setCurrentMove((prev) => Math.max(0, prev - 1));
    }
  };

  const startGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setHistory([]);
    setCurrentMove(0);
    setGameStarted(true);
    setDepth(selectedDifficulty.depth);
    setIsBotThinking(false);

    if (playerColor === "b") {
      setTimeout(() => {
        if (!stockfish) return;
        setIsBotThinking(true);

        stockfish.postMessage("ucinewgame");
        stockfish.postMessage(`position startpos`);
        stockfish.postMessage(`go depth ${selectedDifficulty.depth}`);

        const handleFirstMove = (event: MessageEvent) => {
          const response = event.data;
          if (response.includes("bestmove")) {
            const bestMove = response.split("bestmove ")[1].split(" ")[0];
            if (bestMove && bestMove.length >= 4) {
              try {
                const move = newGame.move({
                  from: bestMove.substring(0, 2),
                  to: bestMove.substring(2, 4),
                  promotion: "q",
                });

                if (move) {
                  setGame(newGame);
                  setFen(newGame.fen());
                  setCurrentMove(1);
                  updateEvaluation();
                }
              } catch (error) {
                console.error("Ошибка первого хода бота:", error);
              }
            }
            setIsBotThinking(false);
            stockfish.removeEventListener("message", handleFirstMove);
          }
        };

        stockfish.addEventListener("message", handleFirstMove);
      }, 500);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setHistory([]);
    setCurrentMove(0);
    setEvaluation(0);
  };

  const evaluationData = history.map((score, index) => ({
    name: `Ход ${index + 1}`,
    score,
  }));

  return (
    <div className="flex flex-col items-center min-h-screen p-4 gap-6">
      <h1 className="text-2xl font-bold">Шахматы против компьютера</h1>

      {!gameStarted && (
        <div className="w-full max-w-md p-6 border rounded-lg bg-background shadow">
          <h2 className="text-lg font-semibold mb-4">Настройка новой партии</h2>

          <div className="mb-6">
            <h4 className="text-sm font-medium mb-2">Выберите цвет фигур:</h4>
            <div className="flex gap-4">
              <Button
                onClick={() => setPlayerColor("w")}
                className={`flex-1 ${playerColor === "w" ? "bg-neutral-100 text-black hover:bg-neutral-300" : "bg-muted text-white hover:bg-neutral-600"}`}
              >
                Белые
              </Button>
              <Button
                onClick={() => setPlayerColor("b")}
                className={`flex-1 ${playerColor === "b" ? "bg-neutral-100 text-black hover:bg-neutral-300" : "bg-muted text-white hover:bg-neutral-600"}`}
              >
                Черные
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium mb-2">Уровень сложности:</h4>
            <div className="grid grid-cols-2 gap-2">
              {difficulties.map((diff) => (
                <Button
                  key={diff.depth}
                  onClick={() => setSelectedDifficulty(diff)}
                  variant={
                    selectedDifficulty.depth === diff.depth
                      ? "default"
                      : "outline"
                  }
                >
                  {diff.label}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={startGame} className="w-full">
            Начать игру
          </Button>
        </div>
      )}

      {gameStarted && (
        <>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              Играете за: {playerColor === "w" ? "белых" : "черных"}
            </div>
            <div className="text-sm">Сложность: {selectedDifficulty.label}</div>
            <Button variant="outline" size="sm" onClick={resetGame}>
              Новая игра
            </Button>
          </div>

          <div style={{ width: boardSize, height: boardSize }}>
            <Chessboard
              position={fen}
              onPieceDrop={onDrop}
              boardWidth={boardSize}
              animationDuration={300}
              boardOrientation={playerColor === "w" ? "white" : "black"}
            />
          </div>

          <Button
            className="mt-4 p-2"
            variant="secondary"
            size="default"
            onClick={undoMove}
          >
            ⏪ Отменить ход
          </Button>

          <div className="w-full max-w-md mt-4">
            <div className="text-center mb-2">
              Оценка позиции: {evaluation.toFixed(2)}
            </div>
            <EvaluationChart data={evaluationData} />
          </div>
        </>
      )}
    </div>
  );
};

export default ChessPage;
