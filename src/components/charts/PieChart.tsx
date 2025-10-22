import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { AnimatedCard } from '../ui/AnimatedCard';

interface PieChartProps {
  title: string;
  data: { name: string; value: number }[];
  delay?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

export const PieChart: React.FC<PieChartProps> = ({ title, data, delay = 0 }) => {
  const chartContent = (
    <Card className="h-96 flex flex-col">
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
            <RechartsPieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </RechartsPieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );

  return <AnimatedCard delay={delay}>{chartContent}</AnimatedCard>;
};