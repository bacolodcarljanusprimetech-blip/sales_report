import type { ReportImage, ReportInfo, CollageLayout } from '../images/imageTypes'

export interface PDFSecurityOptions {
  enabled: boolean
  userPassword?: string
  ownerPassword?: string
  permissions?: ('print' | 'modify' | 'copy' | 'annot-forms')[]
}

export interface PDFLayoutOptions {
  orientation: 'auto' | 'portrait' | 'landscape'
  marginMm: number
  includeHeader: boolean
  includeFooter: boolean
  includeCoverPage: boolean
  collageLayout: CollageLayout // 1, 2, 3, or 4 pictures per page
  security: PDFSecurityOptions
}

export interface GeneratePDFProgressCallback {
  (current: number, total: number, status: string): void
}

export interface PDFGeneratorParams {
  reportInfo: ReportInfo
  images: ReportImage[]
  options: PDFLayoutOptions
  onProgress?: GeneratePDFProgressCallback
}
