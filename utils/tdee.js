/**
 * TDEE 计算工具
 * 基于 Mifflin-St Jeor 公式
 */

function calcBMR(gender, weight, height, age) {
  // gender: 'male' | 'female', weight: kg, height: cm, age: years
  if (gender === 'female') {
    return 10 * weight + 6.25 * height - 5 * age - 161
  }
  return 10 * weight + 6.25 * height - 5 * age + 5
}

var ACTIVITY_MAP = {
  sedentary: { label: '久坐不动', multiplier: 1.2,   desc: '办公室工作，几乎不运动',   icon: '🪑' },
  light:     { label: '轻度活动', multiplier: 1.375, desc: '每周运动 1-3 次',          icon: '🚶' },
  moderate:  { label: '中度活动', multiplier: 1.55,  desc: '每周运动 3-5 次',          icon: '🏃' },
  active:    { label: '高度活动', multiplier: 1.725, desc: '每周运动 6-7 次',          icon: '💪' },
  extreme:   { label: '极高强度', multiplier: 1.9,   desc: '体力劳动 / 专业运动员',    icon: '🔥' }
}

var GOAL_MAP = {
  lose:     { label: '减脂',     adjust: -500, color: '#FF6B6B', icon: '📉', desc: '每日热量缺口 500 千卡' },
  maintain: { label: '维持体重', adjust: 0,    color: '#6BCB77', icon: '⚖️', desc: '保持热量收支平衡' },
  gain:     { label: '增肌增重', adjust: 400,  color: '#6C8EEF', icon: '📈', desc: '每日热量盈余 400 千卡' }
}

/**
 * 计算完整热量方案
 * @param {Object} userInfo - { gender, weight(kg), height(cm), age, activityLevel, goal }
 * @param {Number} exerciseCal - 当日运动消耗千卡
 * @returns {Object|null} 完整方案，资料不全返回 null
 */
function getFullPlan(userInfo, exerciseCal) {
  if (!userInfo || !userInfo.weight || !userInfo.height || !userInfo.age || !userInfo.gender) {
    return null
  }

  var gender  = userInfo.gender
  var weight  = Number(userInfo.weight)
  var height  = Number(userInfo.height)
  var age     = Number(userInfo.age)
  var actKey  = userInfo.activityLevel || 'sedentary'
  var goalKey = userInfo.goal || 'maintain'

  var act = ACTIVITY_MAP[actKey] || ACTIVITY_MAP.sedentary
  var g   = GOAL_MAP[goalKey]   || GOAL_MAP.maintain

  var bmr   = calcBMR(gender, weight, height, age)
  var tdee  = Math.round(bmr * act.multiplier)
  var exCal = Number(exerciseCal) || 0
  var dailyBurn = tdee + exCal
  var target    = Math.round(dailyBurn + g.adjust)

  // 安全下限
  if (gender === 'female' && target < 1200) target = 1200
  if (gender === 'male'   && target < 1500) target = 1500

  return {
    bmr:              Math.round(bmr),
    tdee:             tdee,
    exerciseCal:      exCal,
    dailyBurn:        dailyBurn,
    target:           target,
    activityLevel:    actKey,
    goal:             goalKey,
    activityLabel:    act.label,
    activityMultiplier: act.multiplier,
    activityDesc:     act.desc,
    activityIcon:     act.icon,
    goalLabel:        g.label,
    goalAdjust:       g.adjust,
    goalColor:        g.color,
    goalDesc:         g.desc,
    goalIcon:         g.icon
  }
}

module.exports = {
  calcBMR:      calcBMR,
  ACTIVITY_MAP: ACTIVITY_MAP,
  GOAL_MAP:     GOAL_MAP,
  getFullPlan:  getFullPlan
}
