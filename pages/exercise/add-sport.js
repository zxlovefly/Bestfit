const app = getApp()

function fmtDate(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0')
}

/* ★ 时间功能：时间工具函数 */
function fmtNowTime() {
  var n = new Date()
  return String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0')
}

function fmtNowMinus(mins) {
  var n = new Date()
  var totalMin = n.getHours() * 60 + n.getMinutes() - mins
  if (totalMin < 0) totalMin = 0
  return String(Math.floor(totalMin / 60)).padStart(2, '0') + ':' + String(totalMin % 60).padStart(2, '0')
}

function timeToMinutes(t) {
  if (!t || t.indexOf(':') < 0) return 0
  var parts = t.split(':')
  return parseInt(parts[0]) * 60 + parseInt(parts[1])
}

function minutesToTime(m) {
  if (m < 0) m = 0
  var h = Math.floor(m / 60) % 24
  var mi = m % 60
  return String(h).padStart(2, '0') + ':' + String(mi).padStart(2, '0')
}

var CATEGORIES = [
  { id: 'hot',     name: '热门',     icon: '🔥' },
  { id: 'walk',    name: '步行',     icon: '🚶' },
  { id: 'run',     name: '跑步',     icon: '🏃' },
  { id: 'bike',    name: '骑行',     icon: '🚴' },
  { id: 'ball',    name: '球类',     icon: '⚽' },
  { id: 'water',   name: '水上',     icon: '🏊' },
  { id: 'gym',     name: '健身',     icon: '💪' },
  { id: 'cardio',  name: '有氧器械', icon: '🏋' },
  { id: 'dance',   name: '舞蹈',     icon: '💃' },
  { id: 'martial', name: '武术',     icon: '🥋' },
  { id: 'stretch', name: '拉伸',     icon: '🧘' },
  { id: 'other',   name: '其它',     icon: '🎯' },
  { id: 'custom',  name: '自定义',   icon: '✏️' }
]

