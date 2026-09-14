import { jsPDF } from 'jspdf'
import { getOrientedImageDataUrl } from '../images/imageUtils'
import {
  calculatePageBounds,
  getLayoutCells,
  calculateCellFit,
} from './pdfLayout'
import type { PDFGeneratorParams } from './pdfTypes'

/**
 * Loads an image URL into an HTMLImageElement asynchronously.
 */
function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image for PDF processing'))
    img.src = url
  })
}

/**
 * Clips and renders an enlarged image strictly to cell boundaries.
 */
async function getClippedCellDataUrl(
  orientedDataUrl: string,
  fitX: number,
  fitY: number,
  fitW: number,
  fitH: number,
  cellX: number,
  cellY: number,
  cellW: number,
  cellH: number
): Promise<string> {
  const pixelRatio = 4
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(cellW * pixelRatio)
  canvas.height = Math.round(cellH * pixelRatio)
  const ctx = canvas.getContext('2d')
  if (!ctx) return orientedDataUrl

  const img = new Image()
  img.src = orientedDataUrl
  await new Promise((resolve) => {
    img.onload = resolve
  })

  const relX = (fitX - cellX) * pixelRatio
  const relY = (fitY - cellY) * pixelRatio
  const relW = fitW * pixelRatio
  const relH = fitH * pixelRatio

  ctx.drawImage(img, relX, relY, relW, relH)
  return canvas.toDataURL('image/jpeg', 0.92)
}

/**
 * Generates a jsPDF document from the provided report info and images.
 * Supports 1, 2, 3, or 4 pictures per page in collage layouts.
 */
