import { useMemo } from 'react'
import type { Bill } from '../types'
import { getCategoryById } from '../data/categories'
import type { HeatmapData } from './useHeatmapData'

export interface HeatmapSummary {
  totalExpense: number
  activeDays: number
  avgDaily: number
  maxDate: string | null
  maxAmount: number
  maxTopCat: string | null
  longestStreak: number
  topCats: { name: string; color: string; amount: number; pct: number }[]
  insight: string
}

export function useHeatmapSummary(bills: Bill[], data: HeatmapData): HeatmapSummary {
  return useMemo(() => {
    const { dailyMap, dailyCats, maxDate, maxAmount } = data
    const activeDays = Object.keys(dailyMap).length
    const totalExpense = Object.values(dailyMap).reduce((s, v) => s + v, 0)
    const avgDaily = activeDays > 0 ? totalExpense / activeDays : 0

    // Max day top category
    let maxTopCat: string | null = null
    if (maxDate && dailyCats[maxDate]) {
      const sorted = Object.entries(dailyCats[maxDate]).sort((a, b) => b[1] - a[1])
      maxTopCat = sorted.length > 0 ? sorted[0][0] : null
    }

    // Longest streak
    const dates = Object.keys(dailyMap).sort()
    let longest = 0
    let run = 0
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) { run = 1 } else {
        const diff = (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / 86400000
        run = diff === 1 ? run + 1 : 1
      }
      if (run > longest) longest = run
    }

    // Top categories
    const catTotals: Record<string, { amount: number; color: string }> = {}
    for (const b of bills) {
      if (b.type !== 'expense') continue
      const cat = getCategoryById(b.categoryId)
      if (!catTotals[cat.name]) catTotals[cat.name] = { amount: 0, color: cat.color }
      catTotals[cat.name].amount += b.amount
    }
    const topCats = Object.entries(catTotals)
      .map(([name, { amount, color }]) => ({ name, color, amount, pct: totalExpense > 0 ? (amount / totalExpense) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3)

    // Insight
    let insight = ''
    if (totalExpense === 0) {
      insight = '暂无消费数据，记录后将自动生成分析。'
    } else if (topCats.length > 0) {
      insight = `${topCats[0].name}是最大支出项，占比 ${topCats[0].pct.toFixed(0)}%`
      if (topCats.length >= 2) {
        insight += `，其次是${topCats[1].name}（${topCats[1].pct.toFixed(0)}%）`
      }
      insight += `。`
      if (longest >= 3) {
        insight += `连续消费最长 ${longest} 天。`
      }
    }

    return { totalExpense, activeDays, avgDaily, maxDate, maxAmount, maxTopCat, longestStreak: longest, topCats, insight }
  }, [bills, data])
}
