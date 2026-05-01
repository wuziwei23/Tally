import { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBillStore } from '../store/useBillStore';
import { useBills } from '../hooks/useBill';
import { getCategoryById } from '../data/categories';
import { formatCurrency } from '../utils/format';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import './AnalyticsDetailPage.css';

const MODE_OPTIONS = [
  { label: '月', value: 'month' },
  { label: '季度', value: 'quarter' },
  { label: '年', value: 'year' },
];

const QUARTER_OPTIONS = [
  { value: 1, label: 'Q1 (1-3月)' },
  { value: 2, label: 'Q2 (4-6月)' },
  { value: 3, label: 'Q3 (7-9月)' },
  { value: 4, label: 'Q4 (10-12月)' },
];

const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

// ── Helpers ────────────────────────────────────────────

function fmt(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(a, b) {
  return Math.round((b - a) / 86400000);
}

function inRange(dateStr, start, end) {
  return dateStr >= fmt(start) && dateStr <= fmt(end);
}

function filterDateRange(filter) {
  let start, end;
  if (filter.mode === 'month') {
    start = new Date(filter.year, (filter.month || 1) - 1, 1);
    end = new Date(filter.year, filter.month || 1, 0);
  } else if (filter.mode === 'quarter') {
    const q = filter.quarter || 1;
    start = new Date(filter.year, (q - 1) * 3, 1);
    end = new Date(filter.year, q * 3, 0);
  } else {
    start = new Date(filter.year, 0, 1);
    end = new Date(filter.year, 11, 31);
  }
  return { start, end };
}

function prevDateRange(filter) {
  const { start: curStart, end: curEnd } = filterDateRange(filter);
  let prevStart, prevEnd;
  if (filter.mode === 'month') {
    const m = (filter.month || 1) - 1;
    prevStart = new Date(filter.year, m - 1, 1);
    prevEnd = new Date(filter.year, m, 0);
  } else if (filter.mode === 'quarter') {
    const q = filter.quarter || 1;
    if (q === 1) {
      prevStart = new Date(filter.year - 1, 9, 1);
      prevEnd = new Date(filter.year - 1, 12, 0);
    } else {
      prevStart = new Date(filter.year, (q - 2) * 3, 1);
      prevEnd = new Date(filter.year, (q - 1) * 3, 0);
    }
  } else {
    prevStart = new Date(filter.year - 1, 0, 1);
    prevEnd = new Date(filter.year - 1, 11, 31);
  }
  return { curStart, curEnd, prevStart, prevEnd };
}

function timeLabel(filter) {
  if (filter.mode === 'month') return `${filter.year}年${filter.month || 1}月`;
  if (filter.mode === 'quarter') return `${filter.year} Q${filter.quarter || 1}`;
  return `${filter.year}年`;
}

// ── Mode Selector ──────────────────────────────────────

const MODE_LABELS = ['月', '季度', '年'];
const MODE_VALUES = ['month', 'quarter', 'year'];

function ModeSelector({ value, onChange }) {
  const idx = MODE_VALUES.indexOf(value);
  return (
    <div className="adet__mode">
      <div className="adet__mode-pill" style={{ transform: `translateX(${idx * 100}%)` }} />
      {MODE_LABELS.map((label, i) => (
        <button
          key={MODE_VALUES[i]}
          className={`adet__mode-btn ${value === MODE_VALUES[i] ? 'adet__mode-btn--active' : ''}`}
          onClick={() => onChange(MODE_VALUES[i])}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Heatmap Section ────────────────────────────────────

const MONTH_NAMES_SHORT = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const DOW_LABELS = ['一', '二', '三', '四', '五', '六', '日'];
const HEAT_COLORS = ['#FFFDF8', '#F3D99B', '#F5C28A', '#EFB7BE', '#E96A5F'];

function heatLevel(amount) {
  if (amount <= 0) return 0;
  if (amount <= 50) return 1;
  if (amount <= 150) return 2;
  if (amount <= 300) return 3;
  return 4;
}

function HeatSection({ bills, filter }) {
  const [activeDay, setActiveDay] = useState(null);

  const { months, summary } = useMemo(() => {
    const { start, end } = filterDateRange(filter);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endClamped = end > today ? today : end;

    if (start > endClamped) {
      return { months: [], summary: null };
    }

    // Aggregate daily expenses + top category per day
    const expenseMap = {};
    const topCatMap = {};
    for (const b of bills) {
      if (b.type !== 'expense') continue;
      if (b.date >= fmt(start) && b.date <= fmt(endClamped)) {
        expenseMap[b.date] = (expenseMap[b.date] || 0) + b.amount;
        const cat = getCategoryById(b.categoryId);
        if (!topCatMap[b.date]) topCatMap[b.date] = {};
        topCatMap[b.date][cat.name] = (topCatMap[b.date][cat.name] || 0) + b.amount;
      }
    }

    // Summary stats
    const activeDays = Object.keys(expenseMap).length;
    let maxDay = null;
    let maxAmt = 0;
    for (const [d, a] of Object.entries(expenseMap)) {
      if (a > maxAmt) { maxAmt = a; maxDay = d; }
    }
    const totalExpense = Object.values(expenseMap).reduce((s, v) => s + v, 0);
    const avg = activeDays > 0 ? totalExpense / activeDays : 0;
    const sum = { activeDays, maxDay, maxAmount: maxAmt, avg };

    // Build calendar grids per month
    const monthList = [];
    let cur = new Date(start.getFullYear(), start.getMonth(), 1);
    const monthEnd = new Date(endClamped.getFullYear(), endClamped.getMonth(), 1);

    while (cur <= monthEnd) {
      const year = cur.getFullYear();
      const month = cur.getMonth();
      const firstOfMonth = new Date(year, month, 1);
      const lastOfMonth = new Date(year, month + 1, 0);
      const actualEnd = lastOfMonth > endClamped ? endClamped : lastOfMonth;
      const actualStart = firstOfMonth < start ? start : firstOfMonth;

      // Monday-based dow: 0=Mon ... 6=Sun
      const startDow = (actualStart.getDay() + 6) % 7;

      // Collect day cells
      const dayCells = {};
      const totalDays = daysBetween(actualStart, actualEnd) + 1;
      for (let i = 0; i < totalDays; i++) {
        const d = new Date(actualStart);
        d.setDate(d.getDate() + i);
        const ds = fmt(d);
        const amt = expenseMap[ds] || 0;
        const topCats = topCatMap[ds] ? Object.entries(topCatMap[ds]).sort((a, b) => b[1] - a[1]) : [];
        dayCells[i] = {
          day: d.getDate(),
          date: ds,
          amount: amt,
          level: heatLevel(amt),
          topCat: topCats.length > 0 ? topCats[0][0] : null,
        };
      }

      // Build week rows
      const weeks = [];
      let currentWeek = new Array(7).fill(null);

      // Fill leading empty cells
      for (let d = 0; d < startDow; d++) {
        currentWeek[d] = null;
      }

      // Place each day
      for (let i = 0; i < totalDays; i++) {
        const pos = (startDow + i) % 7;
        if (pos === 0 && i > 0) {
          weeks.push(currentWeek);
          currentWeek = new Array(7).fill(null);
        }
        currentWeek[pos] = dayCells[i];
      }
      // Push last week and pad trailing nulls
      weeks.push(currentWeek);

      monthList.push({
        year,
        month,
        label: `${year}年${month + 1}月`,
        weeks,
      });

      cur = new Date(year, month + 1, 1);
    }

    return { months: monthList, summary: sum };
  }, [bills, filter]);

  if (months.length === 0) {
    return <div className="adet__empty">暂无热力数据</div>;
  }

  return (
    <div className="adet__card">
      {/* Summary bar */}
      <div className="adet__heat-summary">
        <div className="adet__heat-stat">
          <span className="adet__heat-stat-val">{summary.activeDays}</span>
          <span className="adet__heat-stat-lbl">活跃天数</span>
        </div>
        <div className="adet__heat-stat">
          <span className="adet__heat-stat-val">{summary.maxDay ? summary.maxDay.slice(5) : '—'}</span>
          <span className="adet__heat-stat-lbl">最高消费日</span>
        </div>
        <div className="adet__heat-stat">
          <span className="adet__heat-stat-val">¥{formatCurrency(summary.avg)}</span>
          <span className="adet__heat-stat-lbl">日均消费</span>
        </div>
      </div>

      {/* Calendar months */}
      <div className="adet__cal-scroll">
        {months.map((m, mi) => (
          <div key={mi} className="adet__cal-month">
            <div className="adet__cal-month-title">{m.label}</div>

            {/* DOW header */}
            <div className="adet__cal-grid">
              {DOW_LABELS.map((lbl, di) => (
                <div key={di} className="adet__cal-dow">{lbl}</div>
              ))}

              {/* Day cells */}
              {m.weeks.map((week, wi) =>
                week.map((cell, ci) => (
                  <div
                    key={`${wi}-${ci}`}
                    className={`adet__cal-cell ${cell ? 'adet__cal-cell--day' : 'adet__cal-cell--empty'} ${cell && activeDay === cell.date ? 'adet__cal-cell--active' : ''}`}
                    style={cell ? { background: HEAT_COLORS[cell.level] } : undefined}
                    onClick={() => cell && setActiveDay(activeDay === cell.date ? null : cell.date)}
                  >
                    {cell && <span className="adet__cal-num">{cell.day}</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="adet__heat-legend">
        <span className="adet__heat-legend-label">少</span>
        {HEAT_COLORS.map((c, i) => (
          <span key={i} className="adet__heat-legend-cell" style={{ background: c }} />
        ))}
        <span className="adet__heat-legend-label">多</span>
      </div>

      {/* Detail on tap */}
      {activeDay && (
        <div className="adet__heat-detail">
          <span className="adet__heat-detail-date">{activeDay}</span>
          {(() => {
            const amt = bills
              .filter(b => b.type === 'expense' && b.date === activeDay)
              .reduce((s, b) => s + b.amount, 0);
            const cats = bills
              .filter(b => b.type === 'expense' && b.date === activeDay)
              .reduce((m, b) => { const c = getCategoryById(b.categoryId); m[c.name] = (m[c.name] || 0) + b.amount; return m; }, {});
            const topCat = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
            return (
              <>
                <span className="adet__heat-detail-amt">¥{formatCurrency(amt)}</span>
                <span className="adet__heat-detail-cat">{topCat ? topCat[0] : '无消费'}</span>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ── Bottom Sheet Picker ────────────────────────────────

function BottomSheet({ open, onClose, filter, onConfirm }) {
  const now = new Date();
  const CUR_YEAR = now.getFullYear();
  const CUR_MONTH = now.getMonth() + 1;
  const CUR_Q = Math.ceil(CUR_MONTH / 3);

  const [year, setYear] = useState(filter.year);
  const [month, setMonth] = useState(filter.month || CUR_MONTH);
  const [quarter, setQuarter] = useState(filter.quarter || CUR_Q);

  // Reset when opening
  const [prevOpen, setPrevOpen] = useState(false);
  if (open && !prevOpen) {
    setPrevOpen(true);
    setYear(filter.year);
    setMonth(filter.month || CUR_MONTH);
    setQuarter(filter.quarter || CUR_Q);
  }
  if (!open && prevOpen) setPrevOpen(false);

  const years = useMemo(() => {
    const arr = [];
    for (let y = CUR_YEAR + 1; y >= CUR_YEAR - 5; y--) arr.push(y);
    return arr;
  }, []);

  const yearRef = useRef(null);
  const valRef = useRef(null);

  const scrollToSelected = useCallback((ref, index) => {
    if (ref.current) {
      const el = ref.current.children[index];
      if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, []);

  // Scroll on open
  const [scrolled, setScrolled] = useState(false);
  if (open && !scrolled) {
    setScrolled(true);
    setTimeout(() => {
      const yi = years.indexOf(filter.year);
      if (yi >= 0) scrollToSelected(yearRef, yi);
      if (filter.mode === 'month') {
        scrollToSelected(valRef, (filter.month || 1) - 1);
      } else if (filter.mode === 'quarter') {
        scrollToSelected(valRef, (filter.quarter || 1) - 1);
      }
    }, 100);
  }
  if (!open && scrolled) setScrolled(false);

  function handleConfirm() {
    if (filter.mode === 'month') onConfirm({ mode: 'month', year, month });
    else if (filter.mode === 'quarter') onConfirm({ mode: 'quarter', year, quarter });
    else onConfirm({ mode: 'year', year });
    onClose();
  }

  if (!open) return null;

  return (
    <div className="adet__sheet-bg" onClick={onClose}>
      <div className="adet__sheet" onClick={e => e.stopPropagation()}>
        <div className="adet__sheet-handle" />
        <h3 className="adet__sheet-title">
          {filter.mode === 'month' ? '选择月份' : filter.mode === 'quarter' ? '选择季度' : '选择年份'}
        </h3>

        <div className="adet__picker-row">
          {/* Year picker */}
          <div className="adet__picker">
            <div className="adet__picker-label">年份</div>
            <div className="adet__picker-scroll" ref={yearRef}>
              <div className="adet__picker-spacer" />
              {years.map(y => (
                <div
                  key={y}
                  className={`adet__picker-item ${y === year ? 'adet__picker-item--active' : ''}`}
                  onClick={() => setYear(y)}
                >
                  {y}年
                </div>
              ))}
              <div className="adet__picker-spacer" />
            </div>
          </div>

          {/* Month / Quarter picker */}
          {filter.mode === 'month' && (
            <div className="adet__picker">
              <div className="adet__picker-label">月份</div>
              <div className="adet__picker-scroll" ref={valRef}>
                <div className="adet__picker-spacer" />
                {MONTH_NAMES.map((name, i) => (
                  <div
                    key={i}
                    className={`adet__picker-item ${(i + 1) === month ? 'adet__picker-item--active' : ''}`}
                    onClick={() => setMonth(i + 1)}
                  >
                    {name}
                  </div>
                ))}
                <div className="adet__picker-spacer" />
              </div>
            </div>
          )}

          {filter.mode === 'quarter' && (
            <div className="adet__picker">
              <div className="adet__picker-label">季度</div>
              <div className="adet__picker-scroll" ref={valRef}>
                <div className="adet__picker-spacer" />
                {QUARTER_OPTIONS.map(q => (
                  <div
                    key={q.value}
                    className={`adet__picker-item ${q.value === quarter ? 'adet__picker-item--active' : ''}`}
                    onClick={() => setQuarter(q.value)}
                  >
                    {q.label}
                  </div>
                ))}
                <div className="adet__picker-spacer" />
              </div>
            </div>
          )}
        </div>

        <button className="adet__sheet-confirm" onClick={handleConfirm}>
          确认
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────

export default function AnalyticsDetailPage() {
  const bills = useBills();
  const navigate = useNavigate();
  const analyticsFilter = useBillStore(s => s.analyticsFilter);
  const setAnalyticsFilter = useBillStore(s => s.setAnalyticsFilter);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filter = analyticsFilter;

  function handleModeChange(mode) {
    const now = new Date();
    if (mode === 'month') {
      setAnalyticsFilter({ mode, year: now.getFullYear(), month: now.getMonth() + 1 });
    } else if (mode === 'quarter') {
      setAnalyticsFilter({ mode, year: now.getFullYear(), quarter: Math.ceil((now.getMonth() + 1) / 3) });
    } else {
      setAnalyticsFilter({ mode, year: now.getFullYear() });
    }
  }

  function handleNav(delta) {
    if (filter.mode === 'month') {
      let m = (filter.month || 1) + delta;
      let y = filter.year;
      if (m < 1) { m = 12; y--; }
      if (m > 12) { m = 1; y++; }
      setAnalyticsFilter({ year: y, month: m });
    } else if (filter.mode === 'quarter') {
      let q = (filter.quarter || 1) + delta;
      let y = filter.year;
      if (q < 1) { q = 4; y--; }
      if (q > 4) { q = 1; y++; }
      setAnalyticsFilter({ year: y, quarter: q });
    } else {
      setAnalyticsFilter({ year: filter.year + delta });
    }
  }

  // ── Section 1: Trend ────────────────────────────────
  const trendData = useMemo(() => {
    const { start, end } = filterDateRange(filter);
    const expenses = bills.filter(b => b.type === 'expense' && inRange(b.date, start, end));
    const map = {};
    for (const b of expenses) {
      map[b.date] = (map[b.date] || 0) + b.amount;
    }
    const days = daysBetween(start, end) + 1;
    if (days > 366) return [];
    const result = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const ds = fmt(d);
      result.push({
        date: ds,
        amount: map[ds] || 0,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
      });
    }
    return result;
  }, [bills, filter]);

  // ── Section 2: Pie ──────────────────────────────────
  const pieData = useMemo(() => {
    const { start, end } = filterDateRange(filter);
    const filtered = bills.filter(b => b.type === 'expense' && inRange(b.date, start, end));
    const map = {};
    for (const b of filtered) {
      map[b.categoryId] = (map[b.categoryId] || 0) + b.amount;
    }
    return Object.entries(map)
      .map(([catId, value]) => {
        const cat = getCategoryById(catId);
        return { name: cat.name, value, color: cat.color, catId };
      })
      .sort((a, b) => b.value - a.value);
  }, [bills, filter]);

  const pieTotal = useMemo(() => pieData.reduce((s, d) => s + d.value, 0), [pieData]);

  // ── Section 3: Compare ──────────────────────────────
  const catCompare = useMemo(() => {
    const { curStart, curEnd, prevStart, prevEnd } = prevDateRange(filter);
    const curMap = {};
    const prevMap = {};
    for (const b of bills) {
      if (b.type !== 'expense') continue;
      if (inRange(b.date, curStart, curEnd)) {
        curMap[b.categoryId] = (curMap[b.categoryId] || 0) + b.amount;
      }
      if (inRange(b.date, prevStart, prevEnd)) {
        prevMap[b.categoryId] = (prevMap[b.categoryId] || 0) + b.amount;
      }
    }
    const allCats = new Set([...Object.keys(curMap), ...Object.keys(prevMap)]);
    const result = [];
    for (const catId of allCats) {
      const cur = curMap[catId] || 0;
      const prev = prevMap[catId] || 0;
      let change = 0;
      if (prev > 0) change = ((cur - prev) / prev) * 100;
      else if (cur > 0) change = 100;
      const cat = getCategoryById(catId);
      result.push({ catId, name: cat.name, color: cat.color, cur, prev, change });
    }
    return result.sort((a, b) => b.cur - a.cur);
  }, [bills, filter]);

  // ── Section 4: Heatmap (computed by HeatSection) ─────

  // ── Section 5: AI Summary ───────────────────────────
  const aiSummary = useMemo(() => {
    if (pieData.length === 0) return null;
    const total = pieData.reduce((s, d) => s + d.value, 0);
    const top = pieData[0];
    const topPct = ((top.value / total) * 100).toFixed(0);
    const insights = [];

    insights.push(`本周期总支出 ¥${formatCurrency(total)}，共涉及 ${pieData.length} 个分类。`);

    if (pieData.length >= 2) {
      const second = pieData[1];
      const secondPct = ((second.value / total) * 100).toFixed(0);
      insights.push(`${top.name}支出占比最高（${topPct}%），其次是${second.name}（${secondPct}%）。`);
    } else {
      insights.push(`${top.name}支出占比 ${topPct}%。`);
    }

    if (catCompare.length > 0) {
      const biggestIncrease = [...catCompare].filter(c => c.change > 0).sort((a, b) => b.change - a.change)[0];
      const biggestDecrease = [...catCompare].filter(c => c.change < 0).sort((a, b) => a.change - b.change)[0];
      if (biggestIncrease) {
        insights.push(`${biggestIncrease.name}支出较上周期增长 ${biggestIncrease.change.toFixed(0)}%，建议关注。`);
      }
      if (biggestDecrease) {
        insights.push(`${biggestDecrease.name}支出下降 ${Math.abs(biggestDecrease.change).toFixed(0)}%，继续保持。`);
      }
    }

    if (parseFloat(topPct) > 40) {
      insights.push(`${top.name}支出占比较高，建议持续关注固定成本。`);
    }

    return insights;
  }, [pieData, catCompare]);

  const hasAnyData = trendData.some(d => d.amount > 0);

  return (
    <div className="page page--no-tabbar page-enter">
      <div className="adet">
        {/* Header */}
        <div className="adet__header">
          <button className="adet__back" onClick={() => navigate('/charts')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <h1 className="adet__title">分析详情</h1>
          <div style={{ width: 36 }} />
        </div>

        {/* Dual Selector */}
        <div className="adet__controls">
          <div className="adet__mode-wrap">
            <ModeSelector value={filter.mode} onChange={handleModeChange} />
          </div>
          <div className="adet__time-nav">
            <button className="adet__nav-btn" onClick={() => handleNav(-1)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button className="adet__time-btn" onClick={() => setSheetOpen(true)}>
              {timeLabel(filter)}
            </button>
            <button className="adet__nav-btn" onClick={() => handleNav(1)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Section 1: Trend */}
        <div className="adet__section adet__section--fade">
          <h2 className="adet__section-title">
            <span className="adet__section-icon" style={{ background: '#EFB7BE' }}></span>
            消费趋势
          </h2>
          {trendData.length === 0 || !hasAnyData ? (
            <div className="adet__empty">暂无消费数据</div>
          ) : (
            <div className="adet__card">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#8C847C' }}
                    axisLine={{ stroke: '#E5E0DA' }}
                    tickLine={false}
                    interval={Math.max(0, Math.floor(trendData.length / 8))}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#8C847C' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                  />
                  <Tooltip
                    formatter={v => [`¥${formatCurrency(v)}`, '支出']}
                    labelFormatter={l => l}
                    contentStyle={{
                      borderRadius: 14,
                      border: '3px solid #222',
                      boxShadow: '3px 3px 0 rgba(0,0,0,0.1)',
                      fontSize: 13,
                      background: '#FFFDF8',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#E96A5F"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5, fill: '#E96A5F', stroke: '#222', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Section 2: Pie */}
        <div className="adet__section adet__section--fade">
          <h2 className="adet__section-title">
            <span className="adet__section-icon" style={{ background: '#DDECCB' }}></span>
            支出结构
          </h2>
          {pieData.length === 0 ? (
            <div className="adet__empty">暂无支出数据</div>
          ) : (
            <div className="adet__card">
              <div className="adet__pie-row">
                <div className="adet__pie-wrap">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={72}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="#222"
                        strokeWidth={2}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={v => [`¥${formatCurrency(v)}`, '金额']}
                        contentStyle={{
                          borderRadius: 14,
                          border: '3px solid #222',
                          boxShadow: '3px 3px 0 rgba(0,0,0,0.1)',
                          fontSize: 13,
                          background: '#FFFDF8',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="adet__pie-legend">
                  {pieData.slice(0, 6).map(d => (
                    <div key={d.catId} className="adet__legend-item">
                      <span className="adet__legend-dot" style={{ background: d.color }} />
                      <span className="adet__legend-name">{d.name}</span>
                      <span className="adet__legend-pct">
                        {pieTotal > 0 ? ((d.value / pieTotal) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Compare */}
        <div className="adet__section adet__section--fade">
          <h2 className="adet__section-title">
            <span className="adet__section-icon" style={{ background: '#F3D99B' }}></span>
            分类变化
          </h2>
          {catCompare.length === 0 ? (
            <div className="adet__empty">暂无对比数据</div>
          ) : (
            <div className="adet__card">
              <div className="adet__compare-list">
                {catCompare.map(c => {
                  const isUp = c.change > 0;
                  const isFlat = c.change === 0;
                  return (
                    <div key={c.catId} className="adet__compare-item">
                      <span className="adet__compare-dot" style={{ background: c.color }} />
                      <span className="adet__compare-name">{c.name}</span>
                      <span className="adet__compare-cur">¥{formatCurrency(c.cur)}</span>
                      <span className={`adet__compare-change ${isFlat ? '' : isUp ? 'text-red' : 'text-green'}`}>
                        {isFlat ? '—' : `${isUp ? '+' : ''}${c.change.toFixed(0)}%`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Heatmap */}
        <div className="adet__section adet__section--fade">
          <h2 className="adet__section-title">
            <span className="adet__section-icon" style={{ background: '#F5C28A' }}></span>
            消费热力
          </h2>
          <HeatSection bills={bills} filter={filter} />
        </div>

        {/* Section 5: AI Summary */}
        <div className="adet__section adet__section--fade">
          <h2 className="adet__section-title">
            <span className="adet__section-icon" style={{ background: '#DDECCB' }}></span>
            智能总结
          </h2>
          {!aiSummary ? (
            <div className="adet__empty">暂无数据，记录后将自动生成总结</div>
          ) : (
            <div className="adet__card adet__ai-card">
              <div className="adet__ai-badge">AI</div>
              <div className="adet__ai-body">
                {aiSummary.map((line, i) => (
                  <p key={i} className="adet__ai-line">{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Sheet */}
        <BottomSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          filter={filter}
          onConfirm={setAnalyticsFilter}
        />
      </div>
    </div>
  );
}
