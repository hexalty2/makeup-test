import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "@/pages/LandingPage";
import ProfileSetup from "@/pages/ProfileSetup";
import RoutineGuide from "@/pages/RoutineGuide";
import SharedRoutine from "@/pages/SharedRoutine";
import SavedRoutines from "@/pages/SavedRoutines";

function App() {
  return (
    <div className="App min-h-screen bg-[#F9F7F2]">
      <BrowserRouter basename="/makeup-test">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/setup" element={<ProfileSetup />} />
          <Route path="/routine" element={<RoutineGuide />} />
          <Route path="/shared/:shareId" element={<SharedRoutine />} />
          <Route path="/saved" element={<SavedRoutines />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-center" richColors />
    </div>
  );
}

export default App;
