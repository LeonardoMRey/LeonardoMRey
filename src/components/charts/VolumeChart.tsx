import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AnimatedCard } from '../ui/AnimatedCard';

interface VolumeChartProps {
  title: string;
  data: any[];
  dataKeyX: string;
  barKey1: string;
  barKey2: string;
  delay?: number;
}

export const VolumeChart: React.FC<VolumeChartProps> = ({ title, data, dataKeyX, barKey1, barKey2, delay = 0 }) => {
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
            <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={dataKeyX} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey={barKey1} fill="hsl(var(--primary))" name={barKey1} radius={[4, 4, 0, 0]} />
              <Bar dataKey={barKey2} fill="hsl(var(--muted))" name={barKey2} radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );

  return <AnimatedCard delay={delay}>{chartContent}</AnimatedCard>;
};