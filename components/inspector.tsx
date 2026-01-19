"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Undo, Redo, Save, AlertCircle, ChevronLeft } from "lucide-react"
import { FolderModule } from "./folder-module"
import { Inspector } from "./inspector"
import { MODULE_CONFIGS } from "@/lib/constants"

export default function StaffWorkspacePage() {
  const [staffId, setStaffId] = useState<string | null>(null)
  const [staffData, setStaffData] = useState<any>(null)
  const [selectedFolder, setSelectedFolder] = useState<any>(null)
  const [openFolders, setOpenFolders] = useState(new Set<string>())
  const [history, setHistory] = useState<any[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draggedFolder, setDraggedFolder] = useState<any>(null)

  const [folderPositions, setFolderPositions] = useState<Record<string, { x: number; y: number }>>({
    roles: { x: 80, y: 80 },
    departments: { x: 340, y: 80 },
    subjects: { x: 600, y: 80 },
    classes: { x: 80, y: 300 },
    salary: { x: 340, y: 300 },
    transfers: { x: 600, y: 300 },
  })

  useEffect(() => {
    const id =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("id") || "demo-staff-1"
        : "demo-staff-1"
    setStaffId(id)
    loadStaffData(id)
  }, [])

  const loadStaffData = async (id: string) => {
    const mockData = {
      id,
      user: {
        firstName: "Alexandra",
        middleName: "Marie",
        lastName: "Deff",
        email: "alexandra.deff@school.edu",
        employeeNumber: "EMP-2024-001",
        avatar: "👩‍🏫",
        isActive: true,
      },
      roles: [
        { id: "role-1", name: "Department Head", permissions: 15 },
        { id: "role-2", name: "Senior Instructor", permissions: 7 },
      ],
      departments: [
        { id: "dept-1", name: "Computer Science", isHead: true },
        { id: "dept-2", name: "Information Technology", isHead: false },
      ],
      subjects: [
        { id: "sub-1", name: "Data Structures" },
        { id: "sub-2", name: "Algorithms" },
      ],
      classes: [
        { id: "class-1", code: "CS 101", section: "A", capacity: 30, enrolled: 28 },
        { id: "class-2", code: "CS 201", section: "B", capacity: 25, enrolled: 20 },
      ],
      salary: {
        baseSalary: 75000,
        departmentBonus: 10000,
        roleBonus: 5000,
        total: 90000,
      },
      transfers: [
        {
          id: "trans-1",
          fromDepartment: "Mathematics",
          toDepartment: "Computer Science",
          date: "2024-01-15",
          status: "completed",
        },
      ],
    }

    setStaffData(mockData)
    saveToHistory(mockData)
  }

  const saveToHistory = useCallback(
    (data: any) => {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(JSON.parse(JSON.stringify(data)))
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    },
    [history, historyIndex],
  )

  const updateStaffData = (newData: any) => {
    setStaffData(newData)
    saveToHistory(newData)
    setHasChanges(true)
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevData = JSON.parse(JSON.stringify(history[historyIndex - 1]))
      setStaffData(prevData)
      setHistoryIndex(historyIndex - 1)
      setHasChanges(true)
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextData = JSON.parse(JSON.stringify(history[historyIndex + 1]))
      setStaffData(nextData)
      setHistoryIndex(historyIndex + 1)
      setHasChanges(true)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulated save
    setHasChanges(false)
    setSaving(false)
  }

  const handleFolderClick = (folder: any) => {
    setSelectedFolder(folder)
    setOpenFolders((prev) => {
      const next = new Set(prev)
      if (next.has(folder.id)) next.delete(folder.id)
      else next.add(folder.id)
      return next
    })
  }

  const handleDragStart = (e: React.DragEvent, folder: any) => {
    setDraggedFolder(folder)
    e.dataTransfer.effectAllowed = "move"
    const img = new Image()
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs="
    e.dataTransfer.setDragImage(img, 0, 0)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedFolder) return

    const canvas = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - canvas.left - 100
    const y = e.clientY - canvas.top - 40

    setFolderPositions((prev) => ({
      ...prev,
      [draggedFolder.id]: { x, y },
    }))
    setDraggedFolder(null)
  }

  if (!staffData) return null

  return (
    <div className="h-screen bg-[#FDFCF9] flex overflow-hidden font-sans text-gray-900 selection:bg-black selection:text-white">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6">
            <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors group">
              <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
            </button>
            <div className="flex items-center gap-4 border-l border-gray-100 pl-6">
              <div className="text-3xl bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center border border-gray-100 shadow-inner">
                {staffData.user.avatar}
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  {staffData.user.firstName} {staffData.user.lastName}
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {staffData.user.employeeNumber} • System Management
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-30"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-30"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>

            {hasChanges && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full border border-amber-100 text-[10px] font-bold uppercase tracking-widest">
                <AlertCircle className="w-3 h-3" />
                Unsaved Edits
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="px-6 py-2.5 bg-black text-white rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-black/10 disabled:opacity-30"
            >
              {saving ? (
                <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4"></span>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Syncing..." : "Save Changes"}
            </button>
          </div>
        </header>

        <main className="flex-1 relative bg-[#FDFCF9]" onDragOver={handleDragOver} onDrop={handleDrop}>
          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none transition-opacity duration-1000"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>

          <div className="absolute top-8 right-8 flex flex-col gap-4 items-end z-10">
            <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-gray-100 shadow-xl min-w-[220px]">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Compensation</p>
              <h3 className="text-2xl font-black tracking-tight text-black">
                ${staffData.salary.total.toLocaleString()}
              </h3>
              <div className="mt-3 flex gap-1.5">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-md uppercase">
                  Calculated
                </span>
                <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[9px] font-black rounded-md uppercase tracking-tighter">
                  Gross Annual
                </span>
              </div>
            </div>
          </div>

          {MODULE_CONFIGS.map((folder) => {
            let items: string[] = []

            if (folder.id === "salary") {
              items = [`$${staffData.salary.total.toLocaleString()}`]
            } else if (folder.id === "roles") {
              items = staffData.roles.map((r: any) => r.name)
            } else if (folder.id === "subjects") {
              items = staffData.subjects.map((s: any) => s.name)
            } else if (folder.id === "departments") {
              items = staffData.departments.map((d: any) => d.name)
            } else if (folder.id === "classes") {
              items = staffData.classes.map((c: any) => `${c.code} ${c.section}`)
            } else if (folder.id === "transfers") {
              items = staffData.transfers.map((t: any) => t.status)
            }

            return (
              <FolderModule
                key={folder.id}
                folder={{ ...folder, items }}
                isOpen={openFolders.has(folder.id)}
                isSelected={selectedFolder?.id === folder.id}
                position={folderPositions[folder.id]}
                onDragStart={(e) => handleDragStart(e, folder)}
                onClick={() => handleFolderClick(folder)}
              />
            )
          })}
        </main>
      </div>

      {selectedFolder && (
        <Inspector
          folder={selectedFolder}
          staff={staffData}
          onClose={() => setSelectedFolder(null)}
          onUpdate={updateStaffData}
        />
      )}
    </div>
  )
}
