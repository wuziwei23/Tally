import { useState, useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import HistoryTabs from '../components/history/HistoryTabs';
import HistorySection from '../components/history/HistorySection';
import './HistoryPage.css';

export default function HistoryPage() {
  const { transactions, deleteTransaction } = useTransactions();
  const [type, setType] = useState('expense');

  const grouped = useMemo(() => {
    const filtered = transactions.filter(t => t.type === type);
    const map = {};
    for (const t of filtered) {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    }
    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, txns]) => ({ date, txns }));
  }, [transactions, type]);

  return (
    <div className="page page-enter">
      <div className="hist">
        <div className="hist__header">
          <h1 className="hist__title">历史</h1>
          <p className="hist__sub">向左滑动可删除和修改金额</p>
        </div>

        <HistoryTabs value={type} onChange={setType} />

        {grouped.length === 0 ? (
          <div className="hist__empty">
            <div className="hist__empty-badge">还没有账单</div>
            <p className="hist__empty-main">先去记一笔吧</p>
          </div>
        ) : (
          grouped.map(({ date, txns }) => (
            <HistorySection
              key={date}
              date={date}
              txns={txns}
              type={type}
              onDelete={deleteTransaction}
            />
          ))
        )}
      </div>
    </div>
  );
}
