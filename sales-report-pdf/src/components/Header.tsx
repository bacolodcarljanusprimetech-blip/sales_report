import React from 'react'
import { FileText, PlusCircle, Download, FileCheck } from 'lucide-react'

interface HeaderProps {
  onNewReport: () => void
  onGeneratePdf: () => void
  onPreviewPdf: () => void
  hasImages: boolean
  isGenerating: boolean
}

export const Header: React.FC<HeaderProps> = ({
  onNewReport,
  onGeneratePdf,
  onPreviewPdf,
  hasImages,
  isGenerating,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-[56px] sm:min-h-[64px] flex items-center justify-between gap-2 sm:gap-3 py-2 sm:py-0">
        {/* Logo & App Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 leading-tight truncate">
              SALES PHOTO COLLAGE PDF
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 truncate">
              Professional client-side report generator
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onNewReport}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus:outline-hidden focus:ring-2 focus:ring-slate-400"
            title="Start a new report"
          >
            <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 shrink-0" />
            <span className="hidden md:inline">New Report</span>
            <span className="md:hidden">New</span>
          </button>

          <button
            type="button"
            onClick={onPreviewPdf}
            disabled={!hasImages || isGenerating}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            title="Preview PDF"
          >
            <FileCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 shrink-0" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          <button
            type="button"
            onClick={onGeneratePdf}
            disabled={!hasImages || isGenerating}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            title="Generate and Download PDF"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Generate PDF'}</span>
            <span className="sm:hidden">{isGenerating ? '...' : 'PDF'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
