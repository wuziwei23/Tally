function uid() {
  return 'txn_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
}

function makeTxn(type, categoryId, amount, date, note = '') {
  return {
    id: uid(),
    type,
    categoryId,
    amount,
    date,
    note,
    createdAt: new Date(date + 'T12:00:00').toISOString(),
  };
}

export function generateSampleTransactions() {
  const txns = [];

  // January 2026
  txns.push(makeTxn('income', 'salary', 15000, '2026-01-10', '1月工资'));
  txns.push(makeTxn('expense', 'housing', 3500, '2026-01-05', '1月房租'));
  txns.push(makeTxn('expense', 'food', 45, '2026-01-08', '午餐'));
  txns.push(makeTxn('expense', 'food', 68, '2026-01-12', '朋友聚餐'));
  txns.push(makeTxn('expense', 'transport', 120, '2026-01-15', '加油'));
  txns.push(makeTxn('expense', 'shopping', 299, '2026-01-18', '买衣服'));
  txns.push(makeTxn('expense', 'bills', 180, '2026-01-20', '水电费'));
  txns.push(makeTxn('expense', 'entertainment', 88, '2026-01-22', '电影票'));
  txns.push(makeTxn('income', 'bonus', 5000, '2026-01-25', '年终奖'));

  // February 2026
  txns.push(makeTxn('income', 'salary', 15000, '2026-02-10', '2月工资'));
  txns.push(makeTxn('expense', 'housing', 3500, '2026-02-05', '2月房租'));
  txns.push(makeTxn('expense', 'food', 38, '2026-02-07', '外卖'));
  txns.push(makeTxn('expense', 'food', 156, '2026-02-14', '情人节晚餐'));
  txns.push(makeTxn('expense', 'shopping', 899, '2026-02-14', '情人节礼物'));
  txns.push(makeTxn('expense', 'transport', 85, '2026-02-18', '地铁充值'));
  txns.push(makeTxn('expense', 'health', 200, '2026-02-20', '体检'));
  txns.push(makeTxn('income', 'freelance', 3000, '2026-02-22', '兼职收入'));
  txns.push(makeTxn('expense', 'bills', 160, '2026-02-25', '话费'));

  // March 2026
  txns.push(makeTxn('income', 'salary', 15000, '2026-03-10', '3月工资'));
  txns.push(makeTxn('expense', 'housing', 3500, '2026-03-05', '3月房租'));
  txns.push(makeTxn('expense', 'food', 52, '2026-03-08', '早餐'));
  txns.push(makeTxn('expense', 'food', 89, '2026-03-15', '火锅'));
  txns.push(makeTxn('expense', 'travel', 1200, '2026-03-18', '周末短途游'));
  txns.push(makeTxn('expense', 'education', 199, '2026-03-20', '网课'));
  txns.push(makeTxn('expense', 'transport', 95, '2026-03-22', '打车'));
  txns.push(makeTxn('income', 'investment', 800, '2026-03-25', '理财收益'));
  txns.push(makeTxn('expense', 'entertainment', 128, '2026-03-28', 'KTV'));

  // April 2026
  txns.push(makeTxn('income', 'salary', 15000, '2026-04-10', '4月工资'));
  txns.push(makeTxn('expense', 'housing', 3500, '2026-04-05', '4月房租'));
  txns.push(makeTxn('expense', 'food', 42, '2026-04-06', '午餐'));
  txns.push(makeTxn('expense', 'food', 75, '2026-04-12', '日料'));
  txns.push(makeTxn('expense', 'shopping', 599, '2026-04-15', '买鞋'));
  txns.push(makeTxn('expense', 'transport', 110, '2026-04-18', '加油'));
  txns.push(makeTxn('expense', 'bills', 200, '2026-04-20', '电费'));
  txns.push(makeTxn('income', 'bonus', 2000, '2026-04-22', '项目奖金'));
  txns.push(makeTxn('expense', 'entertainment', 65, '2026-04-25', '游戏充值'));
  txns.push(makeTxn('expense', 'food', 35, '2026-04-28', '下午茶'));

  // Sort by date descending
  txns.sort((a, b) => b.date.localeCompare(a.date));

  return txns;
}
