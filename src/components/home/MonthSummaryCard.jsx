import { useMemo } from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency, getMonthKey } from '../../utils/format';
import './MonthSummaryCard.css';

export default function MonthSummaryCard() {
  const { transactions } = useTransactions();

  const stats = useMemo(() => {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    let income = 0, expense = 0, expCount = 0, incCount = 0;
    for (const t of transactions) {
      if (getMonthKey(t.date) === key) {
        if (t.type === 'income') { income += t.amount; incCount++; }
        else { expense += t.amount; expCount++; }
      }
    }
    return { income, expense, balance: income - expense, expCount, incCount };
  }, [transactions]);

  const now = new Date();
  const monthLabel = `${now.getMonth() + 1}月`;

  return (
    <div className="msc">
      <h2 className="msc__title">本月概览</h2>

      <div className="msc__card">
        {/* Month pill */}
        <div className="msc__month-row">
          <span className="msc__month-pill">{monthLabel}</span>
        </div>

        {/* Main number */}
        <div className="msc__main">
          <span className="msc__main-label">本月支出</span>
          <span className="msc__main-value text-red">¥{formatCurrency(stats.expense)}</span>
        </div>

        {/* Breakdown */}
        <div className="msc__rows">
          <div className="msc__row">
            <span className="msc__row-label">总收入</span>
            <span className="msc__row-value text-green">¥{formatCurrency(stats.income)}</span>
          </div>
          <div className="msc__row">
            <span className="msc__row-label">交易笔数</span>
            <span className="msc__row-value">共 {stats.expCount} 笔支出 / {stats.incCount} 笔收入</span>
          </div>
          <div className="msc__row">
            <span className="msc__row-label">本月结余</span>
            <span className={`msc__row-value ${stats.balance >= 0 ? 'text-green' : 'text-red'}`}>
              ¥{formatCurrency(stats.balance)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
