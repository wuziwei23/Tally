import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, MessageCircle, Smartphone, User, Cloud, Shield, Sparkles } from 'lucide-react'
import { userRepo } from '../../database'
import './AccountDrawer.css'

const AVATAR_COLORS = [
  { hex: '#F4E39B', name: '奶黄' },
  { hex: '#F7C6CF', name: '浅粉' },
  { hex: '#CBEBC8', name: '薄荷' },
  { hex: '#BFE1FF', name: '浅蓝' },
  { hex: '#D9C7F7', name: '淡紫' },
  { hex: '#FFD39B', name: '橙黄' },
  { hex: '#FFA8A8', name: '珊瑚' },
  { hex: '#777777', name: '深灰' },
]

export default function AccountDrawer({ onClose, onConfirm }) {
  const existing = userRepo.getProfile()
  const [nickname, setNickname] = useState(existing?.nickname || '')
  const [avatarColor, setAvatarColor] = useState(existing?.avatarColor || AVATAR_COLORS[0].hex)
  const [loginType, setLoginType] = useState(existing?.loginType || null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const nicknameLen = nickname.trim().length
  const canSubmit = nicknameLen >= 2 && nicknameLen <= 12

  function handleSave() {
    if (!canSubmit) return
    const profile = {
      nickname: nickname.trim(),
      avatarColor,
      avatarImage: null,
      loginType: loginType || 'guest',
    }
    userRepo.saveProfile(profile)
    onConfirm?.(profile)
    onClose()
  }

  function handleLogout() {
    userRepo.clearProfile()
    onConfirm?.(null)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        className="acd__bg ad__bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="ad"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="ad__handle" />

          {/* Scrollable body */}
          <div className="ad__body">
            {/* Title */}
            <h2 className="ad__title">
              {existing ? '编辑账号' : '登录你的记账本'}
            </h2>
            <p className="ad__subtitle">
              同步数据、保存分类、换设备也不会丢账单
            </p>

            {/* Avatar section */}
            <div className="ad__avatar-section">
              <div className="ad__avatar" style={{ background: avatarColor }}>
                <span className="ad__avatar-char">账</span>
                <button className="ad__avatar-cam">
                  <Camera size={16} strokeWidth={2.5} />
                </button>
              </div>
              <div className="ad__colors">
                {AVATAR_COLORS.map(c => (
                  <motion.button
                    key={c.hex}
                    className={`ad__color-dot ${avatarColor === c.hex ? 'ad__color-dot--active' : ''}`}
                    style={{ background: c.hex }}
                    onClick={() => setAvatarColor(c.hex)}
                    whileTap={{ scale: 0.85 }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Nickname */}
            <label className="ad__label">昵称</label>
            <div className="ad__input-wrap">
              <input
                className="ad__input"
                type="text"
                placeholder="请输入昵称"
                maxLength={12}
                value={nickname}
                onChange={e => setNickname(e.target.value)}
              />
              <span className="ad__counter">{nickname.trim().length}/12</span>
            </div>

            {/* Login methods */}
            <label className="ad__label">选择方式</label>
            <div className="ad__methods">
              <motion.button
                className={`ad__method ad__method--wechat ${loginType === 'wechat' ? 'ad__method--active' : ''}`}
                onClick={() => setLoginType('wechat')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <MessageCircle size={22} strokeWidth={2} />
                <span>微信登录</span>
              </motion.button>
              <motion.button
                className={`ad__method ad__method--phone ${loginType === 'phone' ? 'ad__method--active' : ''}`}
                onClick={() => setLoginType('phone')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <Smartphone size={22} strokeWidth={2} />
                <span>手机号登录</span>
              </motion.button>
              <motion.button
                className={`ad__method ad__method--guest ${loginType === 'guest' ? 'ad__method--active' : ''}`}
                onClick={() => setLoginType('guest')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <User size={22} strokeWidth={2} />
                <span>游客继续</span>
              </motion.button>
            </div>

            {/* Benefits card */}
            <div className="ad__benefits">
              <div className="ad__benefits-title">
                <Sparkles size={16} strokeWidth={2} />
                <span>登录后可获得</span>
              </div>
              <ul className="ad__benefits-list">
                <li><Cloud size={14} strokeWidth={2} /> 云端同步账单</li>
                <li><Shield size={14} strokeWidth={2} /> 自定义分类永久保存</li>
                <li><Shield size={14} strokeWidth={2} /> 换手机也不会丢</li>
                <li><Sparkles size={14} strokeWidth={2} /> 后续支持 AI 财务分析</li>
              </ul>
            </div>

            {/* Logout (if logged in) */}
            {existing && (
              <button className="ad__logout" onClick={handleLogout}>
                退出登录
              </button>
            )}
          </div>

          {/* Sticky footer */}
          <div className="ad__footer">
            <motion.button
              className="ad__btn ad__btn--later"
              onClick={onClose}
              whileTap={{ scale: 0.97 }}
            >
              稍后再说
            </motion.button>
            <motion.button
              className="ad__btn ad__btn--start"
              disabled={!canSubmit}
              onClick={handleSave}
              whileHover={canSubmit ? { y: -2 } : {}}
              whileTap={canSubmit ? { scale: 0.97 } : {}}
            >
              立即开始
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
