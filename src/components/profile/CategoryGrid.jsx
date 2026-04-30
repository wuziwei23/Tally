import CategoryIcon from '../common/CategoryIcon';
import './CategoryGrid.css';

export default function CategoryGrid({ categories }) {
  return (
    <div className="catgrid">
      {categories.map(cat => (
        <div key={cat.id} className="catgrid__item">
          <span className="catgrid__icon" style={{ background: cat.color + '25', color: cat.color }}>
            <CategoryIcon categoryId={cat.id} size={18} color={cat.color} />
          </span>
          <span className="catgrid__name">{cat.name}</span>
        </div>
      ))}
    </div>
  );
}
