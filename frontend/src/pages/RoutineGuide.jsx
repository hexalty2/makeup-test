import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Share2, 
  Save,
  RotateCcw,
  Copy,
  ChevronRight,
  Lightbulb
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RoutineGuide = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shareId, setShareId] = useState(null);
  const [showFinalScreen, setShowFinalScreen] = useState(false);

  const stepIcons = [
    "foundation", "concealer", "powder", "brows", 
    "eyeshadow", "eyeliner", "blush", "bronzer", "lips"
  ];

  useEffect(() => {
    const savedProfile = localStorage.getItem("glowguide_profile");
    if (!savedProfile) {
      navigate("/setup");
      return;
    }

    const profileData = JSON.parse(savedProfile);
    setProfile(profileData);
    fetchRecommendations(profileData);
  }, [navigate]);

  const fetchRecommendations = async (profileData) => {
    try {
      const response = await axios.post(`${API}/recommendations`, profileData);
      setSteps(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast.error("Failed to load recommendations");
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowFinalScreen(true);
    }
  };

  const handlePrevious = () => {
    if (showFinalScreen) {
      setShowFinalScreen(false);
    } else if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkipStep = () => {
    handleNext();
  };

  const handleSaveRoutine = async () => {
    if (!profile || steps.length === 0) return;

    setSaving(true);
    try {
      const response = await axios.post(`${API}/routines`, {
        profile,
        steps
      });
      
      setShareId(response.data.share_id);
      
      // Save to local storage
      const savedRoutines = JSON.parse(localStorage.getItem("glowguide_routines") || "[]");
      savedRoutines.push({
        id: response.data.id,
        share_id: response.data.share_id,
        profile,
        occasion: profile.occasion,
        created_at: new Date().toISOString()
      });
      localStorage.setItem("glowguide_routines", JSON.stringify(savedRoutines));
      
      toast.success("Routine saved successfully!");
    } catch (error) {
      console.error("Error saving routine:", error);
      toast.error("Failed to save routine");
    }
    setSaving(false);
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/shared/${shareId}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      // Fallback for when clipboard API fails
      const textArea = document.createElement("textarea");
      textArea.value = link;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success("Link copied to clipboard!");
      } catch (e) {
        toast.info(`Share link: ${link}`);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleRedoWithOccasion = () => {
    navigate("/setup");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-[#C27863] mx-auto mb-4 animate-pulse" />
          <p className="text-[#666666]">Creating your personalized routine...</p>
        </div>
      </div>
    );
  }

  if (showFinalScreen) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] noise-overlay">
        {/* Header */}
        <header className="px-6 md:px-12 py-6 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            className="flex items-center gap-2 text-[#666666] hover:text-[#C27863] transition-colors"
            data-testid="back-to-routine-btn"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Steps</span>
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C27863]" />
            <span className="font-['Playfair_Display'] text-xl font-medium text-[#333333]">
              GlowGuide
            </span>
          </div>
          <div className="w-24" />
        </header>

        {/* Final Content */}
        <main className="px-6 md:px-12 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-[#9CAFA0] flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
              <Check className="w-10 h-10 text-white" />
            </div>
            
            <h1 
              className="font-['Playfair_Display'] text-4xl md:text-5xl font-medium text-[#333333] mb-4"
              data-testid="completion-title"
            >
              You're All Done!
            </h1>
            <p className="text-[#666666] text-lg mb-10">
              Your personalized makeup routine is complete. Save it for later or share with friends.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Button
                onClick={handleSaveRoutine}
                disabled={saving || shareId}
                className="btn-primary flex items-center gap-2"
                data-testid="save-routine-btn"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : shareId ? "Saved!" : "Save Routine"}
              </Button>
              
              {shareId && (
                <Button
                  onClick={handleCopyLink}
                  className="share-btn"
                  data-testid="copy-link-btn"
                >
                  <Copy className="w-4 h-4" />
                  Copy Share Link
                </Button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
              <button
                onClick={handleRedoWithOccasion}
                className="card-feature flex items-center gap-4 text-left hover:border-[#C27863] transition-colors"
                data-testid="redo-btn"
              >
                <div className="w-12 h-12 rounded-full bg-[#F9F7F2] flex items-center justify-center text-[#C27863]">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-[#333333]">Try Different Occasion</h3>
                  <p className="text-sm text-[#666666]">Get new recommendations</p>
                </div>
              </button>
              
              <button
                onClick={() => navigate("/saved")}
                className="card-feature flex items-center gap-4 text-left hover:border-[#C27863] transition-colors"
                data-testid="view-saved-btn"
              >
                <div className="w-12 h-12 rounded-full bg-[#F9F7F2] flex items-center justify-center text-[#C27863]">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-[#333333]">Saved Routines</h3>
                  <p className="text-sm text-[#666666]">View all your looks</p>
                </div>
              </button>
            </div>

            {/* Routine Summary */}
            <div className="mt-12 text-left">
              <h2 className="font-['Playfair_Display'] text-2xl font-medium text-[#333333] mb-6 text-center">
                Your Routine Summary
              </h2>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={step.step_name}
                    className="card-feature p-4 flex items-center gap-4"
                    data-testid={`summary-step-${index}`}
                  >
                    <div className="step-badge text-sm">{index + 1}</div>
                    <div className="flex-1">
                      <h3 className="font-medium text-[#333333]">{step.title}</h3>
                      <p className="text-sm text-[#666666] line-clamp-1">
                        {step.skip ? step.skip_reason : step.recommendations[0]}
                      </p>
                    </div>
                    {step.skip && (
                      <span className="text-xs bg-[#F9F7F2] text-[#999999] px-3 py-1 rounded-full">
                        Optional
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-[#F9F7F2] noise-overlay">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* Left Progress Tracker - Desktop */}
        <div className="hidden lg:flex lg:col-span-2 flex-col items-center py-12 px-4 bg-white border-r border-stone-100">
          <div className="flex items-center gap-2 mb-12">
            <Sparkles className="w-5 h-5 text-[#C27863]" />
            <span className="font-['Playfair_Display'] text-lg font-medium text-[#333333]">
              GlowGuide
            </span>
          </div>
          
          <div className="flex flex-col items-center">
            {steps.map((step, index) => (
              <div key={step.step_name} className="flex flex-col items-center">
                <button
                  onClick={() => setCurrentStep(index)}
                  className={`progress-step ${
                    index < currentStep ? 'completed' : ''
                  } ${index === currentStep ? 'active' : ''}`}
                  data-testid={`progress-step-${index}`}
                />
                {index < steps.length - 1 && (
                  <div 
                    className={`progress-line h-8 ${index < currentStep ? 'completed' : ''}`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-[#999999] uppercase tracking-wide">Step</p>
            <p className="text-2xl font-['Playfair_Display'] text-[#333333]">
              {currentStep + 1} / {steps.length}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-10 flex flex-col">
          {/* Mobile Header */}
          <header className="lg:hidden px-6 py-4 flex items-center justify-between border-b border-stone-100 bg-white">
            <button
              onClick={() => currentStep === 0 ? navigate("/setup") : handlePrevious()}
              className="flex items-center gap-2 text-[#666666] hover:text-[#C27863] transition-colors"
              data-testid="mobile-back-btn"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C27863]" />
              <span className="font-['Playfair_Display'] text-lg font-medium text-[#333333]">
                GlowGuide
              </span>
            </div>
            <span className="text-sm text-[#999999]">
              {currentStep + 1}/{steps.length}
            </span>
          </header>

          {/* Mobile Progress Bar */}
          <div className="lg:hidden px-6 py-3 bg-white">
            <div className="h-1.5 bg-[#E0AFA0]/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C27863] rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <main className="flex-1 px-6 md:px-12 lg:px-16 py-8 lg:py-12 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              {/* Step Header */}
              <div className="mb-8 animate-fade-in-up">
                <div className="flex items-center gap-4 mb-4">
                  <div className="step-badge">{currentStep + 1}</div>
                  <div>
                    <span className="text-xs font-bold tracking-widest uppercase text-[#C27863]">
                      Step {currentStep + 1}
                    </span>
                    <h1 
                      className="font-['Playfair_Display'] text-2xl md:text-3xl font-medium text-[#333333]"
                      data-testid="step-title"
                    >
                      {currentStepData.title}
                    </h1>
                  </div>
                </div>

                {currentStepData.skip && (
                  <div className="bg-[#9CAFA0]/10 border border-[#9CAFA0]/30 rounded-xl p-4 mb-6">
                    <p className="text-[#6B7F70] text-sm">
                      <strong>Optional:</strong> {currentStepData.skip_reason}
                    </p>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              <div className="mb-8">
                <h2 className="text-sm font-bold tracking-widest uppercase text-[#999999] mb-4">
                  Recommendations
                </h2>
                <div className="space-y-3">
                  {currentStepData.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="recommendation-item animate-fade-in-up"
                      style={{ animationDelay: `${0.1 * index}s` }}
                      data-testid={`recommendation-${index}`}
                    >
                      <ChevronRight className="w-5 h-5 text-[#C27863] flex-shrink-0 mt-0.5" />
                      <p className="text-[#333333]">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="mb-8">
                <h2 className="text-sm font-bold tracking-widest uppercase text-[#999999] mb-4 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Pro Tips
                </h2>
                <div className="space-y-3">
                  {currentStepData.tips.map((tip, index) => (
                    <div
                      key={index}
                      className="tip-card animate-fade-in-up"
                      style={{ animationDelay: `${0.15 * index}s` }}
                      data-testid={`tip-${index}`}
                    >
                      <p className="text-[#666666] text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>

          {/* Bottom Navigation */}
          <div className="px-6 md:px-12 lg:px-16 py-6 bg-white border-t border-stone-100">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <Button
                onClick={handlePrevious}
                variant="ghost"
                className="text-[#666666] hover:text-[#C27863]"
                disabled={currentStep === 0}
                data-testid="prev-step-btn"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-3">
                {currentStepData.skip && (
                  <Button
                    onClick={handleSkipStep}
                    variant="ghost"
                    className="text-[#999999] hover:text-[#666666]"
                    data-testid="skip-step-btn"
                  >
                    Skip
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  className="btn-primary flex items-center gap-2"
                  data-testid="next-step-btn"
                >
                  {currentStep === steps.length - 1 ? "Complete" : "Next"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutineGuide;
