const app = getApp()
Page({
  data:{weight:''},
  back(){wx.navigateBack()},
  setWeight(e){this.setData({weight:e.detail.value})},
  submit(){
    const w = Number(this.data.weight)
    if(!w) return wx.showToast({title:'请输入体重',icon:'none'})
    app.globalData.weightLogs.push({date:new Date().toLocaleDateString(),weight:w})
    app.globalData.userInfo.weight = w
    wx.showToast({title:'体重记录成功',icon:'success'})
    setTimeout(()=>wx.navigateBack(),600)
  }
})