var SPORTS = {
  hot: [
    { id: 'run3',    name: '跑步机爬坡', emoji: '🏔', cal60: 480 },
    { id: 'rope2',   name: '中速跳绳',   emoji: '🤸', cal60: 700 },
    { id: 'run1',    name: '慢跑',       emoji: '🏃', cal60: 360 },
    { id: 'swim1',   name: '自由泳',     emoji: '🏊', cal60: 500 },
    { id: 'spin1',   name: '动感单车',   emoji: '🚴', cal60: 450 },
    { id: 'walk2',   name: '快走',       emoji: '🚶', cal60: 250 },
    { id: 'ellip1',  name: '椭圆机',     emoji: '⭕', cal60: 350 },
    { id: 'hiit1',   name: 'HIIT训练',   emoji: '🔥', cal60: 600 }
  ],
  walk: [
    { id: 'walk1', name: '散步(4km/h)',  emoji: '🚶', cal60: 150 },
    { id: 'walk2', name: '快走(6km/h)',  emoji: '🚶', cal60: 250 },
    { id: 'walk3', name: '健走(7km/h)',  emoji: '🥾', cal60: 300 },
    { id: 'walk4', name: '负重行走',     emoji: '🎒', cal60: 350 },
    { id: 'walk5', name: '爬楼梯',       emoji: '🔝', cal60: 400 }
  ],
  run: [
    { id: 'run1', name: '慢跑(6-8km/h)',           emoji: '🏃', cal60: 360 },
    { id: 'run2', name: '中速跑(8-10km/h)',         emoji: '🏃', cal60: 480 },
    { id: 'run3', name: '跑步机爬坡',               emoji: '🏔', cal60: 480 },
    { id: 'run4', name: '快跑(10-12km/h)',          emoji: '💨', cal60: 600 },
    { id: 'run5', name: '越野跑',                   emoji: '⛰',  cal60: 550 },
    { id: 'run6', name: '原地超慢跑(低强度)',        emoji: '🐢', cal60: 200 },
    { id: 'run7', name: '原地超慢跑(中强度)',        emoji: '🐕', cal60: 300 },
    { id: 'run8', name: '原地超慢跑(高强度)',        emoji: '🐇', cal60: 400 }
  ],
  bike: [
    { id: 'bike1', name: '休闲骑行', emoji: '🚲', cal60: 250 },
    { id: 'bike2', name: '公路骑行', emoji: '🚴', cal60: 400 },
    { id: 'bike3', name: '山地骑行', emoji: '🚵', cal60: 500 },
    { id: 'spin1', name: '动感单车', emoji: '🚴', cal60: 450 }
  ],
  ball: [
    { id: 'ball1', name: '篮球',   emoji: '🏀', cal60: 450 },
    { id: 'ball2', name: '足球',   emoji: '⚽', cal60: 500 },
    { id: 'ball3', name: '羽毛球', emoji: '🏸', cal60: 350 },
    { id: 'ball4', name: '乒乓球', emoji: '🏓', cal60: 250 },
    { id: 'ball5', name: '网球',   emoji: '🎾', cal60: 400 },
    { id: 'ball6', name: '排球',   emoji: '🏐', cal60: 280 },
    { id: 'ball7', name: '高尔夫', emoji: '⛳', cal60: 200 },
    { id: 'ball8', name: '壁球',   emoji: '🟤', cal60: 500 }
  ],
  water: [
    { id: 'swim1', name: '自由泳',     emoji: '🏊', cal60: 500 },
    { id: 'swim2', name: '蛙泳',       emoji: '🐸', cal60: 450 },
    { id: 'swim3', name: '仰泳',       emoji: '🏊', cal60: 400 },
    { id: 'swim4', name: '蝶泳',       emoji: '🦋', cal60: 550 },
    { id: 'swim5', name: '水中有氧操',  emoji: '🌊', cal60: 350 },
    { id: 'swim6', name: '皮划艇',      emoji: '🛶', cal60: 300 },
    { id: 'swim7', name: '冲浪',       emoji: '🏄', cal60: 350 }
  ],
  gym: [
    { id: 'gym1',  name: '俯卧撑',   emoji: '💪', cal60: 350 },
    { id: 'gym2',  name: '引体向上',  emoji: '🏋', cal60: 400 },
    { id: 'gym3',  name: '深蹲训练',  emoji: '🦵', cal60: 380 },
    { id: 'gym4',  name: '平板支撑',  emoji: '🧎', cal60: 180 },
    { id: 'gym5',  name: '波比跳',    emoji: '🔥', cal60: 600 },
    { id: 'hiit1', name: 'HIIT训练',  emoji: '⚡', cal60: 600 },
    { id: 'gym7',  name: '战绳训练',  emoji: '🪢', cal60: 550 },
    { id: 'gym8',  name: '壶铃训练',  emoji: '🔔', cal60: 480 }
  ],
  cardio: [
    { id: 'ellip1',  name: '椭圆机',       emoji: '⭕', cal60: 350 },
    { id: 'cardio2', name: '划船机',        emoji: '🚣', cal60: 400 },
    { id: 'cardio3', name: '台阶机',        emoji: '🔝', cal60: 450 },
    { id: 'cardio4', name: '跑步机(平跑)',   emoji: '🏃', cal60: 400 },
    { id: 'run3',    name: '跑步机(爬坡)',   emoji: '🏔', cal60: 480 },
    { id: 'cardio6', name: '卧式单车',      emoji: '🚴', cal60: 300 }
  ],
  dance: [
    { id: 'dance1', name: '广场舞', emoji: '💃', cal60: 280 },
    { id: 'dance2', name: '尊巴',   emoji: '🎶', cal60: 400 },
    { id: 'dance3', name: '有氧操', emoji: '🤸', cal60: 380 },
    { id: 'dance4', name: '搏击操', emoji: '🥊', cal60: 500 },
    { id: 'dance5', name: '街舞',   emoji: '🕺', cal60: 350 },
    { id: 'dance6', name: '拉丁舞', emoji: '💃', cal60: 320 },
    { id: 'dance7', name: '肚皮舞', emoji: '🪭', cal60: 280 }
  ],
  martial: [
    { id: 'martial1', name: '太极拳', emoji: '☯️', cal60: 200 },
    { id: 'martial2', name: '跆拳道', emoji: '🥋', cal60: 500 },
    { id: 'martial3', name: '空手道', emoji: '👊', cal60: 480 },
    { id: 'martial4', name: '散打',   emoji: '🥊', cal60: 550 },
    { id: 'martial5', name: '咏春拳', emoji: '🤜', cal60: 350 },
    { id: 'martial6', name: '击剑',   emoji: '🤺', cal60: 350 }
  ],
  stretch: [
    { id: 'stretch1', name: '哈他瑜伽',   emoji: '🧘', cal60: 200 },
    { id: 'stretch2', name: '流瑜伽',     emoji: '🧘', cal60: 300 },
    { id: 'stretch3', name: '普拉提',     emoji: '🤸', cal60: 250 },
    { id: 'stretch4', name: '静态拉伸',   emoji: '🙆', cal60: 120 },
    { id: 'stretch5', name: '泡沫轴放松', emoji: '🧽', cal60: 80 }
  ],
  other: [
    { id: 'rope1',   name: '慢速跳绳',                emoji: '🤸', cal60: 500 },
    { id: 'rope2',   name: '中速跳绳(100-120次/分)',   emoji: '🤸', cal60: 700 },
    { id: 'rope3',   name: '快速跳绳(>120次/分)',      emoji: '⚡',  cal60: 958 },
    { id: 'hula1',   name: '呼啦圈',                  emoji: '⭕', cal60: 200 },
    { id: 'climb1',  name: '攀岩',                    emoji: '🧗', cal60: 500 },
    { id: 'skate1',  name: '滑冰',                    emoji: '⛸',  cal60: 350 },
    { id: 'ski1',    name: '滑雪',                    emoji: '🎿', cal60: 400 },
    { id: 'frisbee', name: '飞盘',                    emoji: '🥏', cal60: 300 }
  ]
}

