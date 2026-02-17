import { TemplateShape } from "./types";

export interface SnapGuide {
  type: "vertical" | "horizontal" | "center-v" | "center-h";
  position: number;
  label?: string;
}

export interface AlignmentResult {
  snapX?: number;
  snapY?: number;
  guides: SnapGuide[];
}

const SNAP_THRESHOLD = 8; // pixels

/**
 * Calculate alignment guides and snap positions when dragging a shape
 */
export function calculateSnapGuides(
  draggedShape: TemplateShape,
  allShapes: TemplateShape[],
  canvasWidth: number,
  canvasHeight: number,
  enableSnap: boolean = true
): AlignmentResult {
  if (!enableSnap) return { guides: [] };

  const guides: SnapGuide[] = [];
  let snapX: number | undefined;
  let snapY: number | undefined;

  // Current shape bounds
  const dragLeft = draggedShape.x;
  const dragRight = draggedShape.x + draggedShape.width;
  const dragCenterX = draggedShape.x + draggedShape.width / 2;
  const dragTop = draggedShape.y;
  const dragBottom = draggedShape.y + draggedShape.height;
  const dragCenterY = draggedShape.y + draggedShape.height / 2;

  // Canvas center lines
  const canvasCenterX = canvasWidth / 2;
  const canvasCenterY = canvasHeight / 2;

  // Check canvas center alignment
  if (Math.abs(dragCenterX - canvasCenterX) < SNAP_THRESHOLD) {
    snapX = canvasCenterX - draggedShape.width / 2;
    guides.push({
      type: "center-v",
      position: canvasCenterX,
      label: "Canvas Center",
    });
  }

  if (Math.abs(dragCenterY - canvasCenterY) < SNAP_THRESHOLD) {
    snapY = canvasCenterY - draggedShape.height / 2;
    guides.push({
      type: "center-h",
      position: canvasCenterY,
      label: "Canvas Center",
    });
  }

  // Check alignment with other shapes
  const otherShapes = allShapes.filter((s) => s.id !== draggedShape.id);

  for (const shape of otherShapes) {
    const left = shape.x;
    const right = shape.x + shape.width;
    const centerX = shape.x + shape.width / 2;
    const top = shape.y;
    const bottom = shape.y + shape.height;
    const centerY = shape.y + shape.height / 2;

    // Vertical alignment checks
    // Left edges align
    if (Math.abs(dragLeft - left) < SNAP_THRESHOLD) {
      snapX = left;
      if (!guides.some((g) => g.type === "vertical" && g.position === left)) {
        guides.push({ type: "vertical", position: left, label: "Left Edge" });
      }
    }
    // Right edges align
    else if (Math.abs(dragRight - right) < SNAP_THRESHOLD) {
      snapX = right - draggedShape.width;
      if (!guides.some((g) => g.type === "vertical" && g.position === right)) {
        guides.push({ type: "vertical", position: right, label: "Right Edge" });
      }
    }
    // Center X align
    else if (Math.abs(dragCenterX - centerX) < SNAP_THRESHOLD) {
      snapX = centerX - draggedShape.width / 2;
      if (!guides.some((g) => g.type === "center-v" && g.position === centerX)) {
        guides.push({ type: "center-v", position: centerX, label: "Center" });
      }
    }
    // Left to right align
    else if (Math.abs(dragLeft - right) < SNAP_THRESHOLD) {
      snapX = right;
      if (!guides.some((g) => g.type === "vertical" && g.position === right)) {
        guides.push({ type: "vertical", position: right });
      }
    }
    // Right to left align
    else if (Math.abs(dragRight - left) < SNAP_THRESHOLD) {
      snapX = left - draggedShape.width;
      if (!guides.some((g) => g.type === "vertical" && g.position === left)) {
        guides.push({ type: "vertical", position: left });
      }
    }

    // Horizontal alignment checks
    // Top edges align
    if (Math.abs(dragTop - top) < SNAP_THRESHOLD) {
      snapY = top;
      if (!guides.some((g) => g.type === "horizontal" && g.position === top)) {
        guides.push({ type: "horizontal", position: top, label: "Top Edge" });
      }
    }
    // Bottom edges align
    else if (Math.abs(dragBottom - bottom) < SNAP_THRESHOLD) {
      snapY = bottom - draggedShape.height;
      if (!guides.some((g) => g.type === "horizontal" && g.position === bottom)) {
        guides.push({ type: "horizontal", position: bottom, label: "Bottom Edge" });
      }
    }
    // Center Y align
    else if (Math.abs(dragCenterY - centerY) < SNAP_THRESHOLD) {
      snapY = centerY - draggedShape.height / 2;
      if (!guides.some((g) => g.type === "center-h" && g.position === centerY)) {
        guides.push({ type: "center-h", position: centerY, label: "Center" });
      }
    }
    // Top to bottom align
    else if (Math.abs(dragTop - bottom) < SNAP_THRESHOLD) {
      snapY = bottom;
      if (!guides.some((g) => g.type === "horizontal" && g.position === bottom)) {
        guides.push({ type: "horizontal", position: bottom });
      }
    }
    // Bottom to top align
    else if (Math.abs(dragBottom - top) < SNAP_THRESHOLD) {
      snapY = top - draggedShape.height;
      if (!guides.some((g) => g.type === "horizontal" && g.position === top)) {
        guides.push({ type: "horizontal", position: top });
      }
    }
  }

  return { snapX, snapY, guides };
}

