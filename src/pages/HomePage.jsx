import QuickEntryCard from '../components/home/QuickEntryCard';
import MonthSummaryCard from '../components/home/MonthSummaryCard';
import TodayRecordList from '../components/home/TodayRecordList';
import './HomePage.css';

export default function HomePage() {
  return (
    <div className="page page-enter">
      <div className="home">
        {/* Header */}
        <div className="home__header">
          <h1 className="home__title">首页</h1>
          <div className="home__bell">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-dark)" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
        </div>

        {/* Module 1: Quick Entry */}
        <QuickEntryCard />

        {/* Module 2: Month Summary */}
        <MonthSummaryCard />

        {/* Module 3: Today Records */}
        <TodayRecordList />
      </div>
    </div>
  );
}
