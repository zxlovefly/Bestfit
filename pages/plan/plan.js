var app = getApp()

/* ======================== 饮食计划 ======================== */
var PLAN_KEYS = ['crd','carbon','sugar','fast52','glp','highpro','med','dash','flex']
var PLAN_META = {
  crd:   { name:'CRD减肥食谱',  icon:'📊', desc:'经典热量缺口均衡饮食，每日适度减少摄入，适配绝大多数超重/肥胖人群。', period:21, target:'8斤', users:'481万', ref:'中国超重/肥胖医学营养治疗指南(2021)' },
  carbon:{ name:'碳循环食谱',    icon:'🔄', desc:'按周进行高/中低碳循环，兼顾减脂与运动表现。', period:7, target:'每周2-3斤', users:'286万', ref:'Kresta et al., 2020' },
  sugar: { name:'控糖食谱',      icon:'🍬', desc:'优选低GI食材，帮助平稳血糖，适合血糖敏感人群。', period:14, target:'5斤', users:'152万', ref:'ADA Standards of Care 2023' },
  fast52:{ name:'5+2轻断食',     icon:'⏰', desc:'每周2天严格控卡，其余5天正常饮食，降低执行难度。', period:7, target:'每周1-2斤', users:'198万', ref:'Harvie et al., 2011' },
  glp:   { name:'GLP减肥食谱',   icon:'💊', desc:'针对GLP-1用药减重人群设计，强化蛋白质与微量营养素。', period:21, target:'8斤', users:'67万', ref:'Wadden et al., 2023' },
  highpro:{name:'中高蛋白食谱',  icon:'🥩', desc:'蛋白质30-35%，增加饱腹感，适配增肌防反弹人群。', period:21, target:'6斤', users:'134万', ref:'Leidy et al., 2015' },
  med:   { name:'地中海食谱',    icon:'🫒', desc:'以橄榄油、鱼类、全谷物、蔬果为主，兼顾心血管健康。', period:28, target:'8斤', users:'89万', ref:'Estruch et al., 2018' },
  dash:  { name:'DASH食谱',      icon:'❤️', desc:'低钠高钾，富含蔬果与低脂乳制品，针对血压管理。', period:28, target:'6斤', users:'45万', ref:'Sacks et al., 2001' },
  flex:  { name:'弹性素食食谱',  icon:'🥬', desc:'以植物性食物为主，适量搭配动物蛋白的半素食生活。', period:21, target:'5斤', users:'72万', ref:'Turner-McGrievy et al., 2015' },
}
var PLAN_MACRO = {
  crd:[{n:'均衡日',c:0.40,p:0.30,f:0.30}],
  carbon:[{n:'高碳水日',c:0.55,p:0.20,f:0.25},{n:'高碳水日',c:0.55,p:0.20,f:0.25},{n:'中碳水日',c:0.40,p:0.30,f:0.30},{n:'低碳水日',c:0.25,p:0.40,f:0.35},{n:'中碳水日',c:0.40,p:0.30,f:0.30},{n:'高碳水日',c:0.55,p:0.20,f:0.25},{n:'低碳水日',c:0.25,p:0.40,f:0.35}],
  sugar:[{n:'控糖日',c:0.35,p:0.35,f:0.30}],
  fast52:[{n:'正常日',c:0.45,p:0.25,f:0.30},{n:'正常日',c:0.45,p:0.25,f:0.30},{n:'断食日',c:0.35,p:0.40,f:0.25,mul:0.30},{n:'正常日',c:0.45,p:0.25,f:0.30},{n:'正常日',c:0.45,p:0.25,f:0.30},{n:'断食日',c:0.35,p:0.40,f:0.25,mul:0.30},{n:'正常日',c:0.45,p:0.25,f:0.30}],
  glp:[{n:'标准日',c:0.35,p:0.35,f:0.30}],
  highpro:[{n:'高蛋白日',c:0.30,p:0.40,f:0.30}],
  med:[{n:'地中海日',c:0.45,p:0.20,f:0.35}],
  dash:[{n:'DASH日',c:0.50,p:0.20,f:0.30}],
  flex:[{n:'弹性素食日',c:0.50,p:0.20,f:0.30}],
}
var GOAL_MACROS = {
  lose:{p:0.30,c:0.40,f:0.30,label:'减脂',adjLabel:'热量缺口'},
  gain:{p:0.25,c:0.50,f:0.25,label:'增肌',adjLabel:'热量盈余'},
  maintain:{p:0.25,c:0.45,f:0.30,label:'维持',adjLabel:'热量平衡'},
  tone:{p:0.30,c:0.40,f:0.30,label:'塑形',adjLabel:'轻微缺口'},
}

