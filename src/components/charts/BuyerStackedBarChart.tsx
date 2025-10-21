import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Compra } from '@/types/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BuyerStackedBarChartProps {
  data: Compra[];
}

export const BuyerStackedBarChart = ({ data }: BuyerStackedBarChartProps) => {
  const chartData = useMemo(() => {
    const buyerData: { [key: string]: { pending: number; delivered: number } } = {};

    data.forEach(item => {
      const buyer = item.buyer || 'Não Informado';
      if (!buyerData[buyer]) {
        buyerData[buyer] = { pending: 0, delivered: 0 };
      }
      buyerData[buyer].pending += item.pendingQuantity;
      buyerData[buyer].delivered += item.deliveredQuantity;
    });

    return Object.entries(buyerData).map(([name, values]) => ({ 
      name, 
      ...values 
    }));
  }, [data]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-medium">Pendente vs Entregue por Comprador</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] p-2 md:p-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(224, 224, 224, 0.1)" />
            <XAxis dataKey="name" stroke="#E0E0E0" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#E0E0E0" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1C1F26',
                border: '1px solid #444',
                color: '#E0E0E0',
                fontSize: '12px'
              }}
              labelStyle={{ color: '#7C4DFF' }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="delivered" stackId="a" fill="#00C49F" name="Entregue" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pending" stackId="a" fill="#FFBB28" name="Pendente" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};