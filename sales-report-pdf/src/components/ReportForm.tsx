import React, { useState } from 'react'
import type { ReportInfo } from '../features/images/imageTypes'
import { FileText, User, Calendar, Building, MapPin, AlignLeft, ChevronDown, ChevronUp } from 'lucide-react'

interface ReportFormProps {
  reportInfo: ReportInfo
  onChange: (info: ReportInfo) => void
}

export const ReportForm: React.FC<ReportFormProps> = ({ reportInfo, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    onChange({
      ...reportInfo,
      [name]: value,
    })
  }

  const filledCount = Object.values(reportInfo).filter(Boolean).length

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 shadow-xs transition-all">
      {/* Header with Collapsible Toggle for Mobile */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between pb-3 cursor-pointer select-none border-b border-slate-100 gap-2"
      >
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-5 h-5 text-blue-600 shrink-0" />
          <h2 className="text-sm sm:text-base font-semibold text-slate-800 truncate">
            Report Details
          </h2>
          {filledCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 shrink-0">
              {filledCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline text-xs text-slate-400 font-normal">
            (Optional metadata)
          </span>
          <button
            type="button"
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            aria-label={isExpanded ? 'Collapse report details' : 'Expand report details'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 animate-in fade-in duration-150">
          {/* Title */}
          <div>
            <label
              htmlFor="report-title"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Report Title
            </label>
            <input
              id="report-title"
              type="text"
              name="title"
              value={reportInfo.title}
              onChange={handleChange}
              placeholder="e.g. Daily Sales Activity Report"
              className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Sales Rep */}
          <div>
            <label
              htmlFor="sales-rep"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1"
            >
              <User className="w-3.5 h-3.5 text-slate-400" />
              Sales Representative
            </label>
            <input
              id="sales-rep"
              type="text"
              name="salesRep"
              value={reportInfo.salesRep}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Report Date */}
          <div>
            <label
              htmlFor="report-date"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Report Date
            </label>
            <input
              id="report-date"
              type="date"
              name="date"
              value={reportInfo.date}
              onChange={handleChange}
              className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Customer / Client */}
          <div>
            <label
              htmlFor="customer"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1"
            >
              <Building className="w-3.5 h-3.5 text-slate-400" />
              Customer / Client
            </label>
            <input
              id="customer"
              type="text"
              name="customer"
              value={reportInfo.customer}
              onChange={handleChange}
              placeholder="e.g. Acme Corp"
              className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Location
            </label>
            <input
              id="location"
              type="text"
              name="location"
              value={reportInfo.location}
              onChange={handleChange}
              placeholder="e.g. Downtown Branch"
              className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Notes */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label
              htmlFor="notes"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1"
            >
              <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
              Notes / Observations
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              value={reportInfo.notes}
              onChange={handleChange}
              placeholder="Additional comments, meeting outcomes, or context for the visit..."
              className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y"
            />
          </div>
        </div>
      )}
    </div>
  )
}
