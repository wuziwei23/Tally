import { useNavigate } from 'react-router-dom';
import './QuickEntryCard.css';

export default function QuickEntryCard() {
  const navigate = useNavigate();

  return (
    <div className="qe">
      <h2 className="qe__title">今天想记哪一笔？</h2>
      <p className="qe__sub">快速记录今天的收入或支出</p>

      <div className="qe__cards">
        {/* Voice / AI Card */}
        <button className="qe__card qe__card--green" onClick={() => navigate('/add')}>
          <div className="qe__card-head">
            <span className="qe__card-icon">语</span>
            <span className="qe__badge qe__badge--orange">更省事</span>
          </div>
          <h3 className="qe__card-title">语音记账</h3>
          <p className="qe__card-desc">说一句话或上传截图，自动识别金额、分类和备注</p>
        </button>

        {/* Manual Card */}
        <button className="qe__card qe__card--pink" onClick={() => navigate('/add')}>
          <div className="qe__card-head">
            <span className="qe__card-icon">手</span>
            <span className="qe__badge qe__badge--yellow">最常用</span>
          </div>
          <h3 className="qe__card-title">手动记账</h3>
          <p className="qe__card-desc">手动输入金额、名称和分类</p>
        </button>
      </div>
    </div>
  );
}
