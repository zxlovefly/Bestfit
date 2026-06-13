const app = getApp()

function pad(n) { return n < 10 ? '0' + n : '' + n }
function fmtDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) }
function parseDate(ds) { var p = ds.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]) }
function fmtFull(ds) { var d = parseDate(ds); return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日' }
function addDays(d, n) { var r = new Date(d); r.setDate(r.getDate() + n); return r }
function dayDiff(a, b) { return Math.round((parseDate(b) - parseDate(a)) / 86400000) }
function nowTime() { var n = new Date(); return pad(n.getHours()) + ':' + pad(n.getMinutes()) }

var MOODS = [
  { emoji: '😊', text: '开心' }, { emoji: '🥰', text: '幸福' },
  { emoji: '😌', text: '平静' }, { emoji: '😴', text: '疲倦' },
  { emoji: '😢', text: '难过' }, { emoji: '😤', text: '生气' },
  { emoji: '😰', text: '焦虑' }, { emoji: '🤕', text: '不适' }
]
var SYMS = [
  '😣 痛经', '😴 疲倦', '😤 易怒', '🍰 食欲增加', '🤕 头痛', '💧 水肿',
  '😩 腰酸', '🌙 失眠', '😖 胸胀', '😢 情绪低落', '🫠 痘痘', '💤 嗜睡'
]

var PERIOD_RECIPES = [
  { title: '红糖姜枣茶', desc: '暖宫驱寒，缓解痛经，温补气血', emoji: '🍵', tip: '生姜3片+红枣5颗+红糖适量，小火煮10分钟' },
  { title: '当归乌鸡汤', desc: '补血养气，温经散寒，滋阴补虚', emoji: '🍲', tip: '当归10g+乌鸡半只+枸杞红枣，慢炖1.5小时' },
  { title: '红枣桂圆糯米粥', desc: '养血安神，补气益脾，改善气色', emoji: '🥣', tip: '红枣8颗+桂圆15g+糯米适量，小火慢煮40分钟' },
  { title: '菠菜猪肝汤', desc: '补铁补血，增强体力，预防贫血', emoji: '🥬', tip: '猪肝200g+菠菜一把+姜片，大火煮开转小火15分钟' },
  { title: '红豆薏米甜汤', desc: '祛湿消肿，健脾养胃，美容养颜', emoji: '🫘', tip: '红豆+薏米各50g提前泡4小时，煮至软烂加冰糖' },
  { title: '山药枸杞排骨汤', desc: '健脾养胃，补中益气，强健体质', emoji: '🥕', tip: '山药300g+排骨500g+枸杞，大火烧开转小火炖1小时' },
  { title: '玫瑰红枣花茶', desc: '理气解郁，活血化瘀，美容养颜', emoji: '🌹', tip: '玫瑰花6朵+红枣3颗，80°C热水冲泡加蜂蜜' }
]
var PERIOD_RELAX = [
  { title: '腹式深呼吸', desc: '深深吸气5秒，缓缓呼气7秒，重复10次，让身体慢慢放松', emoji: '🫧', duration: '5分钟' },
  { title: '猫牛式瑜伽', desc: '四足跪姿交替弓背与塌腰，温柔缓解腰部不适', emoji: '🐱', duration: '8分钟' },
  { title: '正念冥想', desc: '闭上眼睛，跟随呼吸的节奏，释放所有紧张与不安', emoji: '🧘', duration: '10分钟' },
  { title: '温热敷腹', desc: '将暖水袋轻轻放在小腹上，感受温暖慢慢渗透全身', emoji: '♨️', duration: '15分钟' },
  { title: '姜艾泡脚', desc: '温水中加入生姜片和艾叶，从脚底温暖到全身', emoji: '🦶', duration: '20分钟' },
  { title: '轻柔腹部按摩', desc: '以肚脐为中心，顺时针方向轻柔按摩，促进血液循环', emoji: '💆', duration: '10分钟' },
  { title: '舒缓芳香疗法', desc: '薰衣草或洋甘菊精油扩香，帮助安神放松助眠', emoji: '🪻', duration: '15分钟' }
]

Page({
  data: {
    gender: '', hasData: false, isRemind: true,
    cycleLength: 28, periodDays: 5,

    currentPhase: '', phaseEmoji: '', phaseColor: '#ccc', phaseSummary: '',
    cycleDay: 0, cycleProgress: 0, daysUntilPeriod: 0, ovulationIn: 0,

    isInPeriod: false, hasActivePeriod: false,
    periodDayNum: 0, periodEstTotal: 0, periodOvertime: 0,
    periodProgress: 0, periodMsg: '',
    dailyRecipe: null, dailyRelax: null,

    periodEnded: false, lastPeriodDays: 0,

    tipTab: 0, dietTips: [], exerciseTips: [], restTips: [], currentTips: [],

    calYear: 2025, calMonth: 4, currentMonth: '', calendarDays: [],
    selectedDate: '', selectedDateDisp: '', selectedPhase: '', selectedPhaseColor: '',

    moodsForDate: [], showMoodModal: false, moodList: [],
    selectedMood: null, showMoodConfirm: false,
    showMoodDel: false, moodDelIdx: -1,

    symsForDate: [], showSymModal: false, symList: [],
    symSelected: [], showSymConfirm: false,
    showSymDel: false, symDelIdx: -1,

    showPeriodBar: false, periodState: '',
    periodDate: '', periodDisplay: '', periodPhase: '', periodPhaseColor: '',
    periodInfo: '', periodDaysCount: 0,

    showDetail: false, detailRec: null, detailDays: [], detailActiveDays: 0,
    showDel: false, delId: null, delActive: false,

    showEndSummary: false,
    endDays: 0, endStart: '', endEnd: '',
    endAvg: 5, endStatus: '', endAdvice: '',

    periodLogs: [], _map: {}, _active: null
  },

  onLoad: function () {
    var n = new Date()
    this.setData({
      calYear: n.getFullYear(), calMonth: n.getMonth(),
      moodList: MOODS, symList: SYMS,
      symSelected: new Array(SYMS.length).fill(false)
    })
  },

  onShow: function () {
    var g = app.globalData
    if (!g.dailySymptoms) g.dailySymptoms = {}
    if (!g.dailyMoods) g.dailyMoods = {}

    var logs = g.periodLogs || [], map = {}, active = null
    for (var i = logs.length - 1; i >= 0; i--) { if (!logs[i].endDate) { active = logs[i]; break } }
    logs.forEach(function (log) {
      if (log.endDate) {
        var d = parseDate(log.startDate), e = parseDate(log.endDate)
        while (d <= e) { map[fmtDate(d)] = log; d = addDays(d, 1) }
      }
    })

    this.setData({
      gender: g.userInfo.gender || '',
      isRemind: g.isRemind !== undefined ? g.isRemind : true,
      cycleLength: g.cycleLength || 28,
      periodDays: g.periodDays || 5,
      periodLogs: logs.slice().reverse(),
      _map: map, _active: active,
      hasData: logs.length > 0
    })

    if (!this.data.selectedDate) {
      this.setData({ selectedDate: fmtDate(new Date()) })
    }
    this.refreshDate()
    if (logs.length > 0) { this.updatePred(); this.calcPhase() }
    else {
      this.setData({
        currentPhase: '', cycleDay: 0, cycleProgress: 0, daysUntilPeriod: 0, ovulationIn: 0,
        dietTips: [], exerciseTips: [], restTips: [], currentTips: [],
        isInPeriod: false, hasActivePeriod: false, periodDayNum: 0,
        periodEstTotal: 0, periodOvertime: 0, periodProgress: 0,
        periodMsg: '', dailyRecipe: null, dailyRelax: null,
        periodEnded: false, lastPeriodDays: 0
      })
    }
    this.buildCal()
  },

  dateDisp: function (ds) {
    var d = parseDate(ds), s = (d.getMonth() + 1) + '月' + d.getDate() + '日'
    if (ds === fmtDate(new Date())) s += '（今天）'
    return s
  },

  refreshDate: function () {
    var ds = this.data.selectedDate, g = app.globalData, ph = this.phaseOf(ds)
    var pn = { 'period-recorded': '已记录经期', 'period-active': '经期进行中', 'period-predicted': '预测经期', 'follicular': '卵泡期', 'ovulation': '排卵期', 'luteal': '黄体期', 'normal': '安全期' }
    var pc = { 'period-recorded': '#E8356B', 'period-active': '#FF6B8A', 'period-predicted': '#D44A72', 'follicular': '#3BA55D', 'ovulation': '#FF9F43', 'luteal': '#8B6BBF', 'normal': '#A8A5B8' }
    this.setData({
      selectedDateDisp: this.dateDisp(ds),
      selectedPhase: pn[ph] || '安全期',
      selectedPhaseColor: pc[ph] || '#A8A5B8',
      moodsForDate: (g.dailyMoods[ds] || []),
      symsForDate: (g.dailySymptoms[ds] || [])
    })
  },

  /* ===== 日历 ===== */
  buildCal: function () {
    var yr = this.data.calYear, mo = this.data.calMonth, sel = this.data.selectedDate
    var now = new Date(), dim = new Date(yr, mo + 1, 0).getDate()
    var fd = new Date(yr, mo, 1).getDay(), off = fd === 0 ? 6 : fd - 1
    var isNow = now.getFullYear() === yr && now.getMonth() === mo
    var todayStr = fmtDate(now)
    var days = [], self = this
    for (var i = 0; i < off; i++) days.push({ day: '', type: 'empty' })
    for (var d = 1; d <= dim; d++) {
      var ds = yr + '-' + pad(mo + 1) + '-' + pad(d)
      var t = self.phaseOf(ds)
      if (ds > todayStr) t += ' future'
      if (isNow && d === now.getDate()) t += ' today'
      if (ds === sel) t += ' selected'
      days.push({ day: d, type: t })
    }
    this.setData({ calendarDays: days, currentMonth: yr + '年' + (mo + 1) + '月' })
  },
  prevMonth: function () {
    var y = this.data.calYear, m = this.data.calMonth - 1
    if (m < 0) { m = 11; y-- }
    this.setData({ calYear: y, calMonth: m }); this.buildCal()
  },
  nextMonth: function () {
    var y = this.data.calYear, m = this.data.calMonth + 1
    if (m > 11) { m = 0; y++ }
    this.setData({ calYear: y, calMonth: m }); this.buildCal()
  },

  /* ===== 点击日期（禁止未来） ===== */
  onDayTap: function (e) {
    var day = Number(e.currentTarget.dataset.day)
    if (!day) return
    var ds = this.data.calYear + '-' + pad(this.data.calMonth + 1) + '-' + pad(day)
    if (ds > fmtDate(new Date())) { wx.showToast({ title: '不能选择未来的日期哦', icon: 'none' }); return }
    this.setData({ selectedDate: ds })
    this.refreshDate(); this.buildCal()
  },

  /* ===== 心情 ===== */
  openMoodModal: function () { this.setData({ showMoodModal: true, selectedMood: null }) },
  closeMoodModal: function () { this.setData({ showMoodModal: false, selectedMood: null }) },
  selectMood: function (e) { this.setData({ selectedMood: MOODS[Number(e.currentTarget.dataset.index)] }) },
  confirmAddMood: function () {
    if (!this.data.selectedMood) { wx.showToast({ title: '请先选择心情', icon: 'none' }); return }
    this.setData({ showMoodConfirm: true })
  },
  cancelMoodConfirm: function () { this.setData({ showMoodConfirm: false }) },
  doAddMood: function () {
    var g = app.globalData, ds = this.data.selectedDate, m = this.data.selectedMood
    if (!g.dailyMoods[ds]) g.dailyMoods[ds] = []
    g.dailyMoods[ds].push({ emoji: m.emoji, text: m.text, time: nowTime() })
    this.setData({ showMoodConfirm: false, showMoodModal: false, selectedMood: null })
    this.refreshDate(); this.buildCal()
    wx.showToast({ title: '已记录心情 ' + m.emoji, icon: 'none' })
  },
  reqDelMood: function (e) { this.setData({ showMoodDel: true, moodDelIdx: Number(e.currentTarget.dataset.idx) }) },
  cancelMoodDel: function () { this.setData({ showMoodDel: false, moodDelIdx: -1 }) },
  confirmDelMood: function () {
    var g = app.globalData, ds = this.data.selectedDate, idx = this.data.moodDelIdx
    if (g.dailyMoods[ds]) { g.dailyMoods[ds].splice(idx, 1); if (!g.dailyMoods[ds].length) delete g.dailyMoods[ds] }
    this.setData({ showMoodDel: false, moodDelIdx: -1 }); this.refreshDate()
    wx.showToast({ title: '已删除', icon: 'none' })
  },

  /* ===== 症状 ===== */
  openSymModal: function () {
    var saved = (app.globalData.dailySymptoms || {})[this.data.selectedDate] || []
    var savedTexts = saved.map(function (s) { return s.text || s })
    this.setData({
      showSymModal: true,
      symSelected: SYMS.map(function (s) { return savedTexts.indexOf(s) >= 0 })
    })
  },
  closeSymModal: function () { this.setData({ showSymModal: false }) },
  toggleSymSelect: function (e) {
    var i = Number(e.currentTarget.dataset.index)
    this.setData({ ['symSelected[' + i + ']']: !this.data.symSelected[i] })
  },
  confirmAddSym: function () {
    if (!this.data.symSelected.some(function (s) { return s })) { wx.showToast({ title: '请至少选择一个症状', icon: 'none' }); return }
    this.setData({ showSymConfirm: true })
  },
  cancelSymConfirm: function () { this.setData({ showSymConfirm: false }) },
  doAddSym: function () {
    var g = app.globalData, ds = this.data.selectedDate, sel = this.data.symSelected, time = nowTime()
    if (!g.dailySymptoms[ds]) g.dailySymptoms[ds] = []
    var kept = g.dailySymptoms[ds].filter(function (s) { return sel[SYMS.indexOf(s.text)] })
    SYMS.forEach(function (s, i) {
      if (sel[i] && !kept.find(function (x) { return x.text === s })) {
        kept.push({ text: s, time: time })
      }
    })
    if (kept.length > 0) g.dailySymptoms[ds] = kept; else delete g.dailySymptoms[ds]
    this.setData({ showSymConfirm: false, showSymModal: false }); this.refreshDate(); this.buildCal()
    wx.showToast({ title: '症状已记录', icon: 'none' })
  },
  reqDelSym: function (e) { this.setData({ showSymDel: true, symDelIdx: Number(e.currentTarget.dataset.idx) }) },
  cancelSymDel: function () { this.setData({ showSymDel: false, symDelIdx: -1 }) },
  confirmDelSym: function () {
    var g = app.globalData, ds = this.data.selectedDate, idx = this.data.symDelIdx
    if (g.dailySymptoms[ds]) { g.dailySymptoms[ds].splice(idx, 1); if (!g.dailySymptoms[ds].length) delete g.dailySymptoms[ds] }
    this.setData({ showSymDel: false, symDelIdx: -1 }); this.refreshDate()
    wx.showToast({ title: '已删除', icon: 'none' })
  },

  /* ===== 经期标记 ===== */
  openPeriodMark: function () {
    var ds = this.data.selectedDate, hit = this.hitRecord(ds)
    if (hit && hit.done) { this.openDetail(hit.r); return }
    if (hit && !hit.done) {
      var df = dayDiff(hit.r.startDate, ds) + 1
      this.setData({
        showPeriodBar: true, periodState: 'end', periodDate: ds,
        periodDisplay: this.dateDisp(ds), periodPhase: '月经期', periodPhaseColor: '#E8356B',
        periodInfo: '从 ' + fmtFull(hit.r.startDate) + ' 开始，第 ' + df + ' 天', periodDaysCount: df
      }); return
    }
    var ph = this.phaseOf(ds)
    var pn = { 'period-predicted': '预测经期', 'follicular': '卵泡期', 'ovulation': '排卵期', 'luteal': '黄体期', 'normal': '安全期' }
    var pc = { 'period-predicted': '#E8356B', 'follicular': '#3BA55D', 'ovulation': '#FF9F43', 'luteal': '#8B6BBF', 'normal': '#A8A5B8' }
    this.setData({
      showPeriodBar: true, periodState: 'start', periodDate: ds,
      periodDisplay: this.dateDisp(ds), periodPhase: pn[ph] || '安全期', periodPhaseColor: pc[ph] || '#A8A5B8'
    })
  },
  closePeriodBar: function () { this.setData({ showPeriodBar: false }) },
  markStart: function () {
    var g = app.globalData; if (!g.periodLogs) g.periodLogs = []
    if (g.periodLogs.some(function (l) { return !l.endDate })) { wx.showToast({ title: '请先结束当前经期', icon: 'none' }); return }
    var ds = this.data.periodDate, d = parseDate(ds)
    g.periodLogs.push({ id: Date.now(), startDate: ds, endDate: null, days: 0, status: '进行中', month: (d.getMonth() + 1) + '月', start: (d.getMonth() + 1) + '月' + d.getDate() + '日', end: '', startYMD: fmtFull(ds), endYMD: '' })
    this.setData({ showPeriodBar: false }); this.onShow()
    wx.showToast({ title: '经期已开始 🌸', icon: 'none' })
  },
  markEnd: function () {
    var g = app.globalData, active = (g.periodLogs || []).filter(function (l) { return !l.endDate })
    if (!active.length) return
    var a = active[active.length - 1], ds = this.data.periodDate, days = dayDiff(a.startDate, ds) + 1
    if (days < 1) { wx.showToast({ title: '结束日期不能早于开始', icon: 'none' }); return }
    var ed = parseDate(ds)
    a.endDate = ds; a.days = days; a.status = '已结束'
    a.end = (ed.getMonth() + 1) + '月' + ed.getDate() + '日'; a.endYMD = fmtFull(ds)
    this.updatePred()

    var avg = this.data.periodDays || 5
    var status = 'normal', advice = ''
    if (days <= avg - 2) {
      status = 'short'
      advice = '这次经期只有' + days + '天，比您的平均时长（' + avg + '天）偏短。偶尔偏短不必过于担心，但如果连续多次出现，建议关注身体状况。'
    } else if (days >= avg + 3) {
      status = 'long'
      advice = '这次经期持续了' + days + '天，比您的平均时长（' + avg + '天）偏长。如果伴有腹痛加重、出血量异常等不适，建议及时就医检查。'
    } else {
      advice = '这次经期持续' + days + '天，与您的平均时长（' + avg + '天）接近，一切正常~'
    }

    this.setData({
      showPeriodBar: false,
      showEndSummary: true,
      endDays: days,
      endStart: fmtFull(a.startDate),
      endEnd: fmtFull(ds),
      endAvg: avg,
      endStatus: status,
      endAdvice: advice
    })
    this.onShow()
  },
  cancelActivePeriod: function () {
    var g = app.globalData
    g.periodLogs = (g.periodLogs || []).filter(function (l) { return l.endDate !== null })
    this.updatePred(); this.setData({ showPeriodBar: false }); this.onShow()
    wx.showToast({ title: '已取消', icon: 'none' })
  },

  closeEndSummary: function () { this.setData({ showEndSummary: false }) },

  /* ===== 阶段/预测/建议 ===== */
  phaseOf: function (ds) {
    var map = this.data._map, active = this.data._active, cLen = this.data.cycleLength, pLen = this.data.periodDays, today = fmtDate(new Date())
    if (map[ds]) return 'period-recorded'
    if (active && ds >= active.startDate && ds <= today) return 'period-active'
    var logs = this.data.periodLogs; if (!logs.length) return 'normal'
    var sorted = logs.slice().sort(function (a, b) { return parseDate(a.startDate) - parseDate(b.startDate) })
    var diff = dayDiff(sorted[sorted.length - 1].startDate, ds), cd = ((diff % cLen) + cLen) % cLen, ov = cLen - 14
    if (cd < pLen) return 'period-predicted'; if (cd < ov - 1) return 'follicular'; if (cd < ov + 2) return 'ovulation'; return 'luteal'
  },
  hitRecord: function (ds) {
    var m = this.data._map; if (m[ds]) return { r: m[ds], done: true }
    var a = this.data._active; if (a && ds >= a.startDate) return { r: a, done: false }; return null
  },
  updatePred: function () {
    var g = app.globalData, logs = g.periodLogs || []
    if (!logs.length) { g.nextPeriodDate = ''; g.ovulationDate = ''; return }
    var sorted = logs.slice().sort(function (a, b) { return parseDate(a.startDate) - parseDate(b.startDate) })
    var latest = sorted[sorted.length - 1], done = sorted.filter(function (l) { return l.endDate })
    var avgC = 28; if (done.length >= 2) { var t = 0, c = 0; for (var i = 1; i < done.length; i++) { t += dayDiff(done[i - 1].startDate, done[i].startDate); c++ }; if (c > 0) avgC = Math.round(t / c) }
    avgC = Math.max(21, Math.min(45, avgC))
    var avgD = 5; if (done.length > 0) avgD = Math.max(1, Math.round(done.reduce(function (s, l) { return s + l.days }, 0) / done.length))
    g.cycleLength = avgC; g.periodDays = avgD
    g.nextPeriodDate = fmtDate(addDays(parseDate(latest.startDate), avgC))
    g.ovulationDate = fmtDate(addDays(parseDate(g.nextPeriodDate), -14))
    this.setData({ cycleLength: avgC, periodDays: avgD })
  },

  calcPhase: function () {
    var g = app.globalData; if (!g.nextPeriodDate) return
    var now = new Date(), nextP = parseDate(g.nextPeriodDate), du = Math.ceil((nextP - now) / 86400000)
    var cLen = g.cycleLength, pLen = g.periodDays, cDay = Math.max(Math.ceil((now - addDays(nextP, -cLen)) / 86400000), 1), ovuIn = Math.ceil((addDays(nextP, -14) - now) / 86400000)

    var isInPeriod = false, hasActivePeriod = false, periodDayNum = 0, periodEstTotal = pLen, periodOvertime = 0, periodProgress = 0, periodMsg = ''
    var dailyRecipe = null, dailyRelax = null

    var active = this.data._active
    if (active) {
      var todayStr = fmtDate(new Date())
      var daysSinceStart = dayDiff(active.startDate, todayStr) + 1
      if (daysSinceStart >= 1) {
        isInPeriod = true; hasActivePeriod = true
        periodDayNum = daysSinceStart
        periodEstTotal = pLen
        if (periodDayNum > pLen) {
          periodOvertime = periodDayNum - pLen
          periodMsg = '已超出您平均经期' + pLen + '天，如果持续流血或伴有不适，请留意身体状况'
        } else {
          var rem = pLen - periodDayNum
          periodMsg = rem > 0 ? '预计还需约' + rem + '天结束（您平均经期' + pLen + '天）' : '今天可能是经期最后一天，结束后可能还会有少量出血，属正常现象'
        }
        periodProgress = Math.min(Math.round(periodDayNum / pLen * 100), 100)
        dailyRecipe = PERIOD_RECIPES[(periodDayNum - 1) % PERIOD_RECIPES.length]
        dailyRelax = PERIOD_RELAX[(periodDayNum - 1) % PERIOD_RELAX.length]
      }
    }

    if (!isInPeriod && du <= 0 && du >= -(pLen - 1)) {
      isInPeriod = true
      periodDayNum = Math.abs(du) + 1
      periodEstTotal = pLen
      if (periodDayNum > pLen) {
        periodOvertime = periodDayNum - pLen
        periodMsg = '已超出您平均经期' + pLen + '天，如果持续流血或伴有不适，请留意身体状况'
      } else {
        var rem2 = pLen - periodDayNum
        periodMsg = rem2 > 0 ? '预计还需约' + rem2 + '天结束（您平均经期' + pLen + '天）' : '今天可能是经期最后一天，结束后可能还会有少量出血，属正常现象'
      }
      periodProgress = Math.min(Math.round(periodDayNum / pLen * 100), 100)
      dailyRecipe = PERIOD_RECIPES[(periodDayNum - 1) % PERIOD_RECIPES.length]
      dailyRelax = PERIOD_RELAX[(periodDayNum - 1) % PERIOD_RELAX.length]
    }

    /* 判断经期是否刚结束 */
    var periodEnded = false, lastPeriodDays = 0
    if (!isInPeriod) {
      var allLogs = this.data.periodLogs
      if (allLogs.length > 0) {
        var sorted2 = allLogs.slice().sort(function (a, b) { return parseDate(a.startDate) - parseDate(b.startDate) })
        var latest2 = sorted2[sorted2.length - 1]
        if (latest2.endDate) {
          var daysAgo = dayDiff(latest2.endDate, fmtDate(new Date()))
          if (daysAgo >= 0 && daysAgo <= 2) {
            periodEnded = true
            lastPeriodDays = latest2.days
          }
        }
      }
    }

    var ph, em, co, su
    if (isInPeriod) { ph = '月经期'; em = '🌺'; co = '#FF6B8A'; su = periodMsg }
    else if (periodEnded) { ph = '经期已结束'; em = '🌿'; co = '#3BA55D'; su = '本轮经期持续' + lastPeriodDays + '天，好好休息，恢复元气~' }
    else if (cDay <= pLen + 3) { ph = '卵泡期'; em = '🌱'; co = '#7ED6A5'; su = '代谢旺盛，运动燃脂效率最高' }
    else if (cDay >= cLen - 16 && cDay <= cLen - 12) { ph = '排卵期'; em = '✨'; co = '#FFB347'; su = '精力充沛状态佳，注意补水' }
    else { ph = '黄体期'; em = '🌙'; co = '#B39DDB'; su = '易水肿情绪波动，少糖少盐早睡' }

    var tips = this.getTips(isInPeriod ? '月经期' : ph, this.data.gender)
    this.setData({
      currentPhase: ph, phaseEmoji: em, phaseColor: co, phaseSummary: su,
      cycleDay: cDay, cycleProgress: Math.min(Math.max(Math.round(cDay / cLen * 100), 0), 100),
      daysUntilPeriod: Math.max(du, 0), ovulationIn: Math.max(ovuIn, 0),
      isInPeriod: isInPeriod, hasActivePeriod: hasActivePeriod,
      periodDayNum: periodDayNum, periodEstTotal: periodEstTotal,
      periodOvertime: periodOvertime, periodProgress: periodProgress,
      periodMsg: periodMsg, dailyRecipe: dailyRecipe, dailyRelax: dailyRelax,
      periodEnded: periodEnded, lastPeriodDays: lastPeriodDays,
      dietTips: tips.diet, exerciseTips: tips.exercise, restTips: tips.rest
    })
    this.updTips()
  },

  getTips: function (p, g) {
    var m = {
      '月经期': { diet: ['多吃红肉猪肝菠菜补铁', '喝红糖姜茶暖宫驱寒', '避免生冷食物', '补充维C促进铁吸收', '红枣桂圆煮水补气养血'], exercise: g === 'male' ? ['适当降低训练强度', '陪伴伴侣轻度活动', '拉伸和瑜伽', '散步30分钟'] : ['适合轻度瑜伽冥想', '散步30分钟', '避免剧烈运动', '拉伸缓解腰酸'], rest: g === 'male' ? ['多关心伴侣情绪', '准备暖水袋红糖水', '减少外出安排', '保持耐心体贴'] : ['保证8小时睡眠', '暖水袋热敷小腹', '热水泡脚15分钟', '避免熬夜过劳'] },
      '经期已结束': { diet: ['适当补充蛋白质恢复体力', '多吃新鲜蔬果补充维C', '温补饮食忌生冷', '红枣枸杞泡水养血', '规律三餐不节食'], exercise: ['暂缓剧烈运动1~2天', '轻度散步放松身心', '温和拉伸缓解疲劳', '循序渐进恢复运动'], rest: ['充分休息恢复体力', '注意保暖避免受凉', '保持心情放松', '观察身体后续反应'] },
      '卵泡期': { diet: ['高蛋白饮食加速恢复', '多吃新鲜蔬果', '增加优质碳水', '尝试新食谱', '规律三餐'], exercise: ['黄金运动期高强度', '代谢旺盛燃脂高', 'HIIT跑步游泳棒', '增加力量训练'], rest: ['精力充沛保持规律', '心情愉悦适合社交', '安排重要工作', '处理积压事务'] },
      '排卵期': { diet: ['补充充足水分', '深海鱼坚果补Omega-3', '补充维生素E', '多吃豆制品', '均衡饮食'], exercise: ['状态最佳表现好', '适合力量耐力训练', '挑战个人最佳', '运动后充分拉伸'], rest: ['精力最旺盛时期', '皮肤好适合护肤', '注意防晒', '适合旅行约会'] },
      '黄体期': { diet: ['减少高糖高盐防水肿', '香蕉坚果补充镁', 'B族维生素稳情绪', '控制食欲', '多吃全谷物深色蔬菜'], exercise: ['降低强度中低为主', '瑜伽普拉提快走', '避免过度训练', '运动45分钟内'], rest: g === 'male' ? ['伴侣可能情绪波动', '减少争吵多关怀', '准备喜欢的零食', '提前准备经期用品'] : ['情绪波动学会调节', '多与朋友交流', '早睡早起', '提前准备经期用品'] }
    }
    return m[p] || m['卵泡期']
  },
  updTips: function () { var t = this.data.tipTab; this.setData({ currentTips: t === 0 ? this.data.dietTips : t === 1 ? this.data.exerciseTips : this.data.restTips }) },
  switchTab: function (e) { this.setData({ tipTab: Number(e.currentTarget.dataset.tab) }); this.updTips() },

  /* ===== 详情/删除 ===== */
  openDetail: function (rec) {
    var g = app.globalData, detailDays = [], activeDays = 0, d = parseDate(rec.startDate), dayNum = 1, endD = rec.endDate ? parseDate(rec.endDate) : new Date()
    while (d <= endD) {
      var ds = fmtDate(d)
      detailDays.push({ date: ds, display: (d.getMonth() + 1) + '月' + d.getDate() + '日', dayNum: dayNum, symptoms: (g.dailySymptoms[ds] || []), hasSyms: (g.dailySymptoms[ds] || []).length > 0, moods: g.dailyMoods[ds] || [], hasMoods: (g.dailyMoods[ds] || []).length > 0 })
      d = addDays(d, 1); dayNum++
    }
    if (!rec.endDate) activeDays = dayDiff(rec.startDate, fmtDate(new Date())) + 1
    this.setData({ showDetail: true, detailRec: rec, detailDays: detailDays, detailActiveDays: activeDays, showPeriodBar: false })
  },
  closeDetail: function () { this.setData({ showDetail: false }) },
  onHistTap: function (e) { var hit = this.hitRecord(e.currentTarget.dataset.start); if (hit) this.openDetail(hit.r) },
  reqDel: function (e) { this.setData({ showDel: true, showDetail: false, delId: Number(e.currentTarget.dataset.id), delActive: e.currentTarget.dataset.active === '1' }) },
  cancelDel: function () { this.setData({ showDel: false, delId: null }) },
  confirmDel: function () {
    var g = app.globalData, id = this.data.delId
    g.periodLogs = (g.periodLogs || []).filter(function (l) { return l.id !== id })
    this.updatePred(); this.setData({ showDel: false, delId: null }); this.onShow()
    wx.showToast({ title: '记录已删除', icon: 'none' })
  },

  toggleRemind: function () { var g = app.globalData; g.isRemind = !g.isRemind; this.setData({ isRemind: g.isRemind }); wx.showToast({ title: g.isRemind ? '已开启提醒' : '已关闭提醒', icon: 'none' }) },
  goBack: function () { wx.navigateBack() },
  preventTouch: function () { }
})
