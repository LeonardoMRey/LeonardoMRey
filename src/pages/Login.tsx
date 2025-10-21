import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { useSession } from "@/contexts/SessionContext";

const Login = () => {
  const { session } = useSession();

  if (session) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Painel de Demandas de Compras
        </h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          theme="light"
          localization={{
            variables: {
              sign_in: {
                email_label: 'Seu endereço de e-mail',
                password_label: 'Sua senha',
                button_label: 'Entrar',
                loading_button_label: 'Entrando...',
                social_provider_text: 'Entrar com {{provider}}',
                link_text: 'Já tem uma conta? Entre',
              },
              sign_up: {
                email_label: 'Seu endereço de e-mail',
                password_label: 'Sua senha',
                button_label: 'Registrar',
                loading_button_label: 'Registrando...',
                social_provider_text: 'Registrar com {{provider}}',
                link_text: 'Não tem uma conta? Registre-se',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Login;