/* ======================== 食材库 ======================== */
var FOODS = {
  balanced:{bf:[{n:'全麦面包',g:70,cal:165},{n:'水煮蛋',g:120,cal:156},{n:'牛奶',g:250,cal:135}],lu:[{n:'杂粮饭',g:180,cal:200},{n:'酱牛肉',g:100,cal:190},{n:'凉拌黄瓜',g:150,cal:30}],sk:[{n:'酸奶',g:150,cal:90},{n:'苹果',g:200,cal:100}],di:[{n:'荞麦面',g:80,cal:130},{n:'白灼虾',g:150,cal:130},{n:'蒜蓉生菜',g:200,cal:40}]},
  highCarb:{bf:[{n:'燕麦片',g:60,cal:220},{n:'香蕉',g:120,cal:105},{n:'脱脂牛奶',g:250,cal:90},{n:'水煮蛋',g:60,cal:78}],lu:[{n:'糙米饭',g:200,cal:230},{n:'鸡胸肉',g:120,cal:160},{n:'清炒西兰花',g:150,cal:50}],sk:[{n:'酸奶',g:150,cal:90},{n:'橙子',g:200,cal:90}],di:[{n:'红薯',g:200,cal:170},{n:'清蒸鲈鱼',g:150,cal:160},{n:'蒜蓉菠菜',g:200,cal:50}]},
  lowCarb:{bf:[{n:'煎蛋',g:120,cal:180},{n:'牛油果',g:80,cal:130},{n:'芝士片',g:30,cal:100}],lu:[{n:'煎三文鱼',g:150,cal:280},{n:'牛油果沙拉',g:200,cal:150}],sk:[{n:'小黄瓜',g:200,cal:32},{n:'奶酪块',g:40,cal:130}],di:[{n:'嫩豆腐',g:200,cal:160},{n:'清炒虾仁',g:120,cal:100},{n:'蒜蓉西兰花',g:200,cal:70}]},
  sugarCtrl:{bf:[{n:'钢切燕麦',g:50,cal:180},{n:'蓝莓',g:80,cal:46},{n:'核桃仁',g:15,cal:98}],lu:[{n:'藜麦饭',g:150,cal:180},{n:'香煎鸡胸',g:120,cal:160},{n:'凉拌苦瓜',g:150,cal:30}],sk:[{n:'希腊酸奶',g:150,cal:90},{n:'杏仁',g:15,cal:87}],di:[{n:'红薯',g:150,cal:130},{n:'清蒸鳕鱼',g:150,cal:140},{n:'蒜蓉油麦菜',g:200,cal:40}]},
  fasting:{bf:[{n:'水煮蛋',g:60,cal:78},{n:'黑咖啡',g:200,cal:5}],lu:[{n:'鸡胸沙拉',g:200,cal:200},{n:'清汤',g:200,cal:25}],sk:[{n:'小番茄',g:150,cal:30}],di:[{n:'清蒸鳕鱼',g:120,cal:112},{n:'白灼西兰花',g:200,cal:55}]},
  glp:{bf:[{n:'蛋白奶昔',g:300,cal:200},{n:'蓝莓',g:80,cal:46}],lu:[{n:'清蒸鸡胸',g:150,cal:200},{n:'南瓜粥',g:200,cal:100}],sk:[{n:'希腊酸奶',g:150,cal:90},{n:'坚果',g:10,cal:60}],di:[{n:'清蒸鲈鱼',g:150,cal:160},{n:'小米粥',g:200,cal:90},{n:'蒜蓉菠菜',g:200,cal:50}]},
  highPro:{bf:[{n:'鸡蛋白',g:180,cal:96},{n:'全麦面包',g:60,cal:140},{n:'脱脂牛奶',g:300,cal:108}],lu:[{n:'糙米饭',g:150,cal:170},{n:'牛腱肉',g:150,cal:220}],sk:[{n:'蛋白粉',g:30,cal:120},{n:'香蕉',g:100,cal:88}],di:[{n:'鸡胸肉',g:150,cal:200},{n:'清炒虾仁',g:100,cal:87},{n:'蒜蓉西兰花',g:250,cal:85}]},
  med:{bf:[{n:'全麦吐司',g:60,cal:140},{n:'牛油果',g:60,cal:96},{n:'水煮蛋',g:60,cal:78}],lu:[{n:'橄榄油意面',g:200,cal:280},{n:'烤鸡腿',g:120,cal:200}],sk:[{n:'鹰嘴豆泥',g:60,cal:100},{n:'全麦饼干',g:30,cal:120}],di:[{n:'烤鲈鱼',g:150,cal:200},{n:'烤蔬菜',g:250,cal:100}]},
  dash:{bf:[{n:'燕麦粥',g:250,cal:150},{n:'香蕉',g:100,cal:88},{n:'低脂酸奶',g:200,cal:100}],lu:[{n:'糙米饭',g:150,cal:170},{n:'清蒸鸡胸',g:120,cal:160},{n:'清炒芹菜',g:200,cal:40}],sk:[{n:'香蕉',g:100,cal:88},{n:'低脂牛奶',g:200,cal:80}],di:[{n:'全麦馒头',g:80,cal:170},{n:'清蒸鳕鱼',g:150,cal:140},{n:'凉拌菠菜',g:200,cal:50}]},
  flex:{bf:[{n:'豆奶燕麦',g:300,cal:180},{n:'蓝莓',g:80,cal:46}],lu:[{n:'藜麦碗',g:200,cal:240},{n:'鹰嘴豆',g:100,cal:160},{n:'烤蔬菜',g:200,cal:80}],sk:[{n:'毛豆',g:100,cal:120},{n:'坚果',g:15,cal:90}],di:[{n:'豆腐炒时蔬',g:250,cal:180},{n:'杂粮饭',g:150,cal:170}]},
}
var PLAN_TIER = {crd:'balanced',carbon:null,sugar:'sugarCtrl',fast52:null,glp:'glp',highpro:'highPro',med:'med',dash:'dash',flex:'flex'}
function pickTier(pk,m){if(PLAN_TIER[pk])return FOODS[PLAN_TIER[pk]];if(pk==='fast52'&&m.mul)return FOODS.fasting;if(pk==='fast52')return FOODS.balanced;if(m.c>=0.50)return FOODS.highCarb;if(m.c<=0.25)return FOODS.lowCarb;return FOODS.balanced}

