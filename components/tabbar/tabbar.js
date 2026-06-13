const app = getApp()

Component({
  data: {
    selected: 0,
    visible: true
  },

  lifetimes: {
    attached() {
      this._sync()
    }
  },

  pageLifetimes: {
    show() {
      this._sync()
      this.setData({ visible: !app.globalData.playlistVisible })
    }
  },

  methods: {
    _sync() {
      const pages = getCurrentPages()
      const cur = pages[pages.length - 1]
      if (!cur) return
      const route = '/' + cur.route
      const map = {
        '/pages/home/home': 0,
        '/pages/account/account': 1,
        '/pages/ai/ai': 2,
        '/pages/plan/plan': 3,
        '/pages/user/user': 4
      }
      const idx = map[route]
      if (idx !== undefined && idx !== this.data.selected) {
        this.setData({ selected: idx })
      }
    },

    switchTab(e) {
      const idx = Number(e.currentTarget.dataset.index)
      const urls = [
        '/pages/home/home',
        '/pages/account/account',
        '/pages/ai/ai',
        '/pages/plan/plan',
        '/pages/user/user'
      ]
      wx.switchTab({ url: urls[idx] })
    }
  }
})
