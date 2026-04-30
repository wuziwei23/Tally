import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { expenseCategories, incomeCategories } from '../data/categories';
import ProfileCard from '../components/profile/ProfileCard';
import CategoryTabs from '../components/profile/CategoryTabs';
import CategoryManager from '../components/profile/CategoryManager';
import './SettingsPage.css';

export default function SettingsPage() {
  const { user } = useAuth();
  const [catType, setCatType] = useState('expense');
  const [customExpense, setCustomExpense] = useState([]);
  const [customIncome, setCustomIncome] = useState([]);

  const categories = catType === 'expense' ? expenseCategories : incomeCategories;
  const customCategories = catType === 'expense' ? customExpense : customIncome;

  function handleAddCustom(name) {
    const newCat = {
      id: 'custom_' + Date.now(),
      name,
      icon: name.charAt(0),
      type: catType,
      color: catType === 'expense' ? '#FF9500' : '#34C759',
    };
    if (catType === 'expense') {
      setCustomExpense(prev => [...prev, newCat]);
    } else {
      setCustomIncome(prev => [...prev, newCat]);
    }
  }

  const defaultCount = expenseCategories.length + incomeCategories.length;
  const customCount = customExpense.length + customIncome.length;

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
        />

        {/* Bottom */}
        <div className="prof__bottom">
          <p className="prof__version">记账本 v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
