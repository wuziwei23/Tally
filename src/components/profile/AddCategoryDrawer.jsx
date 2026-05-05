import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ICON_MAP } from '../../data/iconMap'
import './AddCategoryDrawer.css'

const LIFESTYLE_ICONS = Object.entries(ICON_MAP).map(([label, icon]) => ({ icon, label }))

const PRESET_COLORS = [
  { hex: '#F5E6A3', name: '奶黄' },
  { hex: '#F08080', name: '珊瑚红' },
  { hex: '#98D8AA', name: '薄荷绿' },
  { hex: '#6CB4EE', name: '湖蓝' },
  { hex: '#C3A6D8', name: '淡紫' },
  { hex: '#F5B461', name: '橙黄' },
  { hex: '#F4A7BB', name: '粉红' },
  { hex: '#6B6B6B', name: '灰黑' },
]

const INITIAL_ICON_COUNT = 12

export default function AddCategoryDrawer({ open, onClose, onSubmit, type }) {
  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState(null)
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].hex)
  const [showAllIcons, setShowAllIcons] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setName('')
      setSelectedIcon(null)
      setSelectedColor(PRESET_COLORS[0].hex)
      setShowAllIcons(false)
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  const visibleIcons = showAllIcons ? LIFESTYLE_ICONS : LIFESTYLE_ICONS.slice(0, INITIAL_ICON_COUNT)
  const canSubmit = name.trim().length > 0

  function handleSubmit() {
    if (!canSubmit) return
    onSubmit({
      name: name.trim(),
      icon: selectedIcon?.label || '日常',
      color: selectedColor,
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="acd__bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="acd"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="acd__handle" />

            {/* Header */}
            <div className="acd__header">
              <div>
                <h3 className="acd__title">新增分类</h3>
                <p className="acd__subtitle">创建属于自己的分类</p>
              </div>
              <button className="acd__close" onClick={onClose}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="acd__body">
              {/* Name input */}
              <label className="acd__label">分类名称</label>
              <div className="acd__input-wrap">
                <input
                  ref={inputRef}
                  className="acd__input"
                  type="text"
                  placeholder="例如：学习 / 宠物 / 健身"
                  maxLength={8}
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <span className="acd__counter">{name.length} / 8</span>
              </div>

              {/* Icon grid */}
              <label className="acd__label">选择图标</label>
              <div className="acd__icon-grid">
                {visibleIcons.map(item => {
                  const IconComp = item.icon
                  return (
                    <motion.button
                      key={item.label}
                      className={`acd__icon-btn ${selectedIcon?.label === item.label ? 'acd__icon-btn--active' : ''}`}
                      onClick={() => setSelectedIcon(item)}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      <IconComp size={22} strokeWidth={2} />
                      <span className="acd__icon-label">{item.label}</span>
                    </motion.button>
                  )
                })}
              </div>
              {!showAllIcons && (
                <button className="acd__more" onClick={() => setShowAllIcons(true)}>
                  更多图标
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}

              {/* Color swatches */}
              <label className="acd__label">选择颜色</label>
              <div className="acd__colors">
                {PRESET_COLORS.map(c => (
                  <motion.button
                    key={c.hex}
                    className={`acd__color-btn ${selectedColor === c.hex ? 'acd__color-btn--active' : ''}`}
                    style={{ background: c.hex }}
                    onClick={() => setSelectedColor(c.hex)}
                    whileTap={{ scale: 0.88 }}
                    title={c.name}
                  />
                ))}
              </div>

              {/* Preview */}
              <label className="acd__label">预览</label>
              <div className="acd__preview">
                <motion.span
                  className="acd__preview-chip"
                  layout
                  style={{ background: selectedColor, borderColor: selectedColor }}
                >
                  <span className="acd__preview-icon">
                    {selectedIcon
                      ? <selectedIcon.icon size={18} strokeWidth={2} />
                      : <Sun size={18} strokeWidth={2} />
                    }
                  </span>
                  {name || '分类名'}
                </motion.span>
              </div>
            </div>

            {/* Sticky footer */}
            <div className="acd__footer">
              <button className="acd__cancel" onClick={onClose}>取消</button>
              <motion.button
                className="acd__submit"
                disabled={!canSubmit}
                onClick={handleSubmit}
                whileHover={canSubmit ? { y: -2 } : {}}
                whileTap={canSubmit ? { scale: 0.97 } : {}}
              >
                创建分类
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
