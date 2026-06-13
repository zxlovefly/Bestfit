var PLAN_MACRO = {
  crd:[{n:'均衡日',c:0.40,p:0.30,f:0.30}],
  carbon:[{n:'高碳水日',c:0.55,p:0.20,f:0.25},{n:'高碳水日',c:0.55,p:0.20,f:0.25},{n:'中碳水日',c:0.40,p:0.30,f:0.30},{n:'低碳水日',c:0.25,p:0.40,f:0.35},{n:'中碳水日',c:0.40,p:0.30,f:0.30},{n:'高碳水日',c:0.55,p:0.20,f:0.25},{n:'低碳水日',c:0.25,p:0.40,f:0.35}],
  sugar:[{n:'控糖日',c:0.35,p:0.35,f:0.30}],
  fast52:[{n:'正常日',c:0.45,p:0.25,f:0.30},{n:'正常日',c:0.45,p:0.25,f:0.30},{n:'断食日',c:0.35,p:0.40,f:0.25,mul:0.30},{n:'正常日',c:0.45,p:0.25,f:0.30},{n:'正常日',c:0.45,p:0.25,f:0.30},{n:'断食日',c:0.35,p:0.40,f:0.25,mul:0.30},{n:'正常日',c:0.45,p:0.25,f:0.30}],
  glp:[{n:'标准日',c:0.35,p:0.35,f:0.30}],
  highpro:[{n:'高蛋白日',c:0.30,p:0.40,f:0.30}],
  med:[{n:'地中海日',c:0.45,p:0.20,f:0.35}],
  dash:[{n:'DASH日',c:0.50,p:0.20,f:0.30}],
  flex:[{n:'弹性素食日',c:0.50,p:0.20,f:0.30}]
}
var GOAL_MACROS = {
  lose:{p:0.30,c:0.40,f:0.30},gain:{p:0.25,c:0.50,f:0.25},
  maintain:{p:0.25,c:0.45,f:0.30},tone:{p:0.30,c:0.40,f:0.30}
}

var MEAL_KEYS = ['breakfast','snack_morning','lunch','snack_afternoon','dinner','snack_evening']

function fmtDate(d) { return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate() }

function parseDateStr(s) {
  if(!s) return null; var p=s.split('-'); if(p.length!==3) return null
  return new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]))
}

function daysBetween(s1,s2) {
  var a=parseDateStr(s1),b=parseDateStr(s2); if(!a||!b) return 0
  a.setHours(0,0,0,0); b.setHours(0,0,0,0)
  var d=Math.floor((b.getTime()-a.getTime())/86400000); return d<0?0:d
}

function getTargetsForDate(dateStr) {
  var info=null; try{info=wx.getStorageSync('userInfo')}catch(e){}
  var bmr=0,tdee=0,target=1800,goalType='maintain'
  if(info&&info.weight&&info.height&&info.age){
    var w=Number(info.weight),h=Number(info.height),a=Number(info.age)
    bmr=Math.round(info.gender==='female'?10*w+6.25*h-5*a-161:10*w+6.25*h-5*a+5)
    var ACT=[1.2,1.375,1.55,1.725]; tdee=Math.round(bmr*(ACT[info.activity]||1.2))
    var train=null; try{train=wx.getStorageSync('activeTrainingPlan')}catch(e){}
    var exCal=(train&&train.weeklyCalBurn)?Math.round(train.weeklyCalBurn/7):0
    var dailyBurn=tdee+exCal
    var adjMap=[-500,400,0,-200]; var adj=adjMap[typeof info.goal==='number'?info.goal:2]||0
    target=dailyBurn+adj
    if(info.gender==='female'&&target<1200) target=1200
    if(info.gender!=='female'&&target<1500) target=1500
    var goalTypes=['lose','gain','maintain','tone']
    goalType=goalTypes[typeof info.goal==='number'?info.goal:2]||'maintain'
  }
  var gm=GOAL_MACROS[goalType]||GOAL_MACROS.maintain
  var plan=null; try{plan=wx.getStorageSync('activeDietPlan')}catch(e){}
  if(plan&&plan.planKey&&plan.startDate){
    var macros=PLAN_MACRO[plan.planKey]||PLAN_MACRO.crd
    var dp=daysBetween(plan.startDate,dateStr), idx=dp%macros.length, m=macros[idx]
    var tc=m.mul?Math.max(500,Math.round(target*m.mul)):target
    return {cal:tc,carbs:Math.round(tc*m.c/4),protein:Math.round(tc*m.p/4),fat:Math.round(tc*m.f/9),cPct:Math.round(m.c*100),pPct:Math.round(m.p*100),fPct:Math.round(m.f*100),dayName:m.n,planDay:dp+1}
  }
  return {cal:target,carbs:Math.round(target*gm.c/4),protein:Math.round(target*gm.p/4),fat:Math.round(target*gm.f/9),cPct:Math.round(gm.c*100),pPct:Math.round(gm.p*100),fPct:Math.round(gm.f*100),dayName:goalType==='lose'?'减脂日':goalType==='gain'?'增肌日':'维持日',planDay:0}
}

/**
 * 在 foodRecords 中按多种格式查找某天的记录
 * 因为不同页面可能用不同格式的 key（2024-1-5 vs 2024-01-05）
 */
function findRecForDate(allRec, dateStr) {
  if (allRec[dateStr]) return allRec[dateStr]
  var parts = dateStr.split('-')
  if (parts.length !== 3) return null
  // 尝试去掉前导零：2024-01-05 → 2024-1-5
  var bare = parseInt(parts[0]) + '-' + parseInt(parts[1]) + '-' + parseInt(parts[2])
  if (bare !== dateStr && allRec[bare]) return allRec[bare]
  // 尝试加前导零：2024-1-5 → 2024-01-05
  var padded = parts[0] + '-' + (parts[1].length < 2 ? '0' : '') + parts[1] + '-' + (parts[2].length < 2 ? '0' : '') + parts[2]
  if (padded !== dateStr && allRec[padded]) return allRec[padded]
  return null
}

/**
 * 计算指定日期的食物总摄入量
 * @param {string} dateStr - 日期字符串
 * @returns {{ cal:number, carbs:number, protein:number, fat:number }}
 */
function getIntakeForDate(dateStr) {
  var allRec = {}; try { allRec = wx.getStorageSync('foodRecords') || {} } catch(e) {}
  var rec = findRecForDate(allRec, dateStr) || {}
  var tc = 0, tC = 0, tP = 0, tF = 0
  MEAL_KEYS.forEach(function(key) {
    var list = rec[key] || []
    list.forEach(function(r) {
      tc += r.cal || 0
      tC += r.carbs || 0
      tP += r.protein || 0
      tF += r.fat || 0
    })
  })
  return {
    cal: Math.round(tc),
    carbs: +tC.toFixed(1),
    protein: +tP.toFixed(1),
    fat: +tF.toFixed(1)
  }
}

/**
 * 获取今天的总摄入量（自动用今天的日期）
 * @returns {{ cal:number, carbs:number, protein:number, fat:number }}
 */
function getTodayIntake() {
  var now = new Date()
  var todayStr = fmtDate(now)
  return getIntakeForDate(todayStr)
}

module.exports = { fmtDate, parseDateStr, daysBetween, getTargetsForDate, getIntakeForDate, getTodayIntake }
