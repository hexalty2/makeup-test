import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  ChevronRight, 
  Lightbulb, 
  ArrowLeft,
  Copy,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SharedRoutine = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedStep, setExpandedStep] = useState(0);

  useEffect(() => {
    fetchRoutine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareId]);

  const fetchRoutine = async () => {
    try {
      const response = await axios.get(`${API}/routines/${shareId}`);
      setRoutine(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching routine:", err);
      setError("Routine not found");
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const link = window.location.href;
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

  const getOccasionLabel = (occasion) => {
    const labels = {
      everyday: "Everyday",
      work: "Work",
      night_out: "Night Out",
      special_event: "Special Event"
    };
    return labels[occasion] || occasion;
  };

  const getSkinToneLabel = (tone) => {
    const labels = {
      very_fair: "Very Fair",
      fair: "Fair",
      light: "Light",
      medium: "Medium",
      tan: "Tan",
      deep: "Deep"
    };
    return labels[tone] || tone;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-[#C27863] mx-auto mb-4 animate-pulse" />
          <p className="text-[#666666]">Loading routine...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 rounded-full bg-[#E8C3C3] flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-[#C27863]" />
          </div>
          <h1 className="font-['Playfair_Display'] text-2xl font-medium text-[#333333] mb-4">
            Routine Not Found
          </h1>
          <p className="text-[#666666] mb-8">
            This routine might have been removed or the link is incorrect.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="btn-primary"
            data-testid="go-home-btn"
          >
            Create Your Own Routine
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] noise-overlay">
      {/* Header */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between bg-white border-b border-stone-100">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[#666666] hover:text-[#C27863] transition-colors"
          data-testid="back-home-btn"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Home</span>
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#C27863]" />
          <span className="font-['Playfair_Display'] text-xl font-medium text-[#333333]">
            GlowGuide
          </span>
        </div>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 text-[#666666] hover:text-[#C27863] transition-colors"
          data-testid="share-btn"
        >
          <Copy className="w-5 h-5" />
          <span className="hidden sm:inline">Copy Link</span>
        </button>
      </header>

      <main className="px-6 md:px-12 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Routine Header */}
          <div className="text-center mb-10">
            <span className="text-xs font-bold tracking-widest uppercase text-[#9CAFA0] mb-3 block">
              Shared Routine
            </span>
            <h1 
              className="font-['Playfair_Display'] text-3xl md:text-4xl font-medium text-[#333333] mb-4"
              data-testid="routine-title"
            >
              {getOccasionLabel(routine.profile.occasion)} Look
            </h1>
            <p className="text-[#666666]">
              Personalized for {getSkinToneLabel(routine.profile.skin_tone)} skin with {routine.profile.undertone} undertones
            </p>
          </div>

          {/* Profile Summary */}
          <div className="card-feature mb-8">
            <h2 className="text-sm font-bold tracking-widest uppercase text-[#999999] mb-4">
              Skin Profile
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-[#999999] uppercase">Skin Tone</p>
                <p className="font-medium text-[#333333]">{getSkinToneLabel(routine.profile.skin_tone)}</p>
              </div>
              <div>
                <p className="text-xs text-[#999999] uppercase">Undertone</p>
                <p className="font-medium text-[#333333] capitalize">{routine.profile.undertone}</p>
              </div>
              <div>
                <p className="text-xs text-[#999999] uppercase">Skin Type</p>
                <p className="font-medium text-[#333333] capitalize">{routine.profile.skin_type}</p>
              </div>
              <div>
                <p className="text-xs text-[#999999] uppercase">Level</p>
                <p className="font-medium text-[#333333] capitalize">{routine.profile.makeup_level}</p>
              </div>
            </div>
          </div>

          {/* Steps Accordion */}
          <div className="space-y-4">
            {routine.steps.map((step, index) => (
              <div
                key={step.step_name}
                className={`card-feature overflow-hidden transition-all duration-300 ${
                  expandedStep === index ? 'ring-2 ring-[#C27863]/20' : ''
                }`}
                data-testid={`shared-step-${index}`}
              >
                <button
                  onClick={() => setExpandedStep(expandedStep === index ? -1 : index)}
                  className="w-full flex items-center gap-4 text-left"
                >
                  <div className="step-badge text-sm flex-shrink-0">{index + 1}</div>
                  <div className="flex-1">
                    <h3 className="font-['Playfair_Display'] text-lg font-medium text-[#333333]">
                      {step.title}
                    </h3>
                    {step.skip && (
                      <span className="text-xs text-[#9CAFA0]">Optional</span>
                    )}
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-[#999999] transition-transform duration-300 ${
                      expandedStep === index ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {expandedStep === index && (
                  <div className="mt-6 pt-6 border-t border-stone-100 animate-fade-in-up">
                    {step.skip && (
                      <div className="bg-[#9CAFA0]/10 border border-[#9CAFA0]/30 rounded-xl p-3 mb-4">
                        <p className="text-[#6B7F70] text-sm">{step.skip_reason}</p>
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="text-xs font-bold tracking-widest uppercase text-[#999999] mb-3">
                        Recommendations
                      </h4>
                      <div className="space-y-2">
                        {step.recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-[#C27863] flex-shrink-0 mt-0.5" />
                            <p className="text-[#333333] text-sm">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold tracking-widest uppercase text-[#999999] mb-3 flex items-center gap-2">
                        <Lightbulb className="w-3 h-3" />
                        Tips
                      </h4>
                      <div className="space-y-2">
                        {step.tips.map((tip, i) => (
                          <div key={i} className="tip-card">
                            <p className="text-[#666666] text-sm">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-[#666666] mb-4">Want your own personalized routine?</p>
            <Button
              onClick={() => navigate("/setup")}
              className="btn-primary flex items-center gap-2 mx-auto"
              data-testid="create-own-btn"
            >
              Create Your Routine
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SharedRoutine;
