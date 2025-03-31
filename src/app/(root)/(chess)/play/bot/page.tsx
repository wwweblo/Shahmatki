"use client";

import { useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"; // Import the necessary components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Card components for chart container
import { Button } from "@/components/ui/button"; // Import the Button component
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

const STOCKFISH_PATH = "/stockfish/stockfish.js"; // Stockfish path

type PlayerColor = 'w' | 'b';

// Добавим тип для уровня сложности
type Difficulty = {
  label: string;
  depth: number;
};

const difficulties: Difficulty[] = [
  { label: "Начинающий", depth: 5 },
  { label: "Средний", depth: 10 },
  { label: "Продвинутый", depth: 15 },
  { label: "Эксперт", depth: 20 }
];

const ChessPage = () => {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [stockfish, setStockfish] = useState<Worker | null>(null);
  const [evaluation, setEvaluation] = useState(0); // Evaluation of the current position
  const [depth, setDepth] = useState(10); // Depth for Stockfish
  const [history, setHistory] = useState<number[]>([]); // History of evaluations
  const [currentMove, setCurrentMove] = useState(0); // For syncing with chart
  const [boardSize, setBoardSize] = useState(500); // Board size
  const [isBotThinking, setIsBotThinking] = useState(false); // Bot thinking flag
  const [playerColor, setPlayerColor] = useState<PlayerColor>('w');
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(difficulties[1]);
  const [showSetupDialog, setShowSetupDialog] = useState(true);

  // 📏 Responsive board size
  useEffect(() => {
    const updateBoardSize = () => {
      const minSize = Math.min(window.innerWidth, window.innerHeight) * 0.8;
      setBoardSize(minSize > 600 ? 600 : minSize);
    };

    updateBoardSize();
    window.addEventListener("resize", updateBoardSize);
    return () => window.removeEventListener("resize", updateBoardSize);
  }, []);

  // 🏁 Initialize Stockfish engine
  useEffect(() => {
    const engine = new Worker(STOCKFISH_PATH);
    engine.postMessage("uci");
    setStockfish(engine);

    return () => {
      engine.terminate();
    };
  }, []);

  // 🎯 Update evaluation after move
  const updateEvaluation = useCallback(() => {
    if (!stockfish || game.isGameOver()) return;

    stockfish.postMessage(`position fen ${game.fen()}`);
    stockfish.postMessage(`go depth ${depth}`);

    stockfish.onmessage = (event) => {
      const response = event.data;
      if (response.includes("score cp")) {
        const match = response.match(/score cp (-?\d+)/);
        if (match) {
          // Оценка всегда с точки зрения белых
          const evalValue = parseInt(match[1], 10) / 100;
          // Если игрок играет черными, инвертируем оценку
          const adjustedEval = playerColor === 'w' ? evalValue : -evalValue;

          setHistory((prev) => [...prev.slice(0, currentMove), adjustedEval]);
          setEvaluation(adjustedEval);
        }
      }
    };
  }, [game, stockfish, depth, currentMove, playerColor]);

  // 🤖 Bot makes a move
  const makeBotMove = useCallback(() => {
    if (!stockfish || game.isGameOver()) {
      setIsBotThinking(false);
      return;
    }

    setIsBotThinking(true);

    const currentFen = game.fen(); // Сохраняем текущую позицию
    stockfish.postMessage(`position fen ${currentFen}`);
    stockfish.postMessage(`go depth ${depth}`);

    const handleMessage = (event: MessageEvent) => {
      const response = event.data;
      if (response.includes("bestmove")) {
        const bestMove = response.split("bestmove ")[1].split(" ")[0];

        if (bestMove && bestMove.length >= 4) {
          try {
            // Создаем новый экземпляр игры с текущей позицией
            const tempGame = new Chess(currentFen);
            const move = tempGame.move({ 
              from: bestMove.substring(0, 2), 
              to: bestMove.substring(2, 4), 
              promotion: "q" 
            });
            
            if (move) {
              // Обновляем основную игру
              game.move(move);
              setFen(game.fen());
              setCurrentMove((prev) => prev + 1);
              updateEvaluation();
            }
          } catch (error) {
            console.error('Ошибка хода бота:', error);
          }
        }
        setIsBotThinking(false);
        stockfish.removeEventListener('message', handleMessage);
      }
    };

    stockfish.addEventListener('message', handleMessage);
  }, [game, stockfish, depth, updateEvaluation]);

  // 👤 Player makes a move
  const onDrop = (sourceSquare: string, targetSquare: string) => {
    // Проверяем, не думает ли бот и началась ли игра
    if (isBotThinking || !gameStarted) return false;

    // Проверяем, чей сейчас ход
    const currentTurn = game.turn();
    
    // Проверяем, соответствует ли ход цвету игрока
    if (playerColor !== currentTurn) {
      console.log('Сейчас не ваш ход');
      return false;
    }

    try {
      const move = game.move({ 
        from: sourceSquare, 
        to: targetSquare, 
        promotion: "q" 
      });

      if (!move) return false;

      setFen(game.fen());
      setCurrentMove((prev) => prev + 1);
      updateEvaluation();
      setTimeout(makeBotMove, 500);
      return true;
    } catch (error) {
      console.error('Ошибка при выполнении хода:', error);
      return false;
    }
  };

  // ⏪ Undo move
  const undoMove = () => {
    if (game.history().length > 0) {
      game.undo();
      setFen(game.fen());
      setCurrentMove((prev) => Math.max(0, prev - 1));
    }
  };

  // 🎮 Start game
  const startGame = () => {
    const newGame = new Chess();
    
    // Сначала обновляем все состояния
    setGame(newGame);
    setFen(newGame.fen());
    setHistory([]);
    setCurrentMove(0);
    setGameStarted(true);
    setDepth(selectedDifficulty.depth);
    setShowSetupDialog(false);
    setIsBotThinking(false);

    // Если игрок выбрал черные фигуры, бот должен сделать первый ход
    if (playerColor === 'b') {
      // Используем setTimeout для гарантированного обновления состояния
      setTimeout(() => {
        if (!stockfish) return;
        
        setIsBotThinking(true);
        
        // Отправляем команды боту
        stockfish.postMessage('ucinewgame');
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
                  promotion: "q"
                });

                if (move) {
                  setGame(newGame);
                  setFen(newGame.fen());
                  setCurrentMove(1);
                  updateEvaluation();
                }
              } catch (error) {
                console.error('Ошибка первого хода бота:', error);
              }
            }
            setIsBotThinking(false);
            stockfish.removeEventListener('message', handleFirstMove);
          }
        };

        stockfish.addEventListener('message', handleFirstMove);
      }, 500);
    }
  };

  // Функция сброса игры
  const resetGame = () => {
    setGameStarted(false);
    setShowSetupDialog(true);
    setHistory([]);
    setCurrentMove(0);
    setEvaluation(0);
  };

  // 📊 Chart data
  const evaluationData = history.map((score, index) => ({
    name: `Move ${index + 1}`,
    score,
  }));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4" style={{ background: "transparent" }}>
      <h1 className="text-2xl font-bold mb-4">Шахматы против компьютера</h1>

      <Dialog open={showSetupDialog} onOpenChange={(open) => {
        if (gameStarted) return; // Предотвращаем закрытие диалога во время игры
        setShowSetupDialog(open);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Настройка новой партии</DialogTitle>
            <DialogDescription>
              Выберите цвет фигур и уровень сложности компьютера
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium leading-none">Выберите цвет:</h4>
              <div className="flex gap-4">
                <Button
                  onClick={() => setPlayerColor('w')}
                  variant={playerColor === 'w' ? 'default' : 'outline'}
                  className="flex-1"
                >
                  Белые
                </Button>
                <Button
                  onClick={() => setPlayerColor('b')}
                  variant={playerColor === 'b' ? 'default' : 'outline'}
                  className="flex-1"
                >
                  Черные
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium leading-none">Уровень сложности:</h4>
              <div className="grid grid-cols-2 gap-2">
                {difficulties.map((diff) => (
                  <Button
                    key={diff.depth}
                    onClick={() => setSelectedDifficulty(diff)}
                    variant={selectedDifficulty.depth === diff.depth ? 'default' : 'outline'}
                  >
                    {diff.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={startGame} className="w-full">
              Начать игру
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {gameStarted && (
        <>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-sm">
              Играете за: {playerColor === 'w' ? 'белых' : 'черных'}
            </div>
            <div className="text-sm">
              Сложность: {selectedDifficulty.label}
            </div>
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
              boardOrientation={playerColor === 'w' ? 'white' : 'black'}
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
            <div className="text-center mb-2">Оценка позиции: {evaluation.toFixed(2)}</div>

            <Card>
              <CardHeader>
                <CardTitle>График оценки позиции</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={evaluationData}
                    margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default ChessPage;