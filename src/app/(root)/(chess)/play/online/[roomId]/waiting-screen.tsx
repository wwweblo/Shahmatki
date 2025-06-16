"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Users, Link2 } from "lucide-react";

interface WaitingScreenProps {
  gameUrl?: string;
}

export default function WaitingScreen({}: WaitingScreenProps) {
  const [copied, setCopied] = useState(false);
  const [gameUrl, setGameUrl] = useState<string | null>(null);
  // ✅ Безопасно получаем URL в браузере
  useEffect(() => {
    if (typeof window !== "undefined") {
      setGameUrl(window.location.href);
    }
  }, []);
  const handleCopyLink = async () => {
    if (gameUrl) {
      await navigator.clipboard.writeText(gameUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex justify-center p-4 ">
      <Card className="w-full max-w-md h-fit">
        <CardContent className="pt-8 pb-8 px-6">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Icon and Status */}
            <div className="relative">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="absolute -top-1 -right-1">
                <div className="w-4 h-4 bg-blue-300 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Status Badge */}
            <Badge variant="secondary" className="px-3 py-1">
              <div className="w-2 h-2 bg-blue-300 rounded-full mr-2 animate-pulse" />
              Ожидание игрока
            </Badge>

            {/* Main Content */}
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Ожидание второго игрока
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Отправьте ссылку другу, чтобы он присоединился к игре
              </p>
            </div>

            {/* Game Link Section */}
            {gameUrl && (
              <div className="w-full space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link2 className="w-4 h-4" />
                  <span>Ссылка для приглашения</span>
                </div>

                <div className="relative">
                  <div className="bg-muted/50 border rounded-lg p-3 text-sm font-mono break-all">
                    {gameUrl}
                  </div>
                </div>

                <Button
                  onClick={handleCopyLink}
                  className="w-full"
                  variant={copied ? "secondary" : "default"}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Скопировано!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Скопировать ссылку
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Additional Info */}
            <div className="text-xs text-muted-foreground text-center">
              Игра начнется автоматически, когда второй игрок присоединится
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
