import { formatCurrency } from '../../utils/format';
import HistoryCard from './HistoryCard';
import './HistorySection.css';

function formatDateLabel(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  const diff = Math.floor((today - d) / 86400000);

  if (diff === 0) return '今天';
  if (diff === 1) return '昨天';
  if (diff === 2) return '前天';

  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}月${day}日`;
}

export default function HistorySection({ date, txns, type, onDelete }) {
  const total = txns.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="hsec">
      <div className="hsec__header">
        <span className="hsec__date">{formatDateLabel(date)}</span>
        <span className="hsec__total">
          {type === 'expense' ? '支出' : '收入'} ¥{formatCurrency(total)}
        </span>
      </div>
      <div className="hsec__list">
        {txns.map(txn => (
          <HistoryCard key={txn.id} txn={txn} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
