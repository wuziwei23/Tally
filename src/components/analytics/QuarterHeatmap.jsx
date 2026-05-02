import { motion } from 'framer-motion'
import { HEAT_COLORS, DOW_LABELS, heatLevel } from '../../hooks/useHeatmapData'
import { formatCurrency } from '../../utils/format'

export default function QuarterHeatmap({ months, selectedDate, onSelect }) {
  if (months.length === 0) return null

  return (
    <div className="hm__quarter-grid">
      {months.map((m, mi) => (
        <motion.div
          key={mi}
          className="hm__quarter-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: mi * 0.1, duration: 0.35 }}
        >
          <div className="hm__quarter-card-title">{m.label}</div>
          <div className="hm__cal-grid hm__cal-grid--quarter">
            {DOW_LABELS.map((lbl, di) => (
              <div key={di} className="hm__cal-dow hm__cal-dow--mini">{lbl}</div>
            ))}
            {m.weeks.map((week, wi) =>
              week.map((cell, ci) => {
                if (!cell) {
                  return <div key={`${wi}-${ci}`} className="hm__cal-cell hm__cal-cell--quarter-empty" />
                }
                const isActive = selectedDate === cell.date
                return (
                  <motion.div
                    key={cell.date}
                    className={`hm__cal-cell hm__cal-cell--quarter ${isActive ? 'hm__cal-cell--active' : ''}`}
                    style={{ background: HEAT_COLORS[cell.level] }}
                    onClick={() => onSelect(cell.date)}
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <span className="hm__cal-num hm__cal-num--mini">{cell.day}</span>
                    {cell.isMax && <span className="hm__cal-crown hm__cal-crown--mini">👑</span>}
                    {cell.isStreak && !cell.isMax && <span className="hm__cal-flame hm__cal-flame--mini"> </span>}
                  </motion.div>
                )
              })
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
