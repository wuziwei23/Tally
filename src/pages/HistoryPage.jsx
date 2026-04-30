import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../context/TransactionContext';
import { getCategoryById } from '../data/categories';
import { formatCurrency, formatDateFull } from '../utils/format';
import './HistoryPage.css';

export default function HistoryPage() {
  const { transactions, deleteTransaction } = useTransactions();
  const navigate = useNavigate();

  const grouped = useMemo(() => {
    const map = {};
    for (const txn of transactions) {
      if (!map[txn.date]) map[txn.date] = [];
      map[txn.date].push(txn);
    }
    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, txns]) => {
        const dayExpense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return { date, txns, dayExpense };
      });
  }, [transactions]);

  return (
    <div className="page page-enter">
      <div className="hist">
        <div className="hist__header">
          <h1 className="hist__title">交易历史</h1>
        </div>

        {grouped.length === 0 ? (
          <div className="hist__empty">暂无记录</div>
        ) : (
          grouped.map(({ date, txns, dayExpense }) => (
            <div key={date} className="hist__day">
              <div className="hist__day-header">
                <span className="hist__day-date">{formatDateFull(date)}</span>
                {dayExpense > 0 && (
                  <span className="hist__day-total">支出 ¥{formatCurrency(dayExpense)}</span>
                )}
              </div>
              <div className="hist__txn-list">
                {txns.map(txn => {
                  const cat = getCategoryById(txn.categoryId);
                  const isExpense = txn.type === 'expense';
                  return (
                    <div key={txn.id} className="hist__txn-item">
                      <span className="hist__txn-icon">{cat.icon}</span>
                      <div className="hist__txn-info">
                        <span className="hist__txn-name">{cat.name}</span>
                        {txn.note && <span className="hist__txn-note">{txn.note}</span>}
                      </div>
                      <span className={`hist__txn-amount ${isExpense ? 'text-red' : 'text-green'}`}>
                        {isExpense ? '-' : '+'}¥{formatCurrency(txn.amount)}
                      </span>
                      <button className="hist__del" onClick={() => deleteTransaction(txn.id)} title="删除">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
