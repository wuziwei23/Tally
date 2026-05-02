import { HEAT_COLORS } from '../../hooks/useHeatmapData'

export default function HeatmapLegend() {
  return (
    <div className="hm__legend">
      <span className="hm__legend-label">少</span>
      {HEAT_COLORS.map((c, i) => (
        <span key={i} className="hm__legend-cell" style={{ background: c }} />
      ))}
      <span className="hm__legend-label">多</span>
    </div>
  )
}
