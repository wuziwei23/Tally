import { getCategoryById } from '../../data/categories';
import { formatCurrency } from '../../utils/format';
import './HistoryCard.css';

function getCatChar(name) {
  return name.charAt(0);
}

function getDisplayTime(txn) {
  if (txn.createdAt) {
    const d = new Date(txn.createdAt);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
  return '';
}

export default function HistoryCard({ txn, onDelete }) {
  const cat = getCategoryById(txn.categoryId);
  const isExpense = txn.type === 'expense';
  const char = getCatChar(cat.name);
  const time = getDisplayTime(txn);

  return (
    <div className="hcard">
      <div className="hcard__icon" style={{ background: cat.color + '25', color: cat.color }}>
        {char}
      </div>
      <div className="hcard__info">
        <span className="hcard__name">{txn.note || cat.name}</span>
        <span className="hcard__sub">{cat.name}{time ? ` · ${time}` : ''}</span>
      </div>
      <span className={`hcard__amount ${isExpense ? '' : 'text-green'}`}>
        {isExpense ? '-' : '+'}¥{formatCurrency(txn.amount)}
      </span>
      <button className="hcard__del" onClick={() => onDelete(txn.id)} title="删除">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}
