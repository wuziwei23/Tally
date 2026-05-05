import { ICON_MAP } from './iconMap';

export const expenseCategories = [
  { id: 'food', name: '餐饮', icon: ' ', type: 'expense', color: '#FF9500' },
  { id: 'transport', name: '交通', icon: ' ', type: 'expense', color: '#007AFF' },
  { id: 'shopping', name: '购物', icon: ' ', type: 'expense', color: '#FF2D55' },
  { id: 'entertainment', name: '娱乐', icon: ' ', type: 'expense', color: '#AF52DE' },
  { id: 'housing', name: '住房', icon: ' ', type: 'expense', color: '#5856D6' },
  { id: 'bills', name: '账单', icon: ' ', type: 'expense', color: '#FF3B30' },
  { id: 'health', name: '医疗', icon: '⚕️', type: 'expense', color: '#34C759' },
  { id: 'education', name: '教育', icon: ' ', type: 'expense', color: '#5AC8FA' },
  { id: 'travel', name: '旅行', icon: '✈️', type: 'expense', color: '#00C7BE' },
  { id: 'other_expense', name: '其他', icon: ' ', type: 'expense', color: '#8E8E93' },
];

export const incomeCategories = [
  { id: 'salary', name: '工资', icon: ' ', type: 'income', color: '#34C759' },
  { id: 'bonus', name: '奖金', icon: ' ', type: 'income', color: '#FF9500' },
  { id: 'freelance', name: '兼职', icon: ' ', type: 'income', color: '#007AFF' },
  { id: 'investment', name: '投资', icon: ' ', type: 'income', color: '#5856D6' },
  { id: 'refund', name: '退款', icon: ' ', type: 'income', color: '#FF2D55' },
  { id: 'gift', name: '红包', icon: ' ', type: 'income', color: '#FF3B30' },
  { id: 'other_income', name: '其他', icon: ' ', type: 'income', color: '#8E8E93' },
];

export const allCategories = [...expenseCategories, ...incomeCategories];

function getCustomCategories() {
  try {
    const raw = localStorage.getItem('custom_categories');
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function withIconComponent(cat) {
  return { ...cat, iconComponent: ICON_MAP[cat.icon] || null };
}

export function getCategoryById(id) {
  const found = allCategories.find(c => c.id === id);
  if (found) return found;
  const customs = getCustomCategories();
  const custom = customs.find(c => c.id === id);
  if (custom) return withIconComponent(custom);
  return { id, name: '未知', icon: '❓', color: '#8E8E93' };
}

export function getCategoryByName(name) {
  const found = allCategories.find(c => c.name === name);
  if (found) return found;
  const customs = getCustomCategories();
  const custom = customs.find(c => c.name === name);
  if (custom) return withIconComponent(custom);
  return { id: name, name: '未知', icon: '❓', color: '#8E8E93' };
}
