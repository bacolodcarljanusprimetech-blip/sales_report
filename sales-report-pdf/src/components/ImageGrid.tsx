import React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { ImageCard } from './ImageCard'
import type { ReportImage, CollageLayout } from '../features/images/imageTypes'
import { Images, LayoutGrid } from 'lucide-react'

interface ImageGridProps {
  images: ReportImage[]
  collageLayout: CollageLayout
  onLayoutChange: (layout: CollageLayout) => void
  onReorder: (images: ReportImage[]) => void
  onRotate: (id: string) => void
  onScaleChange: (id: string, scale: number) => void
  onReset: (id: string) => void
  onDelete: (id: string) => void
  onPreview: (image: ReportImage) => void
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  collageLayout,
  onLayoutChange,
  onReorder,
  onRotate,
  onScaleChange,
  onReset,
  onDelete,
  onPreview,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((item) => item.id === active.id)
      const newIndex = images.findIndex((item) => item.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(arrayMove(images, oldIndex, newIndex))
      }
    }
  }

  if (images.length === 0) {
    return null
  }

  const estimatedPages = Math.ceil(images.length / collageLayout)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Top Header & Layout Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Images className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Report Photographs ({images.length})
            </h2>
            <p className="text-xs text-slate-400">
              Drag cards to reorder sequence for PDF export
            </p>
          </div>
        </div>

        {/* Collage Layout Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1 rounded-xl">
          <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-600">
            <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Page Layout:</span>
          </div>

          {([1, 2, 3, 4] as const).map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => onLayoutChange(count)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                collageLayout === count
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
              title={`${count} picture${count > 1 ? 's' : ''} per PDF page`}
            >
              {count} {count === 1 ? 'per page' : 'per page'}
            </button>
          ))}
        </div>
      </div>

      {/* Helper message showing collage summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Layout: <strong>{collageLayout} picture{collageLayout > 1 ? 's' : ''} per page</strong>
        </span>
        <span>
          Will generate <strong>{estimatedPages} image page{estimatedPages > 1 ? 's' : ''}</strong>
        </span>
      </div>

      {/* Sortable Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <ImageCard
                key={image.id}
                image={image}
                index={index}
                onRotate={onRotate}
                onScaleChange={onScaleChange}
                onReset={onReset}
                onDelete={onDelete}
                onPreview={onPreview}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
