import './HistoryTabs.css';

export default function HistoryTabs({ value, onChange }) {
  return (
    <div className="htab">
      <button
        className={`htab__btn ${value === 'expense' ? 'htab__btn--active' : ''}`}
        onClick={() => onChange('expense')}
      >
        支出
      </button>
      <button
        className={`htab__btn ${value === 'income' ? 'htab__btn--active' : ''}`}
        onClick={() => onChange('income')}
      >
        收入
      </button>
    </div>
  );
}
