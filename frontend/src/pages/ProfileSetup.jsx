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
      title: "What's your skin tone?",
      subtitle: "Select the shade that best matches your natural skin color",
      options: [
        { value: "very_fair", label: "Very Fair", color: "#FAE5D3" },
        { value: "fair", label: "Fair", color: "#F5D5C8" },
        { value: "light", label: "Light", color: "#E8C4A2" },
        { value: "medium", label: "Medium", color: "#D4A574" },
        { value: "tan", label: "Tan", color: "#B8865C" },
        { value: "deep", label: "Deep", color: "#8B5A2B" }
      ]
    },
    {
      key: "undertone",
      title: "What's your undertone?",
      subtitle: "Look at the veins on your wrist - blue/purple = cool, green = warm",
      options: [
        { value: "cool", label: "Cool", description: "Pink / Red undertones", color: "#E8C3C3" },
        { value: "warm", label: "Warm", description: "Yellow / Golden undertones", color: "#E8D4B8" },
        { value: "neutral", label: "Neutral", description: "Mix of both", color: "#D4C4B0" },
        { value: "olive", label: "Olive", description: "Green / Yellow undertones", color: "#C4C4A0" }
      ]
    },
    {
      key: "skin_type",
      title: "What's your skin type?",
      subtitle: "Think about how your skin feels by midday without makeup",
      options: [
        { value: "oily", label: "Oily", description: "Shiny throughout the day" },
        { value: "dry", label: "Dry", description: "Feels tight or flaky" },
        { value: "combination", label: "Combination", description: "Oily T-zone, dry cheeks" },
        { value: "normal", label: "Normal", description: "Balanced, rarely problematic" }
      ]
    },
    {
      key: "makeup_level",
      title: "What's your makeup experience?",
      subtitle: "We'll adjust our recommendations based on your skill level",
      options: [
        { value: "beginner", label: "Beginner", description: "New to makeup or prefer simple looks" },
        { value: "intermediate", label: "Intermediate", description: "Comfortable with basics, ready for more" }
      ]
    },
    {
      key: "occasion",
      title: "What's the occasion?",
      subtitle: "This helps us suggest the right intensity and colors",
      options: [
        { value: "everyday", label: "Everyday", description: "Natural, effortless look" },
        { value: "work", label: "Work", description: "Polished but professional" },
        { value: "night_out", label: "Night Out", description: "Glamorous and fun" },
        { value: "special_event", label: "Special Event", description: "Statement-making" }
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
          <span className="hidden sm:inline">Back</span>
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
            <span className="text-sm text-[#999999]">Step {currentStep + 1} of {steps.length}</span>
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
              {isLastStep ? "See My Routine" : "Continue"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileSetup;
