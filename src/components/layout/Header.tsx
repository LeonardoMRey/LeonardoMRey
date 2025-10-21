import { useSession } from '@/contexts/SessionContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { showError } from '@/utils/toast';

export const Header = () => {
  const { session } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError("Erro ao fazer logout.");
      console.error("Logout Error:", error);
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">
          Dashboard de Compras e Solicitações - <span className="text-accent">Setor de Compras</span>
        </h1>
        {session && (
          <Button variant="ghost" onClick={handleLogout} className="text-gray-400 hover:text-red-500">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        )}
      </div>
    </header>
  );
};