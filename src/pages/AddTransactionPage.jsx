import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../context/TransactionContext';
import { expenseCategories, incomeCategories } from '../data/categories';
import { getToday } from '../utils/format';
import CategoryIcon from '../components/common/CategoryIcon';
import './AddTransactionPage.css';

export default function AddTransactionPage() {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(getToday());
  const [note, setNote] = useState('');
  const { addTransaction } = useTransactions();
  const navigate = useNavigate();

  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  function handleSave() {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0 || !categoryId) return;
    addTransaction({
      id: 'txn_' + Date.now(),
      type,
      categoryId,
      amount: numAmount,
      date,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    });
    navigate('/');
  }

  const canSave = parseFloat(amount) > 0 && categoryId;

  return (
    <div className="page page--no-tabbar page-enter">
      <div className="add-pg">
        {/* Header */}
        <div className="add-pg__header">
          <button className="add-pg__back" onClick={() => navigate('/')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <h1 className="add-pg__title">记一笔</h1>
          <div style={{ width: 36 }} />
        </div>

        {/* Type Toggle */}
        <div className="add-pg__type">
          <button
            className={`add-pg__type-btn ${type === 'expense' ? 'add-pg__type-btn--expense' : ''}`}
            onClick={() => { setType('expense'); setCategoryId(''); }}
          >
            支出
          </button>
          <button
            className={`add-pg__type-btn ${type === 'income' ? 'add-pg__type-btn--income' : ''}`}
            onClick={() => { setType('income'); setCategoryId(''); }}
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
                  <CategoryIcon categoryId={cat.id} size={20} color={categoryId === cat.id ? '#fff' : cat.color} />
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

        {/* Add Button */}
        <button
          className={`add-pg__submit ${canSave ? '' : 'add-pg__submit--disabled'}`}
          onClick={handleSave}
          disabled={!canSave}
        >
          确认记账
        </button>
      </div>
    </div>
  );
}
