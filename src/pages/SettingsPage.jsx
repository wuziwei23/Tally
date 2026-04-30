import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { expenseCategories, incomeCategories } from '../data/categories';
import './SettingsPage.css';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { clearAll, transactions } = useTransactions();
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const days = new Set(transactions.map(t => t.date)).size;
    return { count: transactions.length, days };
  }, [transactions]);

  function handleLogout() {
    if (user) logout();
    navigate('/', { replace: true });
  }

  function handleClear() {
    clearAll();
    setShowConfirm(false);
  }

  return (
    <div className="page page-enter">
      <div className="settings">
        <div className="settings__header">
          <h1 className="settings__title">个人中心</h1>
        </div>

        {/* User Card */}
        <div className="settings__user-card">
          <div className="settings__avatar">
            <svg viewBox="0 0 36 36" width="52" height="52">
              <circle cx="18" cy="14" r="9" fill="#FFDAB9"/>
              <circle cx="14" cy="12" r="1.5" fill="#222"/>
              <circle cx="22" cy="12" r="1.5" fill="#222"/>
              <path d="M15 17 Q18 20 21 17" stroke="#E96A5F" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M10 6 Q18 0 26 6" stroke="#8B4513" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <ellipse cx="18" cy="28" rx="12" ry="10" fill="#E96A5F"/>
            </svg>
          </div>
          <h2 className="settings__name">{user?.username || '飞飞'}</h2>
          <p className="settings__desc">爱记账的小能手</p>
        </div>

        {/* Stats */}
        <div className="settings__stats">
          <div className="settings__stat">
            <span className="settings__stat-value">{stats.count}</span>
            <span className="settings__stat-label">笔</span>
          </div>
          <div className="settings__stat-divider" />
          <div className="settings__stat">
            <span className="settings__stat-value">{stats.days}</span>
            <span className="settings__stat-label">天</span>
          </div>
          <div className="settings__stat-divider" />
          <div className="settings__stat">
            <span className="settings__stat-value">{Math.max(1, Math.ceil(stats.count / Math.max(stats.days, 1)))}</span>
            <span className="settings__stat-label">次/天</span>
          </div>
        </div>

        {/* Category Management */}
        <div className="settings__section">
          <h3 className="settings__section-title">分类管理</h3>
          <div className="settings__cat-row">
            <h4 className="settings__cat-type">支出</h4>
            <div className="settings__cat-list">
              {expenseCategories.slice(0, 8).map(cat => (
                <span key={cat.id} className="settings__cat-tag" style={{ background: cat.color + '25', borderColor: cat.color }}>
                  {cat.icon} {cat.name}
                </span>
              ))}
            </div>
          </div>
          <div className="settings__cat-row">
            <h4 className="settings__cat-type">收入</h4>
            <div className="settings__cat-list">
              {incomeCategories.map(cat => (
                <span key={cat.id} className="settings__cat-tag" style={{ background: cat.color + '25', borderColor: cat.color }}>
                  {cat.icon} {cat.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="settings__menu">
          <button className="settings__menu-item" onClick={() => setShowConfirm(true)}>
            <span className="settings__menu-icon" style={{ background: 'var(--bg-pink)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-dark)" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </span>
            <span>清空数据</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-gray)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button className="settings__menu-item" onClick={() => navigate('/')}>
            <span className="settings__menu-icon" style={{ background: 'var(--bg-green)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-dark)" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </span>
            <span>返回首页</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-gray)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* Logout */}
        <div className="settings__bottom">
          <button className="settings__logout" onClick={handleLogout}>
            退出登录
          </button>
          <p className="settings__version">记账本 v1.0.0</p>
        </div>

        {/* Confirm Modal */}
        {showConfirm && (
          <div className="settings__modal-bg" onClick={() => setShowConfirm(false)}>
            <div className="settings__modal" onClick={e => e.stopPropagation()}>
              <h3>确认清空？</h3>
              <p>所有交易记录将被永久删除，此操作不可恢复。</p>
              <div className="settings__modal-btns">
                <button className="settings__modal-btn settings__modal-btn--cancel" onClick={() => setShowConfirm(false)}>取消</button>
                <button className="settings__modal-btn settings__modal-btn--danger" onClick={handleClear}>确认清空</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