/* ======================== 训练计划 ======================== */
var TRAIN = [
  {key:'beginner',name:'新手全身训练',icon:'🌱',diff:'入门',met:4.5,desc:'适合健身新手，每周3天全身力量训练，循序渐进。',sch:[{day:'周一',t:'t',name:'全身训练A',dur:45,ex:['深蹲 3×12','俯卧撑 3×10','哑铃划船 3×12','平板支撑 3×30s']},{day:'周二',t:'r',name:'休息日',dur:0,ex:['轻度拉伸 15min']},{day:'周三',t:'t',name:'全身训练B',dur:45,ex:['硬拉 3×10','卧推 3×10','引体向上 3×8','卷腹 3×15']},{day:'周四',t:'r',name:'休息日',dur:0,ex:['散步 20min']},{day:'周五',t:'t',name:'全身训练C',dur:45,ex:['弓步蹲 3×10/侧','肩推 3×10','高位下拉 3×12','臀桥 3×15']},{day:'周六',t:'r',name:'休息日',dur:0,ex:['瑜伽/拉伸']},{day:'周日',t:'r',name:'休息日',dur:0,ex:[]}]},
  {key:'split',name:'增肌分化训练',icon:'💪',diff:'中级',met:5.5,desc:'上下肢四分化训练，针对性刺激各肌群。',sch:[{day:'周一',t:'t',name:'胸部+三头',dur:60,ex:['杠铃卧推 4×8','上斜哑铃卧推 3×10','绳索夹胸 3×12','绳索下压 3×12']},{day:'周二',t:'t',name:'背部+二头',dur:60,ex:['引体向上 4×8','杠铃划船 4×8','坐姿下拉 3×12','哑铃弯举 3×12']},{day:'周三',t:'t',name:'腿部训练',dur:65,ex:['杠铃深蹲 5×5','腿举 4×10','罗马尼亚硬拉 4×10','腿弯举 3×12']},{day:'周四',t:'r',name:'休息日',dur:0,ex:['轻度有氧 20min','拉伸']},{day:'周五',t:'t',name:'肩部+核心',dur:60,ex:['杠铃肩推 4×8','侧平举 3×15','面拉 3×15','悬垂举腿 3×12']},{day:'周六',t:'t',name:'手臂+补弱',dur:50,ex:['杠铃弯举 4×10','窄距卧推 4×10','锤式弯举 3×12']},{day:'周日',t:'r',name:'休息日',dur:0,ex:[]}]},
  {key:'cardio',name:'减脂有氧计划',icon:'🏃',diff:'入门',met:7.0,desc:'有氧为主结合基础力量，高效燃脂。',sch:[{day:'周一',t:'t',name:'快走+慢跑',dur:50,ex:['热身 5min','快走/慢跑交替 40min','拉伸 5min']},{day:'周二',t:'t',name:'力量基础',dur:40,ex:['深蹲 3×15','俯卧撑 3×12','平板支撑 3×45s']},{day:'周三',t:'r',name:'休息日',dur:0,ex:['散步 30min']},{day:'周四',t:'t',name:'动感单车',dur:45,ex:['热身 5min','中阻力骑行 35min']},{day:'周五',t:'t',name:'跳绳+力量',dur:40,ex:['跳绳 10min','波比跳 3×10','开合跳 3×30s']},{day:'周六',t:'t',name:'户外慢跑',dur:45,ex:['轻松跑 45min']},{day:'周日',t:'r',name:'休息日',dur:0,ex:[]}]},
  {key:'hiit',name:'HIIT间歇训练',icon:'⚡',diff:'中高级',met:10.0,desc:'高强度间歇，短时间高效燃脂。',sch:[{day:'周一',t:'t',name:'HIIT全身',dur:30,ex:['波比跳 8×30s','高抬腿 8×30s','开合跳 8×30s']},{day:'周二',t:'r',name:'主动恢复',dur:0,ex:['散步 20min','泡沫轴放松']},{day:'周三',t:'t',name:'HIIT下肢',dur:30,ex:['深蹲跳 8×30s','弓步跳 8×30s','箱跳 8×30s']},{day:'周四',t:'r',name:'休息日',dur:0,ex:[]},{day:'周五',t:'t',name:'Tabata',dur:25,ex:['开合跳 4min','深蹲 4min','登山者 4min','波比 4min']},{day:'周六',t:'t',name:'轻松有氧',dur:40,ex:['慢跑或快走 40min']},{day:'周日',t:'r',name:'休息日',dur:0,ex:[]}]},
  {key:'running',name:'跑步进阶计划',icon:'🏅',diff:'中级',met:8.0,desc:'轻松跑、节奏跑和长跑，系统提升耐力。',sch:[{day:'周一',t:'r',name:'休息日',dur:0,ex:['轻度拉伸']},{day:'周二',t:'t',name:'轻松跑',dur:40,ex:['配速6:00-7:00 轻松跑 40min']},{day:'周三',t:'t',name:'节奏跑',dur:35,ex:['热身10min','乳酸阈值跑15min','放松10min']},{day:'周四',t:'r',name:'休息日',dur:0,ex:['核心训练 15min']},{day:'周五',t:'t',name:'间歇跑',dur:35,ex:['热身10min','400m快跑×6组','放松5min']},{day:'周六',t:'t',name:'长距离跑',dur:60,ex:['轻松配速长跑 60min']},{day:'周日',t:'r',name:'休息日',dur:0,ex:[]}]},
  {key:'swim',name:'游泳训练计划',icon:'🏊',diff:'入门',met:7.0,desc:'低冲击全身运动，保护关节。',sch:[{day:'周一',t:'t',name:'自由泳',dur:50,ex:['热身 200m','自由泳 4×100m','放松 200m']},{day:'周二',t:'r',name:'休息日',dur:0,ex:[]},{day:'周三',t:'t',name:'混合泳',dur:50,ex:['热身 200m','蛙泳 4×100m','仰泳 200m']},{day:'周四',t:'r',name:'休息日',dur:0,ex:[]},{day:'周五',t:'t',name:'间歇冲刺',dur:45,ex:['热身 200m','50m冲刺×8','放松 200m']},{day:'周六',t:'t',name:'长距离',dur:55,ex:['热身 200m','持续游 1500m']},{day:'周日',t:'r',name:'休息日',dur:0,ex:[]}]},
  {key:'mixed',name:'力量+有氧混合',icon:'🔄',diff:'中级',met:6.5,desc:'力量与有氧结合，全面提升体能。',sch:[{day:'周一',t:'t',name:'上肢力量',dur:55,ex:['杠铃卧推 4×8','引体 4×8','肩推 3×10']},{day:'周二',t:'t',name:'有氧',dur:40,ex:['跑步/单车 40min']},{day:'周三',t:'r',name:'休息日',dur:0,ex:['拉伸 15min']},{day:'周四',t:'t',name:'下肢力量',dur:55,ex:['深蹲 4×8','硬拉 4×8','腿举 3×12']},{day:'周五',t:'t',name:'有氧+核心',dur:45,ex:['跳绳 15min','卷腹 3×20','平板 3×60s']},{day:'周六',t:'r',name:'休息日',dur:0,ex:[]},{day:'周日',t:'r',name:'休息日',dur:0,ex:[]}]},
  {key:'yoga',name:'瑜伽拉伸恢复',icon:'🧘',diff:'入门',met:2.5,desc:'改善柔韧性，缓解压力，促进恢复。',sch:[{day:'周一',t:'t',name:'哈他瑜伽',dur:45,ex:['拜日式×5','战士系列','三角式','冥想']},{day:'周二',t:'r',name:'休息日',dur:0,ex:[]},{day:'周三',t:'t',name:'流瑜伽',dur:50,ex:['流瑜伽序列','平衡体式','核心']},{day:'周四',t:'r',name:'休息日',dur:0,ex:[]},{day:'周五',t:'t',name:'阴瑜伽',dur:45,ex:['深层拉伸','髋部打开','冥想']},{day:'周六',t:'t',name:'散步',dur:40,ex:['轻松散步 40min']},{day:'周日',t:'r',name:'休息日',dur:0,ex:[]}]},
  {key:'home',name:'居家徒手训练',icon:'🏠',diff:'入门',met:4.0,desc:'无需器械，随时随地开练。',sch:[{day:'周一',t:'t',name:'上肢',dur:35,ex:['俯卧撑 4×15','钻石俯卧撑 3×10','臂屈伸 3×12']},{day:'周二',t:'t',name:'下肢',dur:35,ex:['深蹲 4×20','弓步蹲 3×12','臀桥 3×20']},{day:'周三',t:'r',name:'休息日',dur:0,ex:['散步 20min']},{day:'周四',t:'t',name:'HIIT',dur:30,ex:['波比×10','登山者×20','深蹲跳×15','×4组']},{day:'周五',t:'r',name:'休息日',dur:0,ex:[]},{day:'周六',t:'t',name:'核心+拉伸',dur:30,ex:['卷腹 3×20','平板 3×45s','拉伸 15min']},{day:'周日',t:'r',name:'休息日',dur:0,ex:[]}]},
]

