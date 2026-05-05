import './ProfileCard.css';

export default function ProfileCard({ profile, onClick }) {
  const loggedIn = !!profile;

  return (
    <div className="pcard" onClick={onClick} role="button" tabIndex={0}>
      <div
        className="pcard__avatar"
        style={loggedIn ? { background: profile.avatarColor } : undefined}
      >
        <span className="pcard__avatar-char">账</span>
      </div>
      <div className="pcard__info">
        <div className="pcard__name-row">
          <span className="pcard__name">
            {loggedIn ? profile.nickname : '未设置昵称'}
          </span>
          <button className="pcard__edit-btn">
            {loggedIn ? '编辑' : '改'}
          </button>
        </div>
        <span className="pcard__hint">
          {loggedIn ? '已登录 · 本地同步中' : '点击头像登录'}
        </span>
      </div>
    </div>
  );
}
