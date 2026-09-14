import type { CollageLayout } from '../images/imageTypes'

export const A4_PORTRAIT_WIDTH = 210
export const A4_PORTRAIT_HEIGHT = 297
export const A4_LANDSCAPE_WIDTH = 297
export const A4_LANDSCAPE_HEIGHT = 210
export const DEFAULT_CELL_GAP_MM = 5

export interface PageBounds {
  pageWidth: number
  pageHeight: number
  isLandscape: boolean
  contentX: number
  contentY: number
  contentWidth: number
  contentHeight: number
}

export interface LayoutCell {
  index: number
  x: number
  y: number
  width: number
  height: number
}

export interface ScaledImageLayout {
  x: number
  y: number
  width: number
  height: number
  clipX?: number
  clipY?: number
  clipWidth?: number
  clipHeight?: number
}

/**
 * Calculates page dimensions and available content area based on orientation and header/footer settings.
 */
export function calculatePageBounds(
  imageWidth: number,
  imageHeight: number,
  orientationMode: 'auto' | 'portrait' | 'landscape',
  marginMm: number,
  hasHeader: boolean,
  hasFooter: boolean,
  collageLayout: CollageLayout = 1
): PageBounds {
  // In collage mode (layout > 1), maintain uniform portrait orientation unless forced landscape
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

  // Reserve space for header and footer in mm
  const headerHeight = hasHeader ? 16 : 0
  const footerHeight = hasFooter ? 10 : 0

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
 * Calculates grid cells for a page according to the selected collage layout (1, 2, 3, or 4).
 */
export function getLayoutCells(
  layout: CollageLayout,
  bounds: PageBounds,
  gapMm = DEFAULT_CELL_GAP_MM
): LayoutCell[] {
  const { contentX, contentY, contentWidth, contentHeight } = bounds

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
    // 2 cells stacked vertically
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
    // 3 cells stacked vertically
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
 * Calculates proportional fit inside an assigned cell, applying user scale and position.
 */
export function calculateCellFit(
  imgWidth: number,
  imgHeight: number,
  cell: LayoutCell,
  userScale = 1,
  userPosX = 0,
  userPosY = 0
): ScaledImageLayout {
  if (imgWidth <= 0 || imgHeight <= 0) {
    return {
      x: cell.x,
      y: cell.y,
      width: cell.width,
      height: cell.height,
      clipX: cell.x,
      clipY: cell.y,
      clipWidth: cell.width,
      clipHeight: cell.height,
    }
  }

  // 1. Determine maximum automatic proportional fit inside the cell
  const autoScale = Math.min(
    cell.width / imgWidth,
    cell.height / imgHeight
  )

  // 2. Apply user scale
  const effectiveScale = autoScale * Math.max(0.5, userScale)
  const finalWidth = imgWidth * effectiveScale
  const finalHeight = imgHeight * effectiveScale

  // 3. Center inside cell + user pan offsets
  const x = cell.x + (cell.width - finalWidth) / 2 + userPosX
  const y = cell.y + (cell.height - finalHeight) / 2 + userPosY

  return {
    x,
    y,
    width: finalWidth,
    height: finalHeight,
    clipX: cell.x,
    clipY: cell.y,
    clipWidth: cell.width,
    clipHeight: cell.height,
  }
}

/**
 * Calculates proportional fit-to-page dimensions for single-image full-page layout.
 */
export function calculateProportionalFit(
  imgWidth: number,
  imgHeight: number,
  bounds: PageBounds
): ScaledImageLayout {
  const cell: LayoutCell = {
    index: 0,
    x: bounds.contentX,
    y: bounds.contentY,
    width: bounds.contentWidth,
    height: bounds.contentHeight,
  }
  return calculateCellFit(imgWidth, imgHeight, cell, 1, 0, 0)
}
