const app = getApp()
Page({
  data:{
    startDate:'',cycle:28,from:''
  },
  onLoad(opt){
    const g = app.globalData
    this.setData({
      startDate:g.userInfo.lastPeriodDate || '2025-05-01',
      cycle:g.userInfo.cycle || 28,
      from:opt.from || ''
    })
  },
  back(){
    wx.navigateBack()
  },
  setStart(e){this.setData({startDate:e.detail.value})},
  setCycle(e){this.setData({cycle:e.detail.value})},
  submit(){
    const {startDate,cycle} = this.data
    if(!startDate||!cycle) return wx.showToast({title:'请完善信息',icon:'none'})

    app.globalData.userInfo.lastPeriodDate = startDate
    app.globalData.userInfo.cycle = Number(cycle)
    app.calcTargetCalorie()
    app.calcPeriodPredict()

    wx.showToast({title:'完成设置 ✨',icon:'success'})
    setTimeout(()=>{
      wx.switchTab({url:'/pages/home/home'})
    },600)
  }
})