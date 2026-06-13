var app = getApp()

Page({
  data: {
    nowYear: 0,
    nowMonth: 0,
    nowDay: 0,
    preMonth: '',
    nextMonth: '',
    weekList: ['日', '一', '二', '三', '四', '五', '六'],
    dayList: [],
    selectDate: '',
    selectedRecords: [],
    showAd: true,
    showDetail: false,
    detailRecord: null,
    showToast: false,
    toastHiding: false,
    toastText: '',
    toastEmoji: '',
    showModal: false,
    modalTitle: '',
    modalContent: '',
    modalEmoji: ''
  },

  _modalCallback: null,

  onLoad: function () {
    this.initCalendar()
  },

  onShow: function () {
    this.loadFromStorage()
  },

  // ==================== Toast ====================
  showCustomToast: function (text, emoji, duration) {
    var that = this
    this.setData({
      showToast: true,
      toastHiding: false,
      toastText: text,
      toastEmoji: emoji || '✨'
    })
    setTimeout(function () {
      that.setData({ toastHiding: true })
      setTimeout(function () {
        that.setData({ showToast: false, toastHiding: false })
      }, 350)
    }, duration || 1800)
  },

  // ==================== Modal ====================
  showCustomModal: function (title, content, emoji, onConfirm) {
    this._modalCallback = onConfirm
    this.setData({
      showModal: true,
      modalTitle: title,
      modalContent: content,
      modalEmoji: emoji || '💩'
    })
  },

  modalConfirm: function () {
    this.setData({ showModal: false })
    if (this._modalCallback) {
      this._modalCallback()
      this._modalCallback = null
    }
  },

  modalCancel: function () {
    this.setData({ showModal: false })
    this._modalCallback = null
  },

  preventScroll: function () {},

  // ==================== Storage ====================
  loadFromStorage: function () {
    var logs = wx.getStorageSync('pooLogs') || []
    app.globalData.pooLogs = logs
    if (this.data.nowYear) {
      this.buildDays(this.data.nowYear, this.data.nowMonth - 1)
    }
    if (this.data.selectDate) {
      this.loadRecords(this.data.selectDate)
    }
  },

  initCalendar: function () {
    var now = new Date()
    var y = now.getFullYear()
    var m = now.getMonth()
    var d = now.getDate()
    var todayStr = this.toStr(y, m + 1, d)
    this.setData({ nowYear: y, nowMonth: m + 1, nowDay: d, selectDate: todayStr })
    this.loadFromStorage()
  },

  toStr: function (y, m, d) {
    return y + '-' + (m < 10 ? '0' + m : '' + m) + '-' + (d < 10 ? '0' + d : '' + d)
  },

  // ==================== 日历渲染 ====================
  buildDays: function (y, m) {
    var first = new Date(y, m, 1)
    var last = new Date(y, m + 1, 0)
    var start = first.getDay()
    var total = last.getDate()
    var now = new Date()
    var today = this.toStr(now.getFullYear(), now.getMonth() + 1, now.getDate())
    var sel = this.data.selectDate
    var logs = app.globalData.pooLogs || []
    var arr = []
    var n = 0
    var i, j, ds, found

    for (i = 0; i < start; i++) {
      arr.push({ id: n++, day: '', ds: '', isToday: false, isSel: false, hasLog: false })
    }

    for (i = 1; i <= total; i++) {
      ds = this.toStr(y, m + 1, i)
      found = false
      for (j = 0; j < logs.length; j++) {
        if (logs[j].date === ds) { found = true; break }
      }
      arr.push({
        id: n++, day: i, ds: ds,
        isToday: ds === today,
        isSel: ds === sel,
        hasLog: found
      })
    }

    while (arr.length < 42) {
      arr.push({ id: n++, day: '', ds: '', isToday: false, isSel: false, hasLog: false })
    }

    var preM = m === 0 ? 12 : m
    var nextM = m === 11 ? 1 : m + 2
    this.setData({ dayList: arr, preMonth: preM + '月', nextMonth: nextM + '月' })
  },

  // ==================== 记录加载 ====================
  loadRecords: function (dateStr) {
    var logs = app.globalData.pooLogs || []
    var records = []
    for (var i = 0; i < logs.length; i++) {
      var r = logs[i]
      if (r.date === dateStr) {
        records.push({
          id: r.id,
          date: r.date,
          time: r.time || '',
          colorHex: r.colorHex || '#8D6E63',
          colorName: r.colorName || '未记录',
          formNum: r.formNum || 0,
          formName: r.formName || '未记录',
          formDesc: r.formDesc || '',
          smellName: r.smellName || '未记录',
          feelingName: r.feelingName || '未记录',
          durationName: r.durationName || '未记录',
          note: r.note || ''
        })
      }
    }
    records.sort(function (a, b) { return a.time > b.time ? 1 : -1 })
    this.setData({ selectedRecords: records })
  },

  // ==================== 月份切换 ====================
  prevMonth: function () {
    var y = this.data.nowYear
    var m = this.data.nowMonth - 2
    if (m < 0) { y--; m = 11 }
    this.setData({ nowYear: y, nowMonth: m + 1 })
    this.buildDays(y, m)
  },

  nextMonth: function () {
    var y = this.data.nowYear
    var m = this.data.nowMonth
    if (m > 11) { y++; m = 0 }
    this.setData({ nowYear: y, nowMonth: m + 1 })
    this.buildDays(y, m)
  },

  // ==================== 点击日期 ====================
  tapDay: function (e) {
    var day = e.currentTarget.dataset.day
    if (!day) return
    var ds = e.currentTarget.dataset.ds
    this.setData({ selectDate: ds })
    this.buildDays(this.data.nowYear, this.data.nowMonth - 1)
    this.loadRecords(ds)
  },

  // ==================== 查看记录详情 ====================
  viewRecord: function (e) {
    var id = e.currentTarget.dataset.id
    var records = this.data.selectedRecords
    for (var i = 0; i < records.length; i++) {
      if (records[i].id === id) {
        this.setData({ detailRecord: records[i], showDetail: true })
        break
      }
    }
  },

  closeDetail: function () {
    this.setData({ showDetail: false, detailRecord: null })
  },

  // ==================== 删除记录（自定义弹窗）====================
  tapDelete: function () {
    var that = this
    this.showCustomModal(
      '确认删除',
      '这条便便记录删除后\n就找不回来啦～',
      '🥺',
      function () {
        var rid = that.data.detailRecord.id
        var logs = wx.getStorageSync('pooLogs') || []
        var newLogs = []
        for (var i = 0; i < logs.length; i++) {
          if (logs[i].id !== rid) newLogs.push(logs[i])
        }
        wx.setStorageSync('pooLogs', newLogs)
        app.globalData.pooLogs = newLogs
        that.setData({ showDetail: false, detailRecord: null })
        that.loadRecords(that.data.selectDate)
        that.buildDays(that.data.nowYear, that.data.nowMonth - 1)
        that.showCustomToast('删除成功', '🗑️✨')
      }
    )
  },

  // ==================== 记录入口 ====================
  goAddPoo: function () {
    var date = this.data.selectDate
    if (!date) {
      var now = new Date()
      date = this.toStr(now.getFullYear(), now.getMonth() + 1, now.getDate())
    }
    wx.navigateTo({ url: '/pages/poo/add-poo?date=' + date })
  },

  closeAd: function () {
    this.setData({ showAd: false })
  }
})
