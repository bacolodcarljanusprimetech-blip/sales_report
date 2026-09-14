import React from 'react'
import type { ReportInfo } from '../features/images/imageTypes'
import { FileText, User, Calendar, Building, MapPin, AlignLeft } from 'lucide-react'

interface ReportFormProps {
  reportInfo: ReportInfo
  onChange: (info: ReportInfo) => void
}

export const ReportForm: React.FC<ReportFormProps> = ({ reportInfo, onChange }) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    onChange({
      ...reportInfo,
      [name]: value,
    })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
        <FileText className="w-5 h-5 text-blue-600" />
        <h2 className="text-base font-semibold text-slate-800">Report Details</h2>
        <span className="text-xs text-slate-400 font-normal ml-auto">
          (Optional report metadata)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y"
          />
        </div>
      </div>
    </div>
  )
}

