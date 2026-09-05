import * as React from 'react';
import { useTourStore, TourStep } from '../../stores/tour.store';
import { useAuthStore } from '../../stores/auth.store';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Compass,
  CheckCircle2,
  Navigation,
} from 'lucide-react';

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

export function OnboardingTour() {
  const { user } = useAuthStore();
  const {
    isActive,
    currentStepIndex,
    steps,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    checkAndAutoStart,
  } = useTourStore();

  const navigate = useNavigate();
  const location = useLocation();

  const [targetRect, setTargetRect] = React.useState<ElementRect | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  // Auto-start on first login if user hasn't completed or skipped it
  React.useEffect(() => {
    if (user?.id) {
      checkAndAutoStart(user.id, user.role);
    }
  }, [user?.id, user?.role, checkAndAutoStart]);

  const currentStep: TourStep | undefined = steps[currentStepIndex];

  // Navigate to step route if specified and not currently on it
  React.useEffect(() => {
    if (!isActive || !currentStep) return;

    if (currentStep.route && location.pathname !== currentStep.route) {
      navigate(currentStep.route);
    }
  }, [isActive, currentStepIndex, currentStep, location.pathname, navigate]);

  // Measure and track the target element
  const updateTargetRect = React.useCallback(() => {
    if (!isActive || !currentStep) {
      setTargetRect(null);
      setIsVisible(false);
      return;
    }

    const el = document.querySelector(currentStep.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom,
        right: rect.right,
      });
      setIsVisible(true);
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    } else {
      // Fallback center position if element is not in DOM
      setTargetRect({
        top: window.innerHeight / 2 - 100,
        left: window.innerWidth / 2 - 150,
        width: 300,
        height: 120,
        bottom: window.innerHeight / 2 + 20,
        right: window.innerWidth / 2 + 150,
      });
      setIsVisible(true);
    }
  }, [isActive, currentStep]);

  React.useEffect(() => {
    const timer = setTimeout(updateTargetRect, 200);
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [updateTargetRect, currentStepIndex, location.pathname]);

  // Handle keyboard navigation (Escape to skip, Right to next, Left to prev)
  React.useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipTour(user?.id);
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentStepIndex === steps.length - 1) {
          completeTour(user?.id);
        } else {
          nextStep();
        }
      } else if (e.key === 'ArrowLeft') {
        prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, currentStepIndex, steps.length, user?.id, nextStep, prevStep, skipTour, completeTour]);

  if (!isActive || !currentStep || !isVisible) {
    return null;
  }

  // Calculate Popover & Arrow Position
  const padding = 12;
  const placement = currentStep.placement || 'bottom';
  const cardWidth = Math.min(360, window.innerWidth - 32);

  let cardTop = 0;
  let cardLeft = 0;
  let arrowSvg: React.ReactNode = null;

  if (targetRect) {
    const { top, left, width, height, bottom, right } = targetRect;

    switch (placement) {
      case 'right': {
        cardLeft = Math.min(right + 24, window.innerWidth - cardWidth - 16);
        cardTop = Math.max(16, Math.min(top + height / 2 - 100, window.innerHeight - 280));
        arrowSvg = (
          <div
            className="absolute -left-6 top-10 pointer-events-none z-50 flex items-center"
            style={{ transform: 'translateX(-50%)' }}
          >
            <div className="relative animate-pulse flex items-center">
              {/* Pulsing Ripple Dot at element border */}
              <div className="w-3 h-3 rounded-full bg-[#714b67] ring-4 ring-[#714b67]/30 animate-ping absolute -left-2" />
              {/* Directional Curved SVG Arrow pointing LEFT */}
              <svg width="48" height="32" viewBox="0 0 48 32" className="drop-shadow-lg text-[#714b67]">
                <path
                  d="M 44 16 L 10 16 M 10 16 L 20 8 M 10 16 L 20 24"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        );
        break;
      }
      case 'left': {
        cardLeft = Math.max(16, left - cardWidth - 24);
        cardTop = Math.max(16, Math.min(top + height / 2 - 100, window.innerHeight - 280));
        arrowSvg = (
          <div
            className="absolute -right-6 top-10 pointer-events-none z-50 flex items-center"
            style={{ transform: 'translateX(50%)' }}
          >
            <div className="relative animate-pulse flex items-center">
              <svg width="48" height="32" viewBox="0 0 48 32" className="drop-shadow-lg text-[#714b67]">
                <path
                  d="M 4 16 L 38 16 M 38 16 L 28 8 M 38 16 L 28 24"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
              <div className="w-3 h-3 rounded-full bg-[#714b67] ring-4 ring-[#714b67]/30 animate-ping absolute -right-2" />
            </div>
          </div>
        );
        break;
      }
      case 'top': {
        cardLeft = Math.max(16, Math.min(left + width / 2 - cardWidth / 2, window.innerWidth - cardWidth - 16));
        cardTop = Math.max(16, top - 240);
        arrowSvg = (
          <div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 pointer-events-none z-50 flex flex-col items-center"
          >
            <div className="relative animate-bounce flex flex-col items-center">
              <svg width="32" height="40" viewBox="0 0 32 40" className="drop-shadow-lg text-[#714b67]">
                <path
                  d="M 16 4 L 16 32 M 16 32 L 8 22 M 16 32 L 24 22"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
              <div className="w-3 h-3 rounded-full bg-[#714b67] ring-4 ring-[#714b67]/30 animate-ping absolute -bottom-1" />
            </div>
          </div>
        );
        break;
      }
      case 'bottom':
      default: {
        cardLeft = Math.max(16, Math.min(left + width / 2 - cardWidth / 2, window.innerWidth - cardWidth - 16));
        cardTop = Math.min(bottom + 20, window.innerHeight - 260);
        arrowSvg = (
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none z-50 flex flex-col items-center"
          >
            <div className="relative animate-bounce flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-[#714b67] ring-4 ring-[#714b67]/30 animate-ping absolute -top-1" />
              <svg width="32" height="40" viewBox="0 0 32 40" className="drop-shadow-lg text-[#714b67]">
                <path
                  d="M 16 36 L 16 8 M 16 8 L 8 18 M 16 8 L 24 18"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        );
        break;
      }
    }
  }

  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto select-none no-print">
      {/* 1. Dark Backdrop with Spotlight Mask Cutout */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none transition-all duration-300">
        <defs>
          <mask id="tour-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - padding}
                y={targetRect.top - padding}
                width={targetRect.width + padding * 2}
                height={targetRect.height + padding * 2}
                rx="14"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.65)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* 2. Highlighted Element Glowing Border & Pulse Ring */}
      {targetRect && (
        <div
          className="fixed pointer-events-none border-2 border-[#714b67] rounded-2xl ring-4 ring-[#714b67]/25 shadow-2xl transition-all duration-300 animate-in fade-in"
          style={{
            top: targetRect.top - padding,
            left: targetRect.left - padding,
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
          }}
        >
          {/* Corner Glowing Accents */}
          <span className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#714b67] rounded-full ring-2 ring-white shadow-md animate-ping" />
          <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#714b67] rounded-full ring-2 ring-white shadow-md" />
        </div>
      )}

      {/* 3. Interactive Tour Step Card with Animated Arrow */}
      <div
        className="fixed z-50 transition-all duration-300 animate-in zoom-in-95"
        style={{
          top: cardTop,
          left: cardLeft,
          width: cardWidth,
        }}
      >
        <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-visible text-[#252733] font-sans">
          {/* Animated Directional SVG Arrow */}
          {arrowSvg}

          {/* Top Gradient Header Ribbon */}
          <div className="h-1.5 bg-gradient-to-r from-[#714b67] via-purple-600 to-amber-500 rounded-t-2xl" />

          <div className="p-4 space-y-3">
            {/* Header: Step counter + Badge + Close button */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#f5eff3] text-[#714b67] font-bold text-[10px] uppercase font-mono tracking-wider border border-[#ecdfe8]">
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
                {currentStep.badge && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold text-[10px] border border-amber-200">
                    {currentStep.badge}
                  </span>
                )}
              </div>

              <button
                onClick={() => skipTour(user?.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Skip tour (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Description */}
            <div>
              <h3 className="font-bold text-sm text-[#252733] font-display flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#714b67]" />
                {currentStep.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* Action Hint Pill */}
            {currentStep.actionHint && (
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-2 text-[11px] text-slate-600">
                <Navigation className="w-3.5 h-3.5 text-[#714b67] shrink-0 rotate-45" />
                <span className="font-semibold text-[#252733]">{currentStep.actionHint}</span>
              </div>
            )}

            {/* Footer Navigation Buttons & Progress Dots */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => skipTour(user?.id)}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Skip Tour
              </button>

              {/* Progress Dots */}
              <div className="flex items-center gap-1">
                {steps.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentStepIndex
                        ? 'w-4 bg-[#714b67]'
                        : idx < currentStepIndex
                        ? 'w-1.5 bg-purple-300'
                        : 'w-1.5 bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex items-center gap-1.5">
                {currentStepIndex > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={prevStep}
                    className="h-8 px-2.5 text-xs text-slate-600 border-slate-200 hover:bg-slate-50"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                )}

                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (isLastStep) {
                      completeTour(user?.id);
                    } else {
                      nextStep();
                    }
                  }}
                  className="h-8 px-3 text-xs gap-1 bg-[#714b67] hover:bg-[#5e3c54] text-white font-semibold shadow-sm"
                >
                  <span>{isLastStep ? 'Get Started' : 'Next'}</span>
                  {isLastStep ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingTour;
