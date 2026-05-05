import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryGrid from './CategoryGrid';
import CategoryIcon from '../common/CategoryIcon';
import AddCategoryDrawer from './AddCategoryDrawer';
import './CategoryManager.css';

export default function CategoryManager({ categories, customCategories, onAddCustom, onDelete, type }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);

  function handleDrawerSubmit({ name, icon, color }) {
    onAddCustom({ name, icon, color });
    setDrawerOpen(false);
  }

  function handleConfirmDelete() {
    if (deleting) {
      onDelete(deleting.id);
      setDeleting(null);
    }
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
          <div key={cat.id} className="catgrid__item catgrid__item--custom">
            <span className="catgrid__icon" style={{ background: cat.color + '25', color: cat.color }}>
              <CategoryIcon categoryId={cat.id} size={18} color={cat.color} iconComponent={cat.iconComponent} />
            </span>
            <span className="catgrid__name">{cat.name}</span>
            <button
              className="catgrid__del"
              onClick={(e) => { e.stopPropagation(); setDeleting(cat); }}
              title="删除分类"
            >
              ×
            </button>
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

      {/* Delete Confirmation Drawer */}
      <AnimatePresence>
        {deleting && (
          <motion.div
            className="acd__bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setDeleting(null)}
          >
            <motion.div
              className="catmgr__confirm"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="acd__handle" />
              <h3 className="catmgr__confirm-title">删除分类？</h3>
              <div className="catmgr__confirm-preview">
                <span className="catgrid__icon" style={{ background: deleting.color + '25', color: deleting.color }}>
                  <CategoryIcon categoryId={deleting.id} size={18} color={deleting.color} iconComponent={deleting.iconComponent} />
                </span>
                <span className="catgrid__name">{deleting.name}</span>
              </div>
              <p className="catmgr__confirm-hint">相关账单将自动归入「其他」分类</p>
              <div className="catmgr__confirm-actions">
                <button className="acd__cancel" onClick={() => setDeleting(null)}>取消</button>
                <button className="catmgr__confirm-delete" onClick={handleConfirmDelete}>确认删除</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
