import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Clock, Share2 } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Personnalisé pour vous",
      description: "Des recommandations adaptées à votre teint, type de peau et style unique"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Guide étape par étape",
      description: "Suivez à votre rythme avec des instructions claires et simples"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Adapté aux débutantes",
      description: "Aucune expérience maquillage requise - on vous guide à chaque étape"
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Enregistrez & Partagez",
      description: "Gardez vos routines favorites et partagez-les avec vos amies"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F9F7F2] relative overflow-hidden noise-overlay">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left Content */}
        <div className="flex flex-col justify-center px-6 md:px-12 lg:px-24 py-12 lg:py-0">
          <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <span className="text-xs md:text-sm font-bold tracking-widest uppercase text-[#C27863] mb-4 block">
              Votre Coach Maquillage Personnel
            </span>
          </div>
          
          <h1 
            className="font-['Playfair_Display'] text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-tight text-[#333333] mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
            data-testid="hero-title"
          >
            Le Maquillage <br />
            <span className="text-[#C27863]">Simplifié</span>
          </h1>
          
          <p 
            className="text-base md:text-lg leading-relaxed text-[#666666] mb-8 max-w-md animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            Un guide maquillage personnel qui élimine toutes les incertitudes. Obtenez des recommandations étape par étape adaptées à votre peau.
          </p>
          
          <div 
            className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <Button
              onClick={() => navigate("/setup")}
              className="btn-primary"
              data-testid="get-started-btn"
            >
              Commencer
            </Button>
            <Button
              onClick={() => navigate("/saved")}
              variant="outline"
              className="btn-secondary"
              data-testid="view-saved-btn"
            >
              Mes Routines
            </Button>
          </div>
        </div>

        {/* Right Image */}
        <div className="hidden lg:flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#F9F7F2] z-10" />
          <img
            src="https://images.unsplash.com/photo-1672794776762-18dddc72982e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGFwcGx5aW5nJTIwbWFrZXVwJTIwbmF0dXJhbCUyMGxvb2slMjBkaXZlcnNlJTIwc2tpbiUyMHRvbmVzfGVufDB8fHx8MTc3MDYxMjM1Mnww&ixlib=rb-4.1.0&q=85"
            alt="Femme avec maquillage naturel"
            className="w-full h-full object-cover"
            data-testid="hero-image"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 md:px-12 lg:px-24 py-16 lg:py-24 bg-white">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-[#9CAFA0] mb-4 block">
            Comment ça marche
          </span>
          <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-medium text-[#333333]">
            La Beauté Sans Stress
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-feature text-center animate-fade-in-up"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              data-testid={`feature-card-${index}`}
            >
              <div className="w-14 h-14 rounded-full bg-[#F9F7F2] flex items-center justify-center mx-auto mb-4 text-[#C27863]">
                {feature.icon}
              </div>
              <h3 className="font-['Playfair_Display'] text-xl font-medium text-[#333333] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[#666666] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 md:px-12 lg:px-24 py-16 lg:py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-medium text-[#333333] mb-4">
            Prête à Rayonner ?
          </h2>
          <p className="text-[#666666] mb-8">
            Seulement 2 minutes pour créer votre routine personnalisée.
          </p>
          <Button
            onClick={() => navigate("/setup")}
            className="btn-primary"
            data-testid="cta-btn"
          >
            Commencer Mon Parcours
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 md:px-12 lg:px-24 py-8 border-t border-stone-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C27863]" />
            <span className="font-['Playfair_Display'] text-xl font-medium text-[#333333]">
              GlowGuide
            </span>
          </div>
          <p className="text-sm text-[#999999]">
            Votre guide maquillage personnel
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
