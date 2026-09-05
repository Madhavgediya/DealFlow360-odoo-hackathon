import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Button } from '../../components/ui/button';
import { LandingThreeCanvas } from '../../components/landing/LandingThreeCanvas';
import {
  ArrowRight,
  BookOpen,
  BarChart2,
  FileText,
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  // Mouse parallax state for floating 3D elements
  const [mouseOffset, setMouseOffset] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * 20;
    setMouseOffset({ x, y });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen min-h-[100dvh] flex flex-col justify-between bg-[#fcfcfd] text-[#1e293b] font-sans selection:bg-[#714b67] selection:text-white relative overflow-hidden"
    >
      {/* 3D Three.js Interactive WebGL Background */}
      <LandingThreeCanvas />

      {/* Background Soft Organic Blurred Ambient Orbs & Arcs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Left ambient glow */}
        <div className="absolute -left-20 top-1/4 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#714b67]/15 via-[#caa5c4]/20 to-transparent blur-[80px]" />
        {/* Right ambient glow */}
        <div className="absolute -right-20 top-1/3 w-[460px] h-[460px] rounded-full bg-gradient-to-bl from-[#714b67]/15 via-[#a855f7]/15 to-transparent blur-[90px]" />

        {/* Top left decorative dot grid */}
        <div className="absolute left-16 top-24 opacity-30 hidden lg:grid grid-cols-5 gap-2.5">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#714b67]" />
          ))}
        </div>

        {/* Curved Connection Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20 hidden md:block" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M 50 250 Q 250 150 400 350 T 800 300 T 1200 450"
            fill="none"
            stroke="#714b67"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <circle cx="400" cy="350" r="4" fill="#714b67" />
          <circle cx="800" cy="300" r="3" fill="#714b67" />
        </svg>
      </div>

      {/* Top Enterprise Sticky Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => navigate('/')}>
            <BrandLogo size="md" />
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/login')}
              className="gap-2 bg-[#714b67] hover:bg-[#5e3c54] text-white text-xs font-semibold px-4 h-9 rounded-lg shadow-sm shadow-[#714b67]/20 transition-all active:scale-[0.98]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Interactive 3D Mockups */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Floating 3D Graphic (Responsive: visible on lg+) */}
          <div
            className="hidden lg:flex lg:col-span-3 flex-col items-center justify-center gap-4 transition-transform duration-300 ease-out pointer-events-none"
            style={{
              transform: `translate3d(${mouseOffset.x * -0.6}px, ${mouseOffset.y * -0.6}px, 0) rotate(-6deg)`,
            }}
          >
            <div className="w-64 p-5 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/70 shadow-2xl shadow-[#714b67]/15 space-y-4 animate-float">
              {/* Bar Chart Mockup */}
              <div className="flex items-end justify-between h-28 gap-2 pt-2 px-1">
                <div className="w-full bg-[#f5eff3] rounded-t-lg h-[40%]" />
                <div className="w-full bg-[#caa5c4] rounded-t-lg h-[65%]" />
                <div className="w-full bg-[#925f84] rounded-t-lg h-[85%]" />
                <div className="w-full bg-[#714b67] rounded-t-lg h-[100%]" />
              </div>
              <div className="space-y-1.5">
                <div className="w-3/4 h-2 bg-slate-200 rounded-full" />
                <div className="w-1/2 h-2 bg-slate-100 rounded-full" />
              </div>
            </div>

            {/* Small floating pill badge */}
            <div className="w-52 p-3 rounded-xl bg-white/90 backdrop-blur-lg border border-white/80 shadow-lg shadow-slate-200/50 flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-[#714b67] animate-pulse" />
              <div className="w-32 h-2 bg-slate-200 rounded-full" />
            </div>
          </div>

          {/* Center Main Content */}
          <div className="lg:col-span-6 text-center space-y-6 sm:space-y-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f5eff3] border border-[#ecdfe8] text-[#714b67] text-xs font-bold tracking-wide shadow-xs animate-in fade-in slide-in-from-bottom-2">
              <span>Next-Gen Enterprise Deal OS & Commercial CPQ Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1e293b] font-display max-w-2xl mx-auto leading-[1.12]">
              Accelerate B2B Deals from{' '}
              <span className="text-[#714b67] bg-gradient-to-r from-[#714b67] to-[#925f84] bg-clip-text text-transparent">
                Proposal to Paid Invoices
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed px-2">
              Eliminate discount leaks, automate multi-tier approval chains, enforce margin floor governance, and generate professional A4 commercial documents in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 max-w-md sm:max-w-none mx-auto w-full">
              <Button
                size="lg"
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto gap-2 bg-[#714b67] hover:bg-[#5e3c54] text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-md shadow-[#714b67]/25 transition-all active:scale-[0.98] h-11"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/docs')}
                className="w-full sm:w-auto gap-2 border-slate-200 bg-white/90 backdrop-blur-sm hover:bg-slate-50 text-slate-800 text-sm font-semibold px-6 py-3 rounded-xl h-11 shadow-xs"
              >
                <BookOpen className="w-4 h-4 text-[#714b67]" />
                <span>Read Docs</span>
              </Button>
            </div>
          </div>

          {/* Right Floating 3D Graphic (Responsive: visible on lg+) */}
          <div
            className="hidden lg:flex lg:col-span-3 flex-col items-center justify-center gap-4 transition-transform duration-300 ease-out pointer-events-none relative"
            style={{
              transform: `translate3d(${mouseOffset.x * 0.6}px, ${mouseOffset.y * 0.6}px, 0) rotate(6deg)`,
            }}
          >
            {/* Mini floating top badge */}
            <div className="absolute -top-6 -right-2 p-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-white/80 shadow-lg text-[#714b67]">
              <BarChart2 className="w-4 h-4" />
            </div>

            {/* Main Donut Chart Card */}
            <div className="w-64 p-5 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/70 shadow-2xl shadow-[#714b67]/15 space-y-4">
              <div className="flex items-center justify-center py-2">
                {/* Donut Chart SVG */}
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#f5eff3]"
                    strokeWidth="4.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#714b67]"
                    strokeDasharray="68, 100"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
              <div className="space-y-1.5">
                <div className="w-full h-2 bg-slate-200 rounded-full" />
                <div className="w-4/5 h-2 bg-slate-100 rounded-full" />
                <div className="w-3/5 h-2 bg-slate-100 rounded-full" />
              </div>
            </div>

            {/* Mini floating bottom badge */}
            <div className="self-end p-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-white/80 shadow-lg text-[#714b67]">
              <FileText className="w-4 h-4" />
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-white/80 backdrop-blur-md border-t border-slate-200/80 py-6 sm:py-8 text-xs text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" />
            <span className="text-slate-400">| Enterprise Deal Operating System</span>
          </div>

          <p>© 2026 DealFlow360 Technologies Pvt Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
