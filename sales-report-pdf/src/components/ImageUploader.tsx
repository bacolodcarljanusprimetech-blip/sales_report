import React, { useRef, useState, useCallback, useEffect } from 'react'
import { UploadCloud, Image as ImageIcon } from 'lucide-react'
import { isValidImageType, getImageDimensions } from '../features/images/imageUtils'
import { compressImageIfNeeded } from '../features/images/imageCompression'
import { generateId } from '../lib/utils'
import type { ReportImage } from '../features/images/imageTypes'

interface ImageUploaderProps {
  onImagesAdded: (newImages: ReportImage[]) => void
  onError: (errorMessage: string) => void
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesAdded,
  onError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressStatus, setProgressStatus] = useState<string | null>(null)

  // Ensure window-level dragover sets dropEffect='copy' so Windows never displays
  // the forbidden 'not allowed' red circle with slash cursor
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault()
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy'
      }
    }

    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault()
    }

    window.addEventListener('dragenter', handleGlobalDragOver)
    window.addEventListener('dragover', handleGlobalDragOver)
    window.addEventListener('drop', handleGlobalDrop)

    return () => {
      window.removeEventListener('dragenter', handleGlobalDragOver)
      window.removeEventListener('dragover', handleGlobalDragOver)
      window.removeEventListener('drop', handleGlobalDrop)
    }
  }, [])

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList)
      if (files.length === 0) return

      setIsProcessing(true)
      const validImages: ReportImage[] = []
      const rejectedFiles: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setProgressStatus(`Processing ${file.name} (${i + 1}/${files.length})...`)

        if (!isValidImageType(file)) {
          rejectedFiles.push(file.name)
          continue
        }

        try {
          // Compress if oversized while maintaining timestamp readability
          const optimizedFile = await compressImageIfNeeded(file)
          const { width, height, previewUrl } = await getImageDimensions(optimizedFile)

          validImages.push({
            id: generateId(),
            file: optimizedFile,
            previewUrl,
            rotation: 0,
            scale: 1,
            positionX: 0,
            positionY: 0,
            width,
            height,
            name: file.name,
            size: optimizedFile.size,
          })
        } catch (err) {
          console.error(`Error processing ${file.name}:`, err)
          rejectedFiles.push(`${file.name} (corrupt or unreadable)`)
        }
      }

      setIsProcessing(false)
      setProgressStatus(null)

      if (rejectedFiles.length > 0) {
        onError(
          `Some files could not be added: ${rejectedFiles.join(', ')}. Supported formats: JPG, PNG, WEBP.`
        )
      }

      if (validImages.length > 0) {
        onImagesAdded(validImages)
      }
    },
    [onImagesAdded, onError]
  )

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
    setIsDragging(true)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
    if (!isDragging) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only reset if moving outside the dropzone element
    if (e.currentTarget && !e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files: File[] = []

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        files.push(e.dataTransfer.files[i])
      }
    } else if (e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        const item = e.dataTransfer.items[i]
        if (item.kind === 'file') {
          const file = item.getAsFile()
          if (file) files.push(file)
        }
      }
    }

    // Support dragging image from another tab or web page
    if (files.length === 0 && e.dataTransfer) {
      const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('URL')
      if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:'))) {
        try {
          const res = await fetch(url)
          const blob = await res.blob()
          if (blob.type.startsWith('image/')) {
            const ext = blob.type.split('/')[1] || 'jpg'
            files.push(new File([blob], `image_${Date.now()}.${ext}`, { type: blob.type }))
          }
        } catch {
          // ignore external fetch failures
        }
      }
    }

    if (files.length > 0) {
      processFiles(files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
      e.target.value = ''
    }
  }

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center p-6 sm:p-10 border-2 border-dashed rounded-xl transition-all duration-150 select-none ${
          isDragging
            ? 'border-blue-500 bg-blue-50/90 scale-[1.01] shadow-lg ring-4 ring-blue-500/20'
            : 'border-slate-300 bg-white hover:bg-slate-50/80 hover:border-slate-400'
        } ${isProcessing ? 'pointer-events-none opacity-75' : 'cursor-pointer'}`}
      >
        {/*
          The invisible <input type="file"> physically covers the entire box.
          Browsers natively recognize <input type="file"> as a valid drop target
          for files dragged from Windows Explorer, preventing the red circle/slash cursor.
        */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={isProcessing}
          aria-label="Upload report pictures"
        />

        {/* Visual UI Content (pointer-events-none ensures drag events hit the dropzone/input) */}
        <div className="pointer-events-none flex flex-col items-center justify-center text-center">
          <div
            className={`w-14 h-14 mb-3 rounded-full flex items-center justify-center transition-transform duration-150 ${
              isDragging ? 'bg-blue-600 text-white scale-110' : 'bg-blue-50 text-blue-600'
            }`}
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <p className="text-sm sm:text-base font-semibold text-slate-800">
            {isProcessing
              ? progressStatus || 'Adding pictures...'
              : isDragging
              ? 'Drop pictures to upload!'
              : 'Drag & drop pictures here'}
          </p>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            or <span className="text-blue-600 font-medium underline">browse files</span> from your computer
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" />
              JPG, PNG, WEBP
            </span>
            <span>•</span>
            <span>Multiple pictures supported</span>
            <span>•</span>
            <span>Timestamps preserved</span>
          </div>
        </div>
      </div>
    </div>
  )
}

