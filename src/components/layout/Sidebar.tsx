import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Activity, ArrowDownUp, Banknote, Handshake } from "lucide-react";

interface SidebarProps {
  setPageTitle: (title: string) => void;
}

const sidebarLinks = [
  {
    title: "Desempenho Operacional",
    icon: Activity,
    to: "/desempenho-operacional",
  },
  {
    title: "Eficiência de Compras",
    icon: ArrowDownUp,
    to: "/eficiencia-compras",
  },
  {
    title: "Gestão Financeira",
    icon: Banknote,
    to: "/gestao-financeira",
  },
  {
    title: "Gestão de Fornecedores",
    icon: Handshake,
    to: "/gestao-fornecedores",
  }
];

export const Sidebar = ({ setPageTitle }: SidebarProps) => {
  const location = useLocation();

  return (
    <div className="hidden border-r bg-card md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <img src="/logo.png" alt="Newen Logo" className="h-8 object-contain" />
          </Link>
        </div>
        <div className="flex-1 py-4">
          <nav className="grid items-start gap-1 px-4 text-sm font-medium">
            {sidebarLinks.map(({ title, icon: Icon, to }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setPageTitle(title)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  location.pathname.includes(to) && "bg-muted text-primary"
                )}
              >
                <Icon className="h-5 w-5" />
                {title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};