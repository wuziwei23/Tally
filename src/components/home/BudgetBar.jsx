import { useMemo } from 'react';
import { useBillStore } from '../../store/useBillStore';
import './BudgetBar.css';

export default function BudgetBar() {
  const bills = useBillStore(s => s.bills);

  const { spent, budget, remain, percent } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthBills = bills.filter(b => {
      if (b.type !== 'expense') return false;
      const d = new Date(b.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    const totalSpent = monthBills.reduce((sum, b) => sum + b.amount, 0);
    const totalBudget = 3000;
    const remaining = totalBudget - totalSpent;
    const pct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    return { spent: totalSpent, budget: totalBudget, remain: remaining, percent: pct };
  }, [bills]);

  const ringColor = percent >= 100 ? '#E96A5F' : percent >= 80 ? '#F5A623' : '#F3D99B';

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <div className="budget-bar">
      <div className="budget-bar__info">
        <span className="budget-bar__title">本月预算</span>
        <span className="budget-bar__amount">¥{spent} / ¥{budget}</span>
        <span className="budget-bar__remain">剩余 ¥{remain}</span>
      </div>
      <div className="budget-bar__ring">
        <svg width="52" height="52" viewBox="0 0 52 52">
          <circle
            cx="26" cy="26" r={radius}
            fill="none"
            stroke="#E8E4DC"
            strokeWidth="6"
          />
          <circle
            cx="26" cy="26" r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <span className="budget-bar__ring-percent">{percent}%</span>
      </div>
    </div>
  );
}
