const fs = require('fs');

// 从 Excel 读取的真实体重数据（手动提取）
// 格式：日期（月.日）→ 体重（斤）
const weightData = [
  // 过渡周（2月）
  { date: '2026-02-16', weight: 177.4, change: 0 },
  { date: '2026-02-17', weight: 176.4, change: -1.0 },
  { date: '2026-02-18', weight: 175.8, change: -0.6 },
  { date: '2026-02-19', weight: 176.4, change: +0.6 },
  
  // 第一周（3月）
  { date: '2026-03-09', weight: 173, change: -0.8 },
  { date: '2026-03-10', weight: 173.2, change: +0.2 },
  { date: '2026-03-11', weight: 173, change: -0.2 },
  { date: '2026-03-12', weight: 172.8, change: -0.2 },
  
  // 第二周（3月底-4月初）
  { date: '2026-03-30', weight: 169.6, change: -2.4 },
  { date: '2026-03-31', weight: 168.2, change: -1.4 },
  { date: '2026-04-01', weight: 168.4, change: +0.2 },
  { date: '2026-04-02', weight: 169.4, change: +1.0 },
  
  // 第三周（4月中）
  { date: '2026-04-20', weight: 163.4, change: -0.8 },
  { date: '2026-04-21', weight: 163.6, change: +0.2 },
  { date: '2026-04-22', weight: 163.6, change: 0 },
  { date: '2026-04-23', weight: 163, change: -0.6 },
  
  // 第四周（5月中）
  { date: '2026-05-11', weight: 162.8, change: -1.4 },
  { date: '2026-05-12', weight: 164, change: +1.2 },
  { date: '2026-05-13', weight: 163.6, change: -0.4 },
  { date: '2026-05-14', weight: 163.6, change: 0 },
];

// 保存到 JSON 文件
const outputPath = '/Users/zhaoyang/WorkBuddy/retirement-plan-web/public/data/weight.json';
fs.writeFileSync(outputPath, JSON.stringify(weightData, null, 2));

console.log(`✅ 已生成 ${weightData.length} 条体重记录`);
console.log('📁 文件路径：', outputPath);
console.log('\n前5条数据：');
console.log(weightData.slice(0, 5));
