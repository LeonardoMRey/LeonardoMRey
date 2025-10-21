import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SiengeData } from '@/types/sienge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StageBarChartProps {
  data: SiengeData[];
}

export const StageBarChart = ({ data }: StageBarChartProps) => {
  const chartData = useMemo(() => {
    const stageCounts: { [key: string]: number } = {};
    data.forEach(item => {
      if (item.stage) {
        stageCounts[item.stage] = (stageCounts[item.stage] || 0) + 1;
      }
    });
    return Object.entries(stageCounts).map(([name, value]) => ({ name, value }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Solicitações por Etapa</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(224, 224, 224, 0.1)" />
            <XAxis dataKey="name" stroke="#E0E0E0" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#E0E0E0" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#2C2C2C',
                border: '1px solid #444',
                color: '#E0E0E0',
              }}
              labelStyle={{ color: '#BB86FC' }}
            />
            <Bar dataKey="value" fill="#1E88E5" name="Quantidade" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};