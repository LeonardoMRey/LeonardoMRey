import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Header = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-sidebar text-sidebar-foreground p-4 shadow-md flex justify-between items-center">
      <h1 className="text-xl font-bold">Painel de Demandas de Compras</h1>
      <Button variant="ghost" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Sair
      </Button>
    </header>
  );
};

export default Header;