import React from 'react'
import type { PDFLayoutOptions } from '../features/pdf/pdfTypes'
import { Settings, Shield, Layout, X } from 'lucide-react'

interface PDFSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  options: PDFLayoutOptions
  onChange: (options: PDFLayoutOptions) => void
}

export const PDFSettingsModal: React.FC<PDFSettingsModalProps> = ({
  isOpen,
  onClose,
  options,
  onChange,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              PDF & Layout Options
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Page Layout Settings */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              <Layout className="w-4 h-4" />
              <span>Page & Collage Layout</span>
            </div>

            <div className="space-y-4">
              {/* Pictures per page */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pictures per Page (Collage Mode)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {([1, 2, 3, 4] as const).map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => onChange({ ...options, collageLayout: count })}
                      className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                        options.collageLayout === count
                          ? 'border-blue-600 bg-blue-50/70 text-blue-700 font-semibold shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {count} {count === 1 ? 'picture' : 'pictures'}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Arranges pictures in balanced vertical rows or a 2×2 grid per A4 sheet.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Page Orientation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['auto', 'portrait', 'landscape'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => onChange({ ...options, orientation: mode })}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border capitalize transition-all ${
                        options.orientation === mode
                          ? 'border-blue-600 bg-blue-50/70 text-blue-700 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {mode === 'auto' ? 'Auto Fit' : mode}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Auto adapts orientation per photo so wide pictures fit seamlessly.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Page Margin
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 15, 20].map((margin) => (
                    <button
                      key={margin}
                      type="button"
                      onClick={() => onChange({ ...options, marginMm: margin })}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                        options.marginMm === margin
                          ? 'border-blue-600 bg-blue-50/70 text-blue-700 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {margin} mm {margin === 10 && '(Standard)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={options.includeCoverPage}
                    onChange={(e) =>
                      onChange({ ...options, includeCoverPage: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span>Include Report Cover Page with full metadata & notes</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={options.includeHeader}
                    onChange={(e) =>
                      onChange({ ...options, includeHeader: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span>Show header on image pages (Title, Rep, Date)</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={options.includeFooter}
                    onChange={(e) =>
                      onChange({ ...options, includeFooter: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span>Show footer page numbering (Page X of Y)</span>
                </label>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* PDF Security Section */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>PDF Security & Encryption</span>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={options.security.enabled}
                  onChange={(e) =>
                    onChange({
                      ...options,
                      security: { ...options.security, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800">
                  Protect PDF with password (Built-in jsPDF Encryption)
                </span>
              </label>

              {options.security.enabled && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3 mt-2 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      User Password (required to open document)
                    </label>
                    <input
                      type="password"
                      value={options.security.userPassword || ''}
                      onChange={(e) =>
                        onChange({
                          ...options,
                          security: { ...options.security, userPassword: e.target.value },
                        })
                      }
                      placeholder="Enter password..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Owner Password (optional, for admin permissions)
                    </label>
                    <input
                      type="password"
                      value={options.security.ownerPassword || ''}
                      onChange={(e) =>
                        onChange({
                          ...options,
                          security: { ...options.security, ownerPassword: e.target.value },
                        })
                      }
                      placeholder="Optional admin password..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Encrypted using jsPDF standard RC4 algorithm. Viewers must provide this password to open and view the report.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  )
}
