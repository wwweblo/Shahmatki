'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { useSession } from 'next-auth/react';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { ChessboardDnDProvider, SparePiece } from 'react-chessboard';

type Piece = 'wP' | 'wN' | 'wB' | 'wR' | 'wQ' | 'wK' | 'bP' | 'bN' | 'bB' | 'bR' | 'bQ' | 'bK';

const buttonStyle = {
    margin: '10px',
    padding: '8px 16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    cursor: 'pointer',
};

const inputStyle = {
    width: '100%',
    padding: '8px',
    margin: '10px 0',
    borderRadius: '4px',
    border: '1px solid #ccc',
};

export default function NewArticlePage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [hasChessBoard, setHasChessBoard] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const game = useMemo(() => new Chess("4k3/8/8/8/8/8/8/4K3 w - - 0 1"), []);
    const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
    const [boardWidth, setBoardWidth] = useState(360);
    const [fenPosition, setFenPosition] = useState(game.fen());

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    const handleSparePieceDrop = (piece: Piece, targetSquare: Square) => {
        const color = piece[0] as Color;
        const type = piece[1].toLowerCase() as PieceSymbol;
        const success = game.put({
            type,
            color
        }, targetSquare);
        if (success) {
            setFenPosition(game.fen());
        } else {
            alert(`На доске уже есть ${color === "w" ? "БЕЛЫЙ" : "ЧЁРНЫЙ"} КОРОЛЬ`);
        }
        return success;
    };

    const handlePieceDrop = (sourceSquare: Square, targetSquare: Square, piece: Piece) => {
        const color = piece[0] as Color;
        const type = piece[1].toLowerCase() as PieceSymbol;

        game.remove(sourceSquare);
        game.remove(targetSquare);
        const success = game.put({
            type,
            color
        }, targetSquare);
        if (success) setFenPosition(game.fen());
        return success;
    };

    const handlePieceDropOffBoard = (sourceSquare: Square) => {
        game.remove(sourceSquare);
        setFenPosition(game.fen());
    };

    const handleFenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fen = e.target.value;
        try {
            game.load(fen);
            setFenPosition(game.fen());
        } catch (error) {
            console.error('Неверный FEN:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/articles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    content,
                    fenPosition: hasChessBoard ? fenPosition : null,
                    hasChessBoard,
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            router.push('/articles');
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при создании статьи');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="w-[90%] mx-auto py-8 px-4">
                <div className="text-center">Загрузка...</div>
            </div>
        );
    }

    if (!session?.user) {
        return null;
    }

    const pieces = ["wP", "wN", "wB", "wR", "wQ", "wK", "bP", "bN", "bB", "bR", "bQ", "bK"];

    return (
        <div className="w-[90%] mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Новая статья</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="title">Заголовок</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <MarkdownEditor
                        value={content}
                        onChange={setContent}
                        label="Содержание"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="hasChessBoard"
                        checked={hasChessBoard}
                        onCheckedChange={(checked) => setHasChessBoard(checked as boolean)}
                    />
                    <Label htmlFor="hasChessBoard">Добавить шахматную позицию</Label>
                </div>

                {hasChessBoard && (
                    <div className="mt-8">
                        <ChessboardDnDProvider>
                            <div>
                                <div style={{
                                    display: "flex",
                                    margin: `${boardWidth / 32}px ${boardWidth / 8}px`
                                }}>
                                    {pieces.slice(6, 12).map(piece => (
                                        <SparePiece key={piece} piece={piece as Piece} width={boardWidth / 8} dndId="ManualBoardEditor" />
                                    ))}
                                </div>
                                <Chessboard
                                    onBoardWidthChange={setBoardWidth}
                                    id="ManualBoardEditor"
                                    boardOrientation={boardOrientation}
                                    position={game.fen()}
                                    onSparePieceDrop={handleSparePieceDrop}
                                    onPieceDrop={handlePieceDrop}
                                    onPieceDropOffBoard={handlePieceDropOffBoard}
                                    dropOffBoardAction="trash"
                                    customBoardStyle={{
                                        borderRadius: "4px",
                                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)"
                                    }}
                                />
                                <div style={{
                                    display: "flex",
                                    margin: `${boardWidth / 32}px ${boardWidth / 8}px`
                                }}>
                                    {pieces.slice(0, 6).map(piece => (
                                        <SparePiece key={piece} piece={piece as Piece} width={boardWidth / 8} dndId="ManualBoardEditor" />
                                    ))}
                                </div>
                            </div>
                            <div style={{
                                display: "flex",
                                justifyContent: "center",
                                marginTop: "20px"
                            }}>
                                <button
                                    type="button"
                                    style={buttonStyle}
                                    onClick={() => {
                                        game.reset();
                                        setFenPosition(game.fen());
                                    }}
                                >
                                    Начальная позиция ♟️
                                </button>
                                <button
                                    type="button"
                                    style={buttonStyle}
                                    onClick={() => {
                                        game.clear();
                                        setFenPosition(game.fen());
                                    }}
                                >
                                    Очистить доску 🗑️
                                </button>
                                <button
                                    type="button"
                                    style={buttonStyle}
                                    onClick={() => {
                                        setBoardOrientation(boardOrientation === "white" ? "black" : "white");
                                    }}
                                >
                                    Перевернуть доску 🔁
                                </button>
                            </div>
                            <input
                                value={fenPosition}
                                style={inputStyle}
                                onChange={handleFenInputChange}
                                placeholder="Вставьте FEN позицию для редактирования"
                            />
                        </ChessboardDnDProvider>
                    </div>
                )}

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </form>
        </div>
    );
} 