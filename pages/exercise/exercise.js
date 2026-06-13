const app = getApp()

/* ===== AI API ===== */
var API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
var API_KEY = 'c62d241acd944273adf6e18730c60e54.vT0N7RDsYVsMmY3P'

/* ===== 常量 ===== */
var WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日']
var SPORT_COLORS = [
  '#7c5cbf', '#ff6b6b', '#26a69a', '#ffa726',
  '#42a5f5', '#ec407a', '#9ccc65', '#26c6da',
  '#ff7043', '#ab47bc', '#5c6bc0', '#ef5350'
]

function fmtDate(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0')
}

function getMonday(d) {
  var t = new Date(d)
  var dow = t.getDay()
  t.setDate(t.getDate() + (dow === 0 ? -6 : 1 - dow))
  t.setHours(0, 0, 0, 0)
  return t
}

function daysInMonth(y, m) {
  return new Date(y, m, 0).getDate()
}

Page({
  data: {
    statusBarH: 20,
    viewMode: 'week',
    todayStr: '',

    weekOffset: 0,
    weekLabel: '',
    weekDays: [],

    monthYear: 0,
    monthMonth: 0,
    monthLabel: '',
    monthGrid: [],
    weekHeaders: WEEK_LABELS,

    goalProgress: 0,
    goalTarget: 7,
    avgCal: 0,
    totalMin: 0,
    totalCal: 0,

    selectedDate: '',
    selectedLabel: '',

    distribution: [],
    dailyTotalCal: 0,
    dailyTotalMin: 0,
    hasDailyData: false,

    trendBars: [],
    trendChartWidth: 630,
    trendBarWidth: 80,

    recordsMap: {},
    nextDisabled: true,

    /* AI 点评 */
    aiText: '',
    aiLoading: false
  },

  _aiCache: {},
  _aiReqTask: null,

  /* ===== 生命周期 ===== */
  onLoad: function () {
    var sys = wx.getSystemInfoSync()
    var now = new Date()
    this.setData({
      statusBarH: sys.statusBarHeight || 20,
      monthYear: now.getFullYear(),
      monthMonth: now.getMonth() + 1,
      todayStr: fmtDate(now)
    })
  },

  onShow: function () {
    this._loadRecords()
    this._refreshAll()
  },

  onHide: function () {
    this._cancelAI()
  },

  onUnload: function () {
    this._cancelAI()
  },

  /* ===== 返回主页 ===== */
  goBack: function () {
    wx.navigateBack({
      fail: function () {
        wx.switchTab({ url: '/pages/home/home' })
      }
    })
  },

  /* ===== AI 点评 ===== */
  _cancelAI: function () {
    if (this._aiReqTask) {
      try { this._aiReqTask.abort() } catch (e) {}
      this._aiReqTask = null
    }
  },

  _buildAICacheKey: function () {
    var key = this.data.viewMode
    if (this.data.viewMode === 'week') {
      key += '_' + this.data.weekLabel
    } else {
      key += '_' + this.data.monthLabel
    }
    var count = 0
    var rm = this.data.recordsMap
    for (var k in rm) { count += rm[k].length }
    key += '_' + count
    return key
  },

  _fetchAI: function () {
    if (this.data.aiLoading) return

    var cacheKey = this._buildAICacheKey()
    if (this._aiCache[cacheKey]) {
      this.setData({ aiText: this._aiCache[cacheKey], aiLoading: false })
      return
    }

    var that = this
    var viewMode = this.data.viewMode
    var rm = this.data.recordsMap
    var dates, periodLabel

    if (viewMode === 'week') {
      dates = this.data.weekDays.map(function (d) { return d.fullDate })
      periodLabel = '本周'
    } else {
      dates = this.data.monthGrid.filter(function (d) { return d.isCurrentMonth }).map(function (d) { return d.fullDate })
      periodLabel = this.data.monthLabel
    }

    var totalCal = 0, totalMin = 0, activeDays = 0
    var sportMap = {}
    dates.forEach(function (fd) {
      var sports = rm[fd]
      if (sports && sports.length > 0) {
        activeDays++
        sports.forEach(function (s) {
          totalCal += (s.cal || 0)
          totalMin += (s.min || 0)
          if (!sportMap[s.name]) sportMap[s.name] = { count: 0, cal: 0 }
          sportMap[s.name].count++
          sportMap[s.name].cal += s.cal
        })
      }
    })

    if (totalCal === 0 && activeDays === 0) {
      this.setData({
        aiText: '还没有运动记录哦~ 点击右下角 + 开始记录你的第一次运动吧！💪',
        aiLoading: false
      })
      return
    }

    var sportLines = []
    for (var name in sportMap) {
      sportLines.push(name + '×' + sportMap[name].count + '次(' + sportMap[name].cal + '千卡)')
    }

    this.setData({ aiLoading: true, aiText: '' })

    var prompt = '请根据以下运动数据给出简短点评(60-80字)：\n' +
      '统计周期：' + periodLabel + '\n' +
      '运动天数：' + activeDays + '/' + dates.length + '天\n' +
      '总消耗：' + totalCal + '千卡\n' +
      '总时长：' + totalMin + '分钟\n' +
      '运动详情：' + (sportLines.join('、') || '暂无') + '\n' +
      '要求：1.评价运动表现 2.一句具体建议 3.一句鼓励。语气亲切可爱。'

    this._aiReqTask = wx.request({
      url: API_URL,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY
      },
      data: {
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: '你是BESTAI，专业运动健康AI顾问。用中文回答，语气亲切活泼，适当使用emoji。回复简洁，80字以内。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.7
      },
      timeout: 15000,
      success: function (res) {
        that._aiReqTask = null
        if (res.statusCode === 200 && res.data && res.data.choices &&
            res.data.choices[0] && res.data.choices[0].message) {
          var content = res.data.choices[0].message.content
          that._aiCache[cacheKey] = content
          that.setData({ aiText: content, aiLoading: false })
        } else {
          that.setData({ aiText: '暂时无法生成分析，点击刷新按钮重试~', aiLoading: false })
        }
      },
      fail: function () {
        that._aiReqTask = null
        that.setData({ aiText: '网络不太给力，点击刷新重试~', aiLoading: false })
      }
    })
  },

  refreshAI: function () {
    var cacheKey = this._buildAICacheKey()
    delete this._aiCache[cacheKey]
    this._fetchAI()
  },

  /* ===== 数据加载 ===== */
  _loadRecords: function () {
    var records = app.globalData.exerciseRecords || wx.getStorageSync('exerciseRecords') || []
    app.globalData.exerciseRecords = records
    var map = {}
    records.forEach(function (r) {
      if (r && r.date && r.sports) map[r.date] = r.sports
    })
    this.setData({ recordsMap: map })
  },

  /* ===== 刷新全部 ===== */
  _refreshAll: function () {
    if (this.data.viewMode === 'week') {
      this._buildWeek()
    } else {
      this._buildMonth()
    }
    this._calcSummary()
    this._calcTrend()
    this._checkNext()

    if (!this.data.selectedDate || !this._isInView(this.data.selectedDate)) {
      this._autoSelect()
    } else {
      this._showDayDetail(this.data.selectedDate)
    }

    var that = this
    setTimeout(function () { that._fetchAI() }, 200)
  },

  _isInView: function (date) {
    if (this.data.viewMode === 'week') {
      return this.data.weekDays.some(function (d) { return d.fullDate === date })
    }
    return this.data.monthGrid.some(function (d) { return d.fullDate === date && d.isCurrentMonth })
  },

  _autoSelect: function () {
    var today = this.data.todayStr
    if (this.data.viewMode === 'week') {
      var hit = this.data.weekDays.find(function (d) { return d.fullDate === today })
      this._selectDay(hit ? today : this.data.weekDays[0].fullDate)
    } else {
      var hit2 = this.data.monthGrid.find(function (d) { return d.fullDate === today && d.isCurrentMonth })
      var first = this.data.monthGrid.find(function (d) { return d.isCurrentMonth })
      this._selectDay(hit2 ? today : (first ? first.fullDate : ''))
    }
  },

  _selectDay: function (date) {
    if (!date) return
    var weekDays = this.data.weekDays.map(function (d) {
      return Object.assign({}, d, { isActive: d.fullDate === date })
    })
    var monthGrid = this.data.monthGrid.map(function (d) {
      return Object.assign({}, d, { isActive: d.fullDate === date })
    })
    var parts = date.split('-')
    this.setData({
      selectedDate: date,
      selectedLabel: parseInt(parts[1]) + '月' + parseInt(parts[2]) + '日',
      weekDays: weekDays,
      monthGrid: monthGrid
    })
    this._showDayDetail(date)
  },

  tapDay: function (e) {
    this._selectDay(e.currentTarget.dataset.date)
  },

  /* ★ 时间功能：附加 timeRange */
  _showDayDetail: function (date) {
    var sports = this.data.recordsMap[date] || []
    var totalCal = 0, totalMin = 0
    sports.forEach(function (s) {
      totalCal += (s.cal || 0)
      totalMin += (s.min || 0)
    })
    var distribution = sports.map(function (s, idx) {
      return Object.assign({}, s, {
        color: SPORT_COLORS[idx % SPORT_COLORS.length],
        pct: totalCal > 0 ? Math.max(12, Math.round(s.cal / totalCal * 100)) : 0,
        timeRange: (s.startTime && s.endTime) ? (s.startTime + ' ~ ' + s.endTime) : ''
      })
    })
    this.setData({
      distribution: distribution,
      dailyTotalCal: totalCal,
      dailyTotalMin: totalMin,
      hasDailyData: sports.length > 0
    })
  },

  /* ===== 构建周视图 ===== */
  _buildWeek: function () {
    var now = new Date()
    var today = this.data.todayStr
    var mon = getMonday(now)
    mon.setDate(mon.getDate() + this.data.weekOffset * 7)
    var rm = this.data.recordsMap
    var sel = this.data.selectedDate
    var days = []
    for (var i = 0; i < 7; i++) {
      var d = new Date(mon)
      d.setDate(d.getDate() + i)
      var fd = fmtDate(d)
      days.push({
        label: WEEK_LABELS[i],
        date: d.getDate(),
        fullDate: fd,
        isToday: fd === today,
        hasRecord: !!rm[fd],
        isActive: fd === sel
      })
    }
    var s = days[0], e = days[6]
    var weekLabel = parseInt(s.fullDate.slice(5, 7)) + '月' + s.date + '日 — ' +
      parseInt(e.fullDate.slice(5, 7)) + '月' + e.date + '日'
    this.setData({ weekDays: days, weekLabel: weekLabel })
  },

  /* ===== 构建月视图 ===== */
  _buildMonth: function () {
    var Y = this.data.monthYear, M = this.data.monthMonth
    var today = this.data.todayStr
    var rm = this.data.recordsMap
    var sel = this.data.selectedDate
    var first = new Date(Y, M - 1, 1)
    var numDays = daysInMonth(Y, M)
    var startDow = first.getDay() - 1
    if (startDow < 0) startDow = 6
    var grid = []

    for (var i = startDow - 1; i >= 0; i--) {
      var d = new Date(Y, M - 1, -i)
      var fd = fmtDate(d)
      grid.push({
        date: d.getDate(), fullDate: fd, isToday: fd === today,
        hasRecord: !!rm[fd], isActive: fd === sel, isCurrentMonth: false
      })
    }
    for (var i = 1; i <= numDays; i++) {
      var d = new Date(Y, M - 1, i)
      var fd = fmtDate(d)
      grid.push({
        date: i, fullDate: fd, isToday: fd === today,
        hasRecord: !!rm[fd], isActive: fd === sel, isCurrentMonth: true
      })
    }
    var rem = grid.length % 7
    if (rem > 0) {
      for (var i = 1; i <= 7 - rem; i++) {
        var d = new Date(Y, M, i)
        var fd = fmtDate(d)
        grid.push({
          date: i, fullDate: fd, isToday: fd === today,
          hasRecord: !!rm[fd], isActive: fd === sel, isCurrentMonth: false
        })
      }
    }
    this.setData({ monthGrid: grid, monthLabel: Y + '年' + M + '月' })
  },

  /* ===== 计算概览 ===== */
  _calcSummary: function () {
    var viewMode = this.data.viewMode
    var rm = this.data.recordsMap
    var dates, goalTarget
    if (viewMode === 'week') {
      dates = this.data.weekDays.map(function (d) { return d.fullDate })
      goalTarget = 7
    } else {
      dates = this.data.monthGrid.filter(function (d) { return d.isCurrentMonth }).map(function (d) { return d.fullDate })
      goalTarget = dates.length
    }
    var activeDays = 0, totalCal = 0, totalMin = 0
    dates.forEach(function (fd) {
      var sports = rm[fd]
      if (sports && sports.length > 0) {
        activeDays++
        sports.forEach(function (s) {
          totalCal += (s.cal || 0)
          totalMin += (s.min || 0)
        })
      }
    })
    this.setData({
      goalProgress: activeDays,
      goalTarget: goalTarget,
      avgCal: activeDays > 0 ? Math.round(totalCal / activeDays) : 0,
      totalMin: totalMin,
      totalCal: totalCal
    })
  },

  /* ===== 计算趋势 ===== */
  _calcTrend: function () {
    var viewMode = this.data.viewMode
    var rm = this.data.recordsMap
    var entries = [], maxCal = 1, maxMin = 1
    if (viewMode === 'week') {
      entries = this.data.weekDays.map(function (d) { return { label: d.label, fullDate: d.fullDate } })
    } else {
      entries = this.data.monthGrid.filter(function (d) { return d.isCurrentMonth }).map(function (d) {
        return { label: String(d.date), fullDate: d.fullDate }
      })
    }
    var bars = entries.map(function (e) {
      var sports = rm[e.fullDate] || []
      var cal = 0, min = 0
      sports.forEach(function (s) { cal += (s.cal || 0); min += (s.min || 0) })
      if (cal > maxCal) maxCal = cal
      if (min > maxMin) maxMin = min
      return { label: e.label, cal: cal, min: min }
    })
    var trendBars = bars.map(function (b) {
      return Object.assign({}, b, {
        calH: maxCal > 0 ? Math.max(b.cal > 0 ? 8 : 0, Math.round(b.cal / maxCal * 100)) : 0,
        minH: maxMin > 0 ? Math.max(b.min > 0 ? 8 : 0, Math.round(b.min / maxMin * 100)) : 0
      })
    })
    var barW = viewMode === 'week' ? 88 : 44
    this.setData({
      trendBars: trendBars,
      trendBarWidth: barW,
      trendChartWidth: trendBars.length * barW + 40
    })
  },

  _checkNext: function () {
    var now = new Date()
    var disabled
    if (this.data.viewMode === 'week') {
      disabled = this.data.weekOffset >= 0
    } else {
      disabled = (this.data.monthYear >= now.getFullYear() && this.data.monthMonth >= now.getMonth() + 1)
    }
    this.setData({ nextDisabled: disabled })
  },

  /* ===== 交互事件 ===== */
  switchMode: function (e) {
    var mode = e.currentTarget.dataset.mode
    if (mode === this.data.viewMode) return
    this.setData({ viewMode: mode, selectedDate: '' })
    this._refreshAll()
  },

  prevPeriod: function () {
    if (this.data.viewMode === 'week') {
      this.setData({ weekOffset: this.data.weekOffset - 1 })
    } else {
      var y = this.data.monthYear, m = this.data.monthMonth - 1
      if (m < 1) { m = 12; y-- }
      this.setData({ monthYear: y, monthMonth: m })
    }
    this.setData({ selectedDate: '' })
    this._refreshAll()
  },

  nextPeriod: function () {
    if (this.data.nextDisabled) return
    if (this.data.viewMode === 'week') {
      this.setData({ weekOffset: this.data.weekOffset + 1 })
    } else {
      var y = this.data.monthYear, m = this.data.monthMonth + 1
      if (m > 12) { m = 1; y++ }
      this.setData({ monthYear: y, monthMonth: m })
    }
    this.setData({ selectedDate: '' })
    this._refreshAll()
  },

  goAddSport: function () {
    wx.navigateTo({ url: '/pages/exercise/add-sport' })
  }
})
