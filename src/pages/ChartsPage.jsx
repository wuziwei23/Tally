import { useState, useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
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
  const { transactions } = useTransactions();
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
          <h1 className="charts__title">统计</h1>
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
