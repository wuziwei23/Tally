import { useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { getCategoryById } from '../data/categories';
import { formatCurrency, formatMonthLabel, getMonthKey } from '../utils/format';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './ChartsPage.css';

export default function ChartsPage() {
  const { byCategory, byMonth } = useTransactions();

  const currentMonthKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const currentMonth = byMonth[currentMonthKey] || { income: 0, expense: 0 };

  const pieData = useMemo(() => {
    const data = [];
    for (const [catId, amounts] of Object.entries(byCategory)) {
      if (amounts.expense > 0) {
        const cat = getCategoryById(catId);
        data.push({ name: cat.name, value: amounts.expense, color: cat.color, icon: cat.icon });
      }
    }
    return data.sort((a, b) => b.value - a.value);
  }, [byCategory]);

  const totalExpense = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="page page-enter">
      <div className="charts">
        <div className="charts__header">
          <h1 className="charts__title">消费分析</h1>
        </div>

        {/* Month Selector */}
        <div className="charts__month">
          <button className="charts__month-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="charts__month-label">{formatMonthLabel(currentMonthKey)}</span>
          <button className="charts__month-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="charts__summary">
          <div className="charts__summary-item">
            <span className="charts__summary-label">本月支出</span>
            <span className="charts__summary-value text-red">¥{formatCurrency(currentMonth.expense)}</span>
          </div>
          <div className="charts__summary-item">
            <span className="charts__summary-label">本月收入</span>
            <span className="charts__summary-value text-green">¥{formatCurrency(currentMonth.income)}</span>
          </div>
          <div className="charts__summary-item">
            <span className="charts__summary-label">本月结余</span>
            <span className={`charts__summary-value ${(currentMonth.income - currentMonth.expense) >= 0 ? 'text-green' : 'text-red'}`}>
              ¥{formatCurrency(currentMonth.income - currentMonth.expense)}
            </span>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="charts__section">
          <h3 className="charts__section-title">支出分类</h3>
          {pieData.length > 0 ? (
            <div className="charts__pie-card">
              <div className="charts__pie-wrap">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="charts__legend">
                {pieData.map(d => (
                  <div key={d.name} className="charts__legend-item">
                    <span className="charts__legend-dot" style={{ background: d.color }} />
                    <span className="charts__legend-name">{d.name}</span>
                    <span className="charts__legend-pct">
                      {totalExpense > 0 ? ((d.value / totalExpense) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="charts__empty">暂无支出数据</div>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="charts__section">
          <h3 className="charts__section-title">月度趋势</h3>
          <div className="charts__trend-card">
            {Object.entries(byMonth)
              .sort(([a], [b]) => a.localeCompare(b))
              .slice(-4)
              .map(([month, amounts]) => (
                <div key={month} className="charts__trend-row">
                  <span className="charts__trend-month">{formatMonthLabel(month)}</span>
                  <div className="charts__trend-bars">
                    <div className="charts__trend-bar">
                      <div className="charts__trend-bar-fill charts__trend-bar-fill--expense"
                        style={{ width: `${Math.min((amounts.expense / Math.max(currentMonth.income, currentMonth.expense, 1)) * 100, 100)}%` }} />
                    </div>
                    <div className="charts__trend-bar">
                      <div className="charts__trend-bar-fill charts__trend-bar-fill--income"
                        style={{ width: `${Math.min((amounts.income / Math.max(currentMonth.income, currentMonth.expense, 1)) * 100, 100)}%` }} />
                    </div>
                  </div>
                  <div className="charts__trend-values">
                    <span className="text-red" style={{ fontSize: 12, fontWeight: 600 }}>出 ¥{formatCurrency(amounts.expense)}</span>
                    <span className="text-green" style={{ fontSize: 12, fontWeight: 600 }}>入 ¥{formatCurrency(amounts.income)}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
