import { useState, useEffect, useCallback, useRef } from 'react'
import { Header } from './components/Header'
import { ReportForm } from './components/ReportForm'
import { ImageUploader } from './components/ImageUploader'
import { ImageGrid } from './components/ImageGrid'
import { ActionBar } from './components/ActionBar'
import { ReportPreview } from './components/ReportPreview'
import { PDFSettingsModal } from './components/PDFSettingsModal'
import { ImageDetailModal } from './components/ImageDetailModal'
import {
  generateReportPDF,
  downloadPDFDocument,
  getPDFBlob,
} from './features/pdf/pdfGenerator'
import { revokePreviewUrl } from './features/images/imageUtils'
import type { ReportImage, ReportInfo, CollageLayout } from './features/images/imageTypes'
import type { PDFLayoutOptions } from './features/pdf/pdfTypes'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

const DEFAULT_REPORT_INFO: ReportInfo = {
  title: 'Daily Sales Activity Report',
  salesRep: '',
  date: new Date().toISOString().split('T')[0],
  customer: '',
  location: '',
  notes: '',
}

const DEFAULT_LAYOUT_OPTIONS: PDFLayoutOptions = {
  orientation: 'auto',
  marginMm: 10,
  includeHeader: true,
  includeFooter: true,
  includeCoverPage: false,
  collageLayout: 1,
  security: {
    enabled: false,
    userPassword: '',
    ownerPassword: '',
    permissions: ['print'],
  },
}

