import './SegmentedControl.css';

export default function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="seg">
      {options.map(opt => (
        <button
          key={opt.value}
          className={`seg__btn ${value === opt.value ? 'seg__btn--active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
