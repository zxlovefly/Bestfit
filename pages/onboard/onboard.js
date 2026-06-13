Page({
  data: {
    // 生成30片随机花瓣
    petalList: []
  },
  onLoad() {
    const list = []
    for (let i = 0; i < 30; i++) {
      list.push({
        left: Math.random() * 100,
        delay: Math.random() * 8,
        size: 16 + Math.random() * 24,
        duration: 6 + Math.random() * 6
      })
    }
    this.setData({ petalList: list })
  },
  goToProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    })
  }
})