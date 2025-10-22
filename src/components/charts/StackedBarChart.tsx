import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface StackedBarChartProps {
  title: string;
  data: any[];
  dataKeyX: string;
  bars: { dataKey: string; name: string; color: string }[];
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({ title, data, dataKeyX, bars }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="h-96 flex flex-col">
        <CardHeader>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <p className="text-muted-foreground">Não há dados para exibir.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-2 md:p-6">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={dataKeyX} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                color: '#FFFFFF', // Corrigido para branco puro
                borderRadius: 'var(--radius)'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {bars.map(bar => (
              <Bar key={bar.dataKey} dataKey={bar.dataKey} stackId="a" fill={bar.color} name={bar.name} radius={[4, 4, 0, 0]} />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};