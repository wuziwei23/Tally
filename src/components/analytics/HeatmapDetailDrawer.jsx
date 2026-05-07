import { useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getCategoryById } from '../../data/categories'
import { formatCurrency } from '../../utils/format'
import CategoryIcon from '../common/CategoryIcon'

export default function HeatmapDetailDrawer({ date, bills, onClose }) {
  useEffect(() => {
    if (!date) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [date])
  const dayBills = useMemo(() => {
    if (!date) return []
    return bills.filter(b => b.type === 'expense' && b.date === date)
  }, [date, bills])

  const total = useMemo(() => dayBills.reduce((s, b) => s + b.amount, 0), [dayBills])

  const catBreakdown = useMemo(() => {
    const map = {}
    for (const b of dayBills) {
      const cat = getCategoryById(b.categoryId)
      if (!map[cat.name]) map[cat.name] = { name: cat.name, color: cat.color, amount: 0 }
      map[cat.name].amount += b.amount
    }
    return Object.values(map).sort((a, b) => b.amount - a.amount)
  }, [dayBills])

  return createPortal(
    <AnimatePresence>
      {date && (
        <motion.div
          className="hm__drawer-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            className="hm__drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400, mass: 0.8 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="hm__drawer-handle" />
            <div className="hm__drawer-header">
              <h3 className="hm__drawer-date">{date}</h3>
              <span className="hm__drawer-total">¥{formatCurrency(total)}</span>
            </div>

            <div className="hm__drawer-body">
              {catBreakdown.length > 0 && (
                <div className="hm__drawer-cats">
                  {catBreakdown.map((c) => (
                    <div key={c.name} className="hm__drawer-cat">
                      <span className="hm__drawer-cat-dot" style={{ background: c.color }} />
                      <span className="hm__drawer-cat-name">{c.name}</span>
                      <span className="hm__drawer-cat-amt">¥{formatCurrency(c.amount)}</span>
                      <span className="hm__drawer-cat-pct">
                        {total > 0 ? ((c.amount / total) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {dayBills.length > 0 && (
                <div className="hm__drawer-bills">
                  <div className="hm__drawer-bills-title">账单明细</div>
                  {dayBills.map((b) => {
                    const cat = getCategoryById(b.categoryId)
                    return (
                      <div key={b.id} className="hm__drawer-bill">
                        <span className="hm__drawer-bill-icon">
                          {cat.iconComponent
                            ? <CategoryIcon categoryId={b.categoryId} size={20} color={cat.color} iconComponent={cat.iconComponent} />
                            : cat.icon
                          }
                        </span>
                        <div className="hm__drawer-bill-info">
                          <span className="hm__drawer-bill-cat">{cat.name}</span>
                          {b.note && <span className="hm__drawer-bill-note">{b.note}</span>}
                        </div>
                        <span className="hm__drawer-bill-amt">-¥{formatCurrency(b.amount)}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {dayBills.length === 0 && (
                <div className="hm__drawer-empty">当日无消费记录</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
