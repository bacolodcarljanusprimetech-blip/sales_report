import type { ReportImage, ReportInfo, CollageLayout } from '../images/imageTypes'
import type { PDFLayoutOptions } from './pdfTypes'

// Canonical A4 Dimensions in Millimeters
export const A4_PORTRAIT_WIDTH = 210
export const A4_PORTRAIT_HEIGHT = 297
export const A4_LANDSCAPE_WIDTH = 297
export const A4_LANDSCAPE_HEIGHT = 210
export const DEFAULT_CELL_GAP_MM = 5
export const HEADER_HEIGHT_MM = 16
export const FOOTER_HEIGHT_MM = 10

export interface LayoutCell {
  index: number
  x: number // mm
  y: number // mm
  width: number // mm
  height: number // mm
}

export interface ImagePlacement {
  imageId: string
  cell: LayoutCell
  // Millimeter coordinates and dimensions on the page
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scale: number
  isClipped: boolean
}

export interface HeaderLayout {
  x: number
  y: number
  width: number
  height: number
  title: string
  metaRight: string
}

export interface FooterLayout {
  x: number
  y: number
  width: number
  height: number
  text: string
}

export interface PageLayoutResult {
  pageIndex: number // 1-based
  isCoverPage: boolean
  isLandscape: boolean
  pageWidth: number // mm
  pageHeight: number // mm
  marginMm: number
  contentX: number
  contentY: number
  contentWidth: number
  contentHeight: number
  header?: HeaderLayout
  footer?: FooterLayout
  cells: LayoutCell[]
  imagePlacements: ImagePlacement[]
}

export interface DocumentLayoutPlan {
  totalPages: number
  pages: PageLayoutResult[]
}

/**
 * Calculates page dimensions and content area in millimeters.
 */
export function calculatePageBounds(
  imageWidth: number,
  imageHeight: number,
  orientationMode: 'auto' | 'portrait' | 'landscape',
  marginMm: number,
  hasHeader: boolean,
  hasFooter: boolean,
  collageLayout: CollageLayout = 1
) {
  const isLandscape =
    collageLayout > 1
      ? orientationMode === 'landscape'
      : orientationMode === 'landscape'
      ? true
      : orientationMode === 'portrait'
      ? false
      : imageWidth > imageHeight

  const pageWidth = isLandscape ? A4_LANDSCAPE_WIDTH : A4_PORTRAIT_WIDTH
  const pageHeight = isLandscape ? A4_LANDSCAPE_HEIGHT : A4_PORTRAIT_HEIGHT

  const headerHeight = hasHeader ? HEADER_HEIGHT_MM : 0
  const footerHeight = hasFooter ? FOOTER_HEIGHT_MM : 0

  const contentX = marginMm
  const contentY = marginMm + headerHeight
  const contentWidth = Math.max(10, pageWidth - marginMm * 2)
  const contentHeight = Math.max(10, pageHeight - marginMm * 2 - headerHeight - footerHeight)

  return {
    pageWidth,
    pageHeight,
    isLandscape,
    contentX,
    contentY,
    contentWidth,
    contentHeight,
  }
}

/**
 * Calculates canonical cell boundaries in millimeters for 1, 2, 3, or 4 cells.
 */
export function getLayoutCells(
  layout: CollageLayout,
  contentX: number,
  contentY: number,
  contentWidth: number,
  contentHeight: number,
  gapMm = DEFAULT_CELL_GAP_MM
): LayoutCell[] {
  if (layout === 1) {
    return [
      {
        index: 0,
        x: contentX,
        y: contentY,
        width: contentWidth,
        height: contentHeight,
      },
    ]
  }

  if (layout === 2) {
    const cellHeight = Math.max(10, (contentHeight - gapMm) / 2)
    return [
      {
        index: 0,
        x: contentX,
        y: contentY,
        width: contentWidth,
        height: cellHeight,
      },
      {
        index: 1,
        x: contentX,
        y: contentY + cellHeight + gapMm,
        width: contentWidth,
        height: cellHeight,
      },
    ]
  }

  if (layout === 3) {
    const cellHeight = Math.max(10, (contentHeight - 2 * gapMm) / 3)
    return [
      {
        index: 0,
        x: contentX,
        y: contentY,
        width: contentWidth,
        height: cellHeight,
      },
      {
        index: 1,
        x: contentX,
        y: contentY + cellHeight + gapMm,
        width: contentWidth,
        height: cellHeight,
      },
      {
        index: 2,
        x: contentX,
        y: contentY + 2 * (cellHeight + gapMm),
        width: contentWidth,
        height: cellHeight,
      },
    ]
  }

  // layout === 4: 2x2 grid
  const cellWidth = Math.max(10, (contentWidth - gapMm) / 2)
  const cellHeight = Math.max(10, (contentHeight - gapMm) / 2)

  return [
    {
      index: 0,
      x: contentX,
      y: contentY,
      width: cellWidth,
      height: cellHeight,
    },
    {
      index: 1,
      x: contentX + cellWidth + gapMm,
      y: contentY,
      width: cellWidth,
      height: cellHeight,
    },
    {
      index: 2,
      x: contentX,
      y: contentY + cellHeight + gapMm,
      width: cellWidth,
      height: cellHeight,
    },
    {
      index: 3,
      x: contentX + cellWidth + gapMm,
      y: contentY + cellHeight + gapMm,
      width: cellWidth,
      height: cellHeight,
    },
  ]
}

/**
 * Calculates exact millimeter placement of an image inside its assigned cell.
 */
