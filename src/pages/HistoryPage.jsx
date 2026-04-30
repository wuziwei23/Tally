import { useState, useMemo, useRef, useEffect } from 'react';
import { useTransactions } from '../context/TransactionContext';
import HistoryTabs from '../components/history/HistoryTabs';
import HistorySection from '../components/history/HistorySection';
import { formatCurrency } from '../utils/format';
import './HistoryPage.css';

export default function HistoryPage() {
  const { transactions, deleteTransaction, updateTransaction } = useTransactions();
  const [type, setType] = useState('expense');
  const [editingTxn, setEditingTxn] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const inputRef = useRef(null);

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

  useEffect(() => {
    if (editingTxn && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTxn]);

  function handleEdit(txn) {
    setEditingTxn(txn);
    setEditAmount(String(txn.amount));
  }

  function handleConfirmEdit() {
    const num = parseFloat(editAmount);
    if (!num || num <= 0) return;
    updateTransaction(editingTxn.id, { amount: num });
    setEditingTxn(null);
  }

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
              onEdit={handleEdit}
            />
          ))
        )}

        {/* Edit Amount Modal */}
        {editingTxn && (
          <div className="hist__modal-bg" onClick={() => setEditingTxn(null)}>
            <div className="hist__modal" onClick={e => e.stopPropagation()}>
              <h3 className="hist__modal-title">修改金额</h3>
              <p className="hist__modal-desc">{editingTxn.note || '交易记录'}</p>
              <div className="hist__modal-input-row">
                <span className="hist__modal-currency">¥</span>
                <input
                  ref={inputRef}
                  className="hist__modal-input"
                  type="text"
                  inputMode="decimal"
                  value={editAmount}
                  onChange={e => {
                    const v = e.target.value;
                    if (/^\d*\.?\d{0,2}$/.test(v) || v === '') setEditAmount(v);
                  }}
                  onKeyDown={e => { if (e.key === 'Enter') handleConfirmEdit(); }}
                />
              </div>
              <div className="hist__modal-btns">
                <button className="hist__modal-btn hist__modal-btn--cancel" onClick={() => setEditingTxn(null)}>取消</button>
                <button className="hist__modal-btn hist__modal-btn--confirm" onClick={handleConfirmEdit}>确认</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
