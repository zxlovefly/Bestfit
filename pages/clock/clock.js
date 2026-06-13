const app = getApp()

function pad(n) { return n < 10 ? '0' + n : '' + n }
function fmtDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) }

Page({
  data: {
    enabled: false,
    reminderTime: '22:00',
    notifyEnabled: false,

    itemSettings: {
      account: true, diet: true, exercise: true,
      poo: true, water: true, period: true
    },

    showTimePicker: false,
    pickerValue: [22, 0],
    hourList: [],
    minuteList: [],
    tempTime: '22:00',
    timePresets: [
      { time: '08:00', emoji: '🌅', label: '早起' },
      { time: '10:00', emoji: '☀️', label: '上午' },
      { time: '12:00', emoji: '🍱', label: '午间' },
      { time: '18:00', emoji: '🌇', label: '傍晚' },
      { time: '20:00', emoji: '🌆', label: '晚间' },
      { time: '21:00', emoji: '🌙', label: '睡前' },
      { time: '22:00', emoji: '💤', label: '晚安' },
      { time: '23:00', emoji: '🌟', label: '深夜' }
    ],

    weatherNotify: false,
    showWeatherNotify: false,
    wnVisible: false,
    wnIcon: '',
    wnTitle: '',
    wnDesc: '',
    reminderWeatherText: '',

    todayItems: [],
    missingItems: [],
    completedCount: 0,
    totalEnabledCount: 0,
    completionRate: 0,
    allCompleted: false,

    periodApproaching: false,
    daysUntilPeriod: 0,
    periodMsg: '',
    periodTips: [],

    showReminder: false,
    loaded: false
  },

  onLoad: function () {
    var hours = [], minutes = []
    for (var i = 0; i < 24; i++) hours.push(pad(i))
    for (var i = 0; i < 12; i++) minutes.push(pad(i * 5))
    this.setData({ hourList: hours, minuteList: minutes })
  },

  onShow: function () {
    this._loadSettings()
    this._checkTodayStatus()
    this._checkPeriod()
    this._checkWeatherFromHome()
    var that = this
    setTimeout(function () {
      that.setData({ loaded: true })
      that._checkShouldRemind()
    }, 350)
  },

  /* ==================== 设置 ==================== */

  _loadSettings: function () {
    var enabled = wx.getStorageSync('clockEnabled') || false
    var time = wx.getStorageSync('clockReminderTime') || '22:00'
    var notify = wx.getStorageSync('clockNotifyEnabled') || false
    var wNotify = wx.getStorageSync('clockWeatherNotify') || false
    var defaults = { account: true, diet: true, exercise: true, poo: true, water: true, period: true }
    var saved = wx.getStorageSync('clockItemEnabled') || {}
    var itemSettings = {}
    for (var k in defaults) itemSettings[k] = saved.hasOwnProperty(k) ? saved[k] : defaults[k]
    var parts = time.split(':')
    this.setData({
      enabled: enabled, reminderTime: time, notifyEnabled: notify,
      weatherNotify: wNotify, itemSettings: itemSettings,
      pickerValue: [parseInt(parts[0]) || 22, Math.round((parseInt(parts[1]) || 0) / 5)]
    })
    var cached = wx.getStorageSync('weatherNotifyText')
    if (cached) this.setData({ reminderWeatherText: cached })
  },

  _saveSettings: function () {
    wx.setStorageSync('clockEnabled', this.data.enabled)
    wx.setStorageSync('clockReminderTime', this.data.reminderTime)
    wx.setStorageSync('clockNotifyEnabled', this.data.notifyEnabled)
    wx.setStorageSync('clockItemEnabled', this.data.itemSettings)
    wx.setStorageSync('clockWeatherNotify', this.data.weatherNotify)
  },

  /* ==================== 开关 ==================== */

  toggleEnabled: function () {
    var nv = !this.data.enabled
    this.setData({ enabled: nv })
    this._saveSettings()
    wx.showToast({ title: nv ? '提醒已开启 ✨' : '提醒已关闭', icon: 'none' })
    if (!nv) this.setData({ showReminder: false })
  },

  toggleItem: function (e) {
    var key = e.currentTarget.dataset.key
    var s = JSON.parse(JSON.stringify(this.data.itemSettings))
    s[key] = !s[key]
    this.setData({ itemSettings: s })
    this._saveSettings()
    this._checkTodayStatus()
  },

  toggleWeatherNotify: function () {
    var nv = !this.data.weatherNotify
    this.setData({ weatherNotify: nv })
    this._saveSettings()
    wx.showToast({ title: nv ? '天气预警已开启 ⛈️' : '天气预警已关闭', icon: 'none' })
    if (nv) this._checkWeatherFromHome()
  },

  /* ==================== 时间选择 ==================== */

  selectTime: function (e) {
    var t = e.currentTarget.dataset.time
    var parts = t.split(':')
    this.setData({ reminderTime: t, pickerValue: [parseInt(parts[0]), Math.round(parseInt(parts[1]) / 5)] })
    this._saveSettings()
    wx.showToast({ title: '已设为 ' + t, icon: 'none' })
  },

  openTimePicker: function () {
    var parts = this.data.reminderTime.split(':')
    this.setData({
      showTimePicker: true,
      pickerValue: [parseInt(parts[0]), Math.round(parseInt(parts[1]) / 5)],
      tempTime: this.data.reminderTime
    })
  },

  closeTimePicker: function () { this.setData({ showTimePicker: false }) },

  onPickerChange: function (e) {
    var v = e.detail.value
    this.setData({ pickerValue: v, tempTime: this.data.hourList[v[0]] + ':' + this.data.minuteList[v[1]] })
  },

  confirmTime: function () {
    this.setData({ reminderTime: this.data.tempTime, showTimePicker: false })
    this._saveSettings()
    wx.showToast({ title: '已设为 ' + this.data.tempTime, icon: 'none' })
  },

  /* ==================== 天气预警（从主页同步） ==================== */

  _checkWeatherFromHome: function () {
    if (!this.data.weatherNotify) return
    var today = fmtDate(new Date())
    if (wx.getStorageSync('weatherNotifyLastDate') === today) return
    var cache = app.globalData._weatherCache
    if (!cache || !cache.tomorrow) return
    var tmr = cache.tomorrow
    var text = tmr.text || ''
    var tempMax = parseInt(tmr.tempMax) || 0
    var tempMin = parseInt(tmr.tempMin) || 0

    var alertText = '', alertIcon = ''
    if (text.indexOf('雷') >= 0) { alertText = '明天有雷暴天气，注意安全，尽量减少外出'; alertIcon = '⛈️' }
    else if (text.indexOf('暴雨') >= 0 || text.indexOf('大雨') >= 0) { alertText = '明天有' + text + '，出门请带伞，注意路面积水'; alertIcon = '🌧️' }
    else if (text.indexOf('雨') >= 0) { alertText = '明天有' + text + '，出门记得带伞哦'; alertIcon = '🌧️' }
    else if (text.indexOf('雪') >= 0) { alertText = '明天有' + text + '，路滑注意安全和保暖'; alertIcon = '❄️' }
    else if (text.indexOf('雾') >= 0) { alertText = '明天有' + text + '，出行注意安全'; alertIcon = '🌫️' }
    else if (tempMax >= 35) { alertText = '明天高温 ' + tempMax + '°，注意防暑降温多喝水'; alertIcon = '🌡️' }
    else if (tempMin <= 0) { alertText = '明天低温 ' + tempMin + '°，注意添衣保暖'; alertIcon = '🥶' }

    if (alertText) {
      this.setData({ reminderWeatherText: alertText })
      wx.setStorageSync('weatherNotifyText', alertText)
      if (wx.getStorageSync('weatherNotifyLastDate') !== today) {
        wx.setStorageSync('weatherNotifyLastDate', today)
        this._showBanner(alertIcon, '天气预警', alertText)
      }
    } else {
      this.setData({ reminderWeatherText: '' })
      wx.setStorageSync('weatherNotifyText', '')
    }
  },

  _showBanner: function (icon, title, desc) {
    var that = this
    this.setData({ showWeatherNotify: true, wnIcon: icon, wnTitle: title, wnDesc: desc, wnVisible: false })
    setTimeout(function () { that.setData({ wnVisible: true }) }, 80)
    setTimeout(function () { that.dismissWeatherNotify() }, 8000)
  },

  dismissWeatherNotify: function () {
    var that = this
    this.setData({ wnVisible: false })
    setTimeout(function () { that.setData({ showWeatherNotify: false }) }, 600)
  },

  /* ==================== 今日状态 ==================== */

  _checkTodayStatus: function () {
    var today = fmtDate(new Date())
    var s = this.data.itemSettings

    var allRec = wx.getStorageSync('accountRecords') || []
    var hasAccount = allRec.some(function (r) { return r.date && r.date.startsWith(today) })

    var foodRec = wx.getStorageSync('foodRecords') || {}
    var tf = foodRec[today]
    var hasDiet = false
    if (tf) { for (var k in tf) { if (tf[k] && tf[k].length) { hasDiet = true; break } } }

    var exRec = app.globalData.exerciseRecords || wx.getStorageSync('exerciseRecords') || []
    var hasExercise = exRec.some(function (r) { return r.date === today })

    var pooLogs = app.globalData.pooLogs || wx.getStorageSync('pooLogs') || []
    var hasPoo = pooLogs.some(function (r) { return r.date === today })

    var waterH = wx.getStorageSync('waterHistory') || {}
    var tw = waterH[today]
    var hasWater = tw && tw.totalML > 0

    var syms = app.globalData.dailySymptoms || {}
    var hasPeriod = !!(syms[today] && syms[today].length)

    var items = [
      { key: 'account', icon: '💰', name: '记账', desc: '记录每日收支', done: hasAccount, canNav: true, page: '/pages/account/account' },
      { key: 'diet', icon: '🍽️', name: '饮食', desc: '记录每日饮食', done: hasDiet, canNav: true, page: '/pages/diet/diet' },
      { key: 'exercise', icon: '🏃', name: '运动', desc: '记录每日运动', done: hasExercise, canNav: true, page: '/pages/exercise/exercise' },
      { key: 'poo', icon: '💩', name: '便便', desc: '记录排便情况', done: hasPoo, canNav: true, page: '/pages/poo/poo-calendar' },
      { key: 'water', icon: '💧', name: '饮水', desc: '记录每日饮水', done: hasWater, canNav: true, page: '/pages/water/water' },
      { key: 'period', icon: '🌸', name: '经期', desc: '记录心情与症状', done: hasPeriod, canNav: true, page: '/pages/women-health/women-health' }
    ]
    items.forEach(function (item) { item.enabled = s[item.key] })

    var enabledItems = items.filter(function (i) { return i.enabled })
    var done = enabledItems.filter(function (i) { return i.done }).length

    this.setData({
      todayItems: items,
      missingItems: items.filter(function (i) { return i.enabled && !i.done }),
      completedCount: done,
      totalEnabledCount: enabledItems.length,
      completionRate: enabledItems.length > 0 ? Math.round(done / enabledItems.length * 100) : 100,
      allCompleted: enabledItems.length > 0 && done === enabledItems.length
    })
  },

  /* ==================== 经期检查 ==================== */

  _checkPeriod: function () {
    var npd = app.globalData.nextPeriodDate
    if (!npd) { this.setData({ periodApproaching: false }); return }
    var nextP = new Date(npd + 'T00:00:00')
    var du = Math.ceil((nextP - new Date()) / 86400000)
    if (du >= 0 && du <= 3) {
      var msg = '', tips = []
      if (du === 0) { msg = '今天可能是经期开始日~'; tips = ['🫧 准备卫生用品', '♨️ 暖水袋备用', '🍫 备些巧克力'] }
      else if (du === 1) { msg = '明天可能来经期~'; tips = ['🍵 喝杯红糖姜茶', '😴 早点休息', '♨️ 热水泡脚'] }
      else { msg = '还有' + du + '天来经期~'; tips = ['🌸 注意保暖', '💤 规律作息', '🥗 均衡饮食'] }
      this.setData({ periodApproaching: true, daysUntilPeriod: du, periodMsg: msg, periodTips: tips })
    } else {
      this.setData({ periodApproaching: false, daysUntilPeriod: 0, periodMsg: '', periodTips: [] })
    }
  },

  /* ==================== 提醒逻辑 ==================== */

  _toMin: function (s) { var p = s.split(':'); return parseInt(p[0]) * 60 + parseInt(p[1]) },

  _checkShouldRemind: function () {
    if (!this.data.enabled) return
    var now = new Date()
    var cur = pad(now.getHours()) + ':' + pad(now.getMinutes())
    var today = fmtDate(now)
    if (wx.getStorageSync('clockLastReminderDate') === today) return
    if (this._toMin(cur) >= this._toMin(this.data.reminderTime) - 5) {
      if (this.data.missingItems.length > 0 || this.data.periodApproaching) {
        this.setData({ showReminder: true })
        wx.setStorageSync('clockLastReminderDate', today)
      }
    }
  },

  dismissReminder: function () { this.setData({ showReminder: false }) },

  goRecordFirst: function () {
    var m = this.data.missingItems
    this.setData({ showReminder: false })
    for (var i = 0; i < m.length; i++) {
      if (m[i].canNav && m[i].page) { this._nav(m[i].page); return }
    }
  },

  goRecord: function (e) {
    var canNav = e.currentTarget.dataset.nav === '1'
    var p = e.currentTarget.dataset.page
    if (canNav && p) this._nav(p)
  },

  _nav: function (page) {
    wx.navigateTo({ url: page, fail: function () { wx.switchTab({ url: page }) } })
  },

  testReminder: function () { this.setData({ showReminder: true }) },

  /* ==================== 开启通知 ==================== */

  requestNotifyPermission: function () {
    var that = this
    var sent = false

    // 尝试发送一条测试通知
    try { sent = app._sendLocalNotification('🔔 提醒已开启', '每天 ' + that.data.reminderTime + ' 会在通知栏提醒你记录') } catch (e) {}

    if (sent) {
      that.setData({ notifyEnabled: true })
      wx.setStorageSync('clockNotifyEnabled', true)
      wx.showToast({ title: '通知已开启 🔔', icon: 'none' })
    } else {
      wx.showModal({
        title: '🔔 提醒已开启',
        content: '每天 ' + that.data.reminderTime + ' 弹窗提醒你记录\n\n恶劣天气也会及时预警',
        confirmText: '好的',
        showCancel: false,
        success: function () {
          that.setData({ notifyEnabled: true })
          wx.setStorageSync('clockNotifyEnabled', true)
        }
      })
    }
  },

  /* ==================== 工具 ==================== */

  preventScroll: function () {},
  goBack: function () { wx.navigateBack({ fail: function () { wx.switchTab({ url: '/pages/home/home' }) } }) }
})
