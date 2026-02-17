// ✅ Font options for PropertyInspector
// These are web-safe fonts that work in canvas without loading

export const FONT_OPTIONS = [
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Arial Black", value: "'Arial Black', sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Tahoma", value: "Tahoma, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { label: "Impact", value: "Impact, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Comic Sans MS", value: "'Comic Sans MS', cursive" },
];

// ✅ Default font
export const DEFAULT_FONT = FONT_OPTIONS[0].value;