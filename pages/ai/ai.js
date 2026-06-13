var app = getApp();

var API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
var API_KEY = 'c62d241acd944273adf6e18730c60e54.vT0N7RDsYVsMmY3P';

var modelList = [
  { id: 'glm-4.6v', multimodal: true },
  { id: 'glm-4.5-air', multimodal: false },
  { id: 'glm-4-flash', multimodal: false }
];
var MAX_ATTEMPTS = 3, REQUEST_TIMEOUT = 120000, MIN_INTERVAL = 800;
var TYPE_SPEED = 16, CHARS_PER_TICK = 5;

var THINK_PHASES = ['分析问题语义...', '查询个人身体数据...', '匹配健身知识库...', '计算推荐摄入量...', '生成个性化方案...', '验证科学准确性...'];

var FIELD_NAMES = {
  weight: '体重', height: '身高', age: '年龄',
  targetWeight: '目标体重', nickname: '昵称',
  gender: '性别', activity: '活动水平',
  goal: '健身目标', signature: '个性签名'
};

var INCOME_KW = [
  { w: ['工资','薪水','发工资'], c: 'salary', n: '工资', i: '💰' },
  { w: ['奖金','年终奖','绩效奖'], c: 'bonus', n: '奖金', i: '🎁' },
  { w: ['红包','转账收入'], c: 'gift', n: '红包', i: '🧧' },
  { w: ['兼职','外快','副业'], c: 'parttime', n: '兼职', i: '💼' },
  { w: ['退款','退货','返现'], c: 'refund', n: '退款', i: '🔄' },
  { w: ['理财','利息','分红','收益','投资'], c: 'invest', n: '理财', i: '📈' },
  { w: ['收入','进账','到账','转入'], c: 'other', n: '收入', i: '💎' }
];
var EXPENSE_KW = [
  { w: ['早餐','午餐','晚餐','宵夜','吃饭','外卖','食堂','麻辣烫','火锅','烧烤','面条','炒饭','快餐','便当','汉堡','披萨','寿司','粉','粥','餐','玉米','包子','馒头','饺子','盖饭','米线','酸辣粉','螺蛳粉','烤肉','炸鸡','三明治','沙拉','蛋糕','甜点'], c: 'food', n: '餐饮', i: '🍔' },
  { w: ['咖啡','奶茶','饮料','果汁','可乐','雪碧','茶','啤酒','酒','拿铁','美式','瑞幸','星巴克','喜茶','蜜雪冰城','霸王茶'], c: 'drink', n: '饮品', i: '🧋' },
  { w: ['水果','苹果','香蕉','橙子','葡萄','草莓','西瓜','芒果','车厘子','桃','梨','柚子','猕猴桃'], c: 'fruit', n: '水果', i: '🍎' },
  { w: ['零食','糖果','饼干','薯片','巧克力','瓜子','坚果','辣条','冰淇淋','冰棍'], c: 'snack', n: '零食', i: '🍪' },
  { w: ['打车','出租','滴滴','地铁','公交','加油','停车','高铁','火车','飞机','机票','车费','油费','过路费','共享单车','骑车'], c: 'transport', n: '交通', i: '🚌' },
  { w: ['购物','衣服','鞋','包','淘宝','京东','拼多多','商场','网购','买衣服','外套','裤子','裙子'], c: 'shopping', n: '购物', i: '🛍️' },
  { w: ['电影','游戏','KTV','唱歌','娱乐','剧本杀','密室','电影票','演出','音乐会','演唱会'], c: 'entertain', n: '娱乐', i: '🎮' },
  { w: ['药','医院','看病','挂号','体检','门诊','牙科','眼科','买药','药费'], c: 'health', n: '医疗', i: '💊' },
  { w: ['超市','纸巾','洗发水','牙膏','洗衣液','日用','日用品','洗手液','垃圾袋'], c: 'daily', n: '日用', i: '🧴' },
  { w: ['健身','运动','游泳','瑜伽','私教','跑步','健身房','球','打球','羽毛球','篮球'], c: 'sport', n: '运动', i: '🏋️' },
  { w: ['书','课程','学习','培训','考试','学费','网课','教材','买书'], c: 'edu', n: '学习', i: '📚' },
  { w: ['旅游','酒店','门票','景点','旅行','民宿','住酒店','景区'], c: 'travel', n: '旅游', i: '✈️' },
  { w: ['手机','电脑','数码','配件','耳机','充电器','iPad','键盘','鼠标','数据线'], c: 'digital', n: '数码', i: '💻' },
  { w: ['请客','聚餐','社交','份子钱','团建','AA','请吃饭','随礼'], c: 'social', n: '社交', i: '💬' },
  { w: ['化妆品','护肤','美妆','口红','面膜','防晒','粉底','眼影','洗面奶'], c: 'beauty', n: '美妆', i: '💄' },
  { w: ['房租','水电','物业','燃气','宽带','租金','水费','电费','物业费'], c: 'housing', n: '住房', i: '🏠' },
  { w: ['宠物','猫粮','狗粮','猫砂','宠物医院','驱虫'], c: 'pet', n: '宠物', i: '🐾' },
  { w: ['礼物','送礼','生日礼物','伴手礼','随礼'], c: 'gift', n: '礼物', i: '🎁' },
  { w: ['洗车','保养','车险','修车','违章','停车费','罚款'], c: 'car', n: '车辆', i: '🚗' }
];

/* ===== 运动数据库 ===== */
var SPORT_DB = {
  '慢跑': { emoji: '🏃', cal60: 360 }, '中速跑': { emoji: '🏃', cal60: 480 },
  '快跑': { emoji: '💨', cal60: 600 }, '跑步机爬坡': { emoji: '🏔', cal60: 480 },
  '越野跑': { emoji: '⛰', cal60: 550 }, '原地超慢跑': { emoji: '🐢', cal60: 200 },
  '散步': { emoji: '🚶', cal60: 150 }, '快走': { emoji: '🚶', cal60: 250 },
  '健走': { emoji: '🥾', cal60: 300 }, '负重行走': { emoji: '🎒', cal60: 350 },
  '爬楼梯': { emoji: '🔝', cal60: 400 }, '休闲骑行': { emoji: '🚲', cal60: 250 },
  '公路骑行': { emoji: '🚴', cal60: 400 }, '山地骑行': { emoji: '🚵', cal60: 500 },
  '动感单车': { emoji: '🚴', cal60: 450 }, '自由泳': { emoji: '🏊', cal60: 500 },
  '蛙泳': { emoji: '🐸', cal60: 450 }, '仰泳': { emoji: '🏊', cal60: 400 },
  '蝶泳': { emoji: '🦋', cal60: 550 }, '篮球': { emoji: '🏀', cal60: 450 },
  '足球': { emoji: '⚽', cal60: 500 }, '羽毛球': { emoji: '🏸', cal60: 350 },
  '乒乓球': { emoji: '🏓', cal60: 250 }, '网球': { emoji: '🎾', cal60: 400 },
  '排球': { emoji: '🏐', cal60: 280 }, '高尔夫': { emoji: '⛳', cal60: 200 },
  '俯卧撑': { emoji: '💪', cal60: 350 }, '引体向上': { emoji: '🏋', cal60: 400 },
  '深蹲训练': { emoji: '🦵', cal60: 380 }, '平板支撑': { emoji: '🧎', cal60: 180 },
  '波比跳': { emoji: '🔥', cal60: 600 }, 'HIIT训练': { emoji: '⚡', cal60: 600 },
  '战绳训练': { emoji: '🪢', cal60: 550 }, '壶铃训练': { emoji: '🔔', cal60: 480 },
  '椭圆机': { emoji: '⭕', cal60: 350 }, '划船机': { emoji: '🚣', cal60: 400 },
  '台阶机': { emoji: '🔝', cal60: 450 }, '慢速跳绳': { emoji: '🤸', cal60: 500 },
  '中速跳绳': { emoji: '🤸', cal60: 700 }, '快速跳绳': { emoji: '⚡', cal60: 958 },
  '哈他瑜伽': { emoji: '🧘', cal60: 200 }, '流瑜伽': { emoji: '🧘', cal60: 300 },
  '普拉提': { emoji: '🤸', cal60: 250 }, '太极拳': { emoji: '☯️', cal60: 200 },
  '跆拳道': { emoji: '🥋', cal60: 500 }, '空手道': { emoji: '👊', cal60: 480 },
  '散打': { emoji: '🥊', cal60: 550 }, '攀岩': { emoji: '🧗', cal60: 500 },
  '滑雪': { emoji: '🎿', cal60: 400 }, '滑冰': { emoji: '⛸', cal60: 350 },
  '广场舞': { emoji: '💃', cal60: 280 }, '尊巴': { emoji: '🎶', cal60: 400 },
  '有氧操': { emoji: '🤸', cal60: 380 }, '搏击操': { emoji: '🥊', cal60: 500 },
  '呼啦圈': { emoji: '⭕', cal60: 200 }, '飞盘': { emoji: '🥏', cal60: 300 }
};

