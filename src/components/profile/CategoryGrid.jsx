import './CategoryGrid.css';

function getCatChar(name) {
  return name.charAt(0);
}

export default function CategoryGrid({ categories }) {
  return (
    <div className="catgrid">
      {categories.map(cat => (
        <div key={cat.id} className="catgrid__item">
          <span className="catgrid__icon" style={{ background: cat.color + '25', color: cat.color }}>
            {getCatChar(cat.name)}
          </span>
          <span className="catgrid__name">{cat.name}</span>
        </div>
      ))}
    </div>
  );
}