/* ======================== 工具函数 ======================== */
function scale(arr, targetCal) {
  var total = 0
  arr.forEach(function(f) { total += f.cal })
  if (!total || !targetCal) return []
  var ratio = targetCal / total
  return arr.map(function(f) {
    return { name: f.n, grams: Math.round(f.g * ratio), cal: Math.round(f.cal * ratio) }
  })
}

function sumCal(arr) {
  var t = 0
  arr.forEach(function(f) { t += f.cal })
  return t
}

/* ========== 与首页统一：读取 app.globalData.tdeeDetail ========== */
function getPersonal() {
  var info = null
  try { info = wx.getStorageSync('userInfo') } catch (e) {}
  if (!info || !info.weight || !info.height || !info.age) return null
  var w = Number(info.weight), h = Number(info.height), a = Number(info.age)
  if (!w || !h || !a) return null

  /* 先确保 app 端已计算 */
  var g = app.globalData || {}
  if (typeof app.calcTargetCalorie === 'function') {
    try { app.calcTargetCalorie() } catch (e) {}
  }
  var dt = g.tdeeDetail || {}

  /* 从统一数据源读取 */
  var bmr = dt.bmr || 0
  var tdee = dt.tdee || 0
  var exerciseCal = dt.exerciseCal || 0
  var dailyBurn = dt.dailyBurn || 0
  var target = dt.target || 0
  var adjust = dt.adjust || 0

  /* 如果 app 没返回有效数据，用完全相同的公式兜底 */
  if (!bmr || !target) {
    bmr = Math.round(info.gender === 'female'
      ? 10 * w + 6.25 * h - 5 * a - 161
      : 10 * w + 6.25 * h - 5 * a + 5)

    var ACT_MULTI_LOCAL = [1.2, 1.375, 1.55, 1.725]
    var actIdx = typeof info.activity === 'number' ? info.activity : 0
    var multi = ACT_MULTI_LOCAL[actIdx] || 1.2
    tdee = Math.round(bmr * multi)

    var train = null
    try { train = wx.getStorageSync('activeTrainingPlan') } catch (e) {}
    exerciseCal = (train && train.weeklyCalBurn) ? Math.round(train.weeklyCalBurn / 7) : 0
    dailyBurn = tdee + exerciseCal

    var goalAdjMap = [-500, 400, 0, -200]
    var goalIdx = typeof info.goal === 'number' ? info.goal : 2
    adjust = goalAdjMap[goalIdx] || 0
    target = dailyBurn + adjust

    if (info.gender === 'female' && target < 1200) target = 1200
    if (info.gender !== 'female' && target < 1500) target = 1500
    if (target > 5000) target = 5000
  }

  /* 宏量比例 */
  var goalTypes = ['lose', 'gain', 'maintain', 'tone']
  var gi = typeof info.goal === 'number' ? info.goal : 2
  var gt = goalTypes[gi] || 'maintain'
  var gm = GOAL_MACROS[gt] || GOAL_MACROS.maintain

  return {
    gender: info.gender, weight: w, height: h, age: a,
    bmr: Math.round(bmr), tdee: Math.round(tdee), dailyEx: exerciseCal,
    goalType: gt, goalLabel: gm.label, adjLabel: gm.adjLabel,
    dailyAdj: adjust, weeklyTarget: 0, targetCal: Math.round(target),
    pPct: Math.round(gm.p * 100), cPct: Math.round(gm.c * 100), fPct: Math.round(gm.f * 100),
    pG: Math.round(target * gm.p / 4), cG: Math.round(target * gm.c / 4), fG: Math.round(target * gm.f / 9)
  }
}

