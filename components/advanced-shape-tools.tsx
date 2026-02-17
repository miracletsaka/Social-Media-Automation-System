"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Columns,
  Rows,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdvancedShapeToolsProps {
  selectedShapeIds: string[];
  onDuplicate: () => void;
  onDelete: () => void;
  onAlign: (alignment: "left" | "center-h" | "right" | "top" | "center-v" | "bottom") => void;
  onDistribute: (direction: "horizontal" | "vertical") => void;
  onReorder: (action: "front" | "forward" | "backward" | "back") => void;
}

export default function AdvancedShapeTools({
  selectedShapeIds,
  onDuplicate,
  onDelete,
  onAlign,
  onDistribute,
  onReorder,
}: AdvancedShapeToolsProps) {
  const count = selectedShapeIds.length;
  const isSingle = count === 1;
  const isMultiple = count >= 2;
  const canDistribute = count >= 3;

  if (count === 0) return null;

  return (
    <Card className="p-3 border-border">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-foreground">
            {count} Selected
          </h3>
          <div className="flex gap-1">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDuplicate}
                    className="h-7 w-7 p-0"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Duplicate (Ctrl+D)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Delete (Del)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Alignment Tools */}
        {isMultiple && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Align
              </div>
              <div className="grid grid-cols-6 gap-1">
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAlign("left")}
                        className="h-7 w-full p-0"
                      >
                        <AlignLeft className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Align Left</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAlign("center-h")}
                        className="h-7 w-full p-0"
                      >
                        <AlignCenter className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Align Center (H)</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAlign("right")}
                        className="h-7 w-full p-0"
                      >
                        <AlignRight className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Align Right</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAlign("top")}
                        className="h-7 w-full p-0"
                      >
                        <AlignVerticalJustifyStart className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Align Top</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAlign("center-v")}
                        className="h-7 w-full p-0"
                      >
                        <AlignHorizontalJustifyCenter className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Align Center (V)</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAlign("bottom")}
                        className="h-7 w-full p-0"
                      >
                        <AlignVerticalJustifyEnd className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Align Bottom</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </>
        )}

        {/* Distribution Tools */}
        {canDistribute && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Distribute
              </div>
              <div className="grid grid-cols-2 gap-2">
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDistribute("horizontal")}
                        className="h-7 text-xs"
                      >
                        <Columns className="h-3.5 w-3.5 mr-1.5" />
                        Horizontal
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Distribute Horizontally</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDistribute("vertical")}
                        className="h-7 text-xs"
                      >
                        <Rows className="h-3.5 w-3.5 mr-1.5" />
                        Vertical
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Distribute Vertically</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </>
        )}

        {/* Layer Order Tools */}
        {isSingle && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Layer Order
              </div>
              <div className="grid grid-cols-4 gap-1">
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReorder("front")}
                        className="h-7 w-full p-0"
                      >
                        <ChevronsUp className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Bring to Front</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReorder("forward")}
                        className="h-7 w-full p-0"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Bring Forward</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReorder("backward")}
                        className="h-7 w-full p-0"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Send Backward</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReorder("back")}
                        className="h-7 w-full p-0"
                      >
                        <ChevronsDown className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Send to Back</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}