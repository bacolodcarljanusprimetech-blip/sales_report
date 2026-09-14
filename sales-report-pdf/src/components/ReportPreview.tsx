import React, { useState } from 'react'
import type { ReportImage, ReportInfo } from '../features/images/imageTypes'
import type { PDFLayoutOptions } from '../features/pdf/pdfTypes'
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
  const [viewMode, setViewMode] = useState<'interactive' | 'pdf'>('interactive')

  if (!isOpen) return null

  const itemsPerPage = layoutOptions.collageLayout || 1
  const totalImagePages = Math.ceil(images.length / itemsPerPage)
  const totalPages = (layoutOptions.includeCoverPage ? 1 : 0) + totalImagePages

  const isCoverPage = layoutOptions.includeCoverPage && currentPage === 1
  const imagePageIdx = layoutOptions.includeCoverPage ? currentPage - 2 : currentPage - 1
  const pageStartIdx = imagePageIdx * itemsPerPage
  const pageImages = images.slice(pageStartIdx, pageStartIdx + itemsPerPage)

  const firstImg = pageImages[0]
  const rot = firstImg ? ((firstImg.rotation % 360) + 360) % 360 : 0
  const isRot90or270 = rot === 90 || rot === 270
  const effectiveW = firstImg ? (isRot90or270 ? firstImg.height : firstImg.width) : 1
  const effectiveH = firstImg ? (isRot90or270 ? firstImg.width : firstImg.height) : 1

  const isLandscape =
    itemsPerPage > 1
      ? layoutOptions.orientation === 'landscape'
      : layoutOptions.orientation === 'landscape'
      ? true
      : layoutOptions.orientation === 'portrait'
      ? false
      : effectiveW > effectiveH

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1))
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1))

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-slate-100 rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-white px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                PDF Report Preview
              </h3>
              <p className="text-xs text-slate-500">
                {itemsPerPage} picture{itemsPerPage > 1 ? 's' : ''} per page • Aspect ratio and timestamps preserved
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pdfBlobUrl && (
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-xs font-medium mr-2">
                <button
                  type="button"
                  onClick={() => setViewMode('interactive')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'interactive'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Layout View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('pdf')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'pdf'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Native PDF
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onGenerateAndDownload}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Downloading...' : 'Download PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-slate-200/80">
          {viewMode === 'pdf' && pdfBlobUrl ? (
            <iframe
              src={pdfBlobUrl}
              title="PDF Preview"
              className="w-full h-full rounded-lg shadow-lg border border-slate-300 bg-white"
            />
          ) : (
            /* Interactive Simulated A4 Sheet */
            <div
              className={`bg-white shadow-2xl rounded-sm transition-all duration-200 flex flex-col relative ${
                isCoverPage || !isLandscape
                  ? 'w-[420px] sm:w-[500px] h-[594px] sm:h-[707px]' // A4 Portrait ratio ~1:1.414
                  : 'w-[594px] sm:w-[707px] h-[420px] sm:h-[500px]' // A4 Landscape ratio ~1.414:1
              }`}
              style={{
                padding: `${layoutOptions.marginMm * 1.5}px`,
              }}
            >
              {isCoverPage ? (
                /* Cover Page Content */
                <div className="flex-1 flex flex-col justify-between border border-dashed border-slate-200 p-6">
                  <div>
                    <div className="bg-slate-800 text-white -mx-6 -mt-6 p-6 rounded-t-sm mb-6">
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
                        <span>{itemsPerPage} picture{itemsPerPage > 1 ? 's' : ''} per page</span>
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

                  {layoutOptions.includeFooter && (
                    <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                      Page 1 of {totalPages}
                    </div>
                  )}
                </div>
              ) : pageImages.length > 0 ? (
                /* Collage Page Content */
                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                  {/* Page Header */}
                  {layoutOptions.includeHeader && (
                    <div className="flex items-center justify-between pb-1 mb-2 border-b border-slate-200 text-[10px] text-slate-600">
                      <span className="font-semibold truncate">
                        {reportInfo.title || 'Sales Picture Report'}
                      </span>
                      <span className="text-slate-400 truncate">
                        {[reportInfo.salesRep, reportInfo.date || reportInfo.customer]
                          .filter(Boolean)
                          .join(' • ')}
                      </span>
                    </div>
                  )}

                  {/* Collage Grid Layout according to selected mode */}
                  <div
                    className={`flex-1 grid gap-2 overflow-hidden ${
                      itemsPerPage === 1
                        ? 'grid-cols-1 grid-rows-1'
                        : itemsPerPage === 2
                        ? 'grid-cols-1 grid-rows-2'
                        : itemsPerPage === 3
                        ? 'grid-cols-1 grid-rows-3'
                        : 'grid-cols-2 grid-rows-2'
                    }`}
                  >
                    {pageImages.map((img) => (
                      <div
                        key={img.id}
                        className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-50/50 rounded-xs border border-slate-100 p-1"
                      >
                        <img
                          src={img.previewUrl}
                          alt={img.name}
                          style={{
                            transform: `rotate(${img.rotation}deg) scale(${img.scale || 1})`,
                          }}
                          className="max-w-full max-h-full object-contain rounded-xs transition-transform duration-150"
                        />
                      </div>
                    ))}
                    {/* Empty placeholder cells for partial last page */}
                    {Array.from({ length: itemsPerPage - pageImages.length }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="w-full h-full rounded-xs border border-dashed border-slate-100/80 bg-slate-50/20"
                      />
                    ))}
                  </div>

                  {/* Page Footer */}
                  {layoutOptions.includeFooter && (
                    <div className="text-center text-[9px] text-slate-400 pt-1 mt-1 border-t border-slate-100">
                      {itemsPerPage === 1
                        ? `Photo ${pageStartIdx + 1} of ${images.length}`
                        : `Photos ${pageStartIdx + 1}–${Math.min(
                            images.length,
                            pageStartIdx + itemsPerPage
                          )} of ${images.length}`}{' '}
                      | Page {currentPage} of {totalPages}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Modal Pagination Footer */}
        <div className="bg-white px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Page
          </button>

          <span className="text-xs font-medium text-slate-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next Page
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
