var app = getApp()

Component({
  data: {
    selected: 2,
    visible: true,
    tabs: [
      { key: 'home',    icon: '🏠', text: '首页',     url: '/pages/home/home',       index: 0 },
      { key: 'account', icon: '💬', text: '记账',     url: '/pages/account/account', index: 1 },
      { key: 'ai',      icon: '',   text: '智慧生活', url: '/pages/ai/ai',           index: 2, center: true },
      { key: 'plan',    icon: '📋', text: '计划',     url: '/pages/plan/plan',       index: 3 },
      { key: 'user',    icon: '👤', text: '我的',     url: '/pages/user/user',       index: 4 }
    ]
  },

  pageLifetimes: {
    show: function () {
      var pages = getCurrentPages()
      var cur = pages[pages.length - 1]
      if (!cur) return
      var idx = this.data.tabs.findIndex(function (t) {
        return t.url === '/' + cur.route
      })
      if (idx >= 0 && idx !== this.data.selected) {
        this.setData({ selected: idx })
      }
    }
  },

  methods: {
    switchTab: function (e) {
      var idx = Number(e.currentTarget.dataset.index)
      if (!this.data.tabs[idx]) return
      this.setData({ selected: idx })
      wx.switchTab({ url: this.data.tabs[idx].url })
    }
  }
})
