import { useRef, useCallback, useEffect } from 'react';
import { getCategoryById } from '../../data/categories';
import { formatCurrency } from '../../utils/format';
import CategoryIcon from '../common/CategoryIcon';
import './HistoryCard.css';

function getDisplayTime(txn) {
  if (txn.createdAt) {
    const d = new Date(txn.createdAt);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
  return '';
}

const SWIPE_THRESHOLD = 80;
const SNAP_OPEN = -140;

export default function HistoryCard({ txn, onDelete, onEdit, isOpen, onSwipeStart }) {
  const cat = getCategoryById(txn.categoryId);
  const isExpense = txn.type === 'expense';
  const time = getDisplayTime(txn);

  const startX = useRef(0);
  const currentX = useRef(0);
  const dragging = useRef(false);
  const cardRef = useRef(null);

  // Reset when this card is no longer the open one
  useEffect(() => {
    if (!isOpen && cardRef.current) {
      cardRef.current.style.transition = 'transform 0.25s ease';
      cardRef.current.style.transform = 'translateX(0)';
      currentX.current = 0;
    }
  }, [isOpen]);

  const handleTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX;
    dragging.current = true;
    onSwipeStart(txn.id);
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }
  }, [txn.id, onSwipeStart]);

  const handleTouchMove = useCallback((e) => {
    if (!dragging.current) return;
    const dx = e.touches[0].clientX - startX.current;
    if (dx > 0) {
      currentX.current = 0;
      if (cardRef.current) cardRef.current.style.transform = 'translateX(0)';
      return;
    }
    const clamped = dx < SNAP_OPEN ? SNAP_OPEN + (dx - SNAP_OPEN) * 0.3 : dx;
    currentX.current = clamped;
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${clamped}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    dragging.current = false;
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.25s ease';
      if (currentX.current < -SWIPE_THRESHOLD) {
        cardRef.current.style.transform = `translateX(${SNAP_OPEN}px)`;
      } else {
        cardRef.current.style.transform = 'translateX(0)';
        currentX.current = 0;
      }
    }
  }, []);

  return (
    <div className="hcard-wrap">
      {/* Action buttons underneath */}
      <div className="hcard__actions">
        <button className="hcard__action hcard__action--edit" onClick={() => onEdit(txn)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          修改
        </button>
        <button className="hcard__action hcard__action--del" onClick={() => onDelete(txn.id)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          删除
        </button>
      </div>

      {/* Swipeable card */}
      <div
        className="hcard"
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="hcard__icon" style={{ background: cat.color + '25', color: cat.color }}>
          <CategoryIcon categoryId={txn.categoryId} size={20} color={cat.color} />
        </div>
        <div className="hcard__info">
          <span className="hcard__name">{txn.note || cat.name}</span>
          <span className="hcard__sub">{cat.name}{time ? ` · ${time}` : ''}</span>
        </div>
        <span className={`hcard__amount ${isExpense ? '' : 'text-green'}`}>
          {isExpense ? '-' : '+'}¥{formatCurrency(txn.amount)}
        </span>
        <button className="hcard__del" onClick={() => onDelete(txn.id)} title="删除">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
