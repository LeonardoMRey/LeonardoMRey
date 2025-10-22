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
    activeClass: "bg-blue-900/50 text-blue-300",
  },
  {
    title: "Eficiência de Compras",
    icon: ArrowDownUp,
    to: "/eficiencia-compras",
    activeClass: "bg-yellow-900/50 text-yellow-300",
  },
  {
    title: "Gestão Financeira",
    icon: Banknote,
    to: "/gestao-financeira",
    activeClass: "bg-green-900/50 text-green-300",
  },
  {
    title: "Gestão de Fornecedores",
    icon: Handshake,
    to: "/gestao-fornecedores",
    activeClass: "bg-red-900/50 text-red-300",
  }
];

export const Sidebar = ({ setPageTitle }: SidebarProps) => {
  const location = useLocation();

  return (
    <div className="hidden border-r bg-card md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center justify-center border-b px-4 lg:h-[60px] lg:px-6 bg-white">
          <Link to="/" className="flex items-center justify-center font-semibold">
            <img src="/logo.png" alt="Newen Logo" className="h-8 object-contain" />
          </Link>
        </div>
        <div className="flex-1 py-4">
          <nav className="grid items-start gap-1 px-4 text-sm font-medium">
            {sidebarLinks.map(({ title, icon: Icon, to, activeClass }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setPageTitle(title)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  location.pathname.includes(to) && activeClass
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