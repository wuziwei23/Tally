import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../hooks/useCategories';
import { expenseCategories as defaultExpense, incomeCategories as defaultIncome } from '../data/categories';
import ProfileCard from '../components/profile/ProfileCard';
import CategoryTabs from '../components/profile/CategoryTabs';
import CategoryManager from '../components/profile/CategoryManager';
import './SettingsPage.css';

export default function SettingsPage() {
  const { user } = useAuth();
  const [catType, setCatType] = useState('expense');
  const { expenseCategories, incomeCategories, addCategory, deleteCategory } = useCategories();

  const categories = catType === 'expense' ? expenseCategories : incomeCategories;
  const customCategories = categories.filter(c => c.isCustom);

  function handleAddCustom({ name, icon, color }) {
    addCategory({ name, icon, color, type: catType });
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
        <ProfileCard username={user?.username} />

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
    </div>
  );
}
