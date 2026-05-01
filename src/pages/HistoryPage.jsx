import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBills, useBillActions } from '../hooks/useBill';
import HistoryTabs from '../components/history/HistoryTabs';
import HistorySection from '../components/history/HistorySection';
import './HistoryPage.css';

export default function HistoryPage() {
  const transactions = useBills();
  const { deleteBill } = useBillActions();
  const navigate = useNavigate();
  const [type, setType] = useState('expense');
  const [deletingId, setDeletingId] = useState(null);

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

  function handleEdit(txn) {
    navigate(`/add?edit=${txn.id}`);
  }

  function handleRequestDelete(id) {
    setDeletingId(id);
  }

  function handleConfirmDelete() {
    if (deletingId) {
      deleteBill(deletingId);
      setDeletingId(null);
    }
  }

  const deletingBill = deletingId ? transactions.find(t => t.id === deletingId) : null;

  return (
    <div className="page page-enter">
      <div className="hist">
        <div className="hist__header">
          <h1 className="hist__title">历史</h1>
          <p className="hist__sub">向左滑动可删除和修改</p>
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
              onDelete={handleRequestDelete}
              onEdit={handleEdit}
            />
          ))
        )}

        {/* Delete Confirm Modal */}
        {deletingBill && (
          <div className="hist__modal-bg" onClick={() => setDeletingId(null)}>
            <div className="hist__modal" onClick={e => e.stopPropagation()}>
              <h3 className="hist__modal-title">确认删除</h3>
              <p className="hist__modal-desc">确认删除这条记录？</p>
              <div className="hist__modal-btns">
                <button
                  className="hist__modal-btn hist__modal-btn--cancel"
                  onClick={() => setDeletingId(null)}
                >
                  取消
                </button>
                <button
                  className="hist__modal-btn hist__modal-btn--confirm"
                  onClick={handleConfirmDelete}
                  style={{ background: '#FF3B30', color: '#fff' }}
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
