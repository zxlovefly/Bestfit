const app = getApp()

Page({
  data: {
    tabIndex: 0,
    weekData: [],
    monthData: [],
    totalWeekML: 0,
    totalMonthML: 0,
    weekCompleteDays: 0,
    monthCompleteDays: 0,
    avgWeekML: 0,
    avgMonthML: 0,
    weekCompleteRate: 0,
    monthCompleteRate: 0
  },

  onLoad() {
    this.initStatistics()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ visible: true, selected: 0 })
    }
    this.initStatistics()
  },

  formatDate(date) {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
  },

  initStatistics() {
    this.initWeekData()
    this.initMonthData()
  },

  initWeekData() {
    const weekData = []
    const today = new Date()
    let totalML = 0
    let completeDays = 0

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = this.formatDate(date)
      const records = wx.getStorageSync('waterRecords_' + dateStr) || []
      const dayML = records.reduce((sum, item) => sum + item.ml, 0)
      const target = app.globalData.waterTotalTargetML || 1800
      const isComplete = dayML >= target

      totalML += dayML
      if (isComplete) completeDays++

      weekData.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        ml: dayML,
        percent: target > 0 ? Math.min(Math.round(dayML / target * 100), 100) : 0,
        isComplete: isComplete
      })
    }

    this.setData({
      weekData: weekData,
      totalWeekML: totalML,
      weekCompleteDays: completeDays,
      avgWeekML: Math.round(totalML / 7),
      weekCompleteRate: Math.round(completeDays / 7 * 100)
    })
  },

  initMonthData() {
    const monthData = []
    const today = new Date()
    let totalML = 0
    let completeDays = 0

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = this.formatDate(date)
      const records = wx.getStorageSync('waterRecords_' + dateStr) || []
      const dayML = records.reduce((sum, item) => sum + item.ml, 0)
      const target = app.globalData.waterTotalTargetML || 1800
      const isComplete = dayML >= target

      totalML += dayML
      if (isComplete) completeDays++

      monthData.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        ml: dayML,
        percent: target > 0 ? Math.min(Math.round(dayML / target * 100), 100) : 0,
        isComplete: isComplete
      })
    }

    this.setData({
      monthData: monthData,
      totalMonthML: totalML,
      monthCompleteDays: completeDays,
      avgMonthML: Math.round(totalML / 30),
      monthCompleteRate: Math.round(completeDays / 30 * 100)
    })
  },

  switchTab(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ tabIndex: index })
  }
})