var SPORT_NAME_MAP = {
  '跑步机爬坡': '跑步机爬坡', '原地超慢跑': '原地超慢跑',
  '跑步机': '跑步机爬坡', '跑步': '慢跑', '慢跑': '慢跑',
  '快跑': '快跑', '中速跑': '中速跑', '越野跑': '越野跑',
  '散步': '散步', '快走': '快走', '健走': '健走',
  '爬楼梯': '爬楼梯', '负重行走': '负重行走',
  '公路骑行': '公路骑行', '山地骑行': '山地骑行', '休闲骑行': '休闲骑行',
  '动感单车': '动感单车', '单车': '动感单车', '骑行': '休闲骑行',
  '骑车': '休闲骑行', '骑自行车': '休闲骑行',
  '自由泳': '自由泳', '蛙泳': '蛙泳', '仰泳': '仰泳', '蝶泳': '蝶泳',
  '游泳': '自由泳', '游': '自由泳',
  '慢速跳绳': '慢速跳绳', '快速跳绳': '快速跳绳', '中速跳绳': '中速跳绳',
  '跳绳': '中速跳绳',
  '羽毛球': '羽毛球', '乒乓球': '乒乓球', '篮球': '篮球',
  '足球': '足球', '网球': '网球', '排球': '排球', '高尔夫': '高尔夫',
  '哈他瑜伽': '哈他瑜伽', '流瑜伽': '流瑜伽', '普拉提': '普拉提',
  '瑜伽': '哈他瑜伽',
  '俯卧撑': '俯卧撑', '引体向上': '引体向上', '深蹲': '深蹲训练',
  '深蹲训练': '深蹲训练', '平板支撑': '平板支撑', '波比跳': '波比跳',
  'HIIT训练': 'HIIT训练', 'HIIT': 'HIIT训练', 'hiit': 'HIIT训练',
  '战绳训练': '战绳训练', '壶铃训练': '壶铃训练',
  '椭圆机': '椭圆机', '划船机': '划船机', '台阶机': '台阶机',
  '太极拳': '太极拳', '太极': '太极拳', '跆拳道': '跆拳道',
  '空手道': '空手道', '散打': '散打',
  '攀岩': '攀岩', '滑雪': '滑雪', '滑冰': '滑冰',
  '广场舞': '广场舞', '尊巴': '尊巴', '有氧操': '有氧操',
  '搏击操': '搏击操', '呼啦圈': '呼啦圈', '飞盘': '飞盘',
  '跑': '慢跑', '走': '快走', '骑': '休闲骑行'
};

