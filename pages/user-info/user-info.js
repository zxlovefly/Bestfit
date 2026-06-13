var app = getApp()

var ACT_LIST = [
  { key: 0, label: '久坐不动', desc: '办公室、学生，几乎不运动', icon: '🪑' },
  { key: 1, label: '轻度活动', desc: '每周 1-3 次轻度运动', icon: '🚶' },
  { key: 2, label: '中度活动', desc: '每周 3-5 次规律运动', icon: '🏃' },
  { key: 3, label: '高强度活动', desc: '每周 6-7 次高强度训练', icon: '🏋️' }
]

var GOAL_LIST = [
  { key: 0, label: '减脂塑形', icon: '🔥', goalType: 'lose', color: '#FF6B6B', bg: '#FFF0F0' },
  { key: 1, label: '增肌增重', icon: '💪', goalType: 'gain', color: '#6C8EEF', bg: '#EEF2FF' },
  { key: 2, label: '维持现状', icon: '⚖️', goalType: 'maintain', color: '#34C759', bg: '#EDF9F0' },
  { key: 3, label: '健康调理', icon: '🧘', goalType: 'tone', color: '#F5A623', bg: '#FFF8EC' }
]

var GOAL_TYPE_TO_INDEX = { lose: 0, gain: 1, maintain: 2, tone: 3 }