function genDay(pk, macros, tc, eatBf, idx) {
  var m = macros[idx % macros.length]
  var dc = m.mul ? Math.max(500, Math.round(tc * m.mul)) : tc
  var r = eatBf ? { bf: 0.25, lu: 0.38, sk: 0.12, di: 0.25 } : { bf: 0, lu: 0.53, sk: 0.12, di: 0.35 }
  var t = pickTier(pk, m)
  var meals = []
  if (r.bf > 0) {
    var bfS = scale(t.bf, Math.round(dc * r.bf))
    meals.push({ name: '早餐', foods: bfS, totalCal: sumCal(bfS) })
  }
  var luS = scale(t.lu, Math.round(dc * r.lu))
  meals.push({ name: '午餐', foods: luS, totalCal: sumCal(luS) })
  var skS = scale(t.sk, Math.round(dc * r.sk))
  meals.push({ name: '加餐', foods: skS, totalCal: sumCal(skS) })
  var diS = scale(t.di, Math.round(dc * r.di))
  meals.push({ name: '晚餐', foods: diS, totalCal: sumCal(diS) })
  return {
    day: idx + 1, dayName: m.n, totalCal: dc,
    cPct: Math.round(m.c * 100), pPct: Math.round(m.p * 100), fPct: Math.round(m.f * 100),
    cG: Math.round(dc * m.c / 4), pG: Math.round(dc * m.p / 4), fG: Math.round(dc * m.f / 9),
    meals: meals
  }
}

