"use client";

import type React from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Кастомный Tooltip с поддержкой тёмной темы
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background text-black dark:text-white p-4 border dark:border-zinc-600 rounded shadow">
        <p className="font-bold">{label}</p>
        <p>Оценка: {payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

interface EvaluationChartProps {
  data: { name: string; score: number }[];
  className?: string;
}

export const EvaluationChart: React.FC<EvaluationChartProps> = ({
  data,
  className = "w-full",
}) => {
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>График оценки позиции</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#18a8f5"
                fill="#6b7280"
                fillOpacity={0.3}
                activeDot={{ r: 8 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
