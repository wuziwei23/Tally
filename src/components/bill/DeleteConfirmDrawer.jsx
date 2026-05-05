import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './DeleteConfirmDrawer.css'

export default function DeleteConfirmDrawer({ open, onClose, onConfirm }) {
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
          className="dcd__bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="dcd"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="dcd__handle" />

            <div className="dcd__body">
              <h3 className="dcd__title">删除这笔记录？</h3>
              <p className="dcd__desc">删除后无法恢复</p>
            </div>

            <div className="dcd__footer">
              <button className="dcd__btn dcd__btn--cancel" onClick={onClose}>取消</button>
              <button className="dcd__btn dcd__btn--confirm" onClick={onConfirm}>确认删除</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
