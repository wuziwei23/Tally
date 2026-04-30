export function formatCurrency(amount) {
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}月${day}日`;
}

export function formatDateFull(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${year}年${month}月${day}日 ${weekdays[d.getDay()]}`;
}

export function getMonthKey(dateStr) {
  return dateStr.substring(0, 7);
}

export function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-');
  return `${year}年${parseInt(month)}月`;
}

export function getToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
