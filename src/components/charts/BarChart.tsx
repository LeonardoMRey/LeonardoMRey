import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatCurrency } from '@/utils/data-processing';

interface BarChartProps {
  title: string;
  data: any[];
  dataKeyX: string;
  dataKeyY: string;
  barKey: string;
  layout: 'horizontal' | 'vertical';
  barColor?: string;
  isCurrency?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({ 
  title, 
  data, 
  dataKeyX, 
  dataKeyY, 
  barKey, 
  layout, 
  barColor = 'hsl(var(--primary))',
  isCurrency = false,
}) => {
  
  const isVertical = layout === 'vertical';
  
  return (
    <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:border-primary/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-2 md:p-6">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart 
            data={data} 
            layout={layout} 
            margin={isVertical ? 
                { top: 5, right: 30, left: 20, bottom: 5 } :
                { top: 5, right: 30, left: 20, bottom: 80 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(224, 224, 224, 0.1)" />
            
            {isVertical ? (
              <>
                <XAxis 
                    type="number" 
                    stroke="#E0E0E0" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={isCurrency ? formatCurrency : undefined}
                />
                <YAxis 
                  dataKey={dataKeyY} 
                  type="category" 
                  stroke="#E0E0E0" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  width={120}
                />
              </>
            ) : (
              <>
                <XAxis 
                  dataKey={dataKeyX} 
                  stroke="#E0E0E0" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis 
                    type="number" 
                    stroke="#E0E0E0" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={isCurrency ? formatCurrency : undefined}
                />
              </>
            )}
            
            <Tooltip
              formatter={(value: number) => [isCurrency ? formatCurrency(value) : value.toLocaleString('pt-BR'), barKey]}
              contentStyle={{
                backgroundColor: '#1C1F26',
                border: '1px solid #444',
                color: '#E0E0E0',
                fontSize: '12px'
              }}
              labelStyle={{ color: barColor }}
            />
            <Bar dataKey={barKey} fill={barColor} radius={[0, 4, 4, 0]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};