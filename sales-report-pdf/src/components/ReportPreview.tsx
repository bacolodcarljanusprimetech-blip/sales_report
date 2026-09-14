import React, { useState, useMemo } from 'react'
import type { ReportImage, ReportInfo } from '../features/images/imageTypes'
import type { PDFLayoutOptions } from '../features/pdf/pdfTypes'
import {
  calculateDocumentLayoutPlan,
  type PageLayoutResult,
  type ImagePlacement,
} from '../features/pdf/pdfLayout'
import {
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Download,
  Calendar,
  User,
  Building,
  MapPin,
} from 'lucide-react'

interface ReportPreviewProps {
  isOpen: boolean
  onClose: () => void
  reportInfo: ReportInfo
  images: ReportImage[]
  layoutOptions: PDFLayoutOptions
  pdfBlobUrl: string | null
  onGenerateAndDownload: () => void
  isGenerating: boolean
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  isOpen,
  onClose,
  reportInfo,
  images,
  layoutOptions,
  pdfBlobUrl,
  onGenerateAndDownload,
  isGenerating,
}) => {
  const [currentPage, setCurrentPage] = useState(1)

  // SINGLE SOURCE OF TRUTH: Shared canonical layout plan
  const plan = useMemo(() => {
    if (!isOpen || images.length === 0) return null
    return calculateDocumentLayoutPlan(reportInfo, images, layoutOptions)
  }, [isOpen, reportInfo, images, layoutOptions])

  const totalPages = plan?.totalPages ?? 0
  const activePage: PageLayoutResult | null =
    plan && plan.pages[Math.min(currentPage - 1, plan.pages.length - 1)]
      ? plan.pages[Math.min(currentPage - 1, plan.pages.length - 1)]
      : plan?.pages[0] ?? null

  // Image lookup map
  const imageMap = new Map(images.map((img) => [img.id, img]))

  // Scale factor: Convert millimeters to CSS pixels for an accurate A4 representation
  // In portrait: 210mm -> ~500px (scale ~2.38 px/mm)
  // In landscape: 297mm -> ~700px (scale ~2.38 px/mm)
  const pxPerMm = 2.4
  const sheetWidthPx = activePage ? activePage.pageWidth * pxPerMm : 0
  const sheetHeightPx = activePage ? activePage.pageHeight * pxPerMm : 0

  const previewScale = useMemo(() => {
    if (typeof window === 'undefined' || !activePage) return 1

    const maxWidth = Math.max(260, window.innerWidth - 32)
    const maxHeight = Math.max(260, window.innerHeight * 0.48)

    return Math.min(1, maxWidth / sheetWidthPx, maxHeight / sheetHeightPx)
  }, [activePage, sheetHeightPx, sheetWidthPx])

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1))
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1))

  if (!isOpen || !plan || !activePage) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-slate-100 rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-white px-3 py-3 border-b border-slate-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                PDF Report Preview (Geometry-Accurate)
              </h3>
              <p className="text-xs text-slate-500 break-words">
                Exact millimeter layout matching downloaded jsPDF output
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 sm:ml-1">
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-xs font-medium">
              <span className="px-2.5 py-1 rounded-md bg-white text-slate-800 shadow-xs">
                Native PDF
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onGenerateAndDownload}
                disabled={isGenerating}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors disabled:opacity-50 min-w-0"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{isGenerating ? 'Downloading...' : 'Download PDF'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-auto p-3 sm:p-6 flex items-center justify-center bg-slate-200/80">
          {pdfBlobUrl ? (
            <iframe
              src={pdfBlobUrl}
              title="PDF Preview"
              className="w-full h-full rounded-lg shadow-lg border border-slate-300 bg-white"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full overflow-auto">
              <div
                className="bg-white shadow-2xl rounded-xs relative overflow-hidden transition-all duration-150 select-none"
                style={{
                  width: `${sheetWidthPx}px`,
                  height: `${sheetHeightPx}px`,
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'center center',
                }}
              >
                <div
                  className="relative overflow-hidden"
                  style={{
                    width: `${sheetWidthPx}px`,
                    height: `${sheetHeightPx}px`,
                  }}
                >
              {activePage.isCoverPage ? (
                /* Cover Page Content */
                <div className="w-full h-full p-8 flex flex-col justify-between">
                  <div>
                    <div className="bg-slate-800 text-white -mx-8 -mt-8 p-8 mb-8">
                      <h2 className="text-xl font-bold">
                        {reportInfo.title || 'Sales Daily Picture Report'}
                      </h2>
                      <p className="text-xs text-slate-300 mt-1">Official Field Visit Documentation</p>
                    </div>

                    <div className="space-y-3 text-xs text-slate-700 mt-4">
                      {reportInfo.salesRep && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold w-32">Representative:</span>
                          <span>{reportInfo.salesRep}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold w-32">Report Date:</span>
                        <span>{reportInfo.date || new Date().toISOString().split('T')[0]}</span>
                      </div>
                      {reportInfo.customer && (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold w-32">Customer/Client:</span>
                          <span>{reportInfo.customer}</span>
                        </div>
                      )}
                      {reportInfo.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold w-32">Location:</span>
                          <span>{reportInfo.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold w-32">Layout:</span>
                        <span>{layoutOptions.collageLayout} picture{layoutOptions.collageLayout > 1 ? 's' : ''} per page</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold w-32">Total Photos:</span>
                        <span>{images.length} pictures attached</span>
                      </div>

                      {reportInfo.notes && (
                        <div className="mt-4 pt-3 border-t border-slate-200">
                          <span className="font-semibold block mb-1">Notes:</span>
                          <p className="text-slate-600 whitespace-pre-wrap">{reportInfo.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {activePage.footer && (
                    <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                      {activePage.footer.text}
                    </div>
                  )}
                </div>
              ) : (
                /* Canonical Geometric Image Page */
                <div className="w-full h-full relative overflow-hidden">
                  {/* Header rendered at exact mm coordinates */}
                  {activePage.header && (
                    <div
                      className="absolute border-b border-slate-200 pb-1"
                      style={{
                        left: `${activePage.header.x * pxPerMm}px`,
                        top: `${(activePage.header.y - 4) * pxPerMm}px`,
                        width: `${activePage.header.width * pxPerMm}px`,
                        height: `${activePage.header.height * pxPerMm}px`,
                      }}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-700">
                        <span className="font-bold truncate">{activePage.header.title}</span>
                        <span className="text-slate-500 font-normal truncate">
                          {activePage.header.metaRight}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Collage Cells & Placed Images at Exact Millimeter Coordinates */}
                  {activePage.cells.map((cell, idx) => {
                    const placement: ImagePlacement | undefined =
                      activePage.imagePlacements[idx]
                    const img = placement ? imageMap.get(placement.imageId) : undefined

                    return (
                      <div
                        key={cell.index}
                        className="absolute overflow-hidden rounded-xs bg-slate-50/40 border border-slate-200/80"
                        style={{
                          left: `${cell.x * pxPerMm}px`,
                          top: `${cell.y * pxPerMm}px`,
                          width: `${cell.width * pxPerMm}px`,
                          height: `${cell.height * pxPerMm}px`,
                        }}
                      >
                        {img && placement ? (
                          <img
                            src={img.previewUrl}
                            alt={img.name}
                            style={{
                              position: 'absolute',
                              left: `${(placement.x - cell.x) * pxPerMm}px`,
                              top: `${(placement.y - cell.y) * pxPerMm}px`,
                              width: `${placement.width * pxPerMm}px`,
                              height: `${placement.height * pxPerMm}px`,
                              transform: `rotate(${placement.rotation}deg)`,
                              transformOrigin: 'center center',
                            }}
                            className="object-fill pointer-events-none select-none max-w-none max-h-none"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px]">
                            Empty Cell
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Footer rendered at exact mm coordinates */}
                  {activePage.footer && (
                    <div
                      className="absolute text-center text-[9px] text-slate-400"
                      style={{
                        left: 0,
                        top: `${(activePage.footer.y - 3) * pxPerMm}px`,
                        width: `${activePage.pageWidth * pxPerMm}px`,
                      }}
                    >
                      {activePage.footer.text}
                    </div>
                  )}
                </div>
              )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Pagination Footer */}
        <div className="bg-white px-3 sm:px-5 py-3 border-t border-slate-200 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Page
          </button>

          <span className="text-xs font-medium text-slate-600 text-center">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next Page
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

