import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Solicitacao } from '@/types/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SolicitacaoStatusChartProps {
  data: Solicitacao[];
}

export const SolicitacaoStatusChart = ({ data }: SolicitacaoStatusChartProps) => {
  const chartData = useMemo(() => {
    const statusCounts: { [key: string]: number } = {};
    data.forEach(item => {
      const status = item.status || 'Não Informado';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [data]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-medium">Solicitações por Status</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] p-2 md:p-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(224, 224, 224, 0.1)" />
            <XAxis dataKey="name" stroke="#E0E0E0" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#E0E0E0" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
              contentStyle={{
                backgroundColor: '#1C1F26',
                border: '1px solid #444',
                color: '#E0E0E0',
                fontSize: '12px'
              }}
              labelStyle={{ color: '#7C4DFF' }}
            />
            <Bar dataKey="value" fill="#2196F3" name="Quantidade" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};