export function calculateImagePlacementInCell(
  image: ReportImage,
  cell: LayoutCell
): ImagePlacement {
  const normRot = ((image.rotation % 360) + 360) % 360
  const isRot90or270 = normRot === 90 || normRot === 270

  const effectiveW = isRot90or270 ? image.height : image.width
  const effectiveH = isRot90or270 ? image.width : image.height

  if (effectiveW <= 0 || effectiveH <= 0) {
    return {
      imageId: image.id,
      cell,
      x: cell.x,
      y: cell.y,
      width: cell.width,
      height: cell.height,
      rotation: normRot,
      scale: 1,
      isClipped: false,
    }
  }

  // 1. Automatic proportional contain fit inside cell
  const autoScale = Math.min(
    cell.width / effectiveW,
    cell.height / effectiveH
  )

  // 2. User scale
  const userScale = Math.max(0.5, image.scale || 1)
  const finalScale = autoScale * userScale
  const finalWidth = effectiveW * finalScale
  const finalHeight = effectiveH * finalScale

  // 3. Center inside cell + user pan offsets
  const x = cell.x + (cell.width - finalWidth) / 2 + (image.positionX || 0)
  const y = cell.y + (cell.height - finalHeight) / 2 + (image.positionY || 0)

  return {
    imageId: image.id,
    cell,
    x,
    y,
    width: finalWidth,
    height: finalHeight,
    rotation: normRot,
    scale: userScale,
    isClipped: userScale > 1.01,
  }
}

/**
 * CANONICAL SINGLE SOURCE OF TRUTH:
 * Computes the complete millimeter layout plan for the entire document.
 * Both the preview and jsPDF generator consume these exact values.
 */
export function calculateDocumentLayoutPlan(
  reportInfo: ReportInfo,
  images: ReportImage[],
  options: PDFLayoutOptions
): DocumentLayoutPlan {
  const itemsPerPage = options.collageLayout || 1
  const totalImagePages = Math.ceil(images.length / itemsPerPage)
  const totalPages = (options.includeCoverPage ? 1 : 0) + totalImagePages

  const pages: PageLayoutResult[] = []
  let currentPageIndex = 0

  // 1. Cover Page
  if (options.includeCoverPage) {
    currentPageIndex++
    pages.push({
      pageIndex: currentPageIndex,
      isCoverPage: true,
      isLandscape: false,
      pageWidth: A4_PORTRAIT_WIDTH,
      pageHeight: A4_PORTRAIT_HEIGHT,
      marginMm: options.marginMm,
      contentX: options.marginMm,
      contentY: options.marginMm,
      contentWidth: A4_PORTRAIT_WIDTH - options.marginMm * 2,
      contentHeight: A4_PORTRAIT_HEIGHT - options.marginMm * 2,
      footer: options.includeFooter
        ? {
            x: A4_PORTRAIT_WIDTH / 2,
            y: 285,
            width: A4_PORTRAIT_WIDTH,
            height: FOOTER_HEIGHT_MM,
            text: `Page 1 of ${totalPages}`,
          }
        : undefined,
      cells: [],
      imagePlacements: [],
    })
  }

  // 2. Image Pages
  for (let pageIdx = 0; pageIdx < totalImagePages; pageIdx++) {
    currentPageIndex++
    const startIdx = pageIdx * itemsPerPage
    const pageImages = images.slice(startIdx, startIdx + itemsPerPage)

    const firstImg = pageImages[0]
    const bounds = calculatePageBounds(
      firstImg.width,
      firstImg.height,
      options.orientation,
      options.marginMm,
      options.includeHeader,
      options.includeFooter,
      options.collageLayout
    )

    const headerTitle = reportInfo.title || 'Sales Picture Report'
    const metaRight = [reportInfo.salesRep, reportInfo.date || reportInfo.customer]
      .filter(Boolean)
      .join(' • ')

    const headerLayout: HeaderLayout | undefined = options.includeHeader
      ? {
          x: options.marginMm,
          y: options.marginMm + 5,
          width: bounds.pageWidth - options.marginMm * 2,
          height: HEADER_HEIGHT_MM,
          title: headerTitle,
          metaRight,
        }
      : undefined

    const endImgIdx = Math.min(images.length, startIdx + itemsPerPage)
    const photoLabel =
      itemsPerPage === 1
        ? `Photo ${startIdx + 1} of ${images.length}`
        : `Photos ${startIdx + 1}–${endImgIdx} of ${images.length}`

    const footerLayout: FooterLayout | undefined = options.includeFooter
      ? {
          x: bounds.pageWidth / 2,
          y: bounds.pageHeight - Math.max(4, options.marginMm / 2),
          width: bounds.pageWidth,
          height: FOOTER_HEIGHT_MM,
          text: `${photoLabel}  |  Page ${currentPageIndex} of ${totalPages}`,
        }
      : undefined

    const cells = getLayoutCells(
      options.collageLayout,
      bounds.contentX,
      bounds.contentY,
      bounds.contentWidth,
      bounds.contentHeight
    )

    const imagePlacements: ImagePlacement[] = []
    for (let c = 0; c < pageImages.length; c++) {
      const placement = calculateImagePlacementInCell(pageImages[c], cells[c])
      imagePlacements.push(placement)
    }

    pages.push({
      pageIndex: currentPageIndex,
      isCoverPage: false,
      isLandscape: bounds.isLandscape,
      pageWidth: bounds.pageWidth,
      pageHeight: bounds.pageHeight,
      marginMm: options.marginMm,
      contentX: bounds.contentX,
      contentY: bounds.contentY,
      contentWidth: bounds.contentWidth,
      contentHeight: bounds.contentHeight,
      header: headerLayout,
      footer: footerLayout,
      cells,
      imagePlacements,
    })
  }

  return {
    totalPages,
    pages,
  }
}

