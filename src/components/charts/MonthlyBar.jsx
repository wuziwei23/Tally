import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MonthlyBar({ data }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '16px 8px 8px 0' }}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: '#8E8E93' }}
            axisLine={{ stroke: '#E5E5EA' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#8E8E93' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value) => [`¥${value.toLocaleString()}`, undefined]}
            contentStyle={{
              borderRadius: 10,
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontSize: 14,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 13, paddingTop: 8 }}
            formatter={(value) => (value === 'income' ? '收入' : '支出')}
          />
          <Bar dataKey="income" fill="#34C759" radius={[4, 4, 0, 0]} barSize={20} name="income" />
          <Bar dataKey="expense" fill="#FF3B30" radius={[4, 4, 0, 0]} barSize={20} name="expense" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
