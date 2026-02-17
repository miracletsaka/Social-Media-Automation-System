"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface GeneratedImage {
  url: string;
  prompt: string;
  generatedAt: string;
}

interface BackgroundGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generatedImages: GeneratedImage[];
  selectedImageUrls: string[];
  onSelectImage: (url: string) => void;
  onSave: () => void;
  onRegenerate: () => void;
  isLoading?: boolean;
  isSaving?: boolean;
  error?: string | null;
}

export function BackgroundGenerationDialog({
  open,
  onOpenChange,
  generatedImages,
  selectedImageUrls,
  onSelectImage,
  onSave,
  onRegenerate,
  isLoading = false,
  isSaving = false,
  error = null,
}: BackgroundGenerationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Generate Backgrounds</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mb-3"></div>
              <p className="text-sm text-muted-foreground">Generating 3 backgrounds...</p>
            </div>
          </div>
        ) : generatedImages.length > 0 ? (
          <>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Select images to save. Click on any image to select/deselect it.
              </p>

              {/* Generated Images Grid */}
              <div className="grid grid-cols-3 gap-4">
                {generatedImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="space-y-2 cursor-pointer"
                    onClick={() => onSelectImage(img.url)}
                  >
                    <Card
                      className={`relative overflow-hidden border-2 transition ${
                        selectedImageUrls.includes(img.url)
                          ? "border-primary ring-2 ring-primary/50"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`Generated ${idx + 1}`}
                        className="w-full aspect-square object-cover"
                      />

                      {selectedImageUrls.includes(img.url) && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <CheckCircle2 className="w-12 h-12 text-white drop-shadow" />
                        </div>
                      )}
                    </Card>

                    {/* Prompt text */}
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {img.prompt}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="flex gap-2 justify-between">
              <Button
                variant="outline"
                onClick={onRegenerate}
                disabled={isSaving}
              >
                Regenerate
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={onSave}
                  disabled={selectedImageUrls.length === 0 || isSaving}
                >
                  {isSaving ? "Saving..." : `Save Selected (${selectedImageUrls.length})`}
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No images generated yet. Click the Generate button to start.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}