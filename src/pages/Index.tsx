import { Link } from "react-router-dom";
import { PiggyBank, Target, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <PiggyBank className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">Cofrinho</span>
        </div>
        <Link to="/auth">
          <Button>Entrar</Button>
        </Link>
      </header>

      <main className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto animate-slide-up">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Transforme seus sonhos em <span className="text-primary">metas alcançáveis</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Organize suas finanças, acompanhe seu progresso e conquiste seus objetivos com o Cofrinho.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8">
              Começar Agora
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto">
          {[
            { icon: Target, title: "Metas Visuais", desc: "Veja seu progresso com barras animadas" },
            { icon: TrendingUp, title: "Controle Total", desc: "Separe dinheiro físico e PIX" },
            { icon: Users, title: "Compartilhe", desc: "Acompanhe amigos e se motive" },
          ].map((f, i) => (
            <div key={i} className="p-6 rounded-2xl bg-card border border-border animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
