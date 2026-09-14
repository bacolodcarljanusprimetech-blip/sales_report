export type CollageLayout = 1 | 2 | 3 | 4

export interface ReportImage {
  id: string
  file: File
  previewUrl: string
  rotation: number // 0, 90, 180, 270
  scale: number // default 1.0 (zoom inside cell)
  positionX: number // pan offset X (default 0)
  positionY: number // pan offset Y (default 0)
  width: number
  height: number
  name: string
  size: number
}

export interface ReportInfo {
  title: string
  salesRep: string
  date: string
  customer: string
  location: string
  notes: string
}
