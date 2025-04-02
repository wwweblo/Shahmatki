"use client";

import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";

type ColorChoice = "white" | "black" | "random";

export default function NewGame() {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState<ColorChoice>("random");

  const createGame = () => {
    const roomId = uuidv4();
    router.push(`/play/online/${roomId}?preferredColor=${selectedColor}`);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Создать новую партию</CardTitle>
          <CardDescription>
            Выберите цвет фигур или оставьте случайный выбор
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={selectedColor}
            onValueChange={(value) => setSelectedColor(value as ColorChoice)}
            className="grid grid-cols-1 gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="white" id="white" />
              <Label htmlFor="white">Белые</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="black" id="black" />
              <Label htmlFor="black">Черные</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="random" id="random" />
              <Label htmlFor="random">Случайный выбор</Label>
            </div>
          </RadioGroup>

          <Button 
            onClick={createGame} 
            className="w-full"
          >
            Создать игру
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
