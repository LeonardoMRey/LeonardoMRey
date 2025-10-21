import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface StackedBarChartProps {
    data: {
        name: string;
        'Pedidos Entregues': number;
        'Pedidos Pendentes': number;
        Total: number;
    }[];
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({ data }) => {
    // Definindo cores baseadas no tema dark mode (globals.css)
    const deliveredColor = 'hsl(142 71% 45%)'; // Green-like
    const pendingColor = 'hsl(48 96% 50%)'; // Yellow-like

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-base font-medium">Carga de Pedidos por Comprador</CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-6 h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                        data={data} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(224, 224, 224, 0.1)" />
                        <XAxis 
                            dataKey="name" 
                            stroke="#E0E0E0" 
                            fontSize={10} 
                            tickLine={false} 
                            angle={-45} 
                            textAnchor="end" 
                            height={60} 
                        />
                        <YAxis stroke="#E0E0E0" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#222',
                                border: '1px solid #444',
                                color: '#E0E0E0',
                                fontSize: '12px'
                            }}
                        />
                        <Legend />
                        <Bar dataKey="Pedidos Entregues" stackId="a" fill={deliveredColor} />
                        <Bar dataKey="Pedidos Pendentes" stackId="a" fill={pendingColor} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};