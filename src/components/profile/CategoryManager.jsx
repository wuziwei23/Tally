import { useState } from 'react';
import CategoryGrid from './CategoryGrid';
import './CategoryManager.css';

export default function CategoryManager({ categories, customCategories, onAddCustom }) {
  const [newName, setNewName] = useState('');

  function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAddCustom(trimmed);
    setNewName('');
  }

  return (
    <div className="catmgr">
      {/* Add custom input */}
      <div className="catmgr__add-row">
        <input
          className="catmgr__input"
          type="text"
          placeholder="新增自定义分类"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
        />
        <button className="catmgr__add-btn" onClick={handleAdd}>添加</button>
      </div>

      {/* Default categories */}
      <h4 className="catmgr__section-title">默认分类</h4>
      <CategoryGrid categories={categories} />

      {/* Custom categories */}
      <h4 className="catmgr__section-title">我的分类</h4>
      {customCategories.length > 0 ? (
        <CategoryGrid categories={customCategories} />
      ) : (
        <div className="catmgr__empty">
          <p className="catmgr__empty-main">还没有自定义分类</p>
          <p className="catmgr__empty-sub">你可以按自己的习惯新增，比如宠物、学习。</p>
        </div>
      )}
    </div>
  );
}
