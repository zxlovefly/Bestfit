// pages/water/water.js
const app = getApp()

const DRINK_COLORS = [
  '#6B8CEF', '#FF8FAB', '#FFD93D', '#6BCB77', '#A78BFA',
  '#F97316', '#14B8A6', '#EC4899', '#06B6D4', '#F59E0B',
  '#84CC16', '#EF4444', '#6366F1', '#10B981', '#EAB308',
  '#78716C', '#64748B', '#D946EF', '#F43F5E', '#8B5CF6', '#3B82F6'
]

const CAFFEINE_MAP = { coffee: 0.4, tea: 0.12, milkTea: 0.12, cola: 0.1 }

Page({
  data: {
    currentView: 'record',
    selectedDate: '',
    selectedDateDisplay: '',
    isToday: true,
    showDatePicker: false,
    pickerYear: 0,
    pickerMonth: 0,
    pickerDays: [],
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],

    waterTotalTargetML: 1800,
    waterTodayML: 0,
    waterRecords: [],
    remainingML: 1800,
    progressPercent: 0,
    cupBgStyle: 'linear-gradient(to top, #6B8CEF, #A78BFA)',
    quickMLs: [250, 400, 600, 800],

    drinkList: [
      { type: 'water', icon: '💧', name: '白开水' },
      { type: 'tea', icon: '🍵', name: '茶水' },
      { type: 'soda', icon: '🥤', name: '苏打水' },
      { type: 'coffee', icon: '☕', name: '咖啡' },
      { type: 'coconut', icon: '🥥', name: '椰奶' },
      { type: 'lemon', icon: '🍋', name: '柠檬水' },
      { type: 'honey', icon: '🍯', name: '蜂蜜水' },
      { type: 'brownSugar', icon: '🧋', name: '红糖水' },
      { type: 'soyMilk', icon: '🥤', name: '豆浆' },
      { type: 'sparkling', icon: '🫧', name: '气泡水' },
      { type: 'soybeanMilk', icon: '🥛', name: '豆奶' },
      { type: 'cola', icon: '🥤', name: '可乐' },
      { type: 'milk', icon: '🥛', name: '牛奶' },
      { type: 'juice', icon: '🧃', name: '果汁' },
      { type: 'sourPlum', icon: '🍹', name: '酸梅汤' },
      { type: 'yogurt', icon: '🥛', name: '酸奶' },
      { type: 'milkTea', icon: '🧋', name: '奶茶' },
      { type: 'yakult', icon: '🍶', name: '养乐多' },
      { type: 'vinegar', icon: '🍎', name: '苹果醋' },
      { type: 'porridge', icon: '🥣', name: '粥' },
      { type: 'mungBean', icon: '🍵', name: '绿豆汤' }
    ],
    cupList: [
      { ml: 150, icon: '☕', name: '小杯' },
      { ml: 250, icon: '🥤', name: '中杯' },
      { ml: 350, icon: '🧋', name: '大杯' },
      { ml: 500, icon: '🍶', name: '超大杯' },
      { ml: 750, icon: '🫗', name: '水壶' }
    ],

    showModal: false,
    isEdit: false,
    editIndex: -1,
    selectedDrink: 'water',
    tempML: 250,
    showDelModal: false,
    deleteIndex: -1,
    deleteRecord: {},
    showTargetModal: false,
    tempTarget: 1800,

    statsRange: 7,
    barChartData: [],
    ringChartData: [],
    ringGradient: '',
    drinkTypeTable: [],
    caffeineTotalMG: 0,
    caffeineLevel: '',
    caffeineBarWidth: 0,
    caffeineBarBg: '#6BCB77',
    totalDaysInRange: 0,
    avgML: 0,
    completedDays: 0,
    showRingEmpty: true
  },

  onLoad() {
    this.migrateOldData()
    var today = this.fmtDate(new Date())
    this.setData({
      selectedDate: today,
      selectedDateDisplay: this.toDisplayStr(today),
      isToday: true
    })
    this.loadDateData()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ visible: true, selected: 0 })
    }
    this.loadDateData()
  },

  /* ===== 日期工具 ===== */
  fmtDate: function (d) {
    var y = d.getFullYear()
    var m = d.getMonth() + 1
    var day = d.getDate()
    return y + '-' + (m < 10 ? '0' + m : '' + m) + '-' + (day < 10 ? '0' + day : '' + day)
  },

  toDisplayStr: function (dateStr) {
    var parts = dateStr.split('-')
    return parts[0] + '年' + parseInt(parts[1]) + '月' + parseInt(parts[2]) + '日'
  },

  checkIsToday: function (dateStr) {
    return dateStr === this.fmtDate(new Date())
  },

  isFuture: function (dateStr) {
    return new Date(dateStr + 'T00:00:00') > new Date(this.fmtDate(new Date()) + 'T00:00:00')
  },

  /* ===== 旧数据迁移 ===== */
  migrateOldData: function () {
    try {
      var history = wx.getStorageSync('waterHistory') || {}
      var today = this.fmtDate(new Date())
      var oldML = wx.getStorageSync('waterTodayML')
      var oldRec = wx.getStorageSync('waterRecords')
      if ((oldML > 0 || (oldRec && oldRec.length > 0)) && !history[today]) {
        history[today] = { totalML: oldML || 0, records: oldRec || [] }
        wx.setStorageSync('waterHistory', history)
      }
    } catch (e) {
      console.error('迁移失败', e)
    }
  },

  /* ===== 日期切换（修复核心） ===== */
  prevDay: function () {
    var cur = new Date(this.data.selectedDate + 'T00:00:00')
    cur.setDate(cur.getDate() - 1)
    var newDate = this.fmtDate(cur)
    var isT = this.checkIsToday(newDate)
    this.setData({
      selectedDate: newDate,
      selectedDateDisplay: this.toDisplayStr(newDate),
      isToday: isT
    })
    this.loadDateData()
  },

  nextDay: function () {
    if (this.data.isToday) {
      wx.showToast({ title: '已经是今天啦~', icon: 'none' })
      return
    }
    var cur = new Date(this.data.selectedDate + 'T00:00:00')
    var today = new Date(this.fmtDate(new Date()) + 'T00:00:00')
    if (cur >= today) {
      wx.showToast({ title: '无法切换到未来哦~', icon: 'none' })
      return
    }
    cur.setDate(cur.getDate() + 1)
    var newDate = this.fmtDate(cur)
    if (new Date(newDate + 'T00:00:00') > today) {
      wx.showToast({ title: '无法切换到未来哦~', icon: 'none' })
      return
    }
    var isT = this.checkIsToday(newDate)
    this.setData({
      selectedDate: newDate,
      selectedDateDisplay: this.toDisplayStr(newDate),
      isToday: isT
    })
    this.loadDateData()
  },

  /* ===== 日期选择器 ===== */
  openDatePicker: function () {
    var parts = this.data.selectedDate.split('-')
    var y = parseInt(parts[0])
    var m = parseInt(parts[1])
    this.setData({ showDatePicker: true, pickerYear: y, pickerMonth: m })
    this.buildPickerDays(y, m)
  },

  closeDatePicker: function () {
    this.setData({ showDatePicker: false })
  },

  pickerPrevMonth: function () {
    var y = this.data.pickerYear
    var m = this.data.pickerMonth
    m = m - 1
    if (m < 1) { m = 12; y = y - 1 }
    this.setData({ pickerYear: y, pickerMonth: m })
    this.buildPickerDays(y, m)
  },

  pickerNextMonth: function () {
    var y = this.data.pickerYear
    var m = this.data.pickerMonth
    var now = new Date()
    if (y > now.getFullYear() || (y === now.getFullYear() && m >= now.getMonth() + 1)) {
      wx.showToast({ title: '无法选择未来月份哦~', icon: 'none' })
      return
    }
    m = m + 1
    if (m > 12) { m = 1; y = y + 1 }
    this.setData({ pickerYear: y, pickerMonth: m })
    this.buildPickerDays(y, m)
  },

  buildPickerDays: function (year, month) {
    var firstDay = new Date(year, month - 1, 1).getDay()
    var daysInMonth = new Date(year, month, 0).getDate()
    var todayStr = this.fmtDate(new Date())
    var selectedStr = this.data.selectedDate
    var days = []

    for (var i = 0; i < firstDay; i++) {
      days.push({ day: '', empty: true, dateStr: '', isToday: false, isSelected: false, isFuture: false })
    }
    for (var d = 1; d <= daysInMonth; d++) {
      var ds = year + '-' + (month < 10 ? '0' + month : '' + month) + '-' + (d < 10 ? '0' + d : '' + d)
      days.push({
        day: d,
        dateStr: ds,
        isToday: ds === todayStr,
        isSelected: ds === selectedStr,
        isFuture: new Date(ds + 'T00:00:00') > new Date(todayStr + 'T00:00:00')
      })
    }
    this.setData({ pickerDays: days })
  },

  selectPickerDay: function (e) {
    var ds = e.currentTarget.dataset.date
    if (!ds) return
    if (new Date(ds + 'T00:00:00') > new Date(this.fmtDate(new Date()) + 'T00:00:00')) return
    var isT = this.checkIsToday(ds)
    this.setData({
      selectedDate: ds,
      selectedDateDisplay: this.toDisplayStr(ds),
      isToday: isT,
      showDatePicker: false
    })
    this.loadDateData()
  },

  /* ===== 水杯背景计算 ===== */
  computeCupStyle: function (percent) {
    if (percent >= 100) {
      return 'linear-gradient(to top, #6BCB77, #98FB98)'
    }
    return 'linear-gradient(to top, #6B8CEF, #A78BFA)'
  },

  /* ===== 加载指定日期数据 ===== */
  loadDateData: function () {
    try {
      var target = app.globalData.waterTotalTargetML || wx.getStorageSync('waterTotalTargetML') || 1800
      var history = wx.getStorageSync('waterHistory') || {}
      var dd = history[this.data.selectedDate] || { totalML: 0, records: [] }
      var remaining = Math.max(target - dd.totalML, 0)
      var percent = target > 0 ? Math.min(Math.round(dd.totalML / target * 100), 100) : 0
      this.setData({
        waterTotalTargetML: target,
        waterTodayML: dd.totalML,
        waterRecords: dd.records,
        remainingML: remaining,
        progressPercent: percent,
        cupBgStyle: this.computeCupStyle(percent),
        tempTarget: target
      })
      if (this.data.currentView === 'stats') {
        this.calcStats()
      }
    } catch (e) {
      console.error('初始化失败', e)
      this.setData({
        waterTotalTargetML: 1800,
        waterTodayML: 0,
        waterRecords: [],
        remainingML: 1800,
        progressPercent: 0,
        cupBgStyle: 'linear-gradient(to top, #6B8CEF, #A78BFA)'
      })
    }
  },

  /* ===== 保存到历史 ===== */
  saveToHistory: function () {
    try {
      var history = wx.getStorageSync('waterHistory') || {}
      history[this.data.selectedDate] = {
        totalML: this.data.waterTodayML,
        records: this.data.waterRecords
      }
      wx.setStorageSync('waterHistory', history)

      app.globalData.waterTotalTargetML = this.data.waterTotalTargetML
      wx.setStorageSync('waterTotalTargetML', this.data.waterTotalTargetML)

      if (this.data.isToday) {
        app.globalData.waterTodayML = this.data.waterTodayML
        app.globalData.waterRecords = this.data.waterRecords
        wx.setStorageSync('waterTodayML', this.data.waterTodayML)
        wx.setStorageSync('waterRecords', this.data.waterRecords)
      }
    } catch (e) {
      console.error('保存失败', e)
    }
  },

  /* ===== 更新统计 ===== */
  updateStats: function () {
    var t = this.data.waterTotalTargetML
    var ml = this.data.waterTodayML
    var percent = t > 0 ? Math.min(Math.round(ml / t * 100), 100) : 0
    this.setData({
      remainingML: Math.max(t - ml, 0),
      progressPercent: percent,
      cupBgStyle: this.computeCupStyle(percent)
    })
    this.saveToHistory()
  },

  /* ===== 视图切换 ===== */
  switchView: function (e) {
    var v = e.currentTarget.dataset.view
    if (v === this.data.currentView) return
    this.setData({ currentView: v })
    if (v === 'stats') {
      this.calcStats()
    }
  },

  /* ===== 记录喝水（中央按钮） ===== */
  addWaterAction: function () {
    this.openAddModal()
  },

  /* ===== 快捷添加 ===== */
  addQuick: function (e) {
    var ml = e.currentTarget.dataset.ml
    this.addWaterRecord(ml, 'water')
  },

  addWaterRecord: function (ml, drinkType) {
    if (ml <= 0) {
      wx.showToast({ title: '请输入有效水量', icon: 'none' })
      return
    }
    var di = null
    for (var i = 0; i < this.data.drinkList.length; i++) {
      if (this.data.drinkList[i].type === drinkType) {
        di = this.data.drinkList[i]
        break
      }
    }
    var name = di ? di.name : '水'
    var icon = di ? di.icon : '💧'
    var now = new Date()
    var hrs = now.getHours() < 10 ? '0' + now.getHours() : '' + now.getHours()
    var mins = now.getMinutes() < 10 ? '0' + now.getMinutes() : '' + now.getMinutes()
    var timeStr = hrs + ':' + mins

    var record = {
      id: Date.now(),
      time: timeStr,
      ml: ml,
      name: name,
      type: drinkType,
      icon: icon,
      date: this.data.selectedDate
    }
    var newRecords = this.data.waterRecords.concat([record])
    var newTotal = this.data.waterTodayML + ml

    this.setData({
      waterRecords: newRecords,
      waterTodayML: newTotal
    })
    this.updateStats()
    wx.showToast({ title: '已记录 ' + ml + 'ml', icon: 'none', duration: 1200 })

    if (this.data.waterTotalTargetML - newTotal <= 0 && this.data.waterTodayML - ml < this.data.waterTotalTargetML) {
      if (this.data.isToday) {
        wx.showModal({
          title: '太棒啦',
          content: '今日喝水目标完成！继续保持~',
          confirmText: '好的',
          showCancel: false
        })
      }
    }
  },

  /* ===== 弹窗控制 ===== */
  openAddModal: function () {
    this.setData({
      showModal: true,
      isEdit: false,
      editIndex: -1,
      selectedDrink: 'water',
      tempML: 250
    })
  },

  editRecord: function (e) {
    var idx = e.currentTarget.dataset.index
    var rec = this.data.waterRecords[idx]
    var drinkType = rec.type || this.getDrinkTypeByName(rec.name)
    this.setData({
      showModal: true,
      isEdit: true,
      editIndex: idx,
      selectedDrink: drinkType,
      tempML: rec.ml
    })
  },

  getDrinkTypeByName: function (name) {
    for (var i = 0; i < this.data.drinkList.length; i++) {
      if (this.data.drinkList[i].name === name) return this.data.drinkList[i].type
    }
    return 'water'
  },

  selectDrink: function (e) {
    this.setData({ selectedDrink: e.currentTarget.dataset.type })
  },

  changeAmount(e) {
    var delta = parseInt(e.currentTarget.dataset.delta)
    var v = this.data.tempML + delta
    if (v < 0) v = 0
    if (v > 5000) v = 5000
    this.setData({ tempML: v })
  },

  onAmountInput: function (e) {
    var v = parseInt(e.detail.value)
    if (isNaN(v)) v = 0
    if (v > 5000) v = 5000
    this.setData({ tempML: v })
  },

  setQuickAmount: function (e) {
    this.setData({ tempML: e.currentTarget.dataset.ml })
  },

  saveRecord: function () {
    var ml = this.data.tempML
    if (ml <= 0) {
      wx.showToast({ title: '请输入饮水量', icon: 'none' })
      return
    }
    if (this.data.isEdit) {
      var old = this.data.waterRecords[this.data.editIndex]
      var di = null
      for (var i = 0; i < this.data.drinkList.length; i++) {
        if (this.data.drinkList[i].type === this.data.selectedDrink) {
          di = this.data.drinkList[i]
          break
        }
      }
      var nr = this.data.waterRecords.slice()
      nr[this.data.editIndex] = {
        id: old.id,
        time: old.time,
        ml: ml,
        name: di ? di.name : '水',
        type: this.data.selectedDrink,
        icon: di ? di.icon : '💧',
        date: old.date
      }
      var newTotal = this.data.waterTodayML - old.ml + ml
      this.setData({ waterRecords: nr, waterTodayML: newTotal })
      this.updateStats()
      wx.showToast({ title: '已修改', icon: 'none' })
    } else {
      this.addWaterRecord(ml, this.data.selectedDrink)
    }
    this.closeModal()
  },

  deleteRecord: function (e) {
    var idx = e.currentTarget.dataset.index
    this.setData({
      showDelModal: true,
      deleteIndex: idx,
      deleteRecord: this.data.waterRecords[idx]
    })
  },

  closeDelModal: function () {
    this.setData({ showDelModal: false, deleteIndex: -1, deleteRecord: {} })
  },

  confirmDelete: function () {
    var idx = this.data.deleteIndex
    if (idx < 0 || idx >= this.data.waterRecords.length) {
      this.closeDelModal()
      return
    }
    var nr = this.data.waterRecords.slice()
    var removed = nr.splice(idx, 1)[0]
    var newTotal = this.data.waterTodayML - removed.ml
    this.setData({ waterRecords: nr, waterTodayML: newTotal })
    this.updateStats()
    this.closeDelModal()
    wx.showToast({ title: '已删除', icon: 'none' })
  },

  editTarget: function () {
    this.setData({ showTargetModal: true, tempTarget: this.data.waterTotalTargetML })
  },

  onTargetInput: function (e) {
    var v = parseInt(e.detail.value)
    if (isNaN(v)) v = 0
    if (v < 0) v = 0
    if (v > 10000) v = 10000
    this.setData({ tempTarget: v })
  },

  saveTarget: function () {
    var newTarget = this.data.tempTarget
    if (newTarget <= 0) {
      wx.showToast({ title: '请输入有效目标', icon: 'none' })
      return
    }
    this.setData({ waterTotalTargetML: newTarget })
    this.updateStats()
    this.closeTargetModal()
    wx.showToast({ title: '目标已更新', icon: 'none' })
  },

  closeModal: function () {
    this.setData({ showModal: false })
  },

  closeTargetModal: function () {
    this.setData({ showTargetModal: false })
  },

  /* ===== 统计计算 ===== */
  switchStatsRange: function (e) {
    this.setData({ statsRange: parseInt(e.currentTarget.dataset.range) })
    this.calcStats()
  },

  calcStats: function () {
    var range = this.data.statsRange
    var history = wx.getStorageSync('waterHistory') || {}
    var today = new Date()
    var dates = []
    for (var i = range - 1; i >= 0; i--) {
      var d = new Date(today)
      d.setDate(d.getDate() - i)
      dates.push(this.fmtDate(d))
    }

    var barData = []
    var maxML = 1
    for (var j = 0; j < dates.length; j++) {
      var ds = dates[j]
      var dd = history[ds] || { totalML: 0 }
      var p = ds.split('-')
      var val = dd.totalML || 0
      if (val > maxML) maxML = val
      barData.push({
        date: ds,
        label: parseInt(p[1]) + '/' + parseInt(p[2]),
        value: val,
        percent: 0
      })
    }
    for (var k = 0; k < barData.length; k++) {
      barData[k].percent = Math.round((barData[k].value / maxML) * 100)
    }

    var drinkMap = {}
    var target = this.data.waterTotalTargetML
    var totalCaffeine = 0
    var totalMLInRange = 0
    var completedDays = 0

    for (var di = 0; di < dates.length; di++) {
      var dateKey = dates[di]
      var dayData = history[dateKey] || { totalML: 0, records: [] }
      var dayML = dayData.totalML || 0
      totalMLInRange += dayML
      if (dayML >= target) completedDays++
      var recs = dayData.records || []
      for (var ri = 0; ri < recs.length; ri++) {
        var r = recs[ri]
        var type = r.type || this.getDrinkTypeByName(r.name)
        var rname = r.name || '未知'
        if (!drinkMap[type]) {
          var drinkItem = null
          for (var ll = 0; ll < this.data.drinkList.length; ll++) {
            if (this.data.drinkList[ll].type === type) {
              drinkItem = this.data.drinkList[ll]
              break
            }
          }
          drinkMap[type] = {
            type: type,
            name: rname,
            icon: drinkItem ? drinkItem.icon : '💧',
            count: 0,
            totalML: 0
          }
        }
        drinkMap[type].count++
        drinkMap[type].totalML += r.ml
        if (CAFFEINE_MAP[type]) {
          totalCaffeine += r.ml * CAFFEINE_MAP[type]
        }
      }
    }

    var table = []
    for (var key in drinkMap) {
      table.push(drinkMap[key])
    }
    table.sort(function (a, b) { return b.totalML - a.totalML })

    for (var ti = 0; ti < table.length; ti++) {
      table[ti].totalMLL = (table[ti].totalML / 1000).toFixed(1)
    }

    var ringData = []
    for (var ri2 = 0; ri2 < table.length; ri2++) {
      ringData.push({
        type: table[ri2].type,
        name: table[ri2].name,
        icon: table[ri2].icon,
        count: table[ri2].count,
        totalML: table[ri2].totalML,
        totalMLL: table[ri2].totalMLL,
        color: DRINK_COLORS[ri2 % DRINK_COLORS.length],
        percent: totalMLInRange > 0 ? Math.round((table[ri2].totalML / totalMLInRange) * 100) : 0
      })
    }

    var ringGradient = ''
    if (ringData.length > 0 && totalMLInRange > 0) {
      var cum = 0
      var stops = []
      for (var si = 0; si < ringData.length; si++) {
        var s = cum
        cum += (ringData[si].totalML / totalMLInRange) * 100
        stops.push(ringData[si].color + ' ' + s + '% ' + cum + '%')
      }
      ringGradient = 'conic-gradient(' + stops.join(',') + ')'
    }

    var cl = '很低 💚'
    if (totalCaffeine > 400) cl = '偏高 ⚠️'
    else if (totalCaffeine > 200) cl = '适中 💛'
    else if (totalCaffeine > 50) cl = '正常 💙'

    var cafeVal = Math.round(totalCaffeine)
    var cafePercent = cafeVal > 400 ? 100 : cafeVal / 4
    var cafeBg = '#6BCB77'
    if (cafeVal > 400) cafeBg = '#FF6B6B'
    else if (cafeVal > 200) cafeBg = '#FFD93D'

    this.setData({
      barChartData: barData,
      ringChartData: ringData,
      ringGradient: ringGradient,
      drinkTypeTable: table,
      caffeineTotalMG: cafeVal,
      caffeineLevel: cl,
      caffeineBarWidth: cafePercent,
      caffeineBarBg: cafeBg,
      totalDaysInRange: dates.length,
      avgML: dates.length > 0 ? Math.round(totalMLInRange / dates.length) : 0,
      completedDays: completedDays,
      showRingEmpty: ringData.length === 0
    })
  }
})