import { useState, useEffect } from 'react';
import { useCategories } from '../hooks/useCategories';
import { expenseCategories as defaultExpense, incomeCategories as defaultIncome } from '../data/categories';
import ProfileCard from '../components/profile/ProfileCard';
import AccountDrawer from '../components/profile/AccountDrawer';
import CategoryTabs from '../components/profile/CategoryTabs';
import CategoryManager from '../components/profile/CategoryManager';
import './SettingsPage.css';

const PROFILE_KEY = 'userProfile';

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState(loadProfile);
  const [showAccountDrawer, setShowAccountDrawer] = useState(false);
  const [catType, setCatType] = useState('expense');
  const { expenseCategories, incomeCategories, addCategory, deleteCategory } = useCategories();

  useEffect(() => {
    setProfile(loadProfile());
  }, [showAccountDrawer]);

  const categories = catType === 'expense' ? expenseCategories : incomeCategories;
  const customCategories = categories.filter(c => c.isCustom);

  function handleAddCustom({ name, icon, color }) {
    addCategory({ name, icon, color, type: catType });
  }

  function handleSaveProfile(newProfile) {
    setProfile(newProfile);
  }

  const defaultCount = defaultExpense.length + defaultIncome.length;
  const customCount = expenseCategories.filter(c => c.isCustom).length
    + incomeCategories.filter(c => c.isCustom).length;

  return (
    <div className="page page-enter">
      <div className="prof">
        <div className="prof__header">
          <h1 className="prof__title">我的</h1>
          <p className="prof__sub">管理头像昵称和个人分类。</p>
        </div>

        {/* Profile Card */}
        <ProfileCard
          profile={profile}
          onClick={() => setShowAccountDrawer(true)}
        />

        {/* Category Management Header */}
        <div className="prof__cat-header">
          <span className="prof__cat-title">分类管理</span>
          <span className="prof__cat-count">默认 {defaultCount} 个 · 自定义 {customCount} 个</span>
        </div>

        {/* Category Tabs */}
        <CategoryTabs value={catType} onChange={setCatType} />

        {/* Category Manager */}
        <CategoryManager
          categories={categories}
          customCategories={customCategories}
          onAddCustom={handleAddCustom}
          onDelete={deleteCategory}
          type={catType}
        />

        {/* Bottom */}
        <div className="prof__bottom">
          <p className="prof__version">记账本 v1.0.0</p>
        </div>
      </div>

      {/* Account Drawer */}
      {showAccountDrawer && (
        <AccountDrawer
          onClose={() => setShowAccountDrawer(false)}
          onConfirm={handleSaveProfile}
        />
      )}
    </div>
  );
}
