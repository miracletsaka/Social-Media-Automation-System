"use client"

import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const AdCampaignHero = () => {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['Brand Intelligence', 'Ad Generation', 'Campaign Visuals', 'Social Automation'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sample campaign images that will float in background
  const campaignImages = [
    { id: 1, rotation: -5, x: '10%', y: '15%', delay: 0 },
    { id: 2, rotation: 8, x: '75%', y: '20%', delay: 1 },
    { id: 3, rotation: -3, x: '15%', y: '65%', delay: 2 },
    { id: 4, rotation: 5, x: '70%', y: '70%', delay: 3 },
    { id: 5, rotation: -8, x: '85%', y: '45%', delay: 1.5 },
    { id: 6, rotation: 4, x: '5%', y: '40%', delay: 2.5 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 relative overflow-hidden">
      {/* Subtle grid background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Spot gradients for depth */}
      <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-gradient-radial from-[#0070f3]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-20 w-[600px] h-[600px] bg-gradient-radial from-emerald-400/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-gradient-radial from-purple-400/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      {/* Linear gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-emerald-50/50 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

      {/* Floating campaign ad mockups in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {campaignImages.map((img) => (
          <div
            key={img.id}
            className="absolute w-64 h-80 rounded-2xl shadow-xl border border-gray-200/50 opacity-30 hover:opacity-40 transition-opacity duration-500 overflow-hidden bg-white"
            style={{
              left: img.x,
              top: img.y,
              transform: `rotate(${img.rotation}deg)`,
              animation: `float ${6 + img.delay}s ease-in-out infinite`,
              animationDelay: `${img.delay}s`,
            }}
          >
            <img 
              src={`${
                img.id === 1 ? 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/modern-online-course-poster-a2-design-template-de9465c83d77066ede9476cb1ab1e9a9.webp?ts=1722346479?w=400' :
                img.id === 2 ? 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/digital-marketing-agency-design-template-d7c52a76e06241888d4e77de02307aa3.webp?ts=1703317912?w=400' :
                img.id === 3 ? 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/marketing-seminar-flyer-template-design-27d9ebc8f0b818cd4e5fd1fb8a901ef2.jpg?ts=1637005524?w=400' :
                img.id === 4 ? 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/digital-marketing-template-design-59dcf5ad21be4ddb35adca00d0dae7b9.jpg?ts=1666340649?w=400' :
                img.id === 5 ? 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/digital-marketing-agency-magazine-style-design-template-fa7eb3ce219643d5f73181d11c1cf4d8.webp?ts=1698511153?w=400' :
                'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/business-conference-ads-design-template-626adba29026c50651938f42e8917fdc.webp?ts=1758599790?w=400'
              }&auto=format&fit=crop`}
              alt={`Campaign ${img.id}`}
              className="w-full h-full object-cover opacity-70"
            />
          </div>
        ))}
      </div>

      {/* Hero Section - Busy Design */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-24 pb-20">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#0070f3]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

        {/* Badge */}
        <div className="relative mb-6 px-4 py-2 bg-white/80 rounded-full border border-gray-200 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wide">AI-Powered Marketing Platform</span>
          </div>
        </div>

        {/* Main Headline with animated words */}
        <div className="text-center space-y-6 mb-8 max-w-6xl relative">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
            <span className="block font-bold text-gray-600 uppercase tracking-wide mb-2">
              From Website to
            </span>
            <span className="block relative overflow-hidden h-[1.3em]">
              {words.map((word, index) => (
                <span
                  key={word}
                  className={`absolute left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0070f3] via-emerald-500 to-[#0070f3] bg-clip-text text-transparent transition-all duration-700 whitespace-nowrap ${
                    index === currentWord 
                      ? 'opacity-100 translate-y-0' 
                      : index < currentWord 
                        ? 'opacity-0 -translate-y-full' 
                        : 'opacity-0 translate-y-full'
                  }`}
                  style={{
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  {word}
                </span>
              ))}
            </span>
          </h1>

          {/* Subheading - Long descriptive
          <div className="max-w-4xl mx-auto space-y-5 pt-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-600 uppercase tracking-wide leading-relaxed px-4">
              Transform your website URL into professional marketing campaigns in seconds. We analyzes your brand identity, voice, and positioning to generate agency-quality ad copy and premium visuals.
            </h2>
          </div> */}
        </div>

        {/* CTA Button */}
        <Link href="/auth/login">
        <button className="group relative px-10 py-4 bg-[#FFD700] border-4 border-black text-black font-black text-lg uppercase tracking-wide hover:translate-x-1 hover:translate-y-1 transition-transform shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
               Sign in (Only Admin)
                <svg className="inline-block ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
        </Link>

        {/* Trust badge */}
        <p className="mt-8 text-sm text-gray-600 font-medium">Trusted by 1+ users worldwide</p>

        {/* Stats row */}
        <div className="flex items-center gap-8 md:gap-12 mt-12 flex-wrap justify-center px-4">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">10x</div>
            <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">Faster than agencies</div>
          </div>
          <div className="h-12 w-px bg-gray-300" />
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">95%</div>
            <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">Cost reduction</div>
          </div>
          <div className="h-12 w-px bg-gray-300" />
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">4.9/5</div>
            <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">User satisfaction</div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(var(--rotation));
          }
          50% {
            transform: translateY(-20px) rotate(var(--rotation));
          }
        }
      `}</style>
    </div>
  );
};

export default AdCampaignHero;