import './StatsEmpty.css';

export default function StatsEmpty() {
  return (
    <div className="stats-empty">
      <div className="stats-empty__badge">暂无账单</div>
      <p className="stats-empty__main">先去记一笔，统计页才会开始计算</p>
      <p className="stats-empty__sub">这里会自动读取账单数据，保存成功后会自动刷新统计结果。</p>
      <div className="stats-empty__icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-gray)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      </div>
    </div>
  );
}
