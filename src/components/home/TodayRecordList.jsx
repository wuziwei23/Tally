import { useMemo, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBills, useBillActions } from '../../hooks/useBill';
import { getCategoryById } from '../../data/categories';
import { formatCurrency, getToday } from '../../utils/format';
import CategoryIcon from '../common/CategoryIcon';
import BillActionDrawer from '../bill/BillActionDrawer';
import DeleteConfirmDrawer from '../bill/DeleteConfirmDrawer';
import './TodayRecordList.css';

export default function TodayRecordList() {
  const transactions = useBills();
  const { deleteBill } = useBillActions();
  const navigate = useNavigate();

  const [actionTarget, setActionTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const today = getToday();
  const todayTxns = useMemo(
    () => transactions.filter(t => t.date === today).slice(0, 5),
    [transactions, today]
  );
  const todayCount = useMemo(
    () => transactions.filter(t => t.date === today).length,
    [transactions, today]
  );

  // Long press logic
  const longPressTimer = useRef(null);

  const handlePointerDown = useCallback((txn) => (e) => {
    longPressTimer.current = setTimeout(() => {
      setActionTarget(txn);
    }, 500);
  }, []);

  const handlePointerUp = useCallback(() => {
    clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  }, []);

  const handlePointerLeave = useCallback(() => {
    clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  }, []);

  const handleEdit = useCallback(() => {
    if (actionTarget) {
      navigate(`/add?edit=${actionTarget.id}`);
      setActionTarget(null);
    }
  }, [actionTarget, navigate]);

  const handleDeleteRequest = useCallback(() => {
    setDeleteTarget(actionTarget);
    setActionTarget(null);
  }, [actionTarget]);

  const handleConfirmDelete = useCallback(() => {
    if (deleteTarget) {
      deleteBill(deleteTarget.id);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteBill]);

  return (
    <div className="tr">
      <div className="tr__header">
        <h2 className="tr__title">今日记录</h2>
        <span className="tr__count">今天共 {todayCount} 笔</span>
      </div>

      {todayTxns.length === 0 ? (
        <div className="tr__empty">
          <p>今天还没有记账，先记一笔吧</p>
          <button className="tr__empty-btn" onClick={() => navigate('/add')}>
            去记账
          </button>
        </div>
      ) : (
        <div className="tr__list">
          {todayTxns.map(txn => {
            const cat = getCategoryById(txn.categoryId);
            const isExpense = txn.type === 'expense';
            return (
              <div
                key={txn.id}
                className="tr__item"
                onPointerDown={handlePointerDown(txn)}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerLeave}
              >
                <span className="tr__icon">
                  <CategoryIcon categoryId={txn.categoryId} size={20} color={cat.color} iconComponent={cat.iconComponent} />
                </span>
                <div className="tr__info">
                  <span className="tr__name">{cat.name}</span>
                  {txn.note && <span className="tr__note">{txn.note}</span>}
                </div>
                <span className={`tr__amount ${isExpense ? 'text-red' : 'text-green'}`}>
                  {isExpense ? '-' : '+'}¥{formatCurrency(txn.amount)}
                </span>
              </div>
            );
          })}
          {todayCount > 5 && (
            <button className="tr__more" onClick={() => navigate('/history')}>
              查看全部 {todayCount} 笔 →
            </button>
          )}
        </div>
      )}

      <BillActionDrawer
        open={!!actionTarget}
        onClose={() => setActionTarget(null)}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />

      <DeleteConfirmDrawer
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
