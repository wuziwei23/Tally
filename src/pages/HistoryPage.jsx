import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBills, useBillActions } from '../hooks/useBill';
import { expenseCategories, incomeCategories, getCategoryById } from '../data/categories';
import CategoryIcon from '../components/common/CategoryIcon';
import HistoryTabs from '../components/history/HistoryTabs';
import HistorySection from '../components/history/HistorySection';
import BillActionDrawer from '../components/bill/BillActionDrawer';
import DeleteConfirmDrawer from '../components/bill/DeleteConfirmDrawer';
import './HistoryPage.css';

const initialFilters = {
  category: 'all',
  type: 'expense',
  keyword: '',
  dateRange: null,
  amountRange: null,
  accountId: 'all',
};

export default function HistoryPage() {
  const transactions = useBills();
  const { deleteBill } = useBillActions();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(initialFilters);
  const [deletingId, setDeletingId] = useState(null);
  const [actionTarget, setActionTarget] = useState(null);
  const [deleteFromAction, setDeleteFromAction] = useState(null);

  const categories = filters.type === 'expense' ? expenseCategories : incomeCategories;

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const grouped = useMemo(() => {
    const kw = filters.keyword.trim().toLowerCase();
    const kwNorm = kw.replace(/[年\-\/]/g, '').replace(/月$/, '');

    const filtered = transactions.filter(t => {
      if (t.type !== filters.type) return false;
      if (filters.category !== 'all' && t.categoryId !== filters.category) return false;
      if (kw) {
        const catName = getCategoryById(t.categoryId).name;
        const note = t.note || '';
        const textHit = note.toLowerCase().includes(kw) || catName.toLowerCase().includes(kw);
        if (!textHit) {
          const d = t.date;
          const [y, m] = d.split('-');
          const dateHit =
            d.includes(kwNorm) ||
            y === kwNorm ||
            (kwNorm.length === 6 && y + m === kwNorm) ||
            (/^\d{1,2}$/.test(kwNorm) && parseInt(kwNorm, 10) === parseInt(m, 10));
          if (!dateHit) return false;
        }
      }
      return true;
    });

    const dateMap = {};
    for (const t of filtered) {
      if (!dateMap[t.date]) dateMap[t.date] = [];
      dateMap[t.date].push(t);
    }
    const sorted = Object.entries(dateMap)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, txns]) => ({ date, txns }));

    const years = [];
    for (const section of sorted) {
      const year = section.date.slice(0, 4);
      const last = years[years.length - 1];
      if (last && last.year === year) {
        last.sections.push(section);
      } else {
        years.push({ year, sections: [section] });
      }
    }
    return years;
  }, [transactions, filters]);

  function handleTypeChange(newType) {
    setFilters(prev => ({ ...prev, type: newType, category: 'all' }));
  }

  function handleEdit(txn) {
    navigate(`/add?edit=${txn.id}`);
  }

  const handleLongPress = useCallback((txn) => {
    setActionTarget(txn);
  }, []);

  const handleActionEdit = useCallback(() => {
    if (actionTarget) {
      navigate(`/add?edit=${actionTarget.id}`);
      setActionTarget(null);
    }
  }, [actionTarget, navigate]);

  const handleActionDelete = useCallback(() => {
    setDeleteFromAction(actionTarget);
    setActionTarget(null);
  }, [actionTarget]);

  const handleConfirmDeleteFromAction = useCallback(() => {
    if (deleteFromAction) {
      deleteBill(deleteFromAction.id);
      setDeleteFromAction(null);
    }
  }, [deleteFromAction, deleteBill]);

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
          <p className="hist__sub">长按或左滑卡片可编辑和删除</p>
        </div>

        <HistoryTabs value={filters.type} onChange={handleTypeChange} />

        <div className="hist__filter-bar">
          <div className="hist__search">
            <svg className="hist__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
            <input
              className="hist__search-input"
              type="text"
              placeholder="搜索备注或分类"
              value={filters.keyword}
              onChange={e => updateFilter('keyword', e.target.value)}
            />
            {filters.keyword && (
              <button className="hist__search-clear" onClick={() => updateFilter('keyword', '')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          <div className="hist__cat-filter">
            <button
              className={`hist__cat-btn ${filters.category === 'all' ? 'hist__cat-btn--active' : ''}`}
              onClick={() => updateFilter('category', 'all')}
            >
              全部
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`hist__cat-btn ${filters.category === cat.id ? 'hist__cat-btn--active' : ''}`}
                onClick={() => updateFilter('category', cat.id)}
              >
                <CategoryIcon categoryId={cat.id} size={14} color={filters.category === cat.id ? 'var(--text-dark)' : cat.color} />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {grouped.length === 0 ? (
          <div className="hist__empty">
            <div className="hist__empty-badge">
              {filters.category !== 'all' || filters.keyword
                ? '没有匹配的账单'
                : '还没有账单'}
            </div>
            <p className="hist__empty-main">
              {filters.category !== 'all' || filters.keyword
                ? '换个筛选条件试试'
                : '先去记一笔吧'}
            </p>
          </div>
        ) : (
          grouped.map(({ year, sections }) => (
            <div key={year} className="hist__year">
              <div className="hist__year-label">
                <span className="hist__year-line" />
                <span className="hist__year-text">{year}</span>
                <span className="hist__year-line" />
              </div>
              {sections.map(({ date, txns }) => (
                <HistorySection
                  key={date}
                  date={date}
                  txns={txns}
                  type={filters.type}
                  onDelete={handleRequestDelete}
                  onEdit={handleEdit}
                  onLongPress={handleLongPress}
                />
              ))}
            </div>
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

        <BillActionDrawer
          open={!!actionTarget}
          onClose={() => setActionTarget(null)}
          onEdit={handleActionEdit}
          onDelete={handleActionDelete}
        />

        <DeleteConfirmDrawer
          open={!!deleteFromAction}
          onClose={() => setDeleteFromAction(null)}
          onConfirm={handleConfirmDeleteFromAction}
        />
      </div>
    </div>
  );
}
