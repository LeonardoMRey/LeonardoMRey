export const Header = () => {
  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">
          Painel de Gestão de Compras - <span className="text-accent">Visão Lorena</span>
        </h1>
      </div>
    </header>
  );
};