/* 构建扁平搜索索引（去重） */
var ALL_SPORTS = []
var _seen = new Set()
Object.keys(SPORTS).forEach(function (cid) {
  if (cid === 'hot') return
  var cat = CATEGORIES.find(function (c) { return c.id === cid })
  SPORTS[cid].forEach(function (s) {
    if (!_seen.has(s.id)) {
      _seen.add(s.id)
      ALL_SPORTS.push({ id: s.id, name: s.name, emoji: s.emoji, cal60: s.cal60, catName: cat.name })
    }
  })
})

Page({
  data: {
    statusBarH: 20,
    categories: CATEGORIES,
    activeCategory: 'hot',
    currentSports: SPORTS.hot,
    selectedId: '',
    selectedSport: null,
    searchKey: '',
    isSearching: false,
    searchResults: [],
    /* 底部面板 */
    showPanel: false,
    min: '',
    previewCal: 0,
    durPresets: [15, 30, 45, 60, 90],
    /* ★ 时间功能：开始/结束时间 */
    startTime: '',
    endTime: '',
    /* 自定义弹窗 */
    showCustomModal: false,
    customName: '',
    customCal: '',
    customSports: []
  },

  onLoad: function () {
    var sys = wx.getSystemInfoSync()
    this.setData({
      statusBarH: sys.statusBarHeight || 20,
      customSports: wx.getStorageSync('customSports') || []
    })
  },

  goBack: function () {
    wx.navigateBack()
  },

  /* ---- 分类切换 ---- */
  switchCategory: function (e) {
    var id = e.currentTarget.dataset.id
    if (id === this.data.activeCategory) return
    var list = id === 'custom' ? this.data.customSports : (SPORTS[id] || [])
    this.setData({ activeCategory: id, currentSports: list })
  },

  /* ---- 点击运动卡片 ---- */
  onTapSport: function (e) {
    var id = e.currentTarget.dataset.id
    if (this.data.selectedId === id) {
      this.setData({
        selectedId: '', selectedSport: null, showPanel: false,
        min: '', previewCal: 0,
        startTime: '', endTime: ''  /* ★ 时间功能 */
      })
      return
    }
    var sport = null
    var pools = [this.data.currentSports, this.data.searchResults, this.data.customSports]
    for (var i = 0; i < pools.length; i++) {
      sport = pools[i].find(function (s) { return s.id === id })
      if (sport) break
    }
    if (sport) {
      /* ★ 时间功能：选中运动时默认结束时间为当前时间 */
      var nowTime = fmtNowTime()
      this.setData({
        selectedId: id, selectedSport: sport, showPanel: true,
        min: '', previewCal: 0,
        startTime: '',
        endTime: nowTime
      })
    }
  },

  /* ---- 关闭面板 ---- */
  closePanel: function () {
    this.setData({
      showPanel: false, selectedId: '', selectedSport: null,
      min: '', previewCal: 0,
      startTime: '', endTime: ''  /* ★ 时间功能 */
    })
  },

  /* ★ 时间功能：时间 ↔ 时长 联动 */
  _syncTime: function (changedField) {
    var st = this.data.startTime
    var et = this.data.endTime
    var mn = parseInt(this.data.min) || 0

    if (changedField === 'duration' && mn > 0) {
      if (et) {
        /* 有结束时间 → 反算开始时间 */
        var start = timeToMinutes(et) - mn
        this.setData({ startTime: minutesToTime(start) })
      } else if (st) {
        /* 有开始时间 → 正算结束时间 */
        var end = timeToMinutes(st) + mn
        this.setData({ endTime: minutesToTime(end) })
      }
    }

    if (changedField === 'startTime' && st) {
      if (et) {
        /* 有结束时间 → 算时长 */
        var diff = timeToMinutes(et) - timeToMinutes(st)
        if (diff > 0) {
          this.setData({ min: String(diff) })
          this._updatePreview()
        }
      } else if (mn > 0) {
        /* 有时长 → 算结束时间 */
        this.setData({ endTime: minutesToTime(timeToMinutes(st) + mn) })
      }
    }

    if (changedField === 'endTime' && et) {
      if (st) {
        /* 有开始时间 → 算时长 */
        var diff = timeToMinutes(et) - timeToMinutes(st)
        if (diff > 0) {
          this.setData({ min: String(diff) })
          this._updatePreview()
        }
      } else if (mn > 0) {
        /* 有时长 → 算开始时间 */
        var start = timeToMinutes(et) - mn
        this.setData({ startTime: minutesToTime(start) })
      }
    }
  },

  /* ★ 时间功能：开始时间变化 */
  onStartTimeChange: function (e) {
    this.setData({ startTime: e.detail.value })
    this._syncTime('startTime')
  },

  /* ★ 时间功能：结束时间变化 */
  onEndTimeChange: function (e) {
    this.setData({ endTime: e.detail.value })
    this._syncTime('endTime')
  },

  /* ---- 时长 ---- */
  tapPreset: function (e) {
    this.setData({ min: String(e.currentTarget.dataset.val) })
    this._updatePreview()
    this._syncTime('duration')  /* ★ 时间功能 */
  },

  inputMin: function (e) {
    this.setData({ min: e.detail.value })
    this._updatePreview()
    this._syncTime('duration')  /* ★ 时间功能 */
  },

  _updatePreview: function () {
    var sport = this.data.selectedSport
    var m = Number(this.data.min)
    var cal = (sport && m > 0) ? Math.round(sport.cal60 / 60 * m) : 0
    this.setData({ previewCal: cal })
  },

  /* ---- 搜索 ---- */
  onSearchInput: function (e) {
    var key = e.detail.value.trim()
    this.setData({ searchKey: key })
    if (!key) {
      this.setData({ isSearching: false, searchResults: [] })
      return
    }
    var kw = key.toLowerCase()
    var results = ALL_SPORTS.filter(function (s) { return s.name.toLowerCase().indexOf(kw) > -1 })
    this.setData({ isSearching: true, searchResults: results })
  },

  clearSearch: function () {
    this.setData({ searchKey: '', isSearching: false, searchResults: [] })
  },

  /* ---- 自定义运动 ---- */
  showAddCustom: function () {
    this.setData({ showCustomModal: true, customName: '', customCal: '' })
  },

  hideModal: function () {
    this.setData({ showCustomModal: false })
  },

  preventBubble: function () { },

  onCustomName: function (e) { this.setData({ customName: e.detail.value }) },
  onCustomCal: function (e) { this.setData({ customCal: e.detail.value }) },

  saveCustom: function () {
    var customName = this.data.customName
    var customCal = this.data.customCal
    var customSports = this.data.customSports
    if (!customName.trim()) return wx.showToast({ title: '请输入运动名称', icon: 'none' })
    if (!customCal || isNaN(Number(customCal))) return wx.showToast({ title: '请输入正确的热量值', icon: 'none' })
    var sport = {
      id: 'cus_' + Date.now(),
      name: customName.trim(),
      emoji: '🏅',
      cal60: parseInt(customCal)
    }
    var list = customSports.concat([sport])
    wx.setStorageSync('customSports', list)
    this.setData({
      customSports: list,
      currentSports: this.data.activeCategory === 'custom' ? list : this.data.currentSports,
      showCustomModal: false
    })
    wx.showToast({ title: '添加成功', icon: 'success' })
  },

  deleteCustom: function (e) {
    var id = e.currentTarget.dataset.id
    var that = this
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这项自定义运动吗？',
      success: function (res) {
        if (!res.confirm) return
        var list = that.data.customSports.filter(function (s) { return s.id !== id })
        wx.setStorageSync('customSports', list)
        var update = {
          customSports: list,
          currentSports: that.data.activeCategory === 'custom' ? list : that.data.currentSports
        }
        if (that.data.selectedId === id) {
          update.selectedId = ''
          update.selectedSport = null
          update.showPanel = false
          update.min = ''
          update.previewCal = 0
          update.startTime = ''  /* ★ 时间功能 */
          update.endTime = ''
        }
        that.setData(update)
      }
    })
  },

  /* ---- 保存记录 ---- */
  save: function () {
    var sport = this.data.selectedSport
    var min = this.data.min
    if (!sport) return wx.showToast({ title: '请先选择运动项目', icon: 'none' })
    if (!min || isNaN(Number(min)) || Number(min) <= 0) {
      return wx.showToast({ title: '请输入有效时长', icon: 'none' })
    }

    var m = Number(min)
    var cal = Math.round(sport.cal60 / 60 * m)
    /* ★ 时间功能：保存时带上开始/结束时间 */
    var entry = {
      name: sport.name,
      emoji: sport.emoji,
      min: m,
      cal: cal,
      startTime: this.data.startTime || '',
      endTime: this.data.endTime || ''
    }

    var today = fmtDate(new Date())
    var records = app.globalData.exerciseRecords || wx.getStorageSync('exerciseRecords') || []
    var record = null
    for (var i = 0; i < records.length; i++) {
      if (records[i].date === today) { record = records[i]; break }
    }
    if (!record) {
      record = { date: today, sports: [] }
      records.push(record)
    }
    record.sports.push(entry)

    app.globalData.exerciseRecords = records
    wx.setStorageSync('exerciseRecords', records)

    /* 同步今日运动热量到 globalData（供主页读取） */
    var todayTotalCal = 0
    if (record && record.sports) {
      record.sports.forEach(function (s) { todayTotalCal += (s.cal || 0) })
    }
    app.globalData.calorieBurn = todayTotalCal

    wx.showToast({ title: '记录成功 💪', icon: 'success' })
    setTimeout(function () { wx.navigateBack() }, 600)
  }
})
