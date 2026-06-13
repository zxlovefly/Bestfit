var app = getApp()

Page({
  data: {
    date: '',
    time: '',
    colorIndex: -1,
    formIndex: -1,
    smellIndex: -1,
    feelingIndex: -1,
    durationIndex: -1,
    note: '',
    showToast: false,
    toastHiding: false,
    toastText: '',
    toastEmoji: '',

    colors: [
      { name: '金黄', hex: '#FFB300' },
      { name: '黄色', hex: '#F9A825' },
      { name: '棕色', hex: '#8D6E63' },
      { name: '深棕', hex: '#5D4037' },
      { name: '黑色', hex: '#37474F' },
      { name: '绿色', hex: '#66BB6A' },
      { name: '红色', hex: '#EF5350' },
      { name: '灰白', hex: '#B0BEC5' }
    ],

    forms: [
      { num: 1, name: '硬球状', desc: '一颗颗硬球，像羊粪' },
      { num: 2, name: '干裂香肠状', desc: '表面有裂纹的硬条' },
      { num: 3, name: '有裂纹条状', desc: '香肠状，表面有裂痕' },
      { num: 4, name: '光滑软条', desc: '表面光滑的柔软条状' },
      { num: 5, name: '软团状', desc: '边缘不规则的软团' },
      { num: 6, name: '糊状', desc: '糊状，边缘模糊' },
      { num: 7, name: '水样', desc: '完全水样，无固体' }
    ],

    smells: ['正常', '略臭', '很臭', '酸臭', '腥臭', '无味'],
    feelings: ['顺畅', '一般', '费力', '腹痛', '腹胀', '不尽感'],
    durations: ['<1分钟', '1~3分钟', '3~5分钟', '5~10分钟', '10~30分钟', '>30分钟']
  },

  onLoad: function (options) {
    var now = new Date()
    var h = now.getHours()
    var m = now.getMinutes()
    this.setData({
      date: options.date || '',
      time: (h < 10 ? '0' + h : '' + h) + ':' + (m < 10 ? '0' + m : '' + m)
    })
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

  // ==================== 选项 ====================
  onTimeChange: function (e) {
    this.setData({ time: e.detail.value })
  },

  pickColor: function (e) {
    var idx = e.currentTarget.dataset.idx
    this.setData({ colorIndex: this.data.colorIndex === idx ? -1 : idx })
  },

  pickForm: function (e) {
    var idx = e.currentTarget.dataset.idx
    this.setData({ formIndex: this.data.formIndex === idx ? -1 : idx })
  },

  pickSmell: function (e) {
    var idx = e.currentTarget.dataset.idx
    this.setData({ smellIndex: this.data.smellIndex === idx ? -1 : idx })
  },

  pickFeeling: function (e) {
    var idx = e.currentTarget.dataset.idx
    this.setData({ feelingIndex: this.data.feelingIndex === idx ? -1 : idx })
  },

  pickDuration: function (e) {
    var idx = e.currentTarget.dataset.idx
    this.setData({ durationIndex: this.data.durationIndex === idx ? -1 : idx })
  },

  onNote: function (e) {
    this.setData({ note: e.detail.value })
  },

  preventScroll: function () {},

  // ==================== 保存 ====================
  save: function () {
    var d = this.data

    // 验证至少选了类型
    if (d.formIndex < 0) {
      this.showCustomToast('请选择便便类型哦', '😅', 2000)
      return
    }

    var record = {
      id: Date.now(),
      date: d.date,
      time: d.time,
      colorIndex: d.colorIndex,
      colorName: d.colorIndex >= 0 ? d.colors[d.colorIndex].name : '',
      colorHex: d.colorIndex >= 0 ? d.colors[d.colorIndex].hex : '#8D6E63',
      formIndex: d.formIndex,
      formName: d.formIndex >= 0 ? d.forms[d.formIndex].name : '',
      formNum: d.formIndex >= 0 ? d.forms[d.formIndex].num : 0,
      formDesc: d.formIndex >= 0 ? d.forms[d.formIndex].desc : '',
      smellIndex: d.smellIndex,
      smellName: d.smellIndex >= 0 ? d.smells[d.smellIndex] : '',
      feelingIndex: d.feelingIndex,
      feelingName: d.feelingIndex >= 0 ? d.feelings[d.feelingIndex] : '',
      durationIndex: d.durationIndex,
      durationName: d.durationIndex >= 0 ? d.durations[d.durationIndex] : '',
      note: d.note
    }

    var logs = wx.getStorageSync('pooLogs') || []
    logs.push(record)
    wx.setStorageSync('pooLogs', logs)
    app.globalData.pooLogs = logs

    this.showCustomToast('记录成功', '💩✨', 1800)

    setTimeout(function () {
      wx.navigateBack()
    }, 1600)
  }
})
