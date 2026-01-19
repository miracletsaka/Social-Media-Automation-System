"use client"

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";


const JobslyLogin = () => {
    const r = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
  
    async function submit() {
      setErr(null);
      setLoading(true);
      try {
        await loginUser({ email, password });
        r.push("/dashboard");
      } catch (e: any) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-teal-50 to-teal-100 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Main Content Container */}
      <div className="w-full max-w-6xl flex gap-8 items-center">
        {/* Left Side - Image Grid */}
        <div className="flex-1 bg-white rounded-3xl shadow-2xl overflow-hidden h-[600px] relative">
          <div className="grid grid-cols-3 grid-rows-3 gap-2 h-full p-4">
            {/* Row 1 */}
            <div className="overflow-hidden rounded-xl animate-slideDown" style={{animationDelay: '0ms'}}>
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop" alt="Professional" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden text-white rounded-xl bg-orange-500 flex items-center justify-center p-6 animate-slideUp" style={{animationDelay: '100ms'}}>
              <div className="text-white text-center">
                <div className="text-5xl font-bold mb-2">41%</div>
                <div className="text-sm">of recruiters say entry-level positions are the hardest to fill.</div>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl bg-slate-600 animate-slideDown" style={{animationDelay: '200ms'}}>
              <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop" alt="Building" className="w-full h-full object-cover opacity-60" />
            </div>

            {/* Row 2 */}
            <div className="overflow-hidden rounded-xl animate-slideUp" style={{animationDelay: '300ms'}}>
              <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop" alt="Working" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden rounded-xl animate-slideDown" style={{animationDelay: '400ms'}}>
              <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=400&fit=crop" alt="Office" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden rounded-xl bg-amber-700 animate-slideUp" style={{animationDelay: '500ms'}}>
              <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop" alt="Professional woman" className="w-full h-full object-cover" />
            </div>

            {/* Row 3 */}
            <div className="overflow-hidden rounded-xl animate-slideDown" style={{animationDelay: '600ms'}}>
              <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop" alt="Library" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden rounded-xl bg-green-500 flex items-center justify-center p-6 animate-slideUp" style={{animationDelay: '700ms'}}>
              <div className="text-white text-center">
                <div className="text-5xl font-bold mb-2">76%</div>
                <div className="text-sm">of hiring managers admit attracting the right job candidates is their greatest challenge.</div>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl animate-slideDown" style={{animationDelay: '800ms'}}>
              <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop" alt="Workspace" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="relative w-full max-w-md rounded-3xl p-10">
            <div className="rounded-3xl z-0 absolute inset-0 bg-gradient-to-br from-blue-500 via-teal-400 to-green-500 shadow-lg transform -rotate-6 scale-105">
                  <img 
                    src="https://images.unsplash.com/photo-1550345332-09e3ac987658?w=400&h=800&fit=crop" 
                    alt="Fitness woman profile"
                    className="w-full h-full rounded-3xl object-cover opacity-60"
                  />
                  <div className="rounded-3xl absolute inset-0 bg-gradient-to-b from-transparent opacity-40 via-slate-900/40 to-slate-900"></div>
                </div>
                <div className='relative'>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Sign in <span className="text-green-600">to Neuroflow</span>
            </h1>
          </div>

          <div className="space-y-6 z-50">
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-gray-400 w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-gray-400 w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
             {err && <p className="text-red-700 text-sm">{err}</p>}
            <div className="text-right">
              <button className="text-blue-600 text-sm font-semibold hover:underline bg-transparent border-none cursor-pointer">
                Forgot the password?
              </button>
            </div>

            <button
              onClick={submit}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default JobslyLogin;