import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  RotateCw,
  Trash2,
  GripVertical,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react'
import type { ReportImage } from '../features/images/imageTypes'
import { formatFileSize } from '../lib/utils'

interface ImageCardProps {
  image: ReportImage
  index: number
  onRotate: (id: string) => void
  onScaleChange: (id: string, newScale: number) => void
  onReset: (id: string) => void
  onDelete: (id: string) => void
  onPreview: (image: ReportImage) => void
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  index,
  onRotate,
  onScaleChange,
  onReset,
  onDelete,
  onPreview,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.4 : 1,
  }

  // Calculate rotated aspect info for badge
  const normalizedRot = ((image.rotation % 360) + 360) % 360
  const isLandscape =
    normalizedRot === 90 || normalizedRot === 270
      ? image.height > image.width
      : image.width > image.height

  const currentScale = image.scale || 1
  const isModified = image.rotation !== 0 || Math.abs(currentScale - 1) > 0.01

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    onScaleChange(image.id, Math.min(2.5, +(currentScale + 0.1).toFixed(2)))
  }

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    onScaleChange(image.id, Math.max(0.6, +(currentScale - 0.1).toFixed(2)))
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white border rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-150 flex flex-col ${
        isDragging ? 'border-blue-500 ring-2 ring-blue-400/50' : 'border-slate-200'
      }`}
    >
      {/* Top Bar with Sequence Number, Name, and Drag Handle */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-semibold">
            {index + 1}
          </span>
          <span className="font-medium truncate max-w-[110px] sm:max-w-[140px]" title={image.name}>
            {image.name}
          </span>
        </div>

        {/* Drag Handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          title="Drag to reorder"
          aria-label={`Drag to reorder image ${index + 1}`}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Image Thumbnail Container (with overflow hidden to simulate cell clip) */}
      <div className="relative aspect-4/3 w-full bg-slate-900/5 flex items-center justify-center overflow-hidden p-2">
        <img
          src={image.previewUrl}
          alt={image.name}
          style={{
            transform: `rotate(${image.rotation}deg) scale(${currentScale})`,
          }}
          className="max-h-full max-w-full object-contain rounded-sm transition-transform duration-150 select-none pointer-events-none"
        />

        {/* Quick View Overlay Button */}
        <button
          type="button"
          onClick={() => onPreview(image)}
          className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="View full image and adjust"
          aria-label="View full image"
        >
          <span className="p-2 rounded-full bg-white/90 text-slate-700 shadow-sm hover:scale-110 transition-transform">
            <Maximize2 className="w-4 h-4" />
          </span>
        </button>

        {/* Badges showing orientation, rotation, and zoom */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white backdrop-blur-xs">
            {isLandscape ? 'Landscape' : 'Portrait'}
          </span>
          {image.rotation !== 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-600/80 text-white backdrop-blur-xs">
              {image.rotation}°
            </span>
          )}
          {Math.abs(currentScale - 1) > 0.01 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-600/80 text-white backdrop-blur-xs">
              {Math.round(currentScale * 100)}%
            </span>
          )}
        </div>
      </div>

      {/* Per-Image Controls Bar (Scale + Rotate + Reset) */}
      <div className="px-3 py-1.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
        {/* Zoom / Scale Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={currentScale <= 0.6}
            className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30 transition-colors"
            title="Reduce scale (-10%)"
            aria-label="Reduce scale"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono font-medium text-slate-600 min-w-[34px] text-center">
            {Math.round(currentScale * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={currentScale >= 2.5}
            className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30 transition-colors"
            title="Enlarge scale (+10%)"
            aria-label="Enlarge scale"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Rotate + Reset */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onRotate(image.id)}
            className="p-1 rounded text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Rotate 90° clockwise"
            aria-label={`Rotate image ${index + 1}`}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {isModified && (
            <button
              type="button"
              onClick={() => onReset(image.id)}
              className="p-1 rounded text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              title="Reset rotation and scale"
              aria-label="Reset adjustments"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Card Footer with File Size and Delete */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white border-t border-slate-100 text-xs text-slate-500">
        <span>{formatFileSize(image.size)}</span>
        <button
          type="button"
          onClick={() => onDelete(image.id)}
          className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Delete picture"
          aria-label={`Delete image ${index + 1}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
