import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/utils/data-processing';
import { AnimatedCard } from '../ui/AnimatedCard';

interface ParetoChartProps {
  title: string;
  data: any[];
  barKey: string;
  lineKey: string;
  dataKeyX: string;
  delay?: number;
}

export const ParetoChart: React.FC<ParetoChartProps> = ({ title, data, barKey, lineKey, dataKeyX, delay = 0 }) => {
  const chartContent = (
    <Card className="h-96 flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] hover:ring-2 hover:ring-primary/50">
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
            <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={dataKeyX} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} angle={-45} textAnchor="end" interval={0} />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value as number)} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--primary))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === lineKey) return [`${value.toFixed(1)}%`, 'Acumulado'];
                  return [formatCurrency(value), 'Valor'];
                }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar yAxisId="left" dataKey={barKey} fill="hsl(var(--secondary))" name="Valor" />
              <Line yAxisId="right" type="monotone" dataKey={lineKey} stroke="hsl(var(--primary))" name="Acumulado" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );

  return <AnimatedCard delay={delay}>{chartContent}</AnimatedCard>;
};