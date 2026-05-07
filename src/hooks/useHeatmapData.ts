import { useMemo } from 'react'
import type { Bill } from '../types'
import { getCategoryById } from '../data/categories'

export const HEAT_COLORS = ['#FBFAF6', '#F9E9B9', '#F3D97B', '#EEB160', '#E86F5A']
export const DOW_LABELS = ['一', '二', '三', '四', '五', '六', '日']

export interface DayCell {
  day: number
  date: string
  amount: number
  level: number
  topCat: string | null
  isMax: boolean
  isStreak: boolean
}

export interface WeekRow extends Array<DayCell | null> { length: 7 }

export interface MonthGrid {
  year: number
  month: number
  label: string
  weeks: WeekRow[]
}

export interface HeatmapData {
  months: MonthGrid[]
  dailyMap: Record<string, number>
  dailyCats: Record<string, Record<string, number>>
  maxDate: string | null
  maxAmount: number
}

function fmt(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function heatLevel(amount: number): number {
  if (amount <= 0) return 0
  if (amount <= 50) return 1
  if (amount <= 150) return 2
  if (amount <= 300) return 3
  return 4
}

function computeStreaks(dailyMap: Record<string, number>): Set<string> {
  const dates = Object.keys(dailyMap).sort()
  const streaks = new Set<string>()
  let run: string[] = []
  for (const d of dates) {
    if (run.length === 0) {
      run.push(d)
    } else {
      const prev = new Date(run[run.length - 1])
      const cur = new Date(d)
      const diff = (cur.getTime() - prev.getTime()) / 86400000
      if (diff === 1) {
        run.push(d)
      } else {
        if (run.length >= 3) run.forEach(dd => streaks.add(dd))
        run = [d]
      }
    }
  }
  if (run.length >= 3) run.forEach(dd => streaks.add(dd))
  return streaks
}

function buildMonthGrid(
  year: number,
  month: number,
  start: Date,
  end: Date,
  dailyMap: Record<string, number>,
  dailyCats: Record<string, Record<string, number>>,
  maxDate: string | null,
  streaks: Set<string>,
): MonthGrid {
  const firstOfMonth = new Date(year, month, 1)
  const lastOfMonth = new Date(year, month + 1, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const actualStart = firstOfMonth < start ? start : firstOfMonth
  const actualEnd = lastOfMonth > end ? end : lastOfMonth
  const clampedEnd = actualEnd > today ? today : actualEnd

  const startDow = (firstOfMonth.getDay() + 6) % 7

  const days: (DayCell | null)[] = []
  const totalDays = Math.round((clampedEnd.getTime() - actualStart.getTime()) / 86400000) + 1

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(actualStart)
    d.setDate(d.getDate() + i)
    const ds = fmt(d)
    const amt = dailyMap[ds] || 0
    const topCats = dailyCats[ds] ? Object.entries(dailyCats[ds]).sort((a, b) => b[1] - a[1]) : []
    days.push({
      day: d.getDate(),
      date: ds,
      amount: amt,
      level: heatLevel(amt),
      topCat: topCats.length > 0 ? topCats[0][0] : null,
      isMax: ds === maxDate,
      isStreak: streaks.has(ds),
    })
  }

  // Build week rows (Monday-based)
  const weeks: WeekRow[] = []
  let currentWeek: (DayCell | null)[] = new Array(7).fill(null)
  const monthStartOffset = Math.round((actualStart.getTime() - firstOfMonth.getTime()) / 86400000)
  const startCol = (startDow + monthStartOffset) % 7

  // Fill leading empty cells
  for (let c = 0; c < startCol; c++) {
    currentWeek[c] = null
  }

  let dayIdx = 0
  let col = startCol
  while (dayIdx < days.length) {
    currentWeek[col] = days[dayIdx]
    dayIdx++
    if (col === 6 || dayIdx === days.length) {
      weeks.push(currentWeek as WeekRow)
      currentWeek = new Array(7).fill(null)
      col = 0
    } else {
      col++
    }
  }

  return { year, month, label: `${year}年${month + 1}月`, weeks }
}

export function useHeatmapData(bills: Bill[], start: Date, end: Date): HeatmapData {
  return useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endClamped = end > today ? today : end

    if (start > endClamped) {
      return { months: [], dailyMap: {}, dailyCats: {}, maxDate: null, maxAmount: 0 }
    }

    const dailyMap: Record<string, number> = {}
    const dailyCats: Record<string, Record<string, number>> = {}
    const startStr = fmt(start)
    const endStr = fmt(endClamped)

    for (const b of bills) {
      if (b.date >= startStr && b.date <= endStr) {
        dailyMap[b.date] = (dailyMap[b.date] || 0) + b.amount
        const cat = getCategoryById(b.categoryId)
        if (!dailyCats[b.date]) dailyCats[b.date] = {}
        dailyCats[b.date][cat.name] = (dailyCats[b.date][cat.name] || 0) + b.amount
      }
    }

    // Find max day
    let maxDate: string | null = null
    let maxAmount = 0
    for (const [d, a] of Object.entries(dailyMap)) {
      if (a > maxAmount) { maxAmount = a; maxDate = d }
    }

    const streaks = computeStreaks(dailyMap)

    // Build month grids
    const months: MonthGrid[] = []
    let cur = new Date(start.getFullYear(), start.getMonth(), 1)
    const monthEnd = new Date(endClamped.getFullYear(), endClamped.getMonth(), 1)
    while (cur <= monthEnd) {
      months.push(buildMonthGrid(cur.getFullYear(), cur.getMonth(), start, endClamped, dailyMap, dailyCats, maxDate, streaks))
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
    }

    return { months, dailyMap, dailyCats, maxDate, maxAmount }
  }, [bills, start, end])
}
