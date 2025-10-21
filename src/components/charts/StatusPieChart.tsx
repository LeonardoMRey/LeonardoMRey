import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SiengeData } from '@/types/sienge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatusPieChartProps {
  data: SiengeData[];
}

const COLORS = ['#1E88E5', '#BB86FC', '#03DAC6', '#CF6679', '#B0BEC5'];

export const StatusPieChart = ({ data }: StatusPieChartProps) => {
  const chartData = useMemo(() => {
    const statusCounts: { [key: string]: number } = {};
    data.forEach(item => {
      if (item.status) {
        statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
      }
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Solicitações por Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: '#2C2C2C',
                border: '1px solid #444',
                color: '#E0E0E0',
              }}
              labelStyle={{ color: '#BB86FC' }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend wrapperStyle={{fontSize: "12px"}}/>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};