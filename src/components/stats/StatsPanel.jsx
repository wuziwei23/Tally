import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getCategoryById } from '../../data/categories';
import { formatCurrency } from '../../utils/format';
import CategoryIcon from '../common/CategoryIcon';
import './StatsPanel.css';

function filterByPeriod(txns, period) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  return txns.filter(t => {
    const d = new Date(t.date + 'T00:00:00');
    if (period === 'month') return d.getFullYear() === y && d.getMonth() === m;
    if (period === 'quarter') {
      const cq = Math.floor(m / 3);
      const tq = Math.floor(d.getMonth() / 3);
      return d.getFullYear() === y && tq === cq;
    }
    return d.getFullYear() === y;
  });
}

export default function StatsPanel({ transactions, type, period }) {
  const isBalance = type === 'balance';

  const filtered = useMemo(() => {
    const byPeriod = filterByPeriod(transactions, period);
    if (isBalance) return byPeriod;
    return byPeriod.filter(t => t.type === type);
  }, [transactions, type, period, isBalance]);

  const { total, incomeTotal, expenseTotal } = useMemo(() => {
    let income = 0, expense = 0;
    for (const t of filtered) {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    }
    return { total: isBalance ? income - expense : (type === 'income' ? income : expense), incomeTotal: income, expenseTotal: expense };
  }, [filtered, type, isBalance]);

  const byCat = useMemo(() => {
    const map = {};
    for (const t of filtered) {
      if (!map[t.categoryId]) map[t.categoryId] = 0;
      map[t.categoryId] += t.amount;
    }
    const absTotal = Object.values(map).reduce((s, v) => s + v, 0);
    return Object.entries(map)
      .map(([catId, amount]) => {
        const cat = getCategoryById(catId);
        return { name: cat.name, catId, color: cat.color, iconComponent: cat.iconComponent, amount, pct: absTotal > 0 ? ((amount / absTotal) * 100).toFixed(0) : 0 };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  const pieData = byCat.map(c => ({ name: c.name, value: c.amount, color: c.color }));

  if (filtered.length === 0) return null;

  const totalLabel = isBalance ? '总余额' : (type === 'income' ? '总收入' : '总支出');
  const colorClass = isBalance ? (total >= 0 ? 'text-green' : 'text-red') : (type === 'income' ? 'text-green' : 'text-red');

  return (
    <div className="sp">
      {/* Total */}
      <div className="sp__total">
        <span className="sp__total-label">{totalLabel}</span>
        <span className={`sp__total-value ${colorClass}`}>¥{formatCurrency(Math.abs(total))}</span>
        <span className="sp__total-count">共 {filtered.length} 笔</span>
        {isBalance && (
          <div className="sp__balance-row">
            <span className="text-green">收入 ¥{formatCurrency(incomeTotal)}</span>
            <span className="sp__balance-sep">/</span>
            <span className="text-red">支出 ¥{formatCurrency(expenseTotal)}</span>
          </div>
        )}
      </div>

      {/* Pie Chart */}
      {!isBalance && pieData.length > 0 && (
        <div className="sp__pie-card">
          <h3 className="sp__section-title">分类占比</h3>
          <div className="sp__pie-row">
            <div className="sp__pie-wrap">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={3} dataKey="value" stroke="none">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="sp__pie-legend">
              {byCat.slice(0, 5).map(c => (
                <div key={c.name} className="sp__legend-item">
                  <span className="sp__legend-dot" style={{ background: c.color }} />
                  <span className="sp__legend-name">{c.name}</span>
                  <span className="sp__legend-pct">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category Ranking */}
      {!isBalance && byCat.length > 0 && (
        <div className="sp__rank-card">
          <h3 className="sp__section-title">分类排行</h3>
          <div className="sp__rank-list">
            {byCat.map((c, i) => (
              <div key={c.name} className="sp__rank-item">
                <span className="sp__rank-no">{i + 1}</span>
                <span className="sp__rank-icon"><CategoryIcon categoryId={c.catId} size={20} color={c.color} iconComponent={c.iconComponent} /></span>
                <span className="sp__rank-name">{c.name}</span>
                <div className="sp__rank-bar-track">
                  <div className="sp__rank-bar-fill" style={{ width: `${c.pct}%`, background: c.color }} />
                </div>
                <span className="sp__rank-amount">¥{formatCurrency(c.amount)}</span>
                <span className="sp__rank-pct">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
