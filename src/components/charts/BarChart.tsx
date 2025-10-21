import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatCurrency } from '@/utils/data-processing';

interface BarChartProps {
  title: string;
  data: any[];
  dataKeyX: string;
  dataKeyY: string;
  barKey: string;
  layout: 'horizontal' | 'vertical';
  barColor?: string;
  isCurrency?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({ title, data, dataKeyX, dataKeyY, barKey, layout, barColor = 'hsl(var(--primary))', isCurrency = false }) => {
  const isVertical = layout === 'vertical';
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-2 md:p-6">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data} layout={layout} margin={isVertical ? { top: 5, right: 20, left: 20, bottom: 5 } : { top: 5, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            {isVertical ? (
              <>
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={isCurrency ? (v) => formatCurrency(v as number) : undefined} />
                <YAxis dataKey={dataKeyY} type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={120} />
              </>
            ) : (
              <>
                <XAxis dataKey={dataKeyX} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} angle={-45} textAnchor="end" interval={0} />
                <YAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={isCurrency ? (v) => formatCurrency(v as number) : undefined} />
              </>
            )}
            <Tooltip
              formatter={(value: number) => [isCurrency ? formatCurrency(value) : value.toLocaleString('pt-BR'), barKey]}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--foreground))',
                borderRadius: 'var(--radius)'
              }}
              labelStyle={{ color: barColor }}
            />
            <Bar dataKey={barKey} fill={barColor} radius={[4, 4, 0, 0]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};