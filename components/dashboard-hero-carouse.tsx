"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Wand2,
  Images,
  Video,
  CheckCircle2,
  CalendarClock,
  Bell,
  Bot,
} from "lucide-react";

type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  bgGradient: string;
  icon: React.ReactNode;
  decorativeElements: {
    color: string;
    position: string;
  }[];
};

const heroSlides: HeroSlide[] = [
  {
    id: "topic-intake",
    title: "Bulk topic intake → instant content pipelines",
    subtitle: "Drop 20+ topics at once, select platforms & content types, and let the system create drafts automatically.",
    ctaText: "Add Topics",
    ctaLink: "/dashboard/topics",
    bgGradient: "from-purple-200 via-pink-200 to-blue-200",
    icon: <Sparkles className="w-16 h-16 text-purple-800" />,
    decorativeElements: [
      { color: "bg-yellow-300", position: "top-20 right-40" },
      { color: "bg-pink-400", position: "top-40 right-20" },
      { color: "bg-blue-400", position: "bottom-40 right-60" },
    ],
  },
  {
    id: "ai-generation",
    title: "Generate captions + creatives (image/video) in one workflow",
    subtitle: "Text drafts first, then generate images/videos and attach them to each post for review.",
    ctaText: "Generate Drafts",
    ctaLink: "/dashboard/approvals",
    bgGradient: "from-blue-200 via-cyan-200 to-teal-200",
    icon: <Wand2 className="w-16 h-16 text-blue-800" />,
    decorativeElements: [
      { color: "bg-cyan-300", position: "top-32 right-32" },
      { color: "bg-teal-400", position: "top-48 right-48" },
      { color: "bg-blue-500", position: "bottom-32 right-40" },
    ],
  },
  {
    id: "media-library",
    title: "Visual-first approvals: see the generated image/video before posting",
    subtitle: "No guessing. Review the media preview, captions, and metadata in one place.",
    ctaText: "Open Approvals",
    ctaLink: "/dashboard/approvals",
    bgGradient: "from-green-200 via-emerald-200 to-lime-200",
    icon: <Images className="w-16 h-16 text-green-800" />,
    decorativeElements: [
      { color: "bg-lime-300", position: "top-28 right-36" },
      { color: "bg-emerald-400", position: "top-44 right-24" },
      { color: "bg-green-500", position: "bottom-36 right-52" },
    ],
  },
  {
    id: "approval-workflow",
    title: "Bulk approve, reject, and regenerate—fast",
    subtitle: "Approve what’s good, reject with reasons, and regenerate drafts without losing momentum.",
    ctaText: "Review Queue",
    ctaLink: "/dashboard/approvals",
    bgGradient: "from-orange-200 via-amber-200 to-yellow-200",
    icon: <CheckCircle2 className="w-16 h-16 text-orange-800" />,
    decorativeElements: [
      { color: "bg-yellow-300", position: "top-24 right-44" },
      { color: "bg-orange-400", position: "top-52 right-28" },
      { color: "bg-amber-500", position: "bottom-28 right-56" },
    ],
  },
  {
    id: "scheduling-publishing",
    title: "Schedule and publish through Buffer/Make with audit-friendly states",
    subtitle: "Move from Approved → Scheduled → Queued → Published, with errors tracked and retriable.",
    ctaText: "Go to Scheduling",
    ctaLink: "/dashboard/scheduled",
    bgGradient: "from-indigo-200 via-violet-200 to-purple-200",
    icon: <CalendarClock className="w-16 h-16 text-indigo-800" />,
    decorativeElements: [
      { color: "bg-violet-300", position: "top-36 right-40" },
      { color: "bg-purple-400", position: "top-48 right-20" },
      { color: "bg-indigo-500", position: "bottom-44 right-48" },
    ],
  },
];

export default function DashboardHeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showChatTooltip, setShowChatTooltip] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const currentSlide = heroSlides[currentIndex];

  const startAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };

  useEffect(() => {
    if (isAutoPlaying) startAutoPlay();
    else stopAutoPlay();
    return () => stopAutoPlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoPlaying, currentIndex]);

  useEffect(() => {
    const timer = setTimeout(() => setShowChatTooltip(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const goToSlide = (index: number) => setCurrentIndex(index);

  return (
    <div className="relative w-full">
      {/* Hero Carousel Section */}
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`bg-gradient-to-br py-10 lg:py-0 lg:rounded-b-[80px] ${currentSlide.bgGradient}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                {/* Left Content */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="space-y-3"
                >
                  {/* Title */}
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 leading-tight">
                    {currentSlide.title}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-sm sm:text-base font-semibold text-slate-700 leading-relaxed">
                    {currentSlide.subtitle}
                  </p>

                  {/* CTA Button */}
                  <a
                    href={currentSlide.ctaLink}
                    className="inline-flex items-center justify-center bg-slate-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-xs sm:text-sm font-semibold hover:bg-slate-800 transition shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    {currentSlide.ctaText}
                  </a>

                  {/* Carousel Indicators */}
                  <div className="flex gap-2 pt-4">
                    {heroSlides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          idx === currentIndex
                            ? "w-8 bg-slate-900"
                            : "w-2 bg-slate-900/30 hover:bg-slate-900/50"
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Right Decorative Elements */}
                <div className="relative h-[380px] lg:h-[500px] hidden lg:block">
                  {currentSlide.decorativeElements.map((element, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.8 }}
                      transition={{
                        delay: 0.4 + idx * 0.15,
                        duration: 0.8,
                        type: "spring",
                        stiffness: 100,
                      }}
                      className={`absolute ${element.color} rounded-full blur-3xl`}
                      style={{
                        width: idx === 0 ? "280px" : idx === 1 ? "320px" : "240px",
                        height: idx === 0 ? "280px" : idx === 1 ? "320px" : "240px",
                      }}
                    >
                      <div className={element.position} />
                    </motion.div>
                  ))}

                  {/* Abstract Shape */}
                  <motion.div
                    initial={{ rotate: 0, scale: 0 }}
                    animate={{ rotate: 15, scale: 1 }}
                    transition={{ delay: 0.6, duration: 1 }}
                    className="absolute top-1/2 right-16 transform -translate-y-1/2"
                  >
                    <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
                      <path
                        d="M200 50 L350 150 L350 250 L200 350 L50 250 L50 150 Z"
                        fill="url(#gradient)"
                        fillOpacity="0.4"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="50%" stopColor="#EC4899" />
                          <stop offset="100%" stopColor="#3B82F6" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </motion.div>

                  {/* Floating Card */}
                  <motion.div
                    animate={{
                      y: [0, -18, 0],
                      rotate: [0, 4, -4, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute top-1/4 right-36 bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-900/10 rounded-xl p-3">{currentSlide.icon}</div>
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-800">Workflow status</div>
                        <div className="text-[11px] font-semibold text-slate-600">
                          Topic → Draft → Media → Approval → Publish
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Chat Tooltip */}
      <AnimatePresence>
        {showChatTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-24 right-4 sm:right-8 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl max-w-sm z-50"
          >
            <button
              onClick={() => setShowChatTooltip(false)}
              className="absolute top-2 right-2 text-white/60 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm leading-relaxed">
                  Want to generate an image for a post? Go to <b>Approvals</b>, select items, then hit{" "}
                  <b>Generate Media</b>.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-4 sm:right-8 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl z-40"
        aria-label="Help"
        onClick={() => setShowChatTooltip(true)}
      >
        <Bot className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
          1
        </span>
      </motion.button>
    </div>
  );
}
