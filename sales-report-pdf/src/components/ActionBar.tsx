import React from 'react'
import { Trash2, Eye, Download, Settings, Shield } from 'lucide-react'

interface ActionBarProps {
  hasImages: boolean
  isGenerating: boolean
  generationStatus: string | null
  onClearAll: () => void
  onPreviewPdf: () => void
  onGeneratePdf: () => void
  onOpenSettings: () => void
  isSecurityEnabled: boolean
}

export const ActionBar: React.FC<ActionBarProps> = ({
  hasImages,
  isGenerating,
  generationStatus,
  onClearAll,
  onPreviewPdf,
  onGeneratePdf,
  onOpenSettings,
  isSecurityEnabled,
}) => {
  return (
    <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-3 sm:px-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Side: Secondary actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            type="button"
            onClick={onClearAll}
            disabled={!hasImages || isGenerating}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Remove all pictures and reset form"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors min-w-0"
            title="Layout & Security Settings"
          >
            <Settings className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="truncate">Layout</span>
            {isSecurityEnabled && (
              <Shield className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 shrink-0" />
            )}
          </button>
        </div>

        {/* Center: Generation status / progress info */}
        {isGenerating && (
          <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs text-blue-700 bg-blue-50 px-3 py-1 rounded-full animate-pulse max-w-full overflow-hidden">
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="truncate">{generationStatus || 'Generating high quality PDF...'}</span>
          </div>
        )}

        {/* Right Side: Preview & Generate actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onPreviewPdf}
            disabled={!hasImages || isGenerating}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Eye className="w-4 h-4 text-slate-600" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={onGeneratePdf}
            disabled={!hasImages || isGenerating}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'Generate PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

