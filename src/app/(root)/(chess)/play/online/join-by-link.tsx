"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function JoinByLink() {
  const router = useRouter();
  const [gameLink, setGameLink] = useState("");

  const handleJoinGame = () => {
    if (gameLink.trim()) {
      // Извлекаем ID комнаты из полного URL
      const roomId = gameLink.split("/").pop();
      if (roomId) {
        router.push(`/play/online/${roomId}`);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Присоединиться по ссылке</CardTitle>
          <CardDescription>
            Введите ссылку на партию
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Input
            type="text"
            placeholder="Введите ссылку на партию"
            value={gameLink}
            onChange={(e) => setGameLink(e.target.value)}
          />

          <Button 
            onClick={handleJoinGame} 
            className="w-full"
            disabled={!gameLink.trim()}
          >
            Присоединиться к игре
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
