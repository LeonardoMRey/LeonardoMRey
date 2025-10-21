import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Solicitacao } from '@/types/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { parse, format, startOfMonth, compareAsc } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimelineLineChartProps {
  data: Solicitacao[];
}

export const TimelineLineChart = ({ data }: TimelineLineChartProps) => {
  const chartData = useMemo(() => {
    const monthlyCounts: { [key: string]: number } = {};
    
    data.forEach(item => {
      const dateString = item.requestDate || item.deliveryDate; // Usando Data de solicitação ou Data previsão
      if (dateString) {
        try {
          const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
          const monthKey = format(startOfMonth(parsedDate), 'yyyy-MM-dd');
          monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
        } catch (e) {
          // Ignora datas inválidas
        }
      }
    });
    
    return Object.entries(monthlyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => compareAsc(new Date(a.date), new Date(b.date)));

  }, [data]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-medium">Evolução Mensal de Solicitações</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] p-2 md:p-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(224, 224, 224, 0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="#E0E0E0" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(str) => format(new Date(str), 'MMM/yy', { locale: ptBR })}
            />
            <YAxis stroke="#E0E0E0" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1C1F26',
                border: '1px solid #444',
                color: '#E0E0E0',
                fontSize: '12px'
              }}
              labelStyle={{ color: '#7C4DFF' }}
              formatter={(value: number) => [`${value} Solicitações`, '']}
            />
            <Line type="monotone" dataKey="count" name="Solicitações" stroke="#7C4DFF" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};