Page({
  data: {
    nickname: '',
    signature: '',
    gender: '',
    age: '',
    height: '',
    weight: '',
    targetWeight: '',
    activity: 0,
    goal: 0,
    actList: ACT_LIST,
    goalList: GOAL_LIST,
    isFemale: false,
    showPreview: false,
    pvBMR: 0,
    pvTDEE: 0,
    pvTarget: 0,

    pageReady: false,

    hasGoalPlan: false,
    goalPlanType: '',
    goalPlanEmoji: '',
    goalPlanLabel: ''
  },

  onLoad: function () {
    this._loadFromSources()
    var self = this
    setTimeout(function () { self.setData({ pageReady: true }) }, 80)
  },

  onShow: function () {
    this._loadFromSources()
  },

  /* ★ 核心改动：统一读取，storage 最高优先级，保证 AI 聊天页修改的数据能同步到此页 ★ */
  _loadFromSources: function () {
    var gData = app.globalData.userInfo || {}
    var stored = {}
    try { stored = wx.getStorageSync('userInfo') || {} } catch (e) {}

    /* 辅助：storage 优先 → globalData → 默认值 */
    function pick(field, fallback) {
      var sv = stored[field]
      var gv = gData[field]
      if (sv !== undefined && sv !== null && sv !== '') return sv
      if (gv !== undefined && gv !== null && gv !== '') return gv
      return fallback !== undefined ? fallback : ''
    }

    var merged = {}
    merged.nickname      = pick('nickname', '')
    merged.signature     = pick('signature', '')
    merged.gender        = pick('gender', 'female')
    merged.age           = pick('age', '')
    merged.height        = pick('height', '')
    merged.weight        = pick('weight', '')
    merged.targetWeight  = pick('targetWeight', '')
    merged.activity      = typeof stored.activity === 'number' ? stored.activity
                         : typeof gData.activity === 'number' ? gData.activity : 0
    merged.goal          = typeof stored.goal === 'number' ? stored.goal
                         : typeof gData.goal === 'number' ? gData.goal : 0

    /* 目标计划 */
    var goalPlan = null
    try { goalPlan = wx.getStorageSync('weightGoal') || null } catch (e) {}

    /* 体重记录最新一条覆盖 */
    var records = []
    try { records = wx.getStorageSync('weightRecords') || [] } catch (e) {}
    if (records.length > 0) {
      records.sort(function (a, b) { return a.date > b.date ? 1 : -1 })
      merged.weight = Number(records[records.length - 1].weight).toFixed(1)
    }

    var hasGoalPlan = false
    var goalPlanType = ''
    var goalPlanEmoji = ''
    var goalPlanLabel = ''

    if (goalPlan && goalPlan.initialWeight) {
      hasGoalPlan = true
      goalPlanType = goalPlan.goalType || 'lose'
      var metaMap = {
        lose:     { emoji: '🔥', label: '减脂减重' },
        gain:     { emoji: '💪', label: '增肌增重' },
        maintain: { emoji: '⚖️', label: '维持体重' },
        tone:     { emoji: '✨', label: '塑形紧致' }
      }
      var meta = metaMap[goalPlanType] || metaMap.lose
      goalPlanEmoji = meta.emoji
      goalPlanLabel = meta.label

      if (goalPlan.targetWeight) merged.targetWeight = Number(goalPlan.targetWeight).toFixed(1)
      if (typeof GOAL_TYPE_TO_INDEX[goalPlanType] !== 'undefined') merged.goal = GOAL_TYPE_TO_INDEX[goalPlanType]
      if (merged.height && !goalPlan.userHeight) {
        goalPlan.userHeight = parseFloat(merged.height)
        try { wx.setStorageSync('weightGoal', goalPlan) } catch (e) {}
      }
    }

    /* ★ 统一写回 globalData，确保三方同步 ★ */
    if (!app.globalData.userInfo) app.globalData.userInfo = {}
    var g = app.globalData.userInfo
    g.nickname     = merged.nickname
    g.signature    = merged.signature
    g.gender       = merged.gender
    g.age          = Number(merged.age) || g.age || 0
    g.height       = Number(merged.height) || g.height || 0
    g.weight       = Number(merged.weight) || g.weight || 0
    g.targetWeight = Number(merged.targetWeight) || g.targetWeight || 0
    g.activity     = merged.activity
    g.goal         = merged.goal

    /* ★ 回写 storage 确保一致 ★ */
    try { wx.setStorageSync('userInfo', g) } catch (e) {}

    this.setData({
      nickname: String(merged.nickname || ''),
      signature: String(merged.signature || ''),
      gender: merged.gender,
      isFemale: merged.gender === 'female',
      age: String(merged.age || ''),
      height: String(merged.height || ''),
      weight: String(merged.weight || ''),
      targetWeight: String(merged.targetWeight || ''),
      activity: merged.activity,
      goal: merged.goal,
      hasGoalPlan: hasGoalPlan,
      goalPlanType: goalPlanType,
      goalPlanEmoji: goalPlanEmoji,
      goalPlanLabel: goalPlanLabel
    })

    this._calcPreview()
  },

  /* ========== 输入事件 ========== */
  onNickname: function (e) { this.setData({ nickname: e.detail.value }) },
  onSignature: function (e) { this.setData({ signature: e.detail.value }) },
  onAge: function (e) { this.setData({ age: e.detail.value }); this._calcPreview() },
  onHeight: function (e) { this.setData({ height: e.detail.value }); this._calcPreview() },
  onWeight: function (e) { this.setData({ weight: e.detail.value }); this._calcPreview() },
  onTargetWeight: function (e) { this.setData({ targetWeight: e.detail.value }) },

  selectGender: function (e) {
    var g = e.currentTarget.dataset.g
    this.setData({ gender: g, isFemale: g === 'female' })
    this._calcPreview()
  },

  selectAct: function (e) {
    this.setData({ activity: parseInt(e.currentTarget.dataset.i) })
    this._calcPreview()
  },

  selectGoal: function (e) {
    this.setData({ goal: parseInt(e.currentTarget.dataset.i) })
    this._calcPreview()
  },

  /* ========== 热量预览 ========== */
  _calcPreview: function () {
    var d = this.data
    var w = Number(d.weight), h = Number(d.height), a = Number(d.age)
    if (!w || !h || !a || !d.gender) { this.setData({ showPreview: false }); return }

    var bmr = d.gender === 'female'
      ? 10 * w + 6.25 * h - 5 * a - 161
      : 10 * w + 6.25 * h - 5 * a + 5

    var actMap = [1.2, 1.375, 1.55, 1.725]
    var adjMap = [-400, 300, 0, 0]
    var tdee = Math.round(bmr * actMap[d.activity])
    var target = Math.round(tdee + adjMap[d.goal])

    if (d.gender === 'female' && target < 1200) target = 1200
    if (d.gender === 'male' && target < 1500) target = 1500

    this.setData({ showPreview: true, pvBMR: Math.round(bmr), pvTDEE: tdee, pvTarget: target })
  },

  /* ========== 保存 ========== */
  saveInfo: function () {
    var d = this.data
    if (!d.nickname.trim()) { wx.showToast({ title: '请输入昵称', icon: 'none' }); return }
    if (!d.age || !d.height || !d.weight) { wx.showToast({ title: '请填写完整身体数据', icon: 'none' }); return }

    var w = Number(d.weight), tw = Number(d.targetWeight) || w
    var u = app.globalData.userInfo
    u.nickname = d.nickname.trim()
    u.signature = d.signature.trim()
    u.gender = d.gender
    u.age = Number(d.age); u.height = Number(d.height)
    u.weight = w; u.targetWeight = tw
    u.activity = d.activity; u.goal = d.goal
    try { wx.setStorageSync('userInfo', u) } catch (e) {}

    var today = this._fmtDate(new Date())
    var records = []
    try { records = wx.getStorageSync('weightRecords') || [] } catch (e) {}
    var found = false
    for (var i = 0; i < records.length; i++) {
      if (records[i].date === today) { records[i].weight = w; found = true; break }
    }
    if (!found) records.push({ date: today, weight: w })
    records.sort(function (a, b) { return a.date > b.date ? 1 : -1 })
    try { wx.setStorageSync('weightRecords', records) } catch (e) {}

    var goalType = GOAL_LIST[d.goal].goalType
    var existingGoal = null
    try { existingGoal = wx.getStorageSync('weightGoal') || null } catch (e) {}
    var weeklyMap = { lose: 0.2, gain: 0.3, maintain: 0, tone: 0.15 }
    if (existingGoal && existingGoal.initialWeight) {
      existingGoal.goalType = goalType; existingGoal.targetWeight = tw
      existingGoal.userHeight = Number(d.height); existingGoal.weeklyTarget = weeklyMap[goalType]
      try { wx.setStorageSync('weightGoal', existingGoal) } catch (e) {}
    }

    try { app.calcTargetCalorie() } catch (e) {}
    try { app.generateTodayPlan() } catch (e) {}

    wx.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(function () { wx.navigateBack() }, 600)
  },

  goGoalManagement: function () {
    wx.navigateTo({ url: '/pages/goal-management/goal-management' })
  },

  _fmtDate: function (d) {
    var y = d.getFullYear(), m = (d.getMonth() + 1).toString(), dd = d.getDate().toString()
    if (m.length < 2) m = '0' + m
    if (dd.length < 2) dd = '0' + dd
    return y + '-' + m + '-' + dd
  }
})
