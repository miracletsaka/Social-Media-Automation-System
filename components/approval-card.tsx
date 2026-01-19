"use client"

import type React from "react"
import { Move, Check, X, AlertCircle } from "lucide-react"
import { useState } from "react"

interface ApprovalCardProps {
  folder: any
  isOpen: boolean
  isSelected: boolean
  position: { x: number; y: number }
  onDragStart: (e: React.DragEvent) => void
  onClick: () => void
}

export function ApprovalCard({ folder, isOpen, isSelected, position, onDragStart, onClick }: ApprovalCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{
        position: "absolute",
        left: position?.x,
        top: position?.y,
        zIndex: isSelected ? 20 : 10,
      }}
      className={`cursor-grab active:cursor-grabbing transition-all duration-500 ease-out ${
        isSelected ? "scale-105" : "hover:scale-[1.02]"
      }`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        className={`w-96 bg-white/80 backdrop-blur-md rounded-[2rem] border shadow-2xl transition-all duration-500 ${
          isSelected ? "border-black shadow-black/10 ring-8 ring-black/5" : "border-gray-100 shadow-black/[0.02]"
        }`}
      >
        {/* Header */}
        <div className={`p-5 bg-gradient-to-br ${folder.color} rounded-[1.8rem] m-1 shadow-lg`}>
          <div className="flex items-center justify-between text-white mb-3">
            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
              <AlertCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-white/70 uppercase tracking-tighter">{folder.status}</span>
          </div>
          <h3 className="font-black text-white text-sm line-clamp-2">{folder.title}</h3>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[8px] font-bold text-white/60 uppercase tracking-tighter">{folder.topic}</span>
            <span className={`bg-white/20 px-2 py-0.5 rounded text-[8px] font-black text-white`}>
              {folder.priority}
            </span>
          </div>
        </div>

        {/* Content Preview */}
        {isOpen && (
          <div className="p-4 space-y-3 max-h-48 overflow-y-auto">
            <div className="text-xs leading-relaxed text-gray-600 line-clamp-4">{folder.content}</div>
          </div>
        )}

        {/* Action Buttons */}
        {isOpen && (
          <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
            <button className="flex-1 px-3 py-1.5 bg-green-500 text-white text-[9px] font-bold rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-1">
              <Check className="w-3 h-3" />
              Approve
            </button>
            <button className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-[9px] font-bold rounded-lg hover:bg-gray-200 transition-colors">
              Changes
            </button>
            <button className="flex-1 px-3 py-1.5 bg-red-500 text-white text-[9px] font-bold rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-1">
              <X className="w-3 h-3" />
              Reject
            </button>
          </div>
        )}

        <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-gray-200"></div>
            ))}
          </div>
          <Move className="w-3 h-3 text-gray-200" />
        </div>
      </div>
    </div>
  )
}
