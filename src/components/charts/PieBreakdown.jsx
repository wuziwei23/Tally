import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function PieBreakdown({ data }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '16px 0' }}>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`¥${value.toLocaleString()}`, '金额']}
            contentStyle={{
              borderRadius: 10,
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontSize: 14,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
