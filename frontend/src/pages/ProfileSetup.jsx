import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState({
    skin_tone: "",
    undertone: "",
    skin_type: "",
    makeup_level: "",
    occasion: ""
  });

  const steps = [
    {
      key: "skin_tone",
      title: "Quel est votre teint ?",
      subtitle: "Sélectionnez la teinte qui correspond le mieux à votre couleur de peau naturelle",
      options: [
        { value: "very_fair", label: "Très clair", color: "#FAE5D3" },
        { value: "fair", label: "Clair", color: "#F5D5C8" },
        { value: "light", label: "Léger", color: "#E8C4A2" },
        { value: "medium", label: "Moyen", color: "#D4A574" },
        { value: "tan", label: "Hâlé", color: "#B8865C" },
        { value: "deep", label: "Foncé", color: "#8B5A2B" }
      ]
    },
    {
      key: "undertone",
      title: "Quel est votre sous-ton ?",
      subtitle: "Regardez les veines de votre poignet - bleu/violet = froid, vert = chaud",
      options: [
        { value: "cool", label: "Froid", description: "Sous-tons roses / rouges", color: "#E8C3C3" },
        { value: "warm", label: "Chaud", description: "Sous-tons jaunes / dorés", color: "#E8D4B8" },
        { value: "neutral", label: "Neutre", description: "Mélange des deux", color: "#D4C4B0" },
        { value: "olive", label: "Olive", description: "Sous-tons verts / jaunes", color: "#C4C4A0" }
      ]
    },
    {
      key: "skin_type",
      title: "Quel est votre type de peau ?",
      subtitle: "Pensez à l'état de votre peau en milieu de journée sans maquillage",
      options: [
        { value: "oily", label: "Grasse", description: "Brillante tout au long de la journée" },
        { value: "dry", label: "Sèche", description: "Sensation de tiraillement ou desquamation" },
        { value: "combination", label: "Mixte", description: "Zone T grasse, joues sèches" },
        { value: "normal", label: "Normale", description: "Équilibrée, rarement problématique" }
      ]
    },
    {
      key: "makeup_level",
      title: "Quelle est votre expérience en maquillage ?",
      subtitle: "Nous ajusterons nos recommandations selon votre niveau",
      options: [
        { value: "beginner", label: "Débutante", description: "Nouvelle en maquillage ou préfère les looks simples" },
        { value: "intermediate", label: "Intermédiaire", description: "À l'aise avec les bases, prête pour plus" }
      ]
    },
    {
      key: "occasion",
      title: "Quelle est l'occasion ?",
      subtitle: "Cela nous aide à suggérer la bonne intensité et les bonnes couleurs",
      options: [
        { value: "everyday", label: "Quotidien", description: "Look naturel et sans effort" },
        { value: "work", label: "Travail", description: "Soigné mais professionnel" },
        { value: "night_out", label: "Soirée", description: "Glamour et amusant" },
        { value: "special_event", label: "Événement spécial", description: "Look affirmé" }
      ]
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = profile[currentStepData.key] !== "";

  const handleSelect = (value) => {
    setProfile(prev => ({
      ...prev,
      [currentStepData.key]: value
    }));
  };

  const handleNext = () => {
    if (isLastStep) {
      // Save profile to localStorage and navigate to routine
      localStorage.setItem("glowguide_profile", JSON.stringify(profile));
      navigate("/routine");
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      navigate("/");
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] noise-overlay">
      {/* Header */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#666666] hover:text-[#C27863] transition-colors"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Retour</span>
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#C27863]" />
          <span className="font-['Playfair_Display'] text-xl font-medium text-[#333333]">
            GlowGuide
          </span>
        </div>
        <div className="w-16" /> {/* Spacer for alignment */}
      </header>

      {/* Progress Bar */}
      <div className="px-6 md:px-12 mb-8">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#999999]">Étape {currentStep + 1} sur {steps.length}</span>
            <span className="text-sm text-[#999999]">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-[#E0AFA0]/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C27863] rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              data-testid="progress-bar"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="px-6 md:px-12 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10 animate-fade-in-up">
            <h1
              className="font-['Playfair_Display'] text-3xl md:text-4xl font-medium text-[#333333] mb-3"
              data-testid="step-title"
            >
              {currentStepData.title}
            </h1>
            <p className="text-[#666666]">{currentStepData.subtitle}</p>
          </div>

          {/* Options Grid */}
          <div className={`grid gap-4 mb-10 ${
            currentStepData.options.length <= 2 
              ? 'grid-cols-1 sm:grid-cols-2 max-w-md mx-auto' 
              : currentStepData.key === 'skin_tone'
                ? 'grid-cols-2 sm:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2'
          }`}>
            {currentStepData.options.map((option, index) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`selection-card text-left animate-fade-in-up ${
                  profile[currentStepData.key] === option.value ? 'selected' : ''
                }`}
                style={{ animationDelay: `${0.05 * index}s` }}
                data-testid={`option-${option.value}`}
              >
                {option.color && (
                  <div
                    className="w-12 h-12 rounded-full mb-3"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                <h3 className="font-['Playfair_Display'] text-lg font-medium text-[#333333] mb-1">
                  {option.label}
                </h3>
                {option.description && (
                  <p className="text-sm text-[#666666]">{option.description}</p>
                )}
              </button>
            ))}
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className={`btn-primary flex items-center gap-2 ${!canProceed ? 'opacity-50 cursor-not-allowed' : ''}`}
              data-testid="continue-btn"
            >
              {isLastStep ? "Voir Ma Routine" : "Continuer"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileSetup;
