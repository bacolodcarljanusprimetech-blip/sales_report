import { jsPDF } from 'jspdf'
import { getOrientedImageDataUrl } from '../images/imageUtils'
import {
  calculateDocumentLayoutPlan,
  type ImagePlacement,
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
  placement: ImagePlacement
): Promise<string> {
  const pixelRatio = 4
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(placement.cell.width * pixelRatio)
  canvas.height = Math.round(placement.cell.height * pixelRatio)
  const ctx = canvas.getContext('2d')
  if (!ctx) return orientedDataUrl

  const img = new Image()
  img.src = orientedDataUrl
  await new Promise((resolve) => {
    img.onload = resolve
  })

  const relX = (placement.x - placement.cell.x) * pixelRatio
  const relY = (placement.y - placement.cell.y) * pixelRatio
  const relW = placement.width * pixelRatio
  const relH = placement.height * pixelRatio

  ctx.drawImage(img, relX, relY, relW, relH)
  return canvas.toDataURL('image/jpeg', 0.92)
}

/**
 * Generates a jsPDF document from the canonical DocumentLayoutPlan.
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

  // Canonical layout calculation
  const plan = calculateDocumentLayoutPlan(reportInfo, images, options)

  // Configure optional security encryption
  const encryptionConfig =
    options.security?.enabled && options.security.userPassword
      ? {
          userPassword: options.security.userPassword,
          ownerPassword: options.security.ownerPassword || options.security.userPassword,
          userPermissions: options.security.permissions || ['print'],
        }
      : undefined

  const firstPage = plan.pages[0]
  const doc = new jsPDF({
    orientation: firstPage.isLandscape ? 'l' : 'p',
    unit: 'mm',
    format: 'a4',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    encryption: encryptionConfig as any,
  })

  const imageMap = new Map(images.map((img) => [img.id, img]))

  for (let p = 0; p < plan.pages.length; p++) {
    const page = plan.pages[p]
    onProgress?.(
      page.pageIndex,
      plan.totalPages,
      page.isCoverPage
        ? 'Generating cover page...'
        : `Rendering page ${page.pageIndex} of ${plan.totalPages}...`
    )

    if (p > 0) {
      doc.addPage('a4', page.isLandscape ? 'l' : 'p')
    }

    if (page.isCoverPage) {
      // Render Cover Page
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

      addField('Employee', reportInfo.salesRep)
      addField('Report Date', reportInfo.date || new Date().toISOString().split('T')[0])
      addField('Customer / Client', reportInfo.customer)
      addField('Location', reportInfo.location)
      addField('Layout', `${options.collageLayout} picture${options.collageLayout > 1 ? 's' : ''} per page`)
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

      if (page.footer) {
        doc.setFontSize(9)
        doc.setTextColor(148, 163, 184)
        doc.text(page.footer.text, page.footer.x, page.footer.y, { align: 'center' })
      }
    } else {
      // Render Image Page Header
      if (page.header) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(71, 85, 105)

        doc.text(page.header.title, page.header.x, page.header.y)
        if (page.header.metaRight) {
          doc.setFont('helvetica', 'normal')
          doc.text(
            page.header.metaRight,
            page.header.x + page.header.width,
            page.header.y,
            { align: 'right' }
          )
        }

        doc.setDrawColor(226, 232, 240) // Slate 200
        doc.setLineWidth(0.3)
        doc.line(
          page.header.x,
          page.header.y + 3,
          page.header.x + page.header.width,
          page.header.y + 3
        )
      }

      // Render Each Image in Its Exact Canonical Placement
      for (const placement of page.imagePlacements) {
        const item = imageMap.get(placement.imageId)
        if (!item) continue

        const imgElement = await loadImageElement(item.previewUrl)
        const oriented = await getOrientedImageDataUrl(imgElement, placement.rotation)

        if (placement.isClipped) {
          const clippedDataUrl = await getClippedCellDataUrl(oriented.dataUrl, placement)
          doc.addImage(
            clippedDataUrl,
            'JPEG',
            placement.cell.x,
            placement.cell.y,
            placement.cell.width,
            placement.cell.height,
            undefined,
            'FAST'
          )
        } else {
          doc.addImage(
            oriented.dataUrl,
            'JPEG',
            placement.x,
            placement.y,
            placement.width,
            placement.height,
            undefined,
            'FAST'
          )
        }
      }

      // Render Image Page Footer
      if (page.footer) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(148, 163, 184)

        doc.text(page.footer.text, page.footer.x, page.footer.y, { align: 'center' })
      }
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

