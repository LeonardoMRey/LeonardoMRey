import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AnimatedCard } from '../ui/AnimatedCard';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColorClass?: string;
  description?: string;
  tooltipText?: string;
  delay?: number; // Adiciona delay para animação sequencial
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon: Icon, iconColorClass = 'text-primary', description, tooltipText, delay = 0 }) => {
  const cardContent = (
    <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-6 w-6 text-muted-foreground", iconColorClass)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );

  const wrappedCard = tooltipText ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : cardContent;

  return <AnimatedCard delay={delay}>{wrappedCard}</AnimatedCard>;
};