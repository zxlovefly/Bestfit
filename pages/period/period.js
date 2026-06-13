const app = getApp()
Page({
  data:{
    nextPeriod:'',ovulationDate:'',periodDiff:'',isRemind:true,
    symptoms:[
      {text:'😣 痛经',selected:false},{text:'😴 疲倦',selected:true},
      {text:'😤 易怒',selected:false},{text:'🍰 食欲增加',selected:false},
      {text:'🤕 头痛',selected:false},{text:'💧 水肿',selected:false}
    ],
    periodLogs:[]
  },
  onShow(){
    const g = app.globalData
    const now = new Date()
    const next = new Date(g.nextPeriodDate)
    const diff = Math.round((next-now)/(24*60*60*1000))
    this.setData({
      nextPeriod:g.nextPeriodDate,
      ovulationDate:g.ovulationDate,
      periodDiff:diff,
      isRemind:g.isRemind,
      periodLogs:g.periodLogs
    })
    // 智能经期提示
    let tipTitle,tipDesc
    if(diff>7){
      tipTitle='卵泡期 · 黄金减脂期',tipDesc='代谢高，适合高强度运动，正常控制饮食即可'
    }else if(diff<=7&&diff>0){
      tipTitle='经期前 · 黄体期',tipDesc='易水肿、食欲上涨，减少高糖高盐，运动降低强度，注意补铁'
    }else{
      tipTitle='经期中',tipDesc='多休息、保暖，禁止剧烈运动，多吃红肉、菠菜补铁'
    }
    this.setData({tipTitle,tipDesc})
  },
  toggleRemind(){
    const g = app.globalData
    g.isRemind = !g.isRemind
    this.setData({isRemind:g.isRemind})
    wx.showToast({title:g.isRemind?'已开启经期提醒':'已关闭提醒',icon:'none'})
  },
  toggleSymptom(e){
    const idx = e.currentTarget.dataset.index
    const arr = this.data.symptoms
    arr[idx].selected = !arr[idx].selected
    this.setData({symptoms:arr})
  },
  goLogPeriod(){wx.navigateTo({url:'/pages/period/log-period'})}
})