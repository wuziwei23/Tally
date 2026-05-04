import { useState } from 'react';
import CategoryGrid from './CategoryGrid';
import CategoryIcon from '../common/CategoryIcon';
import AddCategoryDrawer from './AddCategoryDrawer';
import './CategoryManager.css';

export default function CategoryManager({ categories, customCategories, onAddCustom, type }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleDrawerSubmit({ name, icon, color }) {
    onAddCustom({ name, icon, color });
    setDrawerOpen(false);
  }

  return (
    <div className="catmgr">
      {/* Default categories */}
      <h4 className="catmgr__section-title">默认分类</h4>
      <CategoryGrid categories={categories} />

      {/* Custom categories */}
      <h4 className="catmgr__section-title">我的分类</h4>
      <div className="catmgr__custom-wrap">
        {customCategories.map(cat => (
          <div key={cat.id} className="catgrid__item">
            <span className="catgrid__icon" style={{ background: cat.color + '25', color: cat.color }}>
              <CategoryIcon categoryId={cat.id} size={18} color={cat.color} iconComponent={cat.iconComponent} />
            </span>
            <span className="catgrid__name">{cat.name}</span>
          </div>
        ))}
        <button className="catmgr__add-chip" onClick={() => setDrawerOpen(true)}>
          <span className="catmgr__add-chip-icon">+</span>
          <span className="catmgr__add-chip-text">新建分类</span>
        </button>
      </div>

      {/* Add Category Drawer */}
      <AddCategoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleDrawerSubmit}
        type={type}
      />
    </div>
  );
}
