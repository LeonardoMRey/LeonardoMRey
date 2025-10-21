import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface LineChartProps {
  title: string;
  data: any[];
  dataKeyX: string;
  lines: { dataKey: string; stroke: string; name: string }[];
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({ 
  title, 
  data, 
  dataKeyX, 
  lines, 
  height = 300 
}) => {
  return (
    <Card className="h-full transition-all duration-300 hover:shadow-xl hover:border-primary/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 md:p-6" style={{ height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart 
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(224, 224, 224, 0.1)" />
            <XAxis 
              dataKey={dataKeyX} 
              stroke="#E0E0E0" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              stroke="#E0E0E0" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `${value}d`}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)} dias`, 'Lead Time']}
              contentStyle={{
                backgroundColor: '#1C1F26',
                border: '1px solid #444',
                color: '#E0E0E0',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {lines.map(line => (
              <Line 
                key={line.dataKey}
                type="monotone" 
                dataKey={line.dataKey} 
                stroke={line.stroke} 
                name={line.name}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};