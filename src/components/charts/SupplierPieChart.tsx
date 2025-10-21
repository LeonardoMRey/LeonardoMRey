import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Compra } from '@/types/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SupplierPieChartProps {
  data: Compra[];
}

const COLORS = ['#7C4DFF', '#2196F3', '#00C49F', '#FFBB28', '#FF8042', '#E91E63', '#9C27B0'];

export const SupplierPieChart = ({ data }: SupplierPieChartProps) => {
  const chartData = useMemo(() => {
    const supplierValue: { [key: string]: number } = {};
    data.forEach(item => {
      const supplier = item.supplier || 'Não Informado';
      supplierValue[supplier] = (supplierValue[supplier] || 0) + item.netValue;
    });

    // Limita aos 7 principais fornecedores para clareza
    const sortedSuppliers = Object.entries(supplierValue)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 7);

    return sortedSuppliers.map(([name, value]) => ({ 
      name, 
      value: parseFloat(value.toFixed(2)) 
    }));
  }, [data]);

  const renderCustomizedLabel = ({ name, percent }: any) => {
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-medium">Distribuição de Pedidos por Fornecedor (Valor Líquido)</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] p-2 md:p-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              nameKey="name"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              contentStyle={{
                backgroundColor: '#1C1F26',
                border: '1px solid #444',
                color: '#E0E0E0',
                fontSize: '12px'
              }}
              labelStyle={{ color: '#7C4DFF' }}
            />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right" 
              wrapperStyle={{ fontSize: "10px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};