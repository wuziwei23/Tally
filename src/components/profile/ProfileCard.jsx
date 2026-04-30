import './ProfileCard.css';

export default function ProfileCard({ username }) {
  return (
    <div className="pcard">
      <div className="pcard__avatar">
        <span className="pcard__avatar-char">账</span>
      </div>
      <div className="pcard__info">
        <div className="pcard__name-row">
          <span className="pcard__name">{username || '未设置昵称'}</span>
          <button className="pcard__edit-btn">改</button>
        </div>
        <span className="pcard__hint">点击头像登录</span>
      </div>
    </div>
  );
}
