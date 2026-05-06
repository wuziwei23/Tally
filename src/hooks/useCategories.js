import { useState, useCallback } from 'react'
import { expenseCategories as defaultExpense, incomeCategories as defaultIncome } from '../data/categories'
import { ICON_MAP } from '../data/iconMap'
import { useBillStore } from '../store/useBillStore'
import { categoryRepo } from '../database'

function resolveIcon(cat) {
  return {
    ...cat,
    iconComponent: ICON_MAP[cat.icon] || null,
  }
}

export function useCategories() {
  const [customCategories, setCustomCategories] = useState(() => categoryRepo.findAll())

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
    const newCat = categoryRepo.saveCategory({
      name,
      icon,
      type,
      color,
    })
    setCustomCategories(prev => [...prev, newCat])
  }, [])

  const deleteCategory = useCallback((catId) => {
    const target = categoryRepo.findAll().find(c => c.id === catId)
    if (!target) return

    categoryRepo.deleteCategory(catId)

    const fallbackId = target.type === 'expense' ? 'other_expense' : 'other_income'
    const { bills, updateBill } = useBillStore.getState()
    for (const b of bills) {
      if (b.categoryId === catId) {
        updateBill(b.id, { categoryId: fallbackId })
      }
    }

    setCustomCategories(prev => prev.filter(c => c.id !== catId))
  }, [])

  return { expenseCategories, incomeCategories, addCategory, deleteCategory }
}
