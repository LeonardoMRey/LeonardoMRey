import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SiengeData } from '@/types/sienge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { parse, compareAsc } from 'date-fns';

interface TimelineLineChartProps {
  data: SiengeData[];
}

export const TimelineLineChart = ({ data }: TimelineLineChartProps) => {
  const chartData = useMemo(() => {
    const dateCounts: { [key: string]: number } = {};
    data.forEach(item => {
      if (item.requestDate) {
        // Normaliza a data para o formato YYYY-MM-DD para agrupamento
        try {
          const parsedDate = parse(item.requestDate, 'dd/MM/yyyy', new Date());
          const formattedDate = parsedDate.toISOString().split('T')[0];
          dateCounts[formattedDate] = (dateCounts[formattedDate] || 0) + 1;
        } catch (e) {
          console.warn(`Invalid date format: ${item.requestDate}`);
        }
      }
    });
    
    return Object.entries(dateCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => compareAsc(new Date(a.date), new Date(b.date)));

  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Evolução das Solicitações</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(224, 224, 224, 0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="#E0E0E0" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(str) => {
                const date = new Date(str);
                // Adiciona um dia para corrigir o fuso horário
                date.setDate(date.getDate() + 1);
                return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis stroke="#E0E0E0" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#2C2C2C',
                border: '1px solid #444',
                color: '#E0E0E0',
              }}
              labelStyle={{ color: '#BB86FC' }}
            />
            <Line type="monotone" dataKey="count" name="Solicitações" stroke="#BB86FC" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};