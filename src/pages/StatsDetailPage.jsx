import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBills } from '../hooks/useBill';
import { formatCurrency } from '../utils/format';
import SegmentedControl from '../components/stats/SegmentedControl';
import './StatsDetailPage.css';

const PERIOD_OPTIONS = [
  { label: '月', value: 'month' },
  { label: '季度', value: 'quarter' },
  { label: '年', value: 'year' },
];

function getMonthKey(dateStr) {
  return dateStr.substring(0, 7);
}

function getQuarter(dateStr) {
  const m = parseInt(dateStr.substring(5, 7)) - 1;
  return Math.floor(m / 3) + 1;
}

function getYear(dateStr) {
  return dateStr.substring(0, 4);
}

export default function StatsDetailPage() {
  const transactions = useBills();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('month');

  const monthData = useMemo(() => {
    const map = {};
    for (const t of transactions) {
      const key = getMonthKey(t.date);
      if (!map[key]) map[key] = { income: 0, expense: 0, count: 0 };
      if (t.type === 'income') map[key].income += t.amount;
      else map[key].expense += t.amount;
      map[key].count++;
    }
    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, d]) => ({
        key,
        label: `${parseInt(key.substring(5, 7))}月`,
        year: key.substring(0, 4),
        ...d,
        balance: d.income - d.expense,
      }));
  }, [transactions]);

  const quarterData = useMemo(() => {
    const map = {};
    for (const t of transactions) {
      const y = getYear(t.date);
      const q = getQuarter(t.date);
      const key = `${y}-Q${q}`;
      if (!map[key]) map[key] = { income: 0, expense: 0, count: 0, year: y, quarter: q };
      if (t.type === 'income') map[key].income += t.amount;
      else map[key].expense += t.amount;
      map[key].count++;
    }
    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, d]) => ({
        key,
        label: `${d.year} Q${d.quarter}`,
        ...d,
        balance: d.income - d.expense,
      }));
  }, [transactions]);

  const yearData = useMemo(() => {
    const map = {};
    for (const t of transactions) {
      const y = getYear(t.date);
      if (!map[y]) map[y] = { income: 0, expense: 0, count: 0 };
      if (t.type === 'income') map[y].income += t.amount;
      else map[y].expense += t.amount;
      map[y].count++;
    }
    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([y, d]) => ({
        key: y,
        label: y,
        ...d,
        balance: d.income - d.expense,
      }));
  }, [transactions]);

  const data = period === 'month' ? monthData : period === 'quarter' ? quarterData : yearData;

  return (
    <div className="page page--no-tabbar page-enter">
      <div className="sdet">
        <div className="sdet__header">
          <button className="sdet__back" onClick={() => navigate('/charts')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <h1 className="sdet__title">统计明细</h1>
          <div style={{ width: 36 }} />
        </div>

        <div className="sdet__tabs">
          <SegmentedControl options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
        </div>

        {data.length === 0 ? (
          <div className="sdet__empty">暂无数据</div>
        ) : (
          <div className="sdet__list">
            {data.map(item => (
              <div key={item.key} className="sdet__card">
                <h3 className="sdet__card-title">{item.label}</h3>
                <div className="sdet__card-rows">
                  <div className="sdet__card-row">
                    <span className="sdet__card-label">总支出</span>
                    <span className="sdet__card-value text-red">¥{formatCurrency(item.expense)}</span>
                  </div>
                  <div className="sdet__card-row">
                    <span className="sdet__card-label">总收入</span>
                    <span className="sdet__card-value text-green">¥{formatCurrency(item.income)}</span>
                  </div>
                  <div className="sdet__card-row">
                    <span className="sdet__card-label">结余</span>
                    <span className={`sdet__card-value ${item.balance >= 0 ? 'text-green' : 'text-red'}`}>
                      ¥{formatCurrency(item.balance)}
                    </span>
                  </div>
                  <div className="sdet__card-row">
                    <span className="sdet__card-label">交易笔数</span>
                    <span className="sdet__card-value">{item.count} 笔</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
