import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatNumber } from '@/utils/data-processing';

interface FunnelChartProps {
  data: { name: string; value: number }[];
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ data }) => {
  const primaryColor = 'hsl(var(--primary))'; 

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-medium">Funil de Compras</CardTitle>
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
              formatter={(value: number) => [formatNumber(value), 'Total']}
              contentStyle={{
                backgroundColor: '#222',
                border: '1px solid #444',
                color: '#E0E0E0',
                fontSize: '12px'
              }}
              labelStyle={{ color: primaryColor }}
            />
            <Bar dataKey="value" fill={primaryColor} name="Quantidade" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};