export async function generateReportPDF({
  reportInfo,
  images,
  options,
  onProgress,
}: PDFGeneratorParams): Promise<jsPDF> {
  if (images.length === 0) {
    throw new Error('Please add at least one picture.')
  }

  const itemsPerPage = options.collageLayout || 1
  const totalImagePages = Math.ceil(images.length / itemsPerPage)
  const totalPages = (options.includeCoverPage ? 1 : 0) + totalImagePages

  // Configure optional security encryption
  const encryptionConfig =
    options.security?.enabled && options.security.userPassword
      ? {
          userPassword: options.security.userPassword,
          ownerPassword: options.security.ownerPassword || options.security.userPassword,
          userPermissions: options.security.permissions || ['print'],
        }
      : undefined

  let currentPageIndex = 0

  // Initial bounds calculation
  const firstBounds = calculatePageBounds(
    images[0].width,
    images[0].height,
    options.orientation,
    options.marginMm,
    options.includeHeader,
    options.includeFooter,
    options.collageLayout
  )

  const doc = new jsPDF({
    orientation: options.includeCoverPage ? 'portrait' : firstBounds.isLandscape ? 'l' : 'p',
    unit: 'mm',
    format: 'a4',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    encryption: encryptionConfig as any,
  })

  // 1. Cover page (if enabled)
  if (options.includeCoverPage) {
    currentPageIndex++
    onProgress?.(0, totalPages, 'Generating cover page...')

    doc.setFillColor(30, 41, 59) // Slate 800
    doc.rect(0, 0, 210, 40, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.text(reportInfo.title || 'Sales Daily Picture Report', 20, 26)

    doc.setTextColor(51, 65, 85) // Slate 700
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')

    let yPos = 60
    const addField = (label: string, value?: string) => {
      if (!value) return
      doc.setFont('helvetica', 'bold')
      doc.text(`${label}:`, 20, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(value, 65, yPos)
      yPos += 10
    }

    addField('Sales Representative', reportInfo.salesRep)
    addField('Report Date', reportInfo.date || new Date().toISOString().split('T')[0])
    addField('Customer / Client', reportInfo.customer)
    addField('Location', reportInfo.location)
    addField('Layout', `${itemsPerPage} picture${itemsPerPage > 1 ? 's' : ''} per page`)
    addField('Total Photographs', `${images.length} images`)

    if (reportInfo.notes) {
      yPos += 5
      doc.setFont('helvetica', 'bold')
      doc.text('Notes / Remarks:', 20, yPos)
      yPos += 7
      doc.setFont('helvetica', 'normal')
      const splitNotes = doc.splitTextToSize(reportInfo.notes, 170)
      doc.text(splitNotes, 20, yPos)
    }

    if (options.includeFooter) {
      doc.setFontSize(9)
      doc.setTextColor(148, 163, 184)
      doc.text(`Page 1 of ${totalPages}`, 105, 285, { align: 'center' })
    }
  }

  // 2. Image Pages in Collage Chunks
  for (let pageIdx = 0; pageIdx < totalImagePages; pageIdx++) {
    currentPageIndex++
    const startImgIdx = pageIdx * itemsPerPage
    const pageImages = images.slice(startImgIdx, startImgIdx + itemsPerPage)

    onProgress?.(
      currentPageIndex,
      totalPages,
      `Processing page ${currentPageIndex} of ${totalPages} (${pageImages.length} images)...`
    )

    // Calculate bounds for this page
    const pageBounds = calculatePageBounds(
      pageImages[0].width,
      pageImages[0].height,
      options.orientation,
      options.marginMm,
      options.includeHeader,
      options.includeFooter,
      options.collageLayout
    )

    if (options.includeCoverPage || pageIdx > 0) {
      doc.addPage('a4', pageBounds.isLandscape ? 'l' : 'p')
    }

    const pageWidth = pageBounds.pageWidth
    const pageHeight = pageBounds.pageHeight

    // Render optional page header
    if (options.includeHeader) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(71, 85, 105) // Slate 600

      const headerTitle = reportInfo.title || 'Sales Picture Report'
      const metaRight = [reportInfo.salesRep, reportInfo.date || reportInfo.customer]
        .filter(Boolean)
        .join(' • ')

      doc.text(headerTitle, options.marginMm, options.marginMm + 5)
      if (metaRight) {
        doc.setFont('helvetica', 'normal')
        doc.text(metaRight, pageWidth - options.marginMm, options.marginMm + 5, { align: 'right' })
      }

      doc.setDrawColor(226, 232, 240) // Slate 200
      doc.setLineWidth(0.3)
      doc.line(options.marginMm, options.marginMm + 8, pageWidth - options.marginMm, options.marginMm + 8)
    }

    // Get assigned cells on page
    const cells = getLayoutCells(options.collageLayout, pageBounds)

    // Render each image in its assigned cell
    for (let cellIdx = 0; cellIdx < pageImages.length; cellIdx++) {
      const item = pageImages[cellIdx]
      const cell = cells[cellIdx]

      const imgElement = await loadImageElement(item.previewUrl)
      const oriented = await getOrientedImageDataUrl(imgElement, item.rotation)

      const fit = calculateCellFit(
        oriented.width,
        oriented.height,
        cell,
        item.scale,
        item.positionX,
        item.positionY
      )

      if (item.scale > 1.01) {
        // Render clipped image to prevent cell overflow
        const clippedDataUrl = await getClippedCellDataUrl(
          oriented.dataUrl,
          fit.x,
          fit.y,
          fit.width,
          fit.height,
          cell.x,
          cell.y,
          cell.width,
          cell.height
        )
        doc.addImage(
          clippedDataUrl,
          'JPEG',
          cell.x,
          cell.y,
          cell.width,
          cell.height,
          undefined,
          'FAST'
        )
      } else {
        doc.addImage(
          oriented.dataUrl,
          'JPEG',
          fit.x,
          fit.y,
          fit.width,
          fit.height,
          undefined,
          'FAST'
        )
      }
    }

    // Render optional page footer
    if (options.includeFooter) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184) // Slate 400

      const endImgIdx = Math.min(images.length, startImgIdx + itemsPerPage)
      const photoLabel =
        itemsPerPage === 1
          ? `Photo ${startImgIdx + 1} of ${images.length}`
          : `Photos ${startImgIdx + 1}–${endImgIdx} of ${images.length}`

      doc.text(
        `${photoLabel}  |  Page ${currentPageIndex} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - Math.max(4, options.marginMm / 2),
        { align: 'center' }
      )
    }
  }

  return doc
}

/**
 * Helper to download the generated PDF to user's computer.
 */
export function downloadPDFDocument(doc: jsPDF, filename = 'sales_report.pdf'): void {
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  doc.save(safeFilename)
}

/**
 * Helper to get a Blob from the generated PDF for previewing in an iframe / object element.
 */
export function getPDFBlob(doc: jsPDF): Blob {
  return doc.output('blob')
}
