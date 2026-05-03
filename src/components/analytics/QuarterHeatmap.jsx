import { useState } from 'react'
import { motion } from 'framer-motion'
import { HEAT_COLORS, DOW_LABELS } from '../../hooks/useHeatmapData'

const spring = { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 }

export default function QuarterHeatmap({ months, selectedDate, onSelect }) {
  const [expanded, setExpanded] = useState(null)

  if (months.length === 0) return null

  return (
    <div className="hm__quarter-stack" layout>
      {months.map((m, mi) => {
        const isExpanded = expanded === mi
        return (
          <motion.div
            key={mi}
            className={`hm__quarter-card ${isExpanded ? 'hm__quarter-card--expanded' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: mi * 0.08 }}
            layout
            style={{ overflow: 'hidden', transformOrigin: 'top center', willChange: 'transform, opacity', backfaceVisibility: 'hidden' }}
          >
            <div
              className="hm__quarter-card-title"
              onClick={() => setExpanded(isExpanded ? null : mi)}
            >
              {m.label}
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

            <motion.div
              className="hm__mini-cal"
              animate={{ opacity: isExpanded ? 0 : 1 }}
              transition={{ duration: 0.15 }}
              style={{ display: isExpanded ? 'none' : undefined }}
            >
              <div className="hm__mini-cal-dow">
                {DOW_LABELS.map((lbl, di) => (
                  <span key={di} className="hm__mini-cal-dow-lbl">{lbl}</span>
                ))}
              </div>
              <div className="hm__mini-cal-grid">
                {m.weeks.map((week, wi) =>
                  week.map((cell, ci) => (
                    <div
                      key={`${wi}-${ci}`}
                      className={`hm__mini-cal-cell ${cell ? '' : 'hm__mini-cal-cell--empty'}`}
                      style={cell ? { background: HEAT_COLORS[cell.level] } : undefined}
                    />
                  ))
                )}
              </div>
            </motion.div>

            {isExpanded && (
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
                        transition={{ ...spring, delay: 0.03 + (wi * 7 + ci) * 0.008 }}
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <span className="hm__cal-num hm__cal-num--mini">{cell.day}</span>
                        {cell.isMax && <span className="hm__cal-crown hm__cal-crown--mini">👑</span>}
                        {cell.isStreak && !cell.isMax && <span className="hm__cal-flame hm__cal-flame--mini"> </span>}
                      </motion.div>
                    )
                  })
                )}
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
