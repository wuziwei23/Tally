import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBills } from '../hooks/useBill';
import SegmentedControl from '../components/stats/SegmentedControl';
import StatsEmpty from '../components/stats/StatsEmpty';
import StatsPanel from '../components/stats/StatsPanel';
import './ChartsPage.css';

const TYPE_OPTIONS = [
  { label: '支出', value: 'expense' },
  { label: '收入', value: 'income' },
  { label: '结余', value: 'balance' },
];

const PERIOD_OPTIONS = [
  { label: '月', value: 'month' },
  { label: '季度', value: 'quarter' },
  { label: '年', value: 'year' },
];

export default function ChartsPage() {
  const transactions = useBills();
  const navigate = useNavigate();
  const [type, setType] = useState('expense');
  const [period, setPeriod] = useState('month');

  const hasData = useMemo(() => {
    if (type === 'balance') return transactions.length > 0;
    return transactions.some(t => t.type === type);
  }, [transactions, type]);

  return (
    <div className="page page-enter">
      <div className="charts">
        <div className="charts__header">
          <div className="charts__title-row">
            <h1 className="charts__title">统计</h1>
            <button className="charts__detail-btn" onClick={() => navigate('/stats-detail')}>
              详细
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
          <p className="charts__sub">看看最近花了多少、主要花在哪些分类。</p>
        </div>

        <div className="charts__tabs">
          <SegmentedControl options={TYPE_OPTIONS} value={type} onChange={setType} />
        </div>

        <div className="charts__tabs">
          <SegmentedControl options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
        </div>

        <div className="charts__content">
          {hasData ? (
            <StatsPanel
              transactions={transactions}
              type={type === 'balance' ? 'balance' : type}
              period={period}
            />
          ) : (
            <StatsEmpty />
          )}
        </div>
      </div>
    </div>
  );
}
