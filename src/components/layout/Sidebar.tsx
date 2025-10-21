import { Link, useLocation } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Activity, ArrowDownUp, Banknote, Handshake } from "lucide-react";
import React from "react";

interface SidebarProps {
  setPageTitle: (title: string) => void;
}

const sidebarGroups = [
  {
    title: "Desempenho Operacional",
    icon: Activity,
    links: [
      { to: "/desempenho-operacional", label: "Visão Geral" },
    ]
  },
  {
    title: "Eficiência de Compras",
    icon: ArrowDownUp,
    links: [
      { to: "/eficiencia-compras", label: "Visão Geral" },
    ]
  },
  {
    title: "Gestão Financeira",
    icon: Banknote,
    links: [
      { to: "/gestao-financeira", label: "Visão Geral" },
    ]
  },
  {
    title: "Gestão de Fornecedores",
    icon: Handshake,
    links: [
      { to: "/gestao-fornecedores", label: "Visão Geral" },
    ]
  }
];

export const Sidebar = ({ setPageTitle }: SidebarProps) => {
  const location = useLocation();
  const activeGroup = sidebarGroups.find(g => g.links.some(l => location.pathname.includes(l.to)))?.title || "Desempenho Operacional";

  return (
    <div className="hidden border-r bg-card md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <img src="/logo.png" alt="Newen Logo" className="h-8 object-contain" />
          </Link>
        </div>
        <div className="flex-1 py-4">
          <Accordion type="single" collapsible defaultValue={activeGroup} className="w-full">
            {sidebarGroups.map(({ title, icon: Icon, links }) => (
              <AccordionItem value={title} key={title} className="border-none px-4">
                <AccordionTrigger 
                  className="py-3 text-base hover:no-underline"
                  onClick={() => setPageTitle(title)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span>{title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-8 pt-2">
                  <nav className="grid gap-2">
                    {links.map(({ to, label }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setPageTitle(title)}
                        className={cn(
                          "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
                          location.pathname.includes(to) && "bg-muted text-primary"
                        )}
                      >
                        {label}
                      </Link>
                    ))}
                  </nav>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};