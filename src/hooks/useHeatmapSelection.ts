import { useState, useCallback } from 'react'

export interface HeatmapSelection {
  selectedDate: string | null
  select: (date: string) => void
  deselect: () => void
  toggle: (date: string) => void
  expandedMonth: number | null
  toggleMonth: (month: number) => void
}

export function useHeatmapSelection(): HeatmapSelection {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null)

  const select = useCallback((date: string) => setSelectedDate(date), [])
  const deselect = useCallback(() => setSelectedDate(null), [])
  const toggle = useCallback((date: string) => {
    setSelectedDate(prev => prev === date ? null : date)
  }, [])
  const toggleMonth = useCallback((month: number) => {
    setExpandedMonth(prev => prev === month ? null : month)
  }, [])

  return { selectedDate, select, deselect, toggle, expandedMonth, toggleMonth }
}
