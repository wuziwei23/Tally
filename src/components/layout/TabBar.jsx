import { NavLink, useLocation } from 'react-router-dom';
import { motion, useTransform } from 'framer-motion';
import { useScrollCollapse } from '../../hooks/useScrollCollapse';
import './TabBar.css';

const tabs = [
  { to: '/', label: '记账', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )},
  { to: '/charts', label: '统计', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )},
  { to: '/history', label: '历史', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )},
  { to: '/settings', label: '我的', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )},
];

export default function TabBar() {
  const location = useLocation();
  const { scrollProgress, isCollapsed } = useScrollCollapse(80);

  const activeIndex = tabs.findIndex(t =>
    t.to === '/' ? location.pathname === '/' : location.pathname.startsWith(t.to)
  );

  const innerWidth = useTransform(scrollProgress, [0, 1], [100, 25], { clamp: true });
  const innerWidthStr = useTransform(innerWidth, v => `${v}%`);

  const inactiveOpacity = useTransform(scrollProgress, [0, 0.6], [1, 0], { clamp: true });
  const inactiveScale = useTransform(scrollProgress, [0, 0.8], [1, 0.3], { clamp: true });

  return (
    <nav className="tabbar">
      <motion.div
        className="tabbar__inner"
        style={{ width: innerWidthStr }}
      >
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          if (!isActive && isCollapsed) return null;

          return (
            <motion.div
              key={tab.to}
              className="tabbar__item-wrapper"
              style={!isActive ? {
                opacity: inactiveOpacity,
                scale: inactiveScale,
              } : undefined}
            >
              <NavLink
                to={tab.to}
                end={tab.to === '/'}
                className={({ isActive: a }) => `tabbar__item ${a ? 'tabbar__item--active' : ''}`}
              >
                <span className="tabbar__icon">{tab.icon}</span>
                <span className="tabbar__label">{tab.label}</span>
              </NavLink>
            </motion.div>
          );
        })}
      </motion.div>
    </nav>
  );
}
