import './CategoryTabs.css';

export default function CategoryTabs({ value, onChange }) {
  return (
    <div className="ctab">
      <button
        className={`ctab__btn ${value === 'expense' ? 'ctab__btn--active' : ''}`}
        onClick={() => onChange('expense')}
      >
        支出分类
      </button>
      <button
        className={`ctab__btn ${value === 'income' ? 'ctab__btn--active' : ''}`}
        onClick={() => onChange('income')}
      >
        收入分类
      </button>
    </div>
  );
}
