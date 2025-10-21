import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface FunnelChartProps {
  data: { name: string; value: number }[];
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ data }) => {
  // Recharts doesn't have a native Funnel Chart, so we simulate it using a horizontal BarChart
  // The data should be sorted from largest to smallest (top to bottom of the funnel)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-medium">Pipeline de Compras (Funil)</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] p-2 md:p-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical" 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(224, 224, 224, 0.1)" />
            <XAxis type="number" stroke="#E0E0E0" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis 
              dataKey="name" 
              type="category" 
              stroke="#E0E0E0" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1C1F26',
                border: '1px solid #444',
                color: '#E0E0E0',
                fontSize: '12px'
              }}
              labelStyle={{ color: '#7C4DFF' }}
            />
            <Bar dataKey="value" fill="#1976D2" name="Quantidade" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};