Page({
  data: {
    messages: [], inputText: '', isLoading: false, scrollToView: '',
    showWelcome: true, selectedImagePreview: '', statusBarHeight: 44,
    bottomPad: 80, fastMode: false, showClearModal: false,
    profileLoaded: false, profileNickname: '', actionMode: '',
    sportQuickList: [
      { name: '慢跑', emoji: '🏃', min: 30, cal: 180, data: '慢跑30分钟' },
      { name: '跳绳', emoji: '🤸', min: 20, cal: 233, data: '中速跳绳20分钟' },
      { name: '游泳', emoji: '🏊', min: 45, cal: 375, data: '自由泳45分钟' },
      { name: '骑行', emoji: '🚴', min: 30, cal: 125, data: '休闲骑行30分钟' },
      { name: '瑜伽', emoji: '🧘', min: 40, cal: 133, data: '哈他瑜伽40分钟' },
      { name: '篮球', emoji: '🏀', min: 60, cal: 450, data: '篮球60分钟' },
      { name: 'HIIT', emoji: '⚡', min: 20, cal: 200, data: 'HIIT训练20分钟' },
      { name: '快走', emoji: '🚶', min: 30, cal: 125, data: '快走30分钟' }
    ]
  },

  _imgMap: {}, _pendingImg: '', _fullBP: 80, _lastReq: 0,
  _typingTimer: null, _thinkTimer: null, _reqTask: null,
  _aiId: '', _cachedMsgIdx: -1, _fullContent: '', _skipAnim: false,
  _userProfile: null,

  onLoad: function () {
    try {
      var sys = wx.getSystemInfoSync();
      var sb = sys.statusBarHeight || 44;
      var sab = sys.safeArea ? (sys.screenHeight - sys.safeArea.bottom) : 34;
      this._fullBP = sab + 56;
      this.setData({ statusBarHeight: sb, bottomPad: this._fullBP });
    } catch (e) {}
    try { if (wx.getStorageSync('bestai_fast') === true) this.setData({ fastMode: true }); } catch (e) {}
    this._loadProfile();
  },
  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) this.getTabBar().setData({ selected: 2 });
    if (this.data.messages.length === 0 && !this.data.showWelcome) this.setData({ showWelcome: true });
    this._loadProfile();
  },
  onUnload: function () { this._abort(); },
  onPlaylistChange: function (e) {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      var v = !e.detail.visible;
      this.getTabBar().setData({ visible: v, selected: 2 });
      this.setData({ bottomPad: v ? this._fullBP : 16 });
    }
  },

  /* ===== 模式切换 ===== */
  onSetActionMode: function (e) {
    var m = e.currentTarget.dataset.mode;
    this.setData({ actionMode: this.data.actionMode === m ? '' : m });
  },
  onClearActionMode: function () { this.setData({ actionMode: '' }); },

  /* ===== 快捷操作 ===== */
  onQuickWater: function (e) {
    var amt = parseInt(e.currentTarget.dataset.amt);
    if (!amt || amt <= 0) return;
    this._directRecordWater(amt + 'ml', amt);
  },
  onPeriodQuick: function (e) {
    var action = e.currentTarget.dataset.action;
    var result = this._execPeriod({ periodAction: action });
    var userText = action === 'start' ? '经期来了' : '经期结束了';
    this._pushDirectMsg(userText, result.text, [result]);
  },
  onQuickDiet: function (e) {
    var food = e.currentTarget.dataset.food;
    var result = this._quickRecordDiet(food);
    this._pushDirectMsg(food, result.text, [result]);
  },
  onQuickSport: function (e) {
    var sport = e.currentTarget.dataset.sport;
    var sp = this._parseSport(sport);
    if (sp) {
      this._directRecordSport(sport, sp);
    } else {
      var result = this._quickRecordSport(sport);
      this._pushDirectMsg(sport, result.text, []);
    }
  },

  /* ===== 个人档案 ===== */
  _loadProfile: function () {
    try {
      var u = wx.getStorageSync('userInfo') || {};
      var goal = wx.getStorageSync('weightGoal') || null;
      var records = wx.getStorageSync('weightRecords') || [];
      this._userProfile = {
        nickname: u.nickname || '', gender: u.gender || '',
        age: u.age || 0, height: u.height || 0, weight: u.weight || 0,
        targetWeight: u.targetWeight || 0, activity: u.activity,
        goal: u.goal, signature: u.signature || '',
        goalPlan: goal, recentRecords: records.slice(-7)
      };
      this.setData({ profileLoaded: !!(u.nickname || u.weight), profileNickname: u.nickname || '' });
    } catch (e) {}
  },

  _buildProfilePrompt: function () {
    var p = this._userProfile;
    if (!p || (!p.weight && !p.height && !p.nickname)) return '';
    var gn = ['减脂塑形','增肌增重','维持现状','健康调理'];
    var an = ['久坐不动','轻度活动','中度活动','高强度活动'];
    var s = '\n\n【用户身体档案】';
    if (p.nickname) s += '\n昵称：' + p.nickname;
    if (p.signature) s += '\n个性签名：' + p.signature;
    if (p.gender === 'male') s += '\n性别：男';
    else if (p.gender === 'female') s += '\n性别：女';
    if (p.age) s += '\n年龄：' + p.age + '岁';
    if (p.height) s += '\n身高：' + p.height + 'cm';
    if (p.weight) s += '\n当前体重：' + p.weight + 'kg';
    if (p.targetWeight) s += '\n目标体重：' + p.targetWeight + 'kg';
    if (typeof p.goal === 'number' && p.goal >= 0 && p.goal < 4) s += '\n健身目标：' + gn[p.goal];
    if (typeof p.activity === 'number' && p.activity >= 0 && p.activity < 4) s += '\n活动水平：' + an[p.activity];
    var gp = p.goalPlan;
    if (gp && gp.goalType) {
      var tm = { lose: '减脂减重', gain: '增肌增重', maintain: '维持体重', tone: '塑形紧致' };
      s += '\n执行计划：' + (tm[gp.goalType] || gp.goalType);
      if (gp.weeklyTarget) s += '，每周' + gp.weeklyTarget + 'kg';
    }
    if (p.recentRecords && p.recentRecords.length > 1) {
      var f = p.recentRecords[0].weight, l = p.recentRecords[p.recentRecords.length - 1].weight;
      s += '\n近期趋势：' + (l > f ? '增重+' : '减重') + (l - f).toFixed(1) + 'kg';
    }
    if (p.weight && p.height) {
      var bmi = (p.weight / ((p.height / 100) * (p.height / 100))).toFixed(1);
      s += '\nBMI：' + bmi + '（' + (bmi < 18.5 ? '偏瘦' : bmi < 24 ? '正常' : bmi < 28 ? '偏胖' : '肥胖') + '）';
    }
    try {
      var now = new Date(), today = this._dateStr(now);
      var wr = wx.getStorageSync('waterRecords') || [], tw = 0;
      wr.forEach(function (r) { if (r.date === today) tw += (r.ml || r.amount || 0); });
      if (tw > 0) s += '\n今日已喝水：' + tw + 'ml';
      var ar = wx.getStorageSync('accountRecords') || [], te = 0, ti = 0;
      ar.forEach(function (r) { if (r.date && r.date.indexOf(today) === 0) { if (r.type === 'expense') te += r.amount; else if (r.type === 'income') ti += r.amount; } });
      if (te > 0) s += '\n今日已支出：¥' + te;
      if (ti > 0) s += '\n今日已收入：¥' + ti;
    } catch (e) {}
    s += '\n\n请根据以上用户具体身体数据给出精准个性化建议。';
    return s;
  },

  _getTodayWaterSummary: function () {
    var today = this._dateStr(new Date());
    var records = wx.getStorageSync('waterRecords') || [];
    var total = 0;
    records.forEach(function (r) { if (r.date === today) total += (r.ml || r.amount || 0); });
    var target = app.globalData.waterTotalTargetML || wx.getStorageSync('waterTotalTargetML') || 1800;
    var left = target - total;
    return { total: total, target: target, left: left > 0 ? left : 0 };
  },
  _getTodayAccountSummary: function () {
    var today = this._dateStr(new Date());
    var records = wx.getStorageSync('accountRecords') || [];
    var expense = 0, income = 0;
    records.forEach(function (r) {
      if (r.date && r.date.indexOf(today) === 0) {
        if (r.type === 'expense') expense += r.amount;
        else if (r.type === 'income') income += r.amount;
      }
    });
    return { expense: expense, income: income };
  },
  _getPeriodCareMessage: function (action) {
    if (action === 'start') return '🌸 经期已记录，这几天要注意保暖、少食生冷，多喝热水好好休息哦~';
    return '🎉 经期结束啦！可以逐步恢复运动，继续保持健康好习惯~';
  },

  _convertBodyValue: function (field, rawValue) {
    var val = String(rawValue).trim();
    var ACT_LABELS = ['久坐不动', '轻度活动', '中度活动', '高强度活动'];
    var GOAL_LABELS = ['减脂塑形', '增肌增重', '维持现状', '健康调理'];
    if (field === 'gender') {
      if (/^(male|男|男生|男性|男的)$/i.test(val)) return { ok: true, value: 'male', display: '男' };
      if (/^(female|女|女生|女性|女的)$/i.test(val)) return { ok: true, value: 'female', display: '女' };
      return { ok: false, error: '⚠️ 性别值无效，请输入男或女' };
    }
    if (field === 'activity') {
      if (/^(0|久坐|久坐不动)$/i.test(val)) return { ok: true, value: 0, display: ACT_LABELS[0] };
      if (/^(1|轻度|轻度活动)$/i.test(val)) return { ok: true, value: 1, display: ACT_LABELS[1] };
      if (/^(2|中度|中度活动)$/i.test(val)) return { ok: true, value: 2, display: ACT_LABELS[2] };
      if (/^(3|高强度|高强度活动)$/i.test(val)) return { ok: true, value: 3, display: ACT_LABELS[3] };
      var n = parseInt(val);
      if (!isNaN(n) && n >= 0 && n <= 3) return { ok: true, value: n, display: ACT_LABELS[n] };
      return { ok: false, error: '⚠️ 活动水平无效' };
    }
    if (field === 'goal') {
      if (/^(0|减脂|减脂塑形)$/i.test(val)) return { ok: true, value: 0, display: GOAL_LABELS[0] };
      if (/^(1|增肌|增肌增重)$/i.test(val)) return { ok: true, value: 1, display: GOAL_LABELS[1] };
      if (/^(2|维持|维持现状)$/i.test(val)) return { ok: true, value: 2, display: GOAL_LABELS[2] };
      if (/^(3|健康|健康调理)$/i.test(val)) return { ok: true, value: 3, display: GOAL_LABELS[3] };
      var n = parseInt(val);
      if (!isNaN(n) && n >= 0 && n <= 3) return { ok: true, value: n, display: GOAL_LABELS[n] };
      return { ok: false, error: '⚠️ 健身目标无效' };
    }
    if (field === 'weight' || field === 'targetWeight' || field === 'height' || field === 'age') {
      var num = parseFloat(val);
      if (isNaN(num)) return { ok: false, error: '⚠️ 数值无效' };
      var suffix = (field === 'weight' || field === 'targetWeight') ? 'kg' : field === 'height' ? 'cm' : '岁';
      return { ok: true, value: num, display: num + suffix, suffix: suffix };
    }
    return { ok: true, value: val, display: val, suffix: '' };
  },

  /* ===== 解析：喝水 ===== */
  _parseWater: function (text) {
    var t = text.replace(/\s+/g, '');
    var m1 = t.match(/(\d+(?:\.\d+)?)\s*(?:ml|毫升|cc)/i);
    if (m1) return parseFloat(m1[1]);
    var cnN = {'一':1,'壹':1,'二':2,'两':2,'贰':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10,'半':0.5};
    var units = [['大瓶',600],['壶',1000],['大杯',500],['中杯',400],['瓶',500],['杯',250],['小杯',150],['碗',300],['罐',330],['听',330],['口',30]];
    for (var u = 0; u < units.length; u++) {
      var uk = units[u][0], uv = units[u][1], idx = t.indexOf(uk);
      if (idx === -1) continue;
      var before = t.substring(Math.max(0, idx - 2), idx);
      var mult = 1, found = false;
      for (var cn in cnN) { if (before.endsWith(cn)) { mult = cnN[cn]; found = true; break; } }
      if (!found) { var dm = t.substring(0, idx).match(/(\d+)$/); if (dm) mult = parseInt(dm[1]); }
      return Math.round(mult * uv);
    }
    var nums = t.match(/(\d+(?:\.\d+)?)/g);
    if (nums) {
      for (var i = 0; i < nums.length; i++) { var n = parseFloat(nums[i]); if (n >= 50 && n <= 5000) return n; }
      for (var i = 0; i < nums.length; i++) { var n = parseFloat(nums[i]); if (n >= 1 && n <= 20) return Math.round(n * 250); }
      for (var i = 0; i < nums.length; i++) { var n = parseFloat(nums[i]); if (n > 0 && n <= 100) return n; }
    }
    if (/喝|水|饮|补|渴/.test(text)) return 250;
    return 0;
  },

  _directRecordWater: function (userText, amount) {
    var ds = this._dateStr(new Date());
    var nowTime = this._fmt();
    var records = wx.getStorageSync('waterRecords') || [];
    records.push({ id: Date.now(), time: nowTime, ml: amount, name: '水', date: ds });
    wx.setStorageSync('waterRecords', records);
    if (!app.globalData.waterRecords) app.globalData.waterRecords = [];
    app.globalData.waterRecords = records;
    app.globalData.waterTodayML = (app.globalData.waterTodayML || 0) + amount;
    wx.setStorageSync('waterTodayML', app.globalData.waterTodayML);
    var history = wx.getStorageSync('waterHistory') || {};
    if (!history[ds]) history[ds] = { totalML: 0, records: [] };
    history[ds].records.push({ id: Date.now(), time: nowTime, ml: amount, name: '水', type: 'water', icon: '💧', date: ds });
    history[ds].totalML += amount;
    wx.setStorageSync('waterHistory', history);
    var summary = this._getTodayWaterSummary();
    var ai = '已记录喝水 **' + amount + 'ml**！\n\n📊 今日累计：**' + summary.total + 'ml** / ' + summary.target + 'ml';
    ai += summary.left > 0 ? '\n💪 还差 **' + summary.left + 'ml**，继续加油！' : '\n🎉 已达成今日饮水目标！';
    var badge = { text: '💧 已记录喝水 ' + amount + 'ml | 今日 ' + summary.total + '/' + summary.target + 'ml', detailUrl: '/pages/water/water', type: 'water' };
    this._pushDirectMsg(userText, ai, [badge]);
  },

  /* ===== 解析：记账 ===== */
  _parseAccount: function (text) {
    var nums = [], rgx = /(\d+(?:\.\d+)?)/g, m;
    while ((m = rgx.exec(text)) !== null) nums.push({ v: parseFloat(m[1]), s: m[1], i: m.index });
    if (nums.length === 0) return null;
    var amount = 0, amountStr = '';
    var nearMoney = text.match(/(\d+(?:\.\d+)?)\s*[元块¥￥]/);
    if (nearMoney) { amount = parseFloat(nearMoney[1]); amountStr = nearMoney[1]; }
    if (!amount) { amount = nums[0].v; amountStr = nums[0].s; }
    if (amount <= 0 || amount > 999999) return null;
    var note = text;
    note = note.replace(new RegExp(amountStr.replace('.', '\\.'), 'g'), '');
    var fillers = ['我','了','的','花掉','花了','花','消费','支付','付了','付','收了','收到','赚了','入账','花费','充值','充了','块钱','元','块','¥','￥','请','帮','给','买','买个','买了','买了个','吃','吃了','喝','喝了','坐','打了','打'];
    for (var f = 0; f < fillers.length; f++) note = note.replace(new RegExp(fillers[f], 'g'), '');
    note = note.replace(/[\s\d]+/g, '').trim() || null;
    for (var i = 0; i < INCOME_KW.length; i++) {
      var g = INCOME_KW[i];
      for (var j = 0; j < g.w.length; j++) { if (text.indexOf(g.w[j]) !== -1) return { rt: 'income', cat: g.c, cn: g.n, ci: g.i, amount: amount, note: note || g.n }; }
    }
    for (var i = 0; i < EXPENSE_KW.length; i++) {
      var g = EXPENSE_KW[i];
      for (var j = 0; j < g.w.length; j++) { if (text.indexOf(g.w[j]) !== -1) return { rt: 'expense', cat: g.c, cn: g.n, ci: g.i, amount: amount, note: note || g.n }; }
    }
    return { rt: 'expense', cat: 'other', cn: '其他', ci: '📦', amount: amount, note: note || '消费' };
  },

  _directRecordAccount: function (userText, d) {
    var ds = this._dateStr(new Date()) + ' ' + String(new Date().getHours()).padStart(2, '0') + ':' + String(new Date().getMinutes()).padStart(2, '0');
    var all = wx.getStorageSync('accountRecords') || [];
    all.push({ id: Date.now(), type: d.rt, amount: d.amount, category: d.cat, categoryName: d.cn, categoryIcon: d.ci, note: d.note || '', date: ds });
    wx.setStorageSync('accountRecords', all);
    if (!app.globalData.accountRecords) app.globalData.accountRecords = [];
    app.globalData.accountRecords = all;
    var label = d.rt === 'expense' ? '支出' : '收入';
    var summary = this._getTodayAccountSummary();
    var ai = '已记录' + label + ' **¥' + d.amount + '** ' + d.ci + ' ' + d.cn;
    if (d.note && d.note !== d.cn) ai += '\n📝 备注：' + d.note;
    ai += '\n\n📊 今日总支出：¥' + summary.expense + '，总收入：¥' + summary.income;
    var badge = { text: '💰 已记' + label + '：¥' + d.amount + ' ' + d.cn, detailUrl: '/pages/account/account', type: 'account' };
    this._pushDirectMsg(userText, ai, [badge]);
  },

  /* ===== 解析：身体数据 ===== */
  _parseBody: function (text) {
    var r = [];
    var nm = text.match(/(?:昵称|名字|叫我|改名)[^\S\n]*(.+)/);
    if (nm) r.push({ f: 'nickname', v: nm[1].trim() });
    var gm = text.match(/(?:性别)[^\S\n]*(?:改成|改为|设置)?[^\S\n]*(男|女|male|female)/i);
    if (!gm) gm = text.match(/(?:我是|改成|改为|变成)(男生?|女生?|男性|女性|男的|女的)/);
    if (gm) { var gv = gm[1]; r.push({ f: 'gender', v: /男/.test(gv) ? 'male' : 'female' }); }
    var sm = text.match(/(?:签名|个性签名)[^\S\n]*(?:改成|改为|设置|设为)?[^\S\n]*(.+)/);
    if (sm && sm[1].trim()) r.push({ f: 'signature', v: sm[1].trim() });
    if (/(?:活动水平|活动强度|运动量|活动量|运动强度)/.test(text)) {
      if (/久坐/.test(text)) r.push({ f: 'activity', v: '0' });
      else if (/轻度/.test(text)) r.push({ f: 'activity', v: '1' });
      else if (/中度/.test(text)) r.push({ f: 'activity', v: '2' });
      else if (/高强度/.test(text)) r.push({ f: 'activity', v: '3' });
      else {
        var actNum = text.match(/(?:活动|运动)[^\d]*?(\d)/);
        if (actNum && parseInt(actNum[1]) >= 0 && parseInt(actNum[1]) <= 3) r.push({ f: 'activity', v: actNum[1] });
      }
    }
    if (/(?:健身目标|目标改为|目标改成|目标设为)/.test(text)) {
      if (/减脂/.test(text)) r.push({ f: 'goal', v: '0' });
      else if (/增肌/.test(text)) r.push({ f: 'goal', v: '1' });
      else if (/维持/.test(text)) r.push({ f: 'goal', v: '2' });
      else if (/健康/.test(text)) r.push({ f: 'goal', v: '3' });
    }
    var wm = text.match(/(?:体重|重了|轻了|称了|称重|磅|斤)[^\d]*?(\d+(?:\.\d+)?)/);
    if (!wm) wm = text.match(/(\d+(?:\.\d+)?)\s*(?:kg|公斤)/i);
    if (wm) r.push({ f: 'weight', v: wm[1] });
    var hm = text.match(/(?:身高|长高|矮了)[^\d]*?(\d+(?:\.\d+)?)/);
    if (!hm) hm = text.match(/(\d+(?:\.\d+)?)\s*(?:cm|厘米)/i);
    if (hm && parseFloat(hm[1]) > 50) r.push({ f: 'height', v: hm[1] });
    var am = text.match(/(\d+)\s*岁/);
    if (am && parseInt(am[1]) > 0 && parseInt(am[1]) < 150) r.push({ f: 'age', v: am[1] });
    if (!r.some(function(x){return x.f==='age'})) {
      var am2 = text.match(/(?:年龄|年纪|生日)[^\d]*?(\d+)/);
      if (am2) r.push({ f: 'age', v: am2[1] });
    }
    var tm = text.match(/(?:目标体重)[^\d]*?(\d+(?:\.\d+)?)/);
    if (tm) r.push({ f: 'targetWeight', v: tm[1] });
    return r;
  },

  _directRecordBody: function (userText, list) {
    var u = wx.getStorageSync('userInfo') || {};
    var lines = [], badges = [], validList = [];
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      var converted = this._convertBodyValue(item.f, item.v);
      if (!converted.ok) continue;
      var val = converted.value;
      u[item.f] = val;
      validList.push({ f: item.f, value: val });
      lines.push((FIELD_NAMES[item.f] || item.f) + '：**' + converted.display + '**');
      badges.push({ text: '✅ 已更新' + (FIELD_NAMES[item.f] || item.f) + '为 ' + converted.display, detailUrl: '/pages/user-info/user-info', type: 'body' });
      if (item.f === 'weight') { var records = wx.getStorageSync('weightRecords') || []; records.push({ date: this._dateStr(new Date()), weight: parseFloat(val) }); wx.setStorageSync('weightRecords', records); }
    }
    if (lines.length === 0) return;
    wx.setStorageSync('userInfo', u);
    if (!app.globalData.userInfo) app.globalData.userInfo = {};
    for (var j = 0; j < validList.length; j++) app.globalData.userInfo[validList[j].f] = validList[j].value;
    this._loadProfile();
    var ai = '已更新你的身体数据：\n\n' + lines.join('\n') + '\n\n数据已同步保存。';
    this._pushDirectMsg(userText, ai, badges);
  },

  /* ===== 解析：经期 ===== */
  _parsePeriod: function (text) {
    if (/经期来了|月经来了|姨妈来了|来了大姨妈|例假来了|大姨妈来了|姨妈到了/.test(text)) return 'start';
    if (/经期结束|月经结束|姨妈走了|大姨妈走了|经期完了|月经完了|经期过了/.test(text)) return 'end';
    if (/来|开始|到了|今/.test(text) && /经期|月经|大姨妈|例假|姨妈|生理期/.test(text)) return 'start';
    if (/结束|完|走了|没了|停|干净|过了/.test(text) && /经期|月经|大姨妈|例假|姨妈|生理期/.test(text)) return 'end';
    if (/来了|到了|开始/.test(text) && this.data.actionMode === 'period') return 'start';
    if (/结束|走了|完了|没了/.test(text) && this.data.actionMode === 'period') return 'end';
    return null;
  },

  /* ===== 解析：运动 ===== */
  _parseSport: function (text) {
    var t = text.replace(/\s+/g, '');
    var min = 0;
    var minMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:分钟|min)/i);
    var hourMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:小时|hour|hr)/i);
    if (minMatch) min = parseFloat(minMatch[1]);
    else if (hourMatch) min = Math.round(parseFloat(hourMatch[1]) * 60);
    var foundName = '';
    var nameKeys = Object.keys(SPORT_NAME_MAP).sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < nameKeys.length; i++) {
      if (t.indexOf(nameKeys[i]) !== -1) { foundName = SPORT_NAME_MAP[nameKeys[i]]; break; }
    }
    if (!foundName) {
      var emojiToName = {
        '🏃': '慢跑', '🏊': '自由泳', '🚴': '休闲骑行', '🚶': '快走',
        '🤸': '中速跳绳', '🧘': '哈他瑜伽', '🧘‍♀️': '哈他瑜伽',
        '🏀': '篮球', '⚽': '足球', '🏸': '羽毛球', '🏓': '乒乓球',
        '🎾': '网球', '💪': '俯卧撑', '🎿': '滑雪', '⛸': '滑冰',
        '🧗': '攀岩', '💃': '广场舞', '🥏': '飞盘'
      };
      for (var em in emojiToName) {
        if (t.indexOf(em) !== -1) { foundName = emojiToName[em]; break; }
      }
    }
    if (!foundName) return null;
    if (!min) {
      var distMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:公里|km)/i);
      if (distMatch) {
        var dist = parseFloat(distMatch[1]);
        if (/骑|单车/.test(foundName)) min = Math.round(dist * 3);
        else if (/走|散步/.test(foundName)) min = Math.round(dist * 12);
        else min = Math.round(dist * 6);
      }
    }
    if (!min && /跳绳/.test(t)) {
      var repsMatch = t.match(/(\d+)\s*(?:个|次|下)/);
      if (repsMatch) min = Math.max(5, Math.round(parseInt(repsMatch[1]) / 120));
    }
    if (!min) min = 30;
    var info = SPORT_DB[foundName];
    var emoji = info ? info.emoji : '🏃';
    var cal60 = info ? info.cal60 : 300;
    return { name: foundName, emoji: emoji, min: min, cal: Math.round(cal60 / 60 * min) };
  },

  /* ===== 写入运动记录 ===== */
  _recordSportData: function (sport) {
    var ds = this._dateStr(new Date());
    var records = app.globalData.exerciseRecords || wx.getStorageSync('exerciseRecords') || [];
    var record = null;
    for (var i = 0; i < records.length; i++) {
      if (records[i].date === ds) { record = records[i]; break; }
    }
    if (!record) { record = { date: ds, sports: [] }; records.push(record); }
    record.sports.push({ id: Date.now(), emoji: sport.emoji, name: sport.name, min: sport.min, cal: sport.cal });
    app.globalData.exerciseRecords = records;
    wx.setStorageSync('exerciseRecords', records);
    var todayTotalCal = 0;
    record.sports.forEach(function (s) { todayTotalCal += (s.cal || 0); });
    app.globalData.calorieBurn = todayTotalCal;
    var sportRecords = wx.getStorageSync('sportRecords') || [];
    sportRecords.push({ id: Date.now(), sport: sport.name, date: ds, time: this._fmt() });
    wx.setStorageSync('sportRecords', sportRecords);
    if (!app.globalData.sportRecords) app.globalData.sportRecords = [];
    app.globalData.sportRecords = sportRecords;
  },

  _directRecordSport: function (userText, sport) {
    this._recordSportData(sport);
    var ds = this._dateStr(new Date());
    var summary = '🏃 已记录运动：**' + sport.emoji + ' ' + sport.name + '**';
    summary += '\n⏱️ 时长：' + sport.min + ' 分钟';
    summary += '\n🔥 消耗：约 ' + sport.cal + ' 千卡';
    summary += '\n📅 ' + ds + ' ' + this._fmt();
    var badge = { text: '🏃 ' + sport.name + ' ' + sport.min + '分钟 · ' + sport.cal + '千卡', detailUrl: '/pages/exercise/exercise', type: 'sport' };
    this._pushDirectMsg(userText, summary, [badge]);
  },

  /* ===== 推送直接消息 ===== */
  _pushDirectMsg: function (userText, aiText, badges) {
    var userId = 'msg_' + Date.now(), aiId = 'msg_ai_' + (Date.now() + 1);
    this.setData({
      messages: this.data.messages.concat([
        { id: userId, role: 'user', content: userText, image: '', hasImage: false, time: this._fmt() },
        { id: aiId, role: 'assistant', content: aiText, htmlContent: this._mdToHtml(aiText),
          thinkingContent: '', isThinking: false, showThinking: false, thinkingDone: false,
          image: '', hasImage: false, time: this._fmt(), typing: false, actionResults: badges || [] }
      ]),
      inputText: '', showWelcome: false, actionMode: '', scrollToView: 'bottom-anchor'
    });
    wx.showToast({ title: '记录成功', icon: 'success' });
  },

  /* ======================== AI 请求 ======================== */
  _send: function (msgs, idx, hasImg, actionMode) {
    if (idx >= MAX_ATTEMPTS) { this._err('所有模型暂时不可用'); return; }
    var now = Date.now(), diff = now - this._lastReq;
    if (diff < MIN_INTERVAL) { var self = this; setTimeout(function () { self._send(msgs, idx, hasImg, actionMode); }, MIN_INTERVAL - diff); return; }
    this._lastReq = Date.now();
    var mi = idx % modelList.length, model = modelList[mi];
    while (hasImg && !model.multimodal && mi < modelList.length - 1) { mi++; model = modelList[mi]; }
    if (hasImg && !model.multimodal) { this._err('无可用图片识别模型'); return; }
    var fast = this.data.fastMode, temperature = fast ? 0.2 : 0.7;

    var sys = '你是BESTAI，专业的健身减脂饮食与运动顾问，同时支持智能记账、喝水记录、运动记录和经期记录。用中文回答，语气亲切专业。';
    sys += '\n\n【健身建议】涉及饮食给具体热量和营养素，涉及运动给组数次注意事项，简洁实用。Markdown格式。';
    sys += '\n\n【记账】用户提到消费/收入时，在回复最后另起一行写：记账:expense|分类键|分类名|图标|金额|备注 或 记账:income|...';
    sys += '\n分类键：food餐饮🍔,drink饮品🧋,fruit水果🍎,snack零食🍪,transport交通🚌,shopping购物🛍️,entertain娱乐🎮,health医疗💊,daily日用🧴,sport运动🏋️,edu学习📚,travel旅游✈️,digital数码💻,social社交💬,beauty美妆💄,housing住房🏠,pet宠物🐾,gift礼物🎁,car车辆🚗,other其他📦';
    sys += '\n收入键：salary工资💰,bonus奖金🎁,invest理财📈,parttime兼职💼,refund退款🔄,gift红包🧧,other其他💎';
    sys += '\n【重要】只有当用户明确花费或收到具体金额时才输出记账标记。';
    sys += '\n\n【喝水】用户提到喝水时，最后另起一行写：喝水:数字(纯ml)';
    sys += '\n\n【运动】用户提到运动时，在回复最后另起一行写：运动:运动名称|时长(分钟)|消耗热量(千卡)';
    sys += '\n示例：运动:慢跑|30|180';
    sys += '\n\n【修改数据】用户要求修改个人信息时，最后另起一行写：修改数据:字段|值';
    sys += '\n字段：weight,height,age,targetWeight,nickname,signature,gender(male/female),activity(0-3),goal(0-3)';
    sys += '\n\n【经期】用户提到经期时，最后另起一行写：经期:开始 或 经期:结束';
    sys += '\n\n所有标记严格用英文冒号:和竖线|。';

    if (actionMode === 'water') sys += '\n\n【当前模式：记喝水】末尾必须写 喝水:数字ml。';
    else if (actionMode === 'account') sys += '\n\n【当前模式：记账】末尾必须写 记账:... 标记。';
    else if (actionMode === 'body') sys += '\n\n【当前模式：修改数据】末尾必须写 修改数据:字段|值。';
    else if (actionMode === 'period') sys += '\n\n【当前模式：经期】末尾必须写 经期:开始 或 经期:结束。';
    else if (actionMode === 'sport') sys += '\n\n【当前模式：运动记录】分析运动描述，末尾必须写 运动:名称|分钟|千卡。';

    sys += this._buildProfilePrompt();

    var apiMsgs = [{ role: 'system', content: sys }];
    var that = this;
    msgs.forEach(function (m) {
      if (m.role === 'user') {
        if (m.hasImage && that._imgMap[m.id]) apiMsgs.push({ role: 'user', content: [{ type: 'text', text: m.content || '分析图片' }, { type: 'image_url', image_url: { url: that._imgMap[m.id] } }] });
        else apiMsgs.push({ role: 'user', content: m.content });
      } else if (m.role === 'assistant' && m.content) apiMsgs.push({ role: 'assistant', content: m.content });
    });

    var aiId = 'msg_ai_' + Date.now() + '_' + idx;
    this._aiId = aiId; this._fullContent = ''; this._skipAnim = false;
    if (idx === 0) {
      this.setData({ messages: this.data.messages.concat({ id: aiId, role: 'assistant', content: '', htmlContent: '', thinkingContent: '', isThinking: !fast, showThinking: !fast, thinkingDone: false, image: '', hasImage: false, time: this._fmt(), typing: true, actionResults: [] }), scrollToView: aiId });
    } else {
      this.setData({ messages: this.data.messages.map(function (m) { return m.role === 'assistant' && m.typing ? Object.assign({}, m, { id: aiId, content: '', htmlContent: '', thinkingContent: '', isThinking: !fast, showThinking: !fast, thinkingDone: false, actionResults: [] }) : m; }), scrollToView: aiId });
    }
    if (!fast) this._startThinkAnim(aiId);

    this._reqTask = wx.request({
      url: API_URL, method: 'POST',
      header: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + API_KEY },
      data: { model: model.id, messages: apiMsgs, max_tokens: 4096, temperature: temperature },
      timeout: REQUEST_TIMEOUT,
      success: function (res) {
        that._reqTask = null; that._stopThinkAnim();
        if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
          var content = res.data.choices[0].message && res.data.choices[0].message.content;
          if (content) { that._fullContent = res.data.choices[0].finish_reason === 'length' ? content + '\n\n---\n*回复被截断*' : content; that._finishThinkStartType(aiId, that._fullContent); return; }
        }
        if (res.statusCode === 429) { setTimeout(function () { that._send(msgs, idx + 1, hasImg, actionMode); }, 5000); return; }
        if (res.statusCode === 401) { that._errMsg(aiId, 'API密钥错误'); return; }
        var d = res.data, e = (d && d.error && d.error.message) ? d.error.message : (d && d.message) ? d.message : 'HTTP ' + res.statusCode;
        if (/rate|limit|unavail|not found|unsupported/i.test(e)) that._send(msgs, idx + 1, hasImg, actionMode);
        else that._errMsg(aiId, '请求失败：' + e);
      },
      fail: function () { that._reqTask = null; that._stopThinkAnim(); that._send(msgs, idx + 1, hasImg, actionMode); }
    });
  },

  onStopGenerate: function () { this._abort(); wx.showToast({ title: '已停止生成', icon: 'none', duration: 1000 }); },

  _startThinkAnim: function (aiId) {
    var pi = 0, that = this;
    this._thinkTimer = setInterval(function () {
      that.setData({ messages: that.data.messages.map(function (m) { return m.id === aiId ? Object.assign({}, m, { thinkingContent: THINK_PHASES[pi % THINK_PHASES.length] }) : m; }) }); pi++;
    }, 700);
  },
  _stopThinkAnim: function () { if (this._thinkTimer) { clearInterval(this._thinkTimer); this._thinkTimer = null; } },

  _finishThinkStartType: function (aiId, fullText) {
    var msgIdx = this.data.messages.findIndex(function (m) { return m.id === aiId; }); this._cachedMsgIdx = msgIdx;
    if (this._skipAnim || this.data.fastMode) { this._skipAnim = false; this._showFormatted(aiId, fullText, msgIdx); return; }
    var that = this;
    this.setData({ messages: this.data.messages.map(function (m) { return m.id === aiId ? Object.assign({}, m, { thinkingContent: '已完成深度分析', isThinking: false, thinkingDone: true, showThinking: false }) : m; }) });
    setTimeout(function () { that._startTyping(aiId, fullText); }, 400);
  },

  _startTyping: function (aiId, fullText) {
    if (this._skipAnim) { this._skipAnim = false; this._showFormatted(aiId, fullText, this._cachedMsgIdx); return; }
    var idx = 0, len = fullText.length, mi = this._cachedMsgIdx, scrollTick = 0, that = this;
    if (mi < 0) { this._showFull(aiId, fullText); return; }
    var tick = function () {
      if (idx >= len) { that._showFormatted(aiId, fullText, mi); return; }
      idx = Math.min(idx + CHARS_PER_TICK, len);
      var u = {}; u['messages[' + mi + '].content'] = fullText.slice(0, idx);
      var now = Date.now(); if (now - scrollTick > 600) { scrollTick = now; u.scrollToView = 'bottom-anchor'; }
      that.setData(u); that._typingTimer = setTimeout(tick, TYPE_SPEED);
    };
    tick();
  },

  _parseAction: function (text) {
    var result = { cleanText: '', actions: [] };
    var lines = text.split('\n'), contentLines = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim(), matched = false;
      var am = line.match(/^记账[：:]\s*(expense|income)\s*[|｜]\s*(\w+)\s*[|｜]\s*([^|｜]+)\s*[|｜]\s*([^|｜]+)\s*[|｜]\s*(\d+(?:\.\d+)?)\s*[|｜]?\s*(.*)?$/);
      if (am) { result.actions.push({ type: 'account', data: { recordType: am[1], category: am[2], categoryName: am[3].trim(), categoryIcon: am[4].trim(), amount: parseFloat(am[5]), note: (am[6] || '').trim() } }); matched = true; }
      if (!matched) { var wm = line.match(/^喝水[：:]\s*(\d+(?:\.\d+)?)\s*(?:ml|毫升|cc)?\s*$/i); if (wm) { result.actions.push({ type: 'water', data: { amount: parseFloat(wm[1]) } }); matched = true; } }
      if (!matched) { var sm = line.match(/^运动[：:]\s*(.+?)\s*[|｜]\s*(\d+(?:\.\d+)?)\s*(?:[|｜]\s*(\d+(?:\.\d+)?)\s*)?$/); if (sm) { result.actions.push({ type: 'sport', data: { name: sm[1].trim(), min: parseFloat(sm[2]), cal: sm[3] ? parseFloat(sm[3]) : 0 } }); matched = true; } }
      if (!matched) { var bm = line.match(/^修改数据[：:]\s*(weight|height|age|targetWeight|nickname|gender|activity|goal|signature)\s*[|｜]\s*(.+)$/); if (bm) { result.actions.push({ type: 'body', data: { field: bm[1], value: bm[2].trim() } }); matched = true; } }
      if (!matched) { var pm = line.match(/^经期[：:]\s*(开始|结束)\s*$/); if (pm) { result.actions.push({ type: 'period', data: { periodAction: pm[1] === '开始' ? 'start' : 'end' } }); matched = true; } }
      if (!matched) contentLines.push(lines[i]);
    }
    result.cleanText = contentLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    return result;
  },

  _executeActions: function (actions) {
    var results = [], that = this;
    actions.forEach(function (a) {
      switch (a.type) {
        case 'account': results.push(that._execAccount(a.data)); break;
        case 'water': results.push(that._execWater(a.data)); break;
        case 'body': results.push(that._execBody(a.data)); break;
        case 'period': results.push(that._execPeriod(a.data)); break;
        case 'sport': results.push(that._execSport(a.data)); break;
      }
    });
    return results;
  },

  _execAccount: function (d) {
    if (!d.amount || d.amount <= 0) return { text: '⚠️ 金额无效，已忽略' };
    var ds = this._dateStr(new Date()) + ' ' + String(new Date().getHours()).padStart(2, '0') + ':' + String(new Date().getMinutes()).padStart(2, '0');
    var all = wx.getStorageSync('accountRecords') || [];
    all.push({ id: Date.now(), type: d.recordType, amount: d.amount, category: d.category, categoryName: d.categoryName, categoryIcon: d.categoryIcon, note: d.note || '', date: ds });
    wx.setStorageSync('accountRecords', all);
    if (!app.globalData.accountRecords) app.globalData.accountRecords = [];
    app.globalData.accountRecords = all;
    var summary = this._getTodayAccountSummary();
    var text = (d.recordType === 'expense' ? '💰 已记账：支出 ¥' : '💰 已记账：收入 ¥') + d.amount + ' ' + d.categoryName +
               '\n📊 今日总支出：¥' + summary.expense + '，总收入：¥' + summary.income;
    return { text: text, detailUrl: '/pages/account/account', type: 'account' };
  },

  _execWater: function (d) {
    var ds = this._dateStr(new Date());
    var nowTime = this._fmt();
    var records = wx.getStorageSync('waterRecords') || [];
    records.push({ id: Date.now(), time: nowTime, ml: d.amount, name: '水', date: ds });
    wx.setStorageSync('waterRecords', records);
    if (!app.globalData.waterRecords) app.globalData.waterRecords = [];
    app.globalData.waterRecords = records;
    app.globalData.waterTodayML = (app.globalData.waterTodayML || 0) + d.amount;
    wx.setStorageSync('waterTodayML', app.globalData.waterTodayML);
    var history = wx.getStorageSync('waterHistory') || {};
    if (!history[ds]) history[ds] = { totalML: 0, records: [] };
    history[ds].records.push({ id: Date.now(), time: nowTime, ml: d.amount, name: '水', type: 'water', icon: '💧', date: ds });
    history[ds].totalML += d.amount;
    wx.setStorageSync('waterHistory', history);
    var summary = this._getTodayWaterSummary();
    var text = '💧 已记录喝水 ' + d.amount + 'ml\n📊 今日累计：' + summary.total + 'ml / ' + summary.target + 'ml';
    if (summary.left > 0) text += '\n💪 还差 ' + summary.left + 'ml';
    else text += '\n🎉 已达成饮水目标！';
    return { text: text, detailUrl: '/pages/water/water', type: 'water' };
  },

  _execBody: function (d) {
    var u = wx.getStorageSync('userInfo') || {};
    var converted = this._convertBodyValue(d.field, d.value);
    if (!converted.ok) return { text: converted.error };
    u[d.field] = converted.value;
    wx.setStorageSync('userInfo', u);
    if (!app.globalData.userInfo) app.globalData.userInfo = {};
    app.globalData.userInfo[d.field] = converted.value;
    if (d.field === 'weight') { var records = wx.getStorageSync('weightRecords') || []; records.push({ date: this._dateStr(new Date()), weight: converted.value }); wx.setStorageSync('weightRecords', records); }
    this._loadProfile();
    return { text: '✅ 已更新' + (FIELD_NAMES[d.field] || d.field) + '为 ' + converted.display, detailUrl: '/pages/user-info/user-info', type: 'body' };
  },

  _execPeriod: function (d) {
    var g = app.globalData; if (!g.periodLogs) g.periodLogs = [];
    var pa = d.periodAction, now = new Date(), ds = this._dateStr(now);
    if (pa === 'start') {
      if (g.periodLogs.some(function (l) { return !l.endDate; })) return { text: '已有进行中的经期记录' };
      g.periodLogs.push({ id: Date.now(), startDate: ds, endDate: null, days: 0, status: '进行中', month: (now.getMonth() + 1) + '月', start: (now.getMonth() + 1) + '月' + now.getDate() + '日', end: '', startYMD: now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日', endYMD: '' });
      return { text: this._getPeriodCareMessage('start'), detailUrl: '/pages/women-health/women-health', type: 'period' };
    } else {
      var active = g.periodLogs.filter(function (l) { return !l.endDate; });
      if (!active.length) return { text: '没有进行中的经期记录' };
      var a = active[active.length - 1], parts = a.startDate.split('-');
      var days = Math.round((now - new Date(+parts[0], +parts[1] - 1, +parts[2])) / 86400000) + 1;
      a.endDate = ds; a.days = days; a.status = '已结束';
      a.end = (now.getMonth() + 1) + '月' + now.getDate() + '日';
      a.endYMD = now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日';
      return { text: this._getPeriodCareMessage('end'), detailUrl: '/pages/women-health/women-health', type: 'period' };
    }
  },

  _execSport: function (d) {
    var name = d.name, min = d.min || 30, cal = d.cal || 0;
    var info = SPORT_DB[name];
    var emoji = info ? info.emoji : '🏃';
    if (!cal && info) cal = Math.round(info.cal60 / 60 * min);
    if (!cal) cal = Math.round(300 / 60 * min);
    var sport = { name: name, emoji: emoji, min: min, cal: cal };
    this._recordSportData(sport);
    var text = '🏃 已记录运动：**' + emoji + ' ' + name + '**\n⏱️ 时长：' + min + ' 分钟\n🔥 消耗：约 ' + cal + ' 千卡';
    return { text: text, detailUrl: '/pages/exercise/exercise', type: 'sport' };
  },

  _quickRecordDiet: function (food) {
    var now = this._dateStr(new Date());
    var dietRecords = wx.getStorageSync('dietRecords') || [];
    dietRecords.push({ id: Date.now(), food: food, date: now, time: this._fmt() });
    wx.setStorageSync('dietRecords', dietRecords);
    if (!app.globalData.dietRecords) app.globalData.dietRecords = [];
    app.globalData.dietRecords = dietRecords;
    return { text: '✅ 已记录饮食：' + food + '\n📅 ' + now + ' ' + this._fmt(), detailUrl: null };
  },
  _quickRecordSport: function (sport) {
    var now = this._dateStr(new Date());
    var sportRecords = wx.getStorageSync('sportRecords') || [];
    sportRecords.push({ id: Date.now(), sport: sport, date: now, time: this._fmt() });
    wx.setStorageSync('sportRecords', sportRecords);
    if (!app.globalData.sportRecords) app.globalData.sportRecords = [];
    app.globalData.sportRecords = sportRecords;
    return { text: '✅ 已记录运动：' + sport + '\n📅 ' + now + ' ' + this._fmt(), detailUrl: null };
  },

  onActionDetail: function (e) {
    var url = e.currentTarget.dataset.url, type = e.currentTarget.dataset.type;
    if (!url) return;
    if (type === 'water') wx.navigateTo({ url: '/pages/water/water' });
    else if (type === 'account') wx.switchTab({ url: '/pages/account/account' });
    else if (type === 'body') wx.navigateTo({ url: '/pages/user-info/user-info' });
    else if (type === 'period') wx.navigateTo({ url: '/pages/women-health/women-health' });
    else if (type === 'sport') wx.navigateTo({ url: '/pages/exercise/exercise' });
    else wx.navigateTo({ url: url });
  },

  _showFormatted: function (aiId, fullText, mi) {
    if (mi < 0) return;
    var parsed = this._parseAction(fullText);
    var actionResults = parsed.actions.length > 0 ? this._executeActions(parsed.actions) : [];
    if (actionResults.length > 0) wx.showToast({ title: '操作已完成', icon: 'success', duration: 1000 });
    var u = {};
    u['messages[' + mi + '].htmlContent'] = this._mdToHtml(parsed.cleanText);
    u['messages[' + mi + '].content'] = parsed.cleanText;
    u['messages[' + mi + '].typing'] = false;
    u['messages[' + mi + '].isThinking'] = false;
    u['messages[' + mi + '].actionResults'] = actionResults;
    u.isLoading = false; u.scrollToView = 'bottom-anchor';
    this.setData(u); this._typingTimer = null;
  },

  _showFull: function (aiId, fullText) {
    var parsed = this._parseAction(fullText), that = this;
    var actionResults = parsed.actions.length > 0 ? this._executeActions(parsed.actions) : [];
    if (actionResults.length > 0) wx.showToast({ title: '操作已完成', icon: 'success', duration: 1000 });
    this.setData({ messages: this.data.messages.map(function (m) { return m.id === aiId ? Object.assign({}, m, { content: parsed.cleanText, htmlContent: that._mdToHtml(parsed.cleanText), typing: false, isThinking: false, actionResults: actionResults }) : m; }), isLoading: false, scrollToView: 'bottom-anchor' });
  },

  _mdToHtml: function (text) {
    if (!text) return '';
    var safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    var lines = safe.split('\n'), out = [];
    for (var i = 0; i < lines.length; i++) {
      var t = lines[i].trim();
      if (t === '') { out.push('<div style="height:10px"></div>'); continue; }
      if (/^[-*_]{3,}$/.test(t)) { out.push('<div style="height:1px;background:linear-gradient(90deg,transparent,#e2e8f0,transparent);margin:14px 0;"></div>'); continue; }
      var hm = t.match(/^(#{1,3})\s+(.+)$/);
      if (hm) { var lv = hm[1].length, sz = lv === 1 ? '17px' : lv === 2 ? '16px' : '15px'; out.push('<div style="font-size:' + sz + ';font-weight:800;color:#1e293b;margin:14px 0 6px;line-height:1.6;">' + this._inline(hm[2]) + '</div>'); continue; }
      if (/^&gt;\s?/.test(t)) { out.push('<div style="border-left:4px solid rgba(0,0,0,0.08);padding:8px 14px;margin:8px 0;background:rgba(0,0,0,0.02);border-radius:0 10px 10px 0;color:#64748b;">' + this._inline(t.replace(/^&gt;\s?/, '')) + '</div>'); continue; }
      var um = t.match(/^([-*•])\s+(.+)$/);
      if (um) { out.push('<div style="display:flex;align-items:flex-start;margin:5px 0;line-height:1.75;"><span style="color:rgba(0,0,0,0.2);font-weight:700;margin-right:10px;flex-shrink:0;">•</span><span>' + this._inline(um[2]) + '</span></div>'); continue; }
      var om = t.match(/^(\d+)[.)、]\s*(.+)$/);
      if (om) { out.push('<div style="display:flex;align-items:flex-start;margin:5px 0;line-height:1.75;"><span style="color:rgba(0,0,0,0.25);font-weight:700;margin-right:10px;min-width:24px;flex-shrink:0;">' + om[1] + '.</span><span>' + this._inline(om[2]) + '</span></div>'); continue; }
      out.push('<div style="margin:5px 0;line-height:1.75;">' + this._inline(lines[i]) + '</div>');
    }
    return out.join('');
  },
  _inline: function (s) {
    if (!s) return '';
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:700;color:#1e293b;">$1</strong>');
    s = s.replace(/\*([^*<>]+?)\*/g, '<em style="color:#64748b;">$1</em>');
    s = s.replace(/`([^`]+?)`/g, '<code style="background:rgba(0,0,0,0.04);padding:2px 8px;border-radius:6px;font-size:12px;color:#be185d;">$1</code>');
    return s;
  },
  onToggleThink: function (e) { var id = e.currentTarget.dataset.id; this.setData({ messages: this.data.messages.map(function (m) { return m.id === id ? Object.assign({}, m, { showThinking: !m.showThinking }) : m; }) }); },

  _errMsg: function (aiId, msg) { this._abort(); this.setData({ messages: this.data.messages.map(function (m) { return m.id === aiId ? Object.assign({}, m, { content: msg, htmlContent: '', typing: false, isThinking: false }) : m; }), isLoading: false }); },
  _err: function (msg) {
    this._abort();
    var msgs = this.data.messages.filter(function (m) { return !m.typing; });
    msgs.push({ id: 'err_' + Date.now(), role: 'assistant', content: msg, htmlContent: '', thinkingContent: '', isThinking: false, showThinking: false, thinkingDone: false, image: '', hasImage: false, time: this._fmt(), typing: false, actionResults: [] });
    this.setData({ messages: msgs, isLoading: false });
  },
  _abort: function () {
    if (this._typingTimer) { clearTimeout(this._typingTimer); this._typingTimer = null; }
    if (this._thinkTimer) { clearInterval(this._thinkTimer); this._thinkTimer = null; }
    if (this._reqTask) { try { this._reqTask.abort(); } catch (e) {}; this._reqTask = null; }
    this._cachedMsgIdx = -1; this._fullContent = ''; this._skipAnim = false;
    if (this.data.messages.some(function (m) { return m.typing; })) this.setData({ messages: this.data.messages.map(function (m) { return m.typing ? Object.assign({}, m, { typing: false }) : m; }), isLoading: false });
    else this.setData({ isLoading: false });
  },

  onChooseImage: function () {
    var that = this;
    wx.chooseMedia({ count: 1, mediaType: ['image'], sourceType: ['album', 'camera'], sizeType: ['compressed'],
      success: function (res) { var p = res.tempFiles[0].tempFilePath; wx.compressImage({ src: p, quality: 30, success: function (c) { that._saveImg(c.tempFilePath); }, fail: function () { that._saveImg(p); } }); }
    });
  },
  _saveImg: function (path) {
    try { var b64 = wx.getFileSystemManager().readFileSync(path, 'base64'); if (b64.length > 500000) { wx.showToast({ title: '图片太大', icon: 'none' }); return; } this._pendingImg = 'data:image/jpeg;base64,' + b64; this.setData({ selectedImagePreview: path }); wx.showToast({ title: '图片已添加', icon: 'success', duration: 800 }); }
    catch (e) { wx.showToast({ title: '图片处理失败', icon: 'none' }); }
  },
  onRemoveImage: function () { this._pendingImg = ''; this.setData({ selectedImagePreview: '' }); },

  _fmt: function () { var d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); },
  _dateStr: function (d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
  onTapSuggest: function (e) { this.setData({ inputText: e.currentTarget.dataset.text }); this.onSend(); },
  onPreviewImage: function (e) { var src = e.currentTarget.dataset.src; if (src && !src.startsWith('data:')) wx.previewImage({ urls: [src], current: src }); },

  goInfoPage: function () { wx.navigateTo({ url: '/pages/user-info/user-info' }); },
  goGoalPage: function () { wx.navigateTo({ url: '/pages/goal-management/goal-management' }); },
  goAddSport: function () { wx.navigateTo({ url: '/pages/exercise/add-sport' }); },

  onToggleMode: function () {
    var f = !this.data.fastMode; this.setData({ fastMode: f });
    try { wx.setStorageSync('bestai_fast', f); } catch (e) {}
    wx.showToast({ title: f ? '已切换快速模式' : '已切换深度模式', icon: 'none', duration: 1500 });
  },
  onSkipAll: function (e) {
    var id = e.currentTarget.dataset.id;
    this._stopThinkAnim();
    if (this._typingTimer) { clearTimeout(this._typingTimer); this._typingTimer = null; }
    this._skipAnim = true;
    var mi = this.data.messages.findIndex(function (m) { return m.id === id; });
    if (mi < 0) return;
    if (this._fullContent) { this._skipAnim = false; this._showFormatted(id, this._fullContent, mi); }
    else { var u = {}; u['messages['+mi+'].isThinking']=false; u['messages['+mi+'].showThinking']=false; u['messages['+mi+'].thinkingContent']='已跳过思考'; u['messages['+mi+'].thinkingDone']=true; this.setData(u); }
  },
  onClearChat: function () { this._abort(); this.setData({ showClearModal: true, actionMode: '' }); },
  onCancelClear: function () { this.setData({ showClearModal: false }); },
  onConfirmClear: function () { this._imgMap = {}; this._pendingImg = ''; this.setData({ messages: [], showWelcome: true, selectedImagePreview: '', showClearModal: false, actionMode: '' }); },
  onInputChange: function (e) { this.setData({ inputText: e.detail.value }); },
  onSend: function () {
    var text = this.data.inputText.trim();
    var hasImg = !!this._pendingImg;
    if ((!text && !hasImg) || this.data.isLoading) return;
    this._abort();
    var mode = this.data.actionMode;

    if (mode === 'water') {
      var wAmt = this._parseWater(text);
      if (wAmt > 0) { this._directRecordWater(text, wAmt); return; }
      var simpleNum = text.match(/^(\d+(?:\.\d+)?)$/);
      if (simpleNum) { this._directRecordWater(text, parseFloat(simpleNum[1])); return; }
    } else if (mode === 'account') {
      var acc = this._parseAccount(text);
      if (acc) { this._directRecordAccount(text, acc); return; }
    } else if (mode === 'body') {
      var body = this._parseBody(text);
      if (body && body.length > 0) { this._directRecordBody(text, body); return; }
    } else if (mode === 'period') {
      var pa = this._parsePeriod(text);
      if (pa) { var result = this._execPeriod({ periodAction: pa }); this._pushDirectMsg(text, result.text, [result]); return; }
    } else if (mode === 'sport') {
      var sp = this._parseSport(text);
      if (sp) { this._directRecordSport(text, sp); return; }
    } else if (mode === 'diet') {
      this._pushDirectMsg(text, '请点击下方快捷按钮或输入食物名称', []);
      return;
    }

    var id = 'msg_' + Date.now();
    var um = { id: id, role: 'user', content: text, image: this.data.selectedImagePreview || '', hasImage: hasImg, time: this._fmt() };
    if (hasImg) this._imgMap[id] = this._pendingImg;
    this.setData({ messages: this.data.messages.concat(um), inputText: '', selectedImagePreview: '', isLoading: true, showWelcome: false, scrollToView: id, actionMode: '' });
    this._pendingImg = '';
    this._send(this.data.messages.slice(-10), 0, hasImg, mode);
  }
});
