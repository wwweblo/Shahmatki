'use client';

import { ArticleEditor } from './ArticleEditor';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { ChessboardDnDProvider } from 'react-chessboard';
import { useState, useMemo } from 'react';

interface Article {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    hasChessBoard: boolean;
    fenPosition: string | null;
    author: {
        id: string;
        email: string | null;
    };
}

interface ArticleEditorWrapperProps {
    article: Article;
    isAuthor: boolean;
}

export function ArticleEditorWrapper({ article, isAuthor }: ArticleEditorWrapperProps) {
    const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
    const [currentPosition, setCurrentPosition] = useState<string | null>(null);
    const [showPromotionDialog, setShowPromotionDialog] = useState(false);
    const [pendingMove, setPendingMove] = useState<{ from: Square; to: Square } | null>(null);
    
    const game = useMemo(() => {
        if (article.hasChessBoard && article.fenPosition) {
            return new Chess(article.fenPosition);
        }
        return new Chess("4k3/8/8/8/8/8/8/4K3 w - - 0 1");
    }, [article.hasChessBoard, article.fenPosition]);

    const handleSave = async (content: string) => {
        try {
            const response = await fetch(`/api/articles/${article.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content }),
            });

            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error updating article:', error);
        }
    };

    const handleCancel = () => {
        // Ничего не делаем при отмене
    };

    const handlePieceDrop = (sourceSquare: Square, targetSquare: Square) => {
        // Проверяем, является ли ход легальным
        const moves = game.moves({ square: sourceSquare, verbose: true });
        const isLegalMove = moves.some(move => move.to === targetSquare);

        if (!isLegalMove) {
            return false;
        }

        // Проверяем, является ли ход превращением пешки
        const piece = game.get(sourceSquare);
        if (piece && piece.type === 'p' && (targetSquare[1] === '1' || targetSquare[1] === '8')) {
            setPendingMove({ from: sourceSquare, to: targetSquare });
            setShowPromotionDialog(true);
            return false;
        }

        // Выполняем ход
        const move = game.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q'
        });
        
        if (move) {
            setCurrentPosition(game.fen());
            return true;
        }
        return false;
    };

    const handlePromotion = (piece: 'q' | 'r' | 'b' | 'n') => {
        if (pendingMove) {
            const move = game.move({
                from: pendingMove.from,
                to: pendingMove.to,
                promotion: piece
            });
            
            if (move) {
                setCurrentPosition(game.fen());
            }
            setShowPromotionDialog(false);
            setPendingMove(null);
        }
    };

    const resetPosition = () => {
        if (article.fenPosition) {
            game.load(article.fenPosition);
            setCurrentPosition(article.fenPosition);
        }
    };

    return (
        <div className="space-y-8">
            <ArticleEditor
                article={article}
                isAuthor={isAuthor}
                onSave={handleSave}
                onCancel={handleCancel}
            />
            
            {article.hasChessBoard && (
                <div className="mt-8">
                    <ChessboardDnDProvider>
                        <div>
                            <Chessboard
                                id="ArticleChessboard"
                                boardOrientation={boardOrientation}
                                position={currentPosition || game.fen()}
                                onPieceDrop={handlePieceDrop}
                                customBoardStyle={{
                                    borderRadius: "4px",
                                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)"
                                }}
                            />
                        </div>
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            marginTop: "20px"
                        }}>
                            <button
                                type="button"
                                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={resetPosition}
                            >
                                Вернуть начальную позицию 🔄
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ml-2"
                                onClick={() => {
                                    setBoardOrientation(boardOrientation === "white" ? "black" : "white");
                                }}
                            >
                                Перевернуть доску 🔁
                            </button>
                        </div>
                    </ChessboardDnDProvider>
                </div>
            )}

            {showPromotionDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">Выберите фигуру для превращения</h3>
                        <div className="grid grid-cols-4 gap-2">
                            <button
                                onClick={() => handlePromotion('q')}
                                className="p-2 border rounded hover:bg-gray-100"
                            >
                                Ферзь
                            </button>
                            <button
                                onClick={() => handlePromotion('r')}
                                className="p-2 border rounded hover:bg-gray-100"
                            >
                                Ладья
                            </button>
                            <button
                                onClick={() => handlePromotion('b')}
                                className="p-2 border rounded hover:bg-gray-100"
                            >
                                Слон
                            </button>
                            <button
                                onClick={() => handlePromotion('n')}
                                className="p-2 border rounded hover:bg-gray-100"
                            >
                                Конь
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 