import { useMemo } from 'react'
import { useBillStore } from '../../store/useBillStore'
import { useBills } from '../../hooks/useBill'
import { useHeatmapData } from '../../hooks/useHeatmapData'
import { useHeatmapSummary } from '../../hooks/useHeatmapSummary'
import { useHeatmapSelection } from '../../hooks/useHeatmapSelection'
import HeatmapSummary from './HeatmapSummary'
import MonthHeatmap from './MonthHeatmap'
import QuarterHeatmap from './QuarterHeatmap'
import YearHeatmap from './YearHeatmap'
import HeatmapLegend from './HeatmapLegend'
import HeatmapDetailDrawer from './HeatmapDetailDrawer'
import './Heatmap.css'

function fmt(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function filterDateRange(filter) {
  let start, end
  if (filter.mode === 'month') {
    start = new Date(filter.year, (filter.month || 1) - 1, 1)
    end = new Date(filter.year, filter.month || 1, 0)
  } else if (filter.mode === 'quarter') {
    const q = filter.quarter || 1
    start = new Date(filter.year, (q - 1) * 3, 1)
    end = new Date(filter.year, q * 3, 0)
  } else {
    start = new Date(filter.year, 0, 1)
    end = new Date(filter.year, 11, 31)
  }
  return { start, end }
}

export default function HeatmapCard() {
  const bills = useBills()
  const filter = useBillStore(s => s.analyticsFilter)
  const { selectedDate, toggle, deselect } = useHeatmapSelection()

  const { start, end } = useMemo(() => filterDateRange(filter), [filter])

  // Filter only expense bills in range for hooks
  const filteredBills = useMemo(() => {
    const startStr = fmt(start)
    const endStr = fmt(end)
    return bills.filter(b => b.type === 'expense' && b.date >= startStr && b.date <= endStr)
  }, [bills, start, end])

  const data = useHeatmapData(filteredBills, start, end)
  const summary = useHeatmapSummary(filteredBills, data)

  if (data.months.length === 0) {
    return <div className="hm__empty">暂无热力数据</div>
  }

  return (
    <div className="hm__card">
      <HeatmapSummary summary={summary} />

      {filter.mode === 'month' && (
        <MonthHeatmap months={data.months} selectedDate={selectedDate} onSelect={toggle} />
      )}

      {filter.mode === 'quarter' && (
        <QuarterHeatmap months={data.months} selectedDate={selectedDate} onSelect={toggle} />
      )}

      {filter.mode === 'year' && (
        <YearHeatmap months={data.months} selectedDate={selectedDate} onSelect={toggle} />
      )}

      <HeatmapLegend />

      {selectedDate && (
        <HeatmapDetailDrawer
          date={selectedDate}
          bills={filteredBills}
          onClose={deselect}
        />
      )}
    </div>
  )
}
