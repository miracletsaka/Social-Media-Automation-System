"use client"

import type React from "react"

import { Folder, FolderOpen, Move, Plus } from "lucide-react"

interface FolderModuleProps {
  folder: any
  isOpen: boolean
  isSelected: boolean
  position: { x: number; y: number }
  onDragStart: (e: React.DragEvent) => void
  onClick: () => void
}

export function FolderModule({ folder, isOpen, isSelected, position, onDragStart, onClick }: FolderModuleProps) {
  const Icon = folder.icon

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
        className={`w-52 bg-white/80 backdrop-blur-md rounded-[2rem] border shadow-2xl transition-all duration-500 ${
          isSelected ? "border-black shadow-black/10 ring-8 ring-black/5" : "border-gray-100 shadow-black/[0.02]"
        }`}
      >
        <div className={`p-5 bg-gradient-to-br ${folder.color} rounded-[1.8rem] m-1 shadow-lg`}>
          <div className="flex items-center justify-between text-white mb-2">
            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
              <Icon className="w-3.5 h-3.5" />
            </div>
            {isOpen ? <FolderOpen className="w-3 h-3 opacity-50" /> : <Folder className="w-3 h-3 opacity-50" />}
          </div>
          <h3 className="font-black text-white text-[10px] uppercase tracking-widest truncate">{folder.name}</h3>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[8px] font-bold text-white/60 uppercase tracking-tighter">System Module</span>
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[8px] font-black text-white">
              {folder.items.length}
            </span>
          </div>
        </div>

        {isOpen && (
          <div className="p-3 space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
            {folder.items.map((item: string, idx: number) => (
              <div
                key={idx}
                className="px-3 py-2 bg-gray-50/50 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 rounded-xl text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center justify-between group transition-all"
              >
                <span className="truncate">{item}</span>
                <Plus className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0" />
              </div>
            ))}
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
