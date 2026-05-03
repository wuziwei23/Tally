import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBillStore } from '../store/useBillStore';
import { useBills } from '../hooks/useBill';
import { getCategoryById } from '../data/categories';
import { formatCurrency } from '../utils/format';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import HeatmapCard from '../components/analytics/HeatmapCard';
import './AnalyticsDetailPage.css';


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

// ── Bottom Sheet Picker ────────────────────────────────

function BottomSheet({ open, onClose, filter, onConfirm }) {
  const now = new Date();
  const CUR_YEAR = now.getFullYear();
  const CUR_MONTH = now.getMonth() + 1;
  const CUR_Q = Math.ceil(CUR_MONTH / 3);

  const [year, setYear] = useState(filter.year);
  const [month, setMonth] = useState(filter.month || CUR_MONTH);
  const [quarter, setQuarter] = useState(filter.quarter || CUR_Q);

  // Reset picker values when sheet opens
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setYear(filter.year);
      setMonth(filter.month || CUR_MONTH);
      setQuarter(filter.quarter || CUR_Q);
    }
    prevOpenRef.current = open;
  }, [open, filter.year, filter.month, filter.quarter, CUR_MONTH, CUR_Q]);

  const years = useMemo(() => {
    const arr = [];
    for (let y = CUR_YEAR + 1; y >= CUR_YEAR - 5; y--) arr.push(y);
    return arr;
  }, [CUR_YEAR]);

  const yearRef = useRef(null);
  const valRef = useRef(null);

  const scrollToSelected = useCallback((ref, index) => {
    if (ref.current) {
      const el = ref.current.children[index];
      if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, []);

  // Scroll to selected item when sheet opens
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      const yi = years.indexOf(filter.year);
      if (yi >= 0) scrollToSelected(yearRef, yi);
      if (filter.mode === 'month') {
        scrollToSelected(valRef, (filter.month || 1) - 1);
      } else if (filter.mode === 'quarter') {
        scrollToSelected(valRef, (filter.quarter || 1) - 1);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [open, filter.year, filter.mode, filter.month, filter.quarter, years, scrollToSelected]);

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

function CategoryBillDrawer({ category, bills, onClose }) {
  if (!category) return null;

  const total = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const sortedBills = [...bills].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="adet__cat-drawer-bg" onClick={onClose}>
      <div className="adet__cat-drawer" onClick={e => e.stopPropagation()}>
        <div className="adet__cat-drawer-handle" />
        <div className="adet__cat-drawer-header">
          <div className="adet__cat-drawer-title-wrap">
            <span className="adet__cat-drawer-dot" style={{ background: category.color }} />
            <div>
              <h3 className="adet__cat-drawer-title">{category.name}</h3>
              <p className="adet__cat-drawer-sub">本周期账单明细</p>
            </div>
          </div>
          <span className="adet__cat-drawer-total">¥{formatCurrency(total)}</span>
        </div>

        {sortedBills.length > 0 ? (
          <div className="adet__cat-drawer-bills">
            {sortedBills.map((bill, index) => (
              <div
                key={bill.id}
                className="adet__cat-drawer-bill"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div className="adet__cat-drawer-bill-date">
                  <span>{bill.date.slice(5)}</span>
                </div>
                <div className="adet__cat-drawer-bill-info">
                  <span className="adet__cat-drawer-bill-note">{bill.note || category.name}</span>
                  <span className="adet__cat-drawer-bill-meta">{bill.date}</span>
                </div>
                <span className="adet__cat-drawer-bill-amt">-¥{formatCurrency(bill.amount)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="adet__cat-drawer-empty">本周期暂无这个分类的账单</div>
        )}
      </div>
    </div>
  );
}

export default function AnalyticsDetailPage() {
  const bills = useBills();
  const navigate = useNavigate();
  const analyticsFilter = useBillStore(s => s.analyticsFilter);
  const setAnalyticsFilter = useBillStore(s => s.setAnalyticsFilter);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(null);

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

  const selectedCategoryDetail = useMemo(() => {
    if (!selectedCatId) return null;
    const { start, end } = filterDateRange(filter);
    const category = getCategoryById(selectedCatId);
    const categoryBills = bills.filter(
      b => b.type === 'expense' && b.categoryId === selectedCatId && inRange(b.date, start, end)
    );
    return { category, bills: categoryBills };
  }, [bills, filter, selectedCatId]);

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
                    <button
                      key={c.catId}
                      type="button"
                      className="adet__compare-item"
                      onClick={() => setSelectedCatId(c.catId)}
                    >
                      <span className="adet__compare-dot" style={{ background: c.color }} />
                      <span className="adet__compare-name">{c.name}</span>
                      <span className="adet__compare-cur">¥{formatCurrency(c.cur)}</span>
                      <span className={`adet__compare-change ${isFlat ? '' : isUp ? 'text-red' : 'text-green'}`}>
                        {isFlat ? '—' : `${isUp ? '+' : ''}${c.change.toFixed(0)}%`}
                      </span>
                    </button>
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
          <HeatmapCard />
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
        <CategoryBillDrawer
          category={selectedCategoryDetail?.category}
          bills={selectedCategoryDetail?.bills || []}
          onClose={() => setSelectedCatId(null)}
        />
      </div>
    </div>
  );
}
