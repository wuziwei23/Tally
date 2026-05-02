import { motion } from 'framer-motion'
import { formatCurrency } from '../../utils/format'

export default function HeatmapSummary({ summary }) {
  return (
    <motion.div
      className="hm__summary"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="hm__summary-stat">
        <span className="hm__summary-val">{summary.activeDays}</span>
        <span className="hm__summary-lbl">活跃天数</span>
      </div>
      <div className="hm__summary-stat">
        <span className="hm__summary-val">{summary.maxDate ? summary.maxDate.slice(5) : '—'}</span>
        <span className="hm__summary-lbl">最高消费日</span>
      </div>
      <div className="hm__summary-stat">
        <span className="hm__summary-val">¥{formatCurrency(summary.avgDaily)}</span>
        <span className="hm__summary-lbl">日均消费</span>
      </div>
    </motion.div>
  )
}
