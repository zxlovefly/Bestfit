// 计算运动消耗热量（大卡）
// MET：运动代谢当量  weight：kg  time：分钟
function calcSportCalorie(MET, weight, time) {
  // 公式：消耗 = MET × 体重kg × 时间小时
  return (MET * weight * (time / 60)).toFixed(1);
}

// 基础代谢 BMR（男女不同）
function calcBMR(sex, weight, height, age) {
  if (sex === '男') {
    return (13.7 * weight + 5.0 * height - 6.8 * age + 66).toFixed(0);
  } else {
    return (9.6 * weight + 1.8 * height - 4.7 * age + 655).toFixed(0);
  }
}

// 食物热量库（可自行扩充）
const foodList = [
  { name: '白米饭(100g)', cal: 130 },
  { name: '鸡胸肉(100g)', cal: 165 },
  { name: '鸡蛋(1个)', cal: 70 },
  { name: '苹果(1个)', cal: 52 },
  { name: '牛奶(250ml)', cal: 150 },
  { name: '西兰花(100g)', cal: 34 },
  { name: '燕麦(50g)', cal: 190 }
];

// 运动热量库（MET值）
const sportList = [
  { name: '慢走', met: 3.5 },
  { name: '慢跑', met: 8.3 },
  { name: '跳绳', met: 10.0 },
  { name: '健身操', met: 6.0 },
  { name: '力量训练', met: 5.0 },
  { name: '游泳', met: 7.0 }
];

// 碳循环方案
const carbPlan = {
  // 新手：高碳日/低碳日循环
  beginner: [
    { day: '第1天(高碳)', desc: '碳水：每kg体重4g | 蛋白质：2g | 脂肪：1g', tip: '配合训练' },
    { day: '第2天(低碳)', desc: '碳水：每kg体重2g | 蛋白质：2g | 脂肪：1g', tip: '轻运动' },
    { day: '第3天(高碳)', desc: '同第1天', tip: '力量训练' },
    { day: '第4天(低碳)', desc: '同第2天', tip: '休息/散步' }
  ],
  // 进阶
  advanced: '高碳日5g/kg、低碳日1.5g/kg，循环5天',
  // 专业
  pro: '无碳日+高碳日结合，适合备赛'
};

module.exports = {
  calcSportCalorie,
  calcBMR,
  foodList,
  sportList,
  carbPlan
};