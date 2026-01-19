"use client"

import React, { useEffect, useState } from 'react';

const AdCampaign = () => {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['Brand Intelligence', 'Ad Generation', 'Campaign Visuals', 'Social Automation'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF9E6] text-gray-900 relative overflow-hidden">
      {/* Subtle dot pattern background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
      {/* Main Hero Section */}
      <div className="relative z-10 px-8 lg:px-16 py-12">
         {/* Right Sidebar */}
            <div className="right-8 bg-[#FFD700] rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 ">
                {/* Platform icons */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                
                    <div className="aspect-square bg-white rounded-xl border-3 border-black flex items-center justify-center shadow-md">
                        <span className="text-2xl">🎨</span>
                    </div>
                    <div className="aspect-square bg-white rounded-xl border-3 border-black flex items-center justify-center shadow-md">
                        <span className="text-2xl">✨</span>
                    </div>
                    <div className="aspect-square bg-white rounded-xl border-3 border-black flex items-center justify-center shadow-md">
                        <span className="text-2xl">📊</span>
                    </div>
                </div>

                <h3 className="text-2xl font-black mb-4 leading-tight">
                Looking for Reliable
                <br />
                <span className="text-3xl">AI Marketing & Campaign</span>
                <br />
                Service?
                </h3>

                <button className="w-full py-4 bg-black text-[#FFD700] font-black text-lg uppercase tracking-wide border-4 border-black hover:translate-x-1 hover:translate-y-1 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
                Get a Quick Quote
                </button>
            </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Left Content */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-tight mb-6">
                Marketing Partner for
                <br />
                <span className="relative inline-block">
                  Growing Businesses
                  <svg className="absolute -right-12 -top-4 w-16 h-16 text-[#FFD700]" viewBox="0 0 64 64" fill="currentColor">
                    <path d="M32 8L28 24L16 20L24 32L8 36L20 44L16 56L32 48L44 56L40 44L56 36L40 32L48 20L36 24L32 8Z"/>
                  </svg>
                </span>
              </h1>
            </div>
          </div>
          {/* Right Visual - Campaign Mockup */}
          <div className="lg:col-span-7 relative">
            <div className="relative">
              {/* Main screen mockup */}
              <div className="relative bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border-8 border-black">
                <div className="bg-gray-800 px-4 py-3 flex items-center gap-2 border-b-2 border-black">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-black" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-black" />
                    <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-black" />
                  </div>
                  <div className="flex-1 bg-gray-700 rounded px-3 py-1 text-xs text-gray-400 font-mono">
                    adcraft.ai/dashboard
                  </div>
                </div>
                
                {/* Code editor simulation */}
                <div className="bg-gray-900 p-6 font-mono text-sm h-64">
                  <div className="space-y-2">
                    <div className="flex gap-4">
                      <span className="text-gray-600">1</span>
                      <span className="text-purple-400">const</span>
                      <span className="text-blue-400">generateCampaign</span>
                      <span className="text-white">= async () =&gt; {'{'}</span>
                    </div>
                    <div className="flex gap-4 ml-8">
                      <span className="text-gray-600">2</span>
                      <span className="text-pink-400">await</span>
                      <span className="text-yellow-400">analyzeBrand</span>
                      <span className="text-white">(websiteUrl);</span>
                    </div>
                    <div className="flex gap-4 ml-8">
                      <span className="text-gray-600">3</span>
                      <span className="text-pink-400">return</span>
                      <span className="text-yellow-400">createAds</span>
                      <span className="text-white">();</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-gray-600">4</span>
                      <span className="text-white">{'}'}</span>
                    </div>
                  </div>
                </div>

                {/* Campaign preview overlay */}
                <div className="absolute bottom-8 right-8 bg-[#00A8E8] rounded-xl shadow-2xl p-6 w-72 border-4 border-black">
                  <div className="space-y-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                      <div className="h-2 bg-white/60 rounded w-3/4 mb-2" />
                      <div className="h-2 bg-white/60 rounded w-full mb-2" />
                      <div className="h-2 bg-white/60 rounded w-2/3" />
                    </div>
                    <div className="text-sm font-bold text-white">
                      Featured Message<br/>
                      <span className="text-xs font-normal">Generated Campaign Preview</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Person image with star rating */}
              <div className="absolute -top-8 -right-8 lg:-right-12">
                <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-6 border-black shadow-xl bg-white">
                  <img 
                    src="https://d1csarkz8obe9u.cloudfront.net/posterpreviews/online-marketing-flyer-template-design-31ddce74312198d8c745c0560524b7e9.webp?ts=1737354403?w=400&h=400&fit=crop"
                    alt="Happy user"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-4 -right-4 bg-[#FFD700] border-4 border-black rounded-xl px-4 py-2 shadow-lg">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-black" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              {/* Person with phone */}
              <div className="absolute bottom-0 left-0 lg:-left-16 w-48 h-64 lg:w-56 lg:h-72">
                <div className="relative h-full bg-gradient-to-br from-pink-300 to-purple-400 rounded-t-full overflow-hidden border-4 border-black">
                  <img 
                    src="https://d1csarkz8obe9u.cloudfront.net/posterpreviews/white-maximalist-content-flyer-%28us-letter%29-design-template-7c7b9e9181749e3b9f0033903536b0b2_e2d35351-8010-4595-91f8-cd5a022e7b64_thumb.webp?ts=1760395607?w=400&h=600&fit=crop"
                    alt="User with phone"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Decorative icons */}
              <div className="absolute top-1/4 -left-8 w-16 h-16 bg-[#00D4FF] rounded-full border-4 border-black flex items-center justify-center animate-bounce">
                <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="8"/>
                  <path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>

              <div className="absolute top-1/2 right-0 w-20 h-20 bg-[#FF6B6B] rounded-2xl border-4 border-black flex items-center justify-center rotate-12">
                <span className="text-4xl">$</span>
              </div>

              <div className="absolute bottom-1/4 -left-4 w-14 h-14 bg-[#4ECDC4] rounded-full border-4 border-black flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>
          </div>
         
        </div>
      </div>
    </div>
  );
};

export default AdCampaign;