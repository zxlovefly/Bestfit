Page({
  data: {
    url: '',
    loadError: false
  },

  onLoad(options) {
    this.setData({
      url: decodeURIComponent(options.url || '')
    })
  },

  onError() {
    this.setData({ loadError: true })
  },

  goBack() {
    wx.navigateBack({
      fail: () => wx.switchTab({ url: '/pages/home/home' })
    })
  },

  copyLink() {
    wx.setClipboardData({
      data: this.data.url,
      success() {
        wx.showToast({ title: '已复制~', icon: 'none' })
      }
    })
  }
})
