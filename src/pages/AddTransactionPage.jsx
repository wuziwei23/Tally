import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBillStore } from '../store/useBillStore';
import { useBillActions } from '../hooks/useBill';
import { useCategories } from '../hooks/useCategories';
import { getToday } from '../utils/format';
import CategoryIcon from '../components/common/CategoryIcon';
import './AddTransactionPage.css';

export default function AddTransactionPage() {
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get('edit');
  const bills = useBillStore((s) => s.bills);
  const editingBill = editingId ? bills.find((b) => b.id === editingId) : null;

  const [type, setType] = useState(editingBill?.type || 'expense');
  const [amount, setAmount] = useState(editingBill ? String(editingBill.amount) : '');
  const [categoryId, setCategoryId] = useState(editingBill?.categoryId || '');
  const [date, setDate] = useState(editingBill?.date || getToday());
  const [note, setNote] = useState(editingBill?.note || '');
  const { addBill, updateBill } = useBillActions();
  const navigate = useNavigate();
  const { expenseCategories, incomeCategories } = useCategories();

  const savedCategoryRef = useRef({ expense: editingBill?.type === 'expense' ? editingBill?.categoryId || '' : '', income: editingBill?.type === 'income' ? editingBill?.categoryId || '' : '' });

  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  function handleSave() {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0 || !categoryId) return;

    if (editingBill) {
      updateBill(editingBill.id, {
        type,
        categoryId,
        amount: numAmount,
        date,
        note: note.trim(),
      });
      navigate('/history');
    } else {
      addBill({
        type,
        categoryId,
        amount: numAmount,
        date,
        note: note.trim(),
        createdAt: new Date().toISOString(),
      });
      navigate('/');
    }
  }

  const canSave = parseFloat(amount) > 0 && categoryId;
  const isEdit = !!editingBill;

  function handleBack() {
    navigate(isEdit ? '/history' : '/');
  }

  return (
    <div className="page page--no-tabbar page-enter">
      <div className="add-pg">
        {/* Header */}
        <div className="add-pg__header">
          <button className="add-pg__back" onClick={handleBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <h1 className="add-pg__title">{isEdit ? '编辑账单' : '记一笔'}</h1>
          <div style={{ width: 36 }} />
        </div>

        {/* Type Toggle */}
        <div className="add-pg__type">
          <button
            className={`add-pg__type-btn ${type === 'expense' ? 'add-pg__type-btn--expense' : ''}`}
            onClick={() => { savedCategoryRef.current[type] = categoryId; setType('expense'); setCategoryId(savedCategoryRef.current.expense); }}
          >
            支出
          </button>
          <button
            className={`add-pg__type-btn ${type === 'income' ? 'add-pg__type-btn--income' : ''}`}
            onClick={() => { savedCategoryRef.current[type] = categoryId; setType('income'); setCategoryId(savedCategoryRef.current.income); }}
          >
            收入
          </button>
        </div>

        {/* Amount */}
        <div className="add-pg__amount-card">
          <div className="add-pg__amount-row">
            <span className="add-pg__currency">¥</span>
            <input
              className="add-pg__amount-input"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={e => {
                const v = e.target.value;
                if (/^\d*\.?\d{0,2}$/.test(v) || v === '') setAmount(v);
              }}
            />
          </div>
        </div>

        {/* Category */}
        <div className="add-pg__section">
          <label className="add-pg__label">选择分类</label>
          <div className="add-pg__cat-grid">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`add-pg__cat-btn ${categoryId === cat.id ? 'add-pg__cat-btn--active' : ''}`}
                onClick={() => setCategoryId(cat.id)}
                type="button"
              >
                <span className="add-pg__cat-icon" style={{
                  background: categoryId === cat.id ? cat.color : cat.color + '22',
                  color: categoryId === cat.id ? '#fff' : cat.color,
                  borderColor: categoryId === cat.id ? cat.color : undefined,
                }}>
                  <CategoryIcon
                    categoryId={cat.id}
                    size={20}
                    color={categoryId === cat.id ? '#fff' : cat.color}
                    iconComponent={cat.iconComponent}
                  />
                </span>
                <span className="add-pg__cat-name">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="add-pg__section">
          <label className="add-pg__label">日期</label>
          <input
            type="date"
            className="add-pg__input"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        {/* Note */}
        <div className="add-pg__section">
          <label className="add-pg__label">备注</label>
          <input
            className="add-pg__input"
            type="text"
            placeholder={type === 'expense' ? '例如：午餐' : '例如：工资'}
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <button
          className={`add-pg__submit ${canSave ? '' : 'add-pg__submit--disabled'}`}
          onClick={handleSave}
          disabled={!canSave}
        >
          {isEdit ? '保存修改' : '确认记账'}
        </button>
      </div>
    </div>
  );
}