function genWeek(pk, tc, eb) {
  var macros = PLAN_MACRO[pk] || PLAN_MACRO.crd
  var w = []
  for (var i = 0; i < 7; i++) w.push(genDay(pk, macros, tc, eb, i))
  return w
}

function buildTrains(w) {
  return TRAIN.map(function(p) {
    var mins = 0
    p.sch.forEach(function(d) { if (d.t === 't') mins += d.dur })
    return {
      key: p.key, name: p.name, icon: p.icon, diff: p.diff, desc: p.desc,
      sch: p.sch, weeklyHrs: (mins / 60).toFixed(1), weeklyCal: Math.round(p.met * (w || 70) * (mins / 60))
    }
  })
}

/* ====================== 日期循环 ====================== */
function parseDateStr(s) {
  if (!s) return null
  var p = s.split('-')
  if (p.length !== 3) return null
  return new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]))
}

function daysBetween(dateStr) {
  if (!dateStr) return 0
  var start = parseDateStr(dateStr)
  if (!start) return 0
  var now = new Date()
  start.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  var diff = Math.floor((now.getTime() - start.getTime()) / 86400000)
  return diff < 0 ? 0 : diff
}

function todayDateStr() {
  var d = new Date()
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
}

/* ======================== 页面 ======================== */
Page({
  data: {
    hasInfo: false, personal: null,
    /* 饮食主卡片 */
    activeDietKey: '', activeDietName: '', activeDietIcon: '',
    dietWeek: [], dietDayIdx: 0, eatBf: false, dietMealExpanded: '-1',
    todayIdx: 0, planDays: 0,
    /* 训练主卡片 */
    activeTrainKey: '', activeTrainName: '', activeTrainIcon: '',
    trainSchedule: [], trainWeeklyHrs: '', trainWeeklyCal: 0,
    trainDayExpanded: '-1',
    /* 弹窗 */
    showDietModal: false, showTrainModal: false,
    allDiets: [], allTrains: [],
    dietModalExpanded: '', dietModalDayIdx: 0, dietModalMealExpanded: '-1',
    trainModalExpanded: '', trainModalDayExpanded: '-1',
  },

  onLoad: function() { this._init() },

  onShow: function() {
    this._init()
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
  },

  _init: function() {
    var p = getPersonal(), has = !!p, tc = p ? p.targetCal : 1800
    var sv = null
    try { sv = wx.getStorageSync('planSetting') } catch (e) {}
    var eb = sv ? !!sv.eatBf : false
    var ad = null
    try { ad = wx.getStorageSync('activeDietPlan') } catch (e) {}
    var at = null
    try { at = wx.getStorageSync('activeTrainingPlan') } catch (e) {}

    /* 生成所有饮食计划数据 */
    var allD = PLAN_KEYS.map(function(k) {
      var m = PLAN_META[k]
      return {
        key: k, name: m.name, icon: m.icon, desc: m.desc,
        period: m.period, target: m.target, users: m.users, ref: m.ref,
        week: genWeek(k, tc, eb)
      }
    })
    var allT = buildTrains(p ? p.weight : 70)

    /* 自动定位到今天的食谱天 */
    var dw = [], dn = '', di = '', dietDayIdx = 0, todayIdx = 0, planDays = 0
    if (ad && ad.planKey) {
      for (var i = 0; i < allD.length; i++) {
        if (allD[i].key === ad.planKey) {
          dw = allD[i].week; dn = allD[i].name; di = allD[i].icon; break
        }
      }
      if (ad.startDate) {
        planDays = daysBetween(ad.startDate) + 1
        dietDayIdx = daysBetween(ad.startDate) % 7
        todayIdx = dietDayIdx
      }
    }

    /* 训练 */
    var ts = [], tn = '', ti = '', th = '', tcCal = 0
    if (at && at.planKey) {
      for (var i = 0; i < allT.length; i++) {
        if (allT[i].key === at.planKey) {
          var f = allT[i]
          ts = f.sch; tn = f.name; ti = f.icon; th = f.weeklyHrs; tcCal = f.weeklyCal; break
        }
      }
    }

    this.setData({
      hasInfo: has, personal: p,
      activeDietKey: ad ? ad.planKey : '', activeDietName: dn, activeDietIcon: di,
      dietWeek: dw, dietDayIdx: dietDayIdx, eatBf: eb, dietMealExpanded: '-1',
      todayIdx: todayIdx, planDays: planDays,
      activeTrainKey: at ? at.planKey : '', activeTrainName: tn, activeTrainIcon: ti,
      trainSchedule: ts, trainWeeklyHrs: th, trainWeeklyCal: tcCal, trainDayExpanded: '-1',
      allDiets: allD, allTrains: allT
    })
  },

  /* ======== 页面跳转 ======== */
  goProfile: function() { wx.navigateTo({ url: '/pages/user-info/user-info' }) },

  /* ======== 早餐开关 ======== */
  toggleBf: function(e) {
    var v = e.currentTarget.dataset.v === 'true'
    this.setData({ eatBf: v })
    try { wx.setStorageSync('planSetting', { eatBf: v }) } catch (e) {}
    this._init()
  },

  /* ======== 饮食天切换 ======== */
  tapDietDay: function(e) {
    this.setData({ dietDayIdx: parseInt(e.currentTarget.dataset.idx), dietMealExpanded: '-1' })
  },

  /* ======== 回到今天 ======== */
  backToToday: function() {
    this.setData({ dietDayIdx: this.data.todayIdx, dietMealExpanded: '-1' })
  },

  /* ======== 主页面餐食展开（复合 key） ======== */
  toggleMeal: function(e) {
    var dk = e.currentTarget.dataset.dayidx
    var mk = e.currentTarget.dataset.mealidx
    var key = dk + '-' + mk
    this.setData({ dietMealExpanded: this.data.dietMealExpanded === key ? '-1' : key })
  },

  /* ======== 主页面训练天展开（用 day 字符串作 key） ======== */
  toggleTrainDay: function(e) {
    var key = e.currentTarget.dataset.key
    this.setData({ trainDayExpanded: this.data.trainDayExpanded === key ? '-1' : key })
  },

  /* ======================== 饮食弹窗 ======================== */
  openDietModal: function() {
    this.setData({ showDietModal: true, dietModalExpanded: '', dietModalDayIdx: 0, dietModalMealExpanded: '-1' })
  },
  closeDietModal: function() { this.setData({ showDietModal: false }) },

  /* 展开/收起某个计划 */
  tapDietInModal: function(e) {
    var k = e.currentTarget.dataset.key
    var isOpen = this.data.dietModalExpanded === k
    this.setData({ dietModalExpanded: isOpen ? '' : k, dietModalDayIdx: 0, dietModalMealExpanded: '-1' })
  },

  /* 弹窗内切换天 */
  tapModalDietDay: function(e) {
    this.setData({ dietModalDayIdx: parseInt(e.currentTarget.dataset.idx), dietModalMealExpanded: '-1' })
  },

  /* 弹窗内展开餐次 */
  toggleModalMeal: function(e) {
    var dk = e.currentTarget.dataset.dayidx
    var mk = e.currentTarget.dataset.mealidx
    var key = dk + '-' + mk
    this.setData({ dietModalMealExpanded: this.data.dietModalMealExpanded === key ? '-1' : key })
  },

  /* 选择饮食计划 */
  selectDiet: function(e) {
    var key = e.currentTarget.dataset.key, dp = null
    for (var i = 0; i < this.data.allDiets.length; i++) {
      if (this.data.allDiets[i].key === key) { dp = this.data.allDiets[i]; break }
    }
    if (!dp) return
    try {
      wx.setStorageSync('activeDietPlan', {
        planKey: key, planName: dp.name, icon: dp.icon,
        startDate: todayDateStr(), savedAt: Date.now()
      })
    } catch (e) {}
    this.setData({ showDietModal: false })
    this._init()
    wx.showToast({ title: '已设为当前饮食计划', icon: 'success' })
  },

  /* ======================== 训练弹窗 ======================== */
  openTrainModal: function() {
    this.setData({ showTrainModal: true, trainModalExpanded: this.data.activeTrainKey || '', trainModalDayExpanded: '-1' })
  },
  closeTrainModal: function() { this.setData({ showTrainModal: false }) },

  /* 展开/收起某个训练计划 */
  tapTrainInModal: function(e) {
    var k = e.currentTarget.dataset.key
    var isOpen = this.data.trainModalExpanded === k
    this.setData({ trainModalExpanded: isOpen ? '' : k, trainModalDayExpanded: '-1' })
  },

  /* 训练弹窗内展开某天动作（复合 key: planKey-dayIdx） */
  toggleTrainModalDay: function(e) {
    var planKey = e.currentTarget.dataset.plankey
    var dayIdx = e.currentTarget.dataset.dayidx
    var key = planKey + '-' + dayIdx
    this.setData({ trainModalDayExpanded: this.data.trainModalDayExpanded === key ? '-1' : key })
  },

  /* 选择训练计划 */
  selectTrain: function(e) {
    var key = e.currentTarget.dataset.key, tp = null
    for (var i = 0; i < this.data.allTrains.length; i++) {
      if (this.data.allTrains[i].key === key) { tp = this.data.allTrains[i]; break }
    }
    if (!tp) return
    try {
      wx.setStorageSync('activeTrainingPlan', {
        planKey: key, planName: tp.name, icon: tp.icon,
        weeklyHours: tp.weeklyHrs, weeklyCalBurn: tp.weeklyCal,
        schedule: tp.sch, savedAt: Date.now()
      })
    } catch (e) {}
    this.setData({ showTrainModal: false })
    this._init()
    wx.showToast({ title: '已设为当前训练计划', icon: 'success' })
  },
})
