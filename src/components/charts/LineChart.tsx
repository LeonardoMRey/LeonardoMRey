import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface LineChartProps {
  title: string;
  data: any[];
  dataKeyX: string;
  lines: { dataKey: string; stroke: string; name: string }[];
}

export const LineChart: React.FC<LineChartProps> = ({ title, data, dataKeyX, lines }) => {
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
          <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={dataKeyX} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}d`} />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)} dias`, 'Lead Time']}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--foreground))',
                borderRadius: 'var(--radius)'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {lines.map(line => (
              <Line key={line.dataKey} type="monotone" dataKey={line.dataKey} stroke={line.stroke} name={line.name} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};