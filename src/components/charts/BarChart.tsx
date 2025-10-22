import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatCurrency } from '@/utils/data-processing';
import { cn } from '@/lib/utils';
import { AnimatedCard } from '../ui/AnimatedCard';

interface BarChartProps {
  title: string;
  data: any[];
  dataKeyX: string;
  dataKeyY: string;
  barKey: string;
  layout: 'horizontal' | 'vertical';
  barColor?: string;
  isCurrency?: boolean;
  isPercentage?: boolean;
  className?: string;
  delay?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ title, data, dataKeyX, dataKeyY, barKey, layout, barColor = 'hsl(var(--primary))', isCurrency = false, isPercentage = false, className, delay = 0 }) => {
  const isVertical = layout === 'vertical';

  const chartContent = (
    <Card className={cn("h-96 flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-2 md:p-6">
        {(!data || data.length === 0) ? (
          <div className="flex-grow flex items-center justify-center h-full">
            <p className="text-muted-foreground">Não há dados para exibir.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={data} layout={layout} margin={isVertical ? { top: 5, right: 20, left: 20, bottom: 5 } : { top: 5, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              {isVertical ? (
                <>
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => isCurrency ? formatCurrency(value as number) : value} />
                  <YAxis dataKey={dataKeyY} type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={250} />
                </>
              ) : (
                <>
                  <XAxis dataKey={dataKeyX} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} angle={-45} textAnchor="end" interval={0} />
                  <YAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => isCurrency ? formatCurrency(value as number) : isPercentage ? `${(value as number).toFixed(0)}%` : value} />
                </>
              )}
              <Tooltip
                formatter={(value: number) => {
                  if (isCurrency) return [formatCurrency(value), barKey];
                  if (isPercentage) return [`${value.toFixed(1)}%`, barKey];
                  return [value.toLocaleString('pt-BR'), barKey];
                }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius)'
                }}
                labelStyle={{ color: barColor }}
              />
              <Bar dataKey={barKey} fill={barColor} radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );

  return <AnimatedCard delay={delay} className={className}>{chartContent}</AnimatedCard>;
};