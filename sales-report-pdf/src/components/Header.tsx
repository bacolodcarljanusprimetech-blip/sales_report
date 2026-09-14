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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              Sales Report PDF Creator
            </h1>
            <p className="text-xs text-slate-500">
              Professional client-side report generator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onNewReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus:outline-hidden focus:ring-2 focus:ring-slate-400"
            title="Start a new report"
          >
            <PlusCircle className="w-4 h-4 text-slate-600" />
            <span>New Report</span>
          </button>

          <button
            type="button"
            onClick={onPreviewPdf}
            disabled={!hasImages || isGenerating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            title="Preview PDF"
          >
            <FileCheck className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Preview PDF</span>
          </button>

          <button
            type="button"
            onClick={onGeneratePdf}
            disabled={!hasImages || isGenerating}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            title="Generate and Download PDF"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'Generate PDF'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}

