import React from 'react'
import type { ReportImage } from '../features/images/imageTypes'
import { X, RotateCw, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { formatFileSize } from '../lib/utils'

interface ImageDetailModalProps {
  image: ReportImage | null
  onClose: () => void
  onRotate: (id: string) => void
  onScaleChange: (id: string, scale: number) => void
  onReset: (id: string) => void
}

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  image,
  onClose,
  onRotate,
  onScaleChange,
  onReset,
}) => {
  if (!image) return null

  const currentScale = image.scale || 1
  const isModified = image.rotation !== 0 || Math.abs(currentScale - 1) > 0.01

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-white shadow-2xl">
        {/* Top Header */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold truncate max-w-md">{image.name}</h3>
            <p className="text-xs text-slate-400">
              {image.width} × {image.height} px • {formatFileSize(image.size)} • Rotation: {image.rotation}° • Scale: {Math.round(currentScale * 100)}%
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Close viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Preview Area */}
        <div className="flex-1 overflow-hidden p-6 flex items-center justify-center bg-slate-950 relative">
          <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-lg border border-slate-800/80 bg-slate-900/40">
            <img
              src={image.previewUrl}
              alt={image.name}
              style={{
                transform: `rotate(${image.rotation}deg) scale(${currentScale})`,
              }}
              className="max-h-[65vh] max-w-full object-contain rounded-sm shadow-xl transition-transform duration-150"
            />
          </div>
        </div>

        {/* Bottom Toolbar with Zoom, Rotate, Reset */}
        <div className="px-5 py-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          {/* Zoom Slider & Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onScaleChange(image.id, Math.max(0.6, +(currentScale - 0.1).toFixed(2)))}
              disabled={currentScale <= 0.6}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <input
              type="range"
              min="0.6"
              max="2.5"
              step="0.05"
              value={currentScale}
              onChange={(e) => onScaleChange(image.id, parseFloat(e.target.value))}
              className="w-32 accent-blue-500 cursor-pointer"
            />

            <button
              type="button"
              onClick={() => onScaleChange(image.id, Math.min(2.5, +(currentScale + 0.1).toFixed(2)))}
              disabled={currentScale >= 2.5}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono text-slate-300 min-w-[40px]">
              {Math.round(currentScale * 100)}%
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onRotate(image.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 hover:text-white transition-colors"
              title="Rotate 90° clockwise"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate</span>
            </button>

            {isModified && (
              <button
                type="button"
                onClick={() => onReset(image.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/60 hover:bg-amber-900/60 text-xs font-medium text-amber-300 transition-colors"
                title="Reset all adjustments"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