export function App() {
  const [reportInfo, setReportInfo] = useState<ReportInfo>(DEFAULT_REPORT_INFO)
  const [images, setImages] = useState<ReportImage[]>([])
  const [layoutOptions, setLayoutOptions] =
    useState<PDFLayoutOptions>(DEFAULT_LAYOUT_OPTIONS)

  // Modals & Viewers
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [inspectImage, setInspectImage] = useState<ReportImage | null>(null)
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)

  // Status & Notifications
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Keep refs in sync with state so the unmount cleanup can access latest values
  // without causing the cleanup to run on every state change.
  const imagesRef = useRef<ReportImage[]>([])
  const pdfBlobUrlRef = useRef<string | null>(null)

  useEffect(() => {
    imagesRef.current = images
  }, [images])

  useEffect(() => {
    pdfBlobUrlRef.current = pdfBlobUrl
  }, [pdfBlobUrl])

  // Revoke object URLs ONLY on unmount — never during re-renders.
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => revokePreviewUrl(img.previewUrl))
      if (pdfBlobUrlRef.current) revokePreviewUrl(pdfBlobUrlRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Clear PDF Blob URL when images or layout changes
  const invalidatePdfBlob = useCallback(() => {
    if (pdfBlobUrl) {
      revokePreviewUrl(pdfBlobUrl)
      setPdfBlobUrl(null)
    }
  }, [pdfBlobUrl])

  // Image actions
  const handleImagesAdded = (newImages: ReportImage[]) => {
    setImages((prev) => [...prev, ...newImages])
    setSuccessMessage(`Added ${newImages.length} picture${newImages.length > 1 ? 's' : ''}.`)
    invalidatePdfBlob()
    setErrorMessage(null)
  }

  const handleRotateImage = (id: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, rotation: (img.rotation + 90) % 360 } : img
      )
    )
    if (inspectImage && inspectImage.id === id) {
      setInspectImage((prev) =>
        prev ? { ...prev, rotation: (prev.rotation + 90) % 360 } : null
      )
    }
    invalidatePdfBlob()
  }

  const handleScaleChange = (id: string, scale: number) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, scale } : img))
    )
    if (inspectImage && inspectImage.id === id) {
      setInspectImage((prev) => (prev ? { ...prev, scale } : null))
    }
    invalidatePdfBlob()
  }

  const handleResetImage = (id: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? { ...img, rotation: 0, scale: 1, positionX: 0, positionY: 0 }
          : img
      )
    )
    if (inspectImage && inspectImage.id === id) {
      setInspectImage((prev) =>
        prev
          ? { ...prev, rotation: 0, scale: 1, positionX: 0, positionY: 0 }
          : null
      )
    }
    invalidatePdfBlob()
  }

  const handleDeleteImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id)
      if (target) revokePreviewUrl(target.previewUrl)
      return prev.filter((img) => img.id !== id)
    })
    if (inspectImage?.id === id) setInspectImage(null)
    invalidatePdfBlob()
  }

  const handleReorderImages = (reordered: ReportImage[]) => {
    setImages(reordered)
    invalidatePdfBlob()
  }

  const handleLayoutChange = (layout: CollageLayout) => {
    setLayoutOptions((prev) => ({ ...prev, collageLayout: layout }))
    invalidatePdfBlob()
  }

  const handleClearAll = () => {
    if (images.length === 0) return
    if (window.confirm('Are you sure you want to remove all pictures?')) {
      images.forEach((img) => revokePreviewUrl(img.previewUrl))
      setImages([])
      invalidatePdfBlob()
      setSuccessMessage('Cleared all pictures.')
    }
  }

  const handleNewReport = () => {
    if (
      images.length > 0 &&
      !window.confirm('Start a new report? This will clear all current pictures and fields.')
    ) {
      return
    }
    images.forEach((img) => revokePreviewUrl(img.previewUrl))
    setImages([])
    setReportInfo({
      ...DEFAULT_REPORT_INFO,
      date: new Date().toISOString().split('T')[0],
    })
    setLayoutOptions(DEFAULT_LAYOUT_OPTIONS)
    invalidatePdfBlob()
    setSuccessMessage('New report initialized.')
  }

  // Generate and download
  const handleGeneratePdf = async () => {
    if (images.length === 0) {
      setErrorMessage('Please add at least one picture before generating the PDF.')
      return
    }

    try {
      setIsGenerating(true)
      setErrorMessage(null)
      const doc = await generateReportPDF({
        reportInfo,
        images,
        options: layoutOptions,
        onProgress: (_current, _total, status) => setGenerationStatus(status),
      })

      const safeTitle = (reportInfo.title || 'sales_report')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '_')
      const dateStr = reportInfo.date || new Date().toISOString().split('T')[0]
      downloadPDFDocument(doc, `${safeTitle}_${dateStr}.pdf`)

      setSuccessMessage('PDF successfully generated and downloaded!')
    } catch (err) {
      console.error(err)
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred while generating the PDF.'
      )
    } finally {
      setIsGenerating(false)
      setGenerationStatus(null)
    }
  }

  // Preview PDF in modal
  const handlePreviewPdf = async () => {
    if (images.length === 0) {
      setErrorMessage('Please add at least one picture before previewing.')
      return
    }

    try {
      setIsGenerating(true)
      setErrorMessage(null)

      const doc = await generateReportPDF({
        reportInfo,
        images,
        options: layoutOptions,
        onProgress: (_current, _total, status) => setGenerationStatus(status),
      })

      const blob = getPDFBlob(doc)
      if (pdfBlobUrl) revokePreviewUrl(pdfBlobUrl)
      const newUrl = URL.createObjectURL(blob)
      setPdfBlobUrl(newUrl)
      setIsPreviewOpen(true)
    } catch (err) {
      console.error(err)
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred while preparing preview.'
      )
    } finally {
      setIsGenerating(false)
      setGenerationStatus(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        onNewReport={handleNewReport}
        onGeneratePdf={handleGeneratePdf}
        onPreviewPdf={handlePreviewPdf}
        hasImages={images.length > 0}
        isGenerating={isGenerating}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Error Notification */}
        {errorMessage && (
          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-700 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Success Notification */}
        {successMessage && (
          <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-500 hover:text-emerald-800 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Section 1: Report Metadata Information Form */}
        <ReportForm reportInfo={reportInfo} onChange={setReportInfo} />

        {/* Section 2: Drag and Drop Image Upload Area */}
        <ImageUploader
          onImagesAdded={handleImagesAdded}
          onError={(msg) => setErrorMessage(msg)}
        />

        {/* Section 3: Sortable Drag & Drop Image Grid with Collage Layout Selector */}
        <ImageGrid
          images={images}
          collageLayout={layoutOptions.collageLayout}
          onLayoutChange={handleLayoutChange}
          onReorder={handleReorderImages}
          onRotate={handleRotateImage}
          onScaleChange={handleScaleChange}
          onReset={handleResetImage}
          onDelete={handleDeleteImage}
          onPreview={(img) => setInspectImage(img)}
        />
      </main>

      {/* Sticky Bottom Actions Bar */}
      <ActionBar
        hasImages={images.length > 0}
        isGenerating={isGenerating}
        generationStatus={generationStatus}
        onClearAll={handleClearAll}
        onPreviewPdf={handlePreviewPdf}
        onGeneratePdf={handleGeneratePdf}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isSecurityEnabled={layoutOptions.security.enabled}
      />

      {/* PDF Settings & Security Modal */}
      <PDFSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        options={layoutOptions}
        onChange={(newOpts) => {
          setLayoutOptions(newOpts)
          invalidatePdfBlob()
        }}
      />

      {/* Report & PDF Preview Modal */}
      <ReportPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        reportInfo={reportInfo}
        images={images}
        layoutOptions={layoutOptions}
        pdfBlobUrl={pdfBlobUrl}
        onGenerateAndDownload={handleGeneratePdf}
        isGenerating={isGenerating}
      />

      {/* Single Image Inspection Modal */}
      <ImageDetailModal
        image={inspectImage}
        onClose={() => setInspectImage(null)}
        onRotate={handleRotateImage}
        onScaleChange={handleScaleChange}
        onReset={handleResetImage}
      />
    </div>
  )
}

export default App
