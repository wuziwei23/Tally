import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HEAT_COLORS, DOW_LABELS } from '../../hooks/useHeatmapData'

export default function YearHeatmap({ months, selectedDate, onSelect }) {
  const [expanded, setExpanded] = useState(null)

  if (months.length === 0) return null

  return (
    <div className="hm__year-grid">
      {months.map((m, mi) => {
        const isExpanded = expanded === mi
        return (
          <motion.div
            key={mi}
            className={`hm__year-card ${isExpanded ? 'hm__year-card--expanded' : ''}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: mi * 0.04, duration: 0.3 }}
            layout
          >
            <div
              className="hm__year-card-title"
              onClick={() => setExpanded(isExpanded ? null : mi)}
            >
              {m.month + 1}月
              {isExpanded ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              )}
            </div>

            {!isExpanded && (
              <div className="hm__year-mini-dots">
                {m.weeks.flat().map((cell, i) => (
                  cell ? (
                    <div
                      key={i}
                      className="hm__year-dot"
                      style={{ background: HEAT_COLORS[cell.level] }}
                    />
                  ) : (
                    <div key={i} className="hm__year-dot hm__year-dot--empty" />
                  )
                ))}
              </div>
            )}

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="hm__cal-grid">
                    {DOW_LABELS.map((lbl, di) => (
                      <div key={di} className="hm__cal-dow hm__cal-dow--mini">{lbl}</div>
                    ))}
                    {m.weeks.map((week, wi) =>
                      week.map((cell, ci) => {
                        if (!cell) {
                          return <div key={`${wi}-${ci}`} className="hm__cal-cell hm__cal-cell--empty" />
                        }
                        const isActive = selectedDate === cell.date
                        return (
                          <motion.div
                            key={cell.date}
                            className={`hm__cal-cell hm__cal-cell--quarter ${isActive ? 'hm__cal-cell--active' : ''}`}
                            style={{ background: HEAT_COLORS[cell.level] }}
                            onClick={() => onSelect(cell.date)}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: (wi * 7 + ci) * 0.006, duration: 0.2 }}
                            whileHover={{ scale: 1.12 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <span className="hm__cal-num hm__cal-num--mini">{cell.day}</span>
                            {cell.isMax && <span className="hm__cal-crown hm__cal-crown--mini">👑</span>}
                          </motion.div>
                        )
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}
