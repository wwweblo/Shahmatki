"use client";

import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { useStockfish } from "@/hooks/useStockfish";
import { useResponsiveBoard } from "@/hooks/useResponsiveBoard";
import { fetchPosition } from "@/utils/fetchPosition";
import { ChessboardSection } from "@/components/ChessboardSection";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { PositionInfo } from "@/components/PositionInfo";
import { Controls } from "@/components/Controls";
import { EvaluationChart } from "@/components/EvaluationChart";

export default function AnalysisPage() {
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [currentPosition, setCurrentPosition] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [evaluationList, setEvaluationList] = useState<number[]>([]);
  const boardWidth = useResponsiveBoard();

  const { evaluationHistory, depth, bestMove, isAnalyzing } = useStockfish(
    game,
    showAnalysis
  );

  const latestEvaluation = evaluationHistory.at(-1)?.evaluation ?? 0;

  const checkPosition = async (fen: string) => {
    setLoading(true);
    const pos = await fetchPosition(fen);
    setCurrentPosition(pos);
    setLoading(false);
  };

  const onPieceDrop = (from: string, to: string) => {
    const gameCopy = new Chess(game.fen());
    const move = gameCopy.move({ from, to, promotion: "q" });
    if (!move) return false;

    const newMoveHistory = [...moveHistory, move.san];
    const newEvalList = [...evaluationList];

    if (showAnalysis) {
      newEvalList.push(latestEvaluation); // сохраняем оценку текущей позиции
    }

    setGame(gameCopy);
    setMoveHistory(newMoveHistory);
    setEvaluationList(newEvalList);
    setCurrentMoveIndex(newMoveHistory.length - 1);
    checkPosition(gameCopy.fen());

    return true;
  };

  const undoMove = () => {
    if (currentMoveIndex < 0) return;
    const gameCopy = new Chess();
    const newHistory = moveHistory.slice(0, currentMoveIndex);
    newHistory.forEach((move) => gameCopy.move(move));

    setGame(gameCopy);
    setMoveHistory(newHistory);
    setEvaluationList((prev) => prev.slice(0, newHistory.length));
    setCurrentMoveIndex((prev) => prev - 1);
    checkPosition(gameCopy.fen());
  };

  const redoMove = () => {
    if (currentMoveIndex >= moveHistory.length - 1) return;
    const gameCopy = new Chess();
    const newHistory = moveHistory.slice(0, currentMoveIndex + 2);
    newHistory.forEach((move) => gameCopy.move(move));

    setGame(gameCopy);
    setMoveHistory(newHistory);
    setEvaluationList((prev) => prev.slice(0, newHistory.length));
    setCurrentMoveIndex((prev) => prev + 1);
    checkPosition(gameCopy.fen());
  };

  const resetBoard = () => {
    const initial = new Chess();
    setGame(initial);
    setMoveHistory([]);
    setEvaluationList([]);
    setCurrentMoveIndex(-1);
    checkPosition(initial.fen());
  };

  const handleFenInput = (fen: string) => {
    try {
      const newGame = new Chess();
      newGame.load(fen);
      const moves = newGame.history();
      setGame(newGame);
      setMoveHistory(moves);
      setEvaluationList(Array(moves.length).fill(0)); // обнуление оценок при ручной загрузке
      setCurrentMoveIndex(moves.length - 1);
      checkPosition(newGame.fen());
    } catch (error) {
      console.error("Ошибка загрузки FEN", error);
    }
  };

  const chartData = evaluationList.map((score, idx) => ({
    name: `Ход ${idx + 1}`,
    score,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold">Анализ позиции</h1>
        {isAnalyzing && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChessboardSection
          fen={game.fen()}
          onPieceDrop={onPieceDrop}
          boardWidth={boardWidth}
          bestMove={bestMove}
          onFenChange={handleFenInput}
        />

        <aside className="flex flex-col gap-4">
          <Controls
            onReset={resetBoard}
            onUndo={undoMove}
            onRedo={redoMove}
            canUndo={currentMoveIndex >= 0}
            canRedo={currentMoveIndex < moveHistory.length - 1}
            showAnalysis={showAnalysis}
            toggleAnalysis={setShowAnalysis}
          />
          <PositionInfo loading={loading} position={currentPosition} />
          {showAnalysis && (
            <>
              <AnalysisPanel
                evaluation={latestEvaluation}
                depth={depth}
                bestMove={bestMove}
              />
              <EvaluationChart data={chartData} className="w-full" />
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
