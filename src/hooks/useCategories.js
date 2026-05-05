import { useState, useCallback } from 'react'
import { expenseCategories as defaultExpense, incomeCategories as defaultIncome } from '../data/categories'
import { ICON_MAP } from '../data/iconMap'

const STORAGE_KEY = 'custom_categories'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function saveToStorage(categories) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
  } catch {}
}

function resolveIcon(cat) {
  return {
    ...cat,
    iconComponent: ICON_MAP[cat.icon] || null,
  }
}

export function useCategories() {
  const [customCategories, setCustomCategories] = useState(loadFromStorage)

  const customExpense = customCategories.filter(c => c.type === 'expense')
  const customIncome = customCategories.filter(c => c.type === 'income')

  const expenseCategories = [
    ...defaultExpense,
    ...customExpense.map(resolveIcon),
  ]
  const incomeCategories = [
    ...defaultIncome,
    ...customIncome.map(resolveIcon),
  ]

  const addCategory = useCallback(({ name, icon, color, type }) => {
    const newCat = {
      id: 'custom_' + Date.now(),
      name,
      icon,
      type,
      color,
      isCustom: true,
      createdAt: new Date().toISOString(),
    }
    setCustomCategories(prev => {
      const next = [...prev, newCat]
      saveToStorage(next)
      return next
    })
  }, [])

  return { expenseCategories, incomeCategories, addCategory }
}
