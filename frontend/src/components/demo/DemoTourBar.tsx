import { useDemoStore, HERO_DEMO_STEPS } from '../../stores/demo.store';
import { useAuthStore } from '../../stores/auth.store';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';

export function DemoTourBar() {
  const { isTourActive, currentStepIndex, nextStep, prevStep, goToStep, stopTour, startTour } = useDemoStore();
  const { switchRole } = useAuthStore();
  const navigate = useNavigate();

  if (!isTourActive) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={startTour}
          size="sm"
          className="bg-[#714b67] hover:bg-[#5e3c54] text-white shadow-xl shadow-[#714b67]/20 gap-1.5 rounded-full px-4 text-xs font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Start Product Tour
        </Button>
      </div>
    );
  }

  const currentStep = HERO_DEMO_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < HERO_DEMO_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      const nextS = HERO_DEMO_STEPS[nextIdx];
      switchRole(nextS.recommendedRole);
      navigate(nextS.route);
      nextStep();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      const prevS = HERO_DEMO_STEPS[prevIdx];
      switchRole(prevS.recommendedRole);
      navigate(prevS.route);
      prevStep();
    }
  };

  return (
    <div className="bg-white border-b border-[#e5e7eb] text-[#252733] px-4 py-2 text-xs flex flex-col md:flex-row items-center justify-between gap-3 shadow-subtle relative z-40">
      {/* Left: Step indicator */}
      {/* <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2 py-0.5 rounded-full bg-[#f5eff3] text-[#714b67] font-bold uppercase tracking-wider text-[10px] border border-[#ecdfe8]">
          Tour ({currentStepIndex + 1}/{HERO_DEMO_STEPS.length})
        </span>
        <span className="font-bold text-[#252733]">{currentStep.title}</span>
        <span className="hidden lg:inline-block text-slate-500">
          — {currentStep.description}
        </span>
      </div> */}

      {/* Right: Actions & Role indication */}
      {/* <div className="flex items-center gap-2 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] bg-[#f3f4f6] px-2 py-1 rounded-lg border border-[#e5e7eb]">
          <span className="text-slate-500">Target Role:</span>
          <span className="font-bold text-[#714b67] font-mono">{currentStep.recommendedRole}</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="h-7 px-2.5 text-xs bg-white text-[#252733] border-[#e5e7eb] hover:bg-[#f3f4f6]"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </Button>

          <Button
            size="sm"
            onClick={handleNext}
            disabled={currentStepIndex === HERO_DEMO_STEPS.length - 1}
            className="h-7 px-3 text-xs gap-1 bg-[#714b67] hover:bg-[#5e3c54] text-white shadow-sm"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <button
          onClick={stopTour}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
          title="Dismiss Tour Bar"
        >
          <X className="w-4 h-4" />
        </button>
      </div> */}
    </div>
  );
}
