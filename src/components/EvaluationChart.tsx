'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface EvaluationData {
  evaluation: number
  depth?: number // Make depth optional
}

interface EvaluationChartProps {
  data: EvaluationData[]
  currentPly: number
}

export function EvaluationChart({ data, currentPly }: EvaluationChartProps) {
  const chartData = data
    .filter((_, index) => index <= currentPly)
    .map((item, index) => ({
      move: Math.floor(index / 2) + 1,
      evaluation: item.evaluation,
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Position Evaluation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="var(--foreground)"
                opacity={0.2}
              />
              <XAxis 
                dataKey="move"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                stroke="var(--foreground)"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                stroke="var(--foreground)"
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(2)}`, 'Evaluation']}
                labelFormatter={(label) => `Move ${label}`}
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--card-foreground)',
                }}
              />
              <Area
                type="monotone"
                dataKey="evaluation"
                stroke="var(--primary)"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}