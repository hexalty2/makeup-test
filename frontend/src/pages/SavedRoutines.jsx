import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  ArrowLeft, 
  Trash2, 
  ExternalLink, 
  Copy,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SavedRoutines = () => {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("glowguide_routines");
    if (saved) {
      setRoutines(JSON.parse(saved));
    }
  }, []);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const handleDelete = (id) => {
    const updated = routines.filter(r => r.id !== id);
    setRoutines(updated);
    localStorage.setItem("glowguide_routines", JSON.stringify(updated));
    toast.success("Routine deleted");
  };

  const handleCopyLink = async (shareId) => {
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
        <div className="w-16" />
      </header>

      <main className="px-6 md:px-12 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-10">
            <h1 
              className="font-['Playfair_Display'] text-3xl md:text-4xl font-medium text-[#333333] mb-4"
              data-testid="page-title"
            >
              Saved Routines
            </h1>
            <p className="text-[#666666]">
              Your collection of personalized makeup looks
            </p>
          </div>

          {routines.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-[#F9F7F2] border-2 border-dashed border-[#E0AFA0] flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-[#C27863]" />
              </div>
              <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#333333] mb-2">
                No saved routines yet
              </h2>
              <p className="text-[#666666] mb-8">
                Create your first personalized makeup routine
              </p>
              <Button
                onClick={() => navigate("/setup")}
                className="btn-primary flex items-center gap-2 mx-auto"
                data-testid="create-first-btn"
              >
                <Plus className="w-4 h-4" />
                Create Routine
              </Button>
            </div>
          ) : (
            /* Routines List */
            <div className="space-y-4">
              {routines.map((routine, index) => (
                <div
                  key={routine.id}
                  className="card-feature animate-fade-in-up"
                  style={{ animationDelay: `${0.05 * index}s` }}
                  data-testid={`saved-routine-${index}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-['Playfair_Display'] text-lg font-medium text-[#333333]">
                          {getOccasionLabel(routine.occasion)} Look
                        </h3>
                        <span className="text-xs bg-[#F9F7F2] text-[#999999] px-3 py-1 rounded-full">
                          {formatDate(routine.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-[#666666]">
                        {getSkinToneLabel(routine.profile.skin_tone)} skin, {routine.profile.undertone} undertone
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyLink(routine.share_id)}
                        className="w-10 h-10 rounded-full bg-[#F9F7F2] flex items-center justify-center text-[#666666] hover:text-[#C27863] hover:bg-[#E0AFA0]/20 transition-colors"
                        title="Copy share link"
                        data-testid={`copy-link-${index}`}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => navigate(`/shared/${routine.share_id}`)}
                        className="w-10 h-10 rounded-full bg-[#F9F7F2] flex items-center justify-center text-[#666666] hover:text-[#C27863] hover:bg-[#E0AFA0]/20 transition-colors"
                        title="View routine"
                        data-testid={`view-routine-${index}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="w-10 h-10 rounded-full bg-[#F9F7F2] flex items-center justify-center text-[#666666] hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete routine"
                            data-testid={`delete-routine-${index}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white rounded-[2rem]">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-['Playfair_Display'] text-xl">
                              Delete this routine?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-[#666666]">
                              This will remove the routine from your saved list. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(routine.id)}
                              className="bg-red-500 hover:bg-red-600 rounded-full"
                              data-testid={`confirm-delete-${index}`}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}

              {/* Create New Button */}
              <button
                onClick={() => navigate("/setup")}
                className="w-full card-feature flex items-center justify-center gap-3 py-6 border-2 border-dashed border-[#E0AFA0] bg-transparent hover:bg-white hover:border-[#C27863] transition-all"
                data-testid="create-new-btn"
              >
                <Plus className="w-5 h-5 text-[#C27863]" />
                <span className="font-medium text-[#C27863]">Create New Routine</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SavedRoutines;