/**
 * Align selected shapes
 */
export function alignShapes(
  shapes: TemplateShape[],
  selectedIds: string[],
  alignment: "left" | "center-h" | "right" | "top" | "center-v" | "bottom"
): TemplateShape[] {
  if (selectedIds.length < 2) return shapes;

  const selected = shapes.filter((s) => selectedIds.includes(s.id));

  // Find reference bounds
  let refValue: number;

  switch (alignment) {
    case "left":
      refValue = Math.min(...selected.map((s) => s.x));
      return shapes.map((s) =>
        selectedIds.includes(s.id) ? { ...s, x: refValue } : s
      );

    case "right":
      refValue = Math.max(...selected.map((s) => s.x + s.width));
      return shapes.map((s) =>
        selectedIds.includes(s.id)
          ? { ...s, x: refValue - s.width }
          : s
      );

    case "center-h":
      const minX = Math.min(...selected.map((s) => s.x));
      const maxX = Math.max(...selected.map((s) => s.x + s.width));
      refValue = minX + (maxX - minX) / 2;
      return shapes.map((s) =>
        selectedIds.includes(s.id)
          ? { ...s, x: refValue - s.width / 2 }
          : s
      );

    case "top":
      refValue = Math.min(...selected.map((s) => s.y));
      return shapes.map((s) =>
        selectedIds.includes(s.id) ? { ...s, y: refValue } : s
      );

    case "bottom":
      refValue = Math.max(...selected.map((s) => s.y + s.height));
      return shapes.map((s) =>
        selectedIds.includes(s.id)
          ? { ...s, y: refValue - s.height }
          : s
      );

    case "center-v":
      const minY = Math.min(...selected.map((s) => s.y));
      const maxY = Math.max(...selected.map((s) => s.y + s.height));
      refValue = minY + (maxY - minY) / 2;
      return shapes.map((s) =>
        selectedIds.includes(s.id)
          ? { ...s, y: refValue - s.height / 2 }
          : s
      );

    default:
      return shapes;
  }
}

/**
 * Distribute shapes evenly
 */
export function distributeShapes(
  shapes: TemplateShape[],
  selectedIds: string[],
  direction: "horizontal" | "vertical"
): TemplateShape[] {
  if (selectedIds.length < 3) return shapes;

  const selected = shapes
    .filter((s) => selectedIds.includes(s.id))
    .sort((a, b) => (direction === "horizontal" ? a.x - b.x : a.y - b.y));

  if (direction === "horizontal") {
    const first = selected[0];
    const last = selected[selected.length - 1];
    const totalSpace = last.x - (first.x + first.width);
    const gapSize = totalSpace / (selected.length - 1);

    let currentX = first.x + first.width;
    const distributed = selected.slice(1, -1).map((s) => {
      const newShape = { ...s, x: currentX + gapSize };
      currentX = newShape.x + newShape.width;
      return newShape;
    });

    return shapes.map((s) => {
      const dist = distributed.find((d) => d.id === s.id);
      return dist || s;
    });
  } else {
    const first = selected[0];
    const last = selected[selected.length - 1];
    const totalSpace = last.y - (first.y + first.height);
    const gapSize = totalSpace / (selected.length - 1);

    let currentY = first.y + first.height;
    const distributed = selected.slice(1, -1).map((s) => {
      const newShape = { ...s, y: currentY + gapSize };
      currentY = newShape.y + newShape.height;
      return newShape;
    });

    return shapes.map((s) => {
      const dist = distributed.find((d) => d.id === s.id);
      return dist || s;
    });
  }
}

/**
 * Change z-index of shapes
 */
export function reorderShape(
  shapes: TemplateShape[],
  shapeId: string,
  action: "front" | "forward" | "backward" | "back"
): TemplateShape[] {
  const maxZ = Math.max(...shapes.map((s) => s.zIndex || 1));
  const minZ = Math.min(...shapes.map((s) => s.zIndex || 1));

  return shapes.map((s) => {
    if (s.id !== shapeId) return s;

    const currentZ = s.zIndex || 1;

    switch (action) {
      case "front":
        return { ...s, zIndex: maxZ + 1 };
      case "forward":
        return { ...s, zIndex: Math.min(maxZ, currentZ + 1) };
      case "backward":
        return { ...s, zIndex: Math.max(minZ, currentZ - 1) };
      case "back":
        return { ...s, zIndex: minZ - 1 };
      default:
        return s;
    }
  });
}

/**
 * Snap to grid
 */
export function snapToGrid(
  x: number,
  y: number,
  gridSize: number = 20
): { x: number; y: number } {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  };
}