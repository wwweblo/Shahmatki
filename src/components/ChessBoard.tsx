'use client';

import { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface ChessBoardProps {
    initialFen?: string;
    onChange?: (fen: string) => void;
    isInteractive?: boolean;
}

export function ChessBoard({ initialFen, onChange, isInteractive = false }: ChessBoardProps) {
    const [game, setGame] = useState<Chess>(new Chess());
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (initialFen) {
            try {
                const newGame = new Chess();
                newGame.load(initialFen);
                setGame(newGame);
            } catch (error) {
                console.error('Invalid FEN:', error);
            }
        }
    }, [initialFen]);

    const makeMove = (move: any) => {
        try {
            const gameCopy = new Chess(game.fen());
            const result = gameCopy.move(move);
            if (result) {
                setGame(gameCopy);
                onChange?.(gameCopy.fen());
                return true;
            }
        } catch (error) {
            console.error('Invalid move:', error);
        }
        return false;
    };

    const resetPosition = () => {
        if (initialFen) {
            const newGame = new Chess();
            newGame.load(initialFen);
            setGame(newGame);
        } else {
            setGame(new Chess());
        }
    };

    return (
        <div className="relative">
            <Chessboard
                position={game.fen()}
                onPieceDrop={(sourceSquare, targetSquare, piece) => {
                    if (!isInteractive) return false;
                    const move = {
                        from: sourceSquare,
                        to: targetSquare,
                        piece: piece[0].toLowerCase() as 'p' | 'n' | 'b' | 'r' | 'q' | 'k',
                        promotion: 'q'
                    };
                    return makeMove(move);
                }}
                onPieceDragBegin={(piece, sourceSquare) => {
                    if (!isInteractive) return;
                    setIsDragging(true);
                }}
                onPieceDragEnd={(piece, sourceSquare, targetSquare) => {
                    if (!isInteractive) return;
                    setIsDragging(false);
                }}
                boardOrientation="white"
                customBoardStyle={{
                    borderRadius: '4px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
                }}
            />
            {isInteractive && initialFen && (
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={resetPosition}
                >
                    <RotateCcw className="w-4 h-4" />
                </Button>
            )}
        </div>
    );
} 