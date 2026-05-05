import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './BillActionDrawer.css'

export default function BillActionDrawer({ open, onClose, onEdit, onDelete }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="bad__bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="bad"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="bad__handle" />

            <div className="bad__body">
              <button className="bad__item" onClick={onEdit}>
                <span className="bad__item-icon">✏️</span>
                <div className="bad__item-info">
                  <span className="bad__item-title">编辑账单</span>
                  <span className="bad__item-desc">修改金额、分类、日期、备注</span>
                </div>
              </button>

              <button className="bad__item bad__item--danger" onClick={onDelete}>
                <span className="bad__item-icon">🗑️</span>
                <div className="bad__item-info">
                  <span className="bad__item-title bad__item-title--danger">删除账单</span>
                  <span className="bad__item-desc">删除后不可恢复</span>
                </div>
              </button>
            </div>

            <div className="bad__footer">
              <button className="bad__cancel" onClick={onClose}>取消</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
