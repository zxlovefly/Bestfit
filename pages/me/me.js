const app = getApp()
Page({
  data:{
    loseWeight:'-3.2',
    completeRate:92,
    periodDiff:'',
    weightChartData:[85,80,78,75,73,70,68,65,63,62,60,58,57,55]
  },
  onShow(){
    const g = app.globalData
    const now = new Date()
    const next = new Date(g.nextPeriodDate)
    const diff = Math.round((next-now)/(24*60*60*1000))
    this.setData({periodDiff:diff})
  },
  goWeightLog(){wx.navigateTo({url:'/pages/me/weight-log'})},
  goPeriod(){wx.switchTab({url:'/pages/period/period'})}
})