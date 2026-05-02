import { motion } from 'framer-motion'
import { HEAT_COLORS, DOW_LABELS } from '../../hooks/useHeatmapData'

export default function MonthHeatmap({ months, selectedDate, onSelect }) {
  if (months.length === 0) return null

  return (
    <>
      {months.map((m, mi) => (
        <div key={mi} className="hm__cal-month">
          <div className="hm__cal-month-title">{m.label}</div>
          <div className="hm__cal-grid">
            {DOW_LABELS.map((lbl, di) => (
              <div key={di} className="hm__cal-dow">{lbl}</div>
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
                    className={`hm__cal-cell hm__cal-cell--day ${isActive ? 'hm__cal-cell--active' : ''}`}
                    style={{ background: HEAT_COLORS[cell.level] }}
                    onClick={() => onSelect(cell.date)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (wi * 7 + ci) * 0.01, duration: 0.25 }}
                  >
                    <span className="hm__cal-num">{cell.day}</span>
                    {cell.isMax && <span className="hm__cal-crown" title="最高消费日">👑</span>}
                    {cell.isStreak && !cell.isMax && <span className="hm__cal-flame" title="连续消费"> </span>}
                  </motion.div>
                )
              })
            )}
          </div>
        </div>
      ))}
    </>
  )
}
