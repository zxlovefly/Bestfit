// pages/profile/profile.js
const app = getApp()

const ACT_KEYS = ['sedentary', 'light', 'moderate', 'active']
const GOAL_KEYS = ['lose', 'gain', 'maintain', 'maintain']

Page({
  data: {
    isEdit: false,
    nickname: '小柠',
    gender: '',
    age: '',
    height: '',
    weight: '',
    goal: 0,
    act: 0
  },

  onLoad(options) {
    const isEdit = options && options.edit === '1'
    this.setData({ isEdit })

    if (isEdit) {
      const u = app.globalData.userInfo || {}
      this.setData({
        nickname: u.nickname || '小柠',
        gender: u.gender || '',
        age: u.age ? String(u.age) : '',
        height: u.height ? String(u.height) : '',
        weight: u.weight ? String(u.weight) : '',
        goal: typeof u.goal === 'number' ? u.goal : 0,
        act: typeof u.activity === 'number' ? u.activity : 0
      })
    }
  },

  setNickname(e) { this.setData({ nickname: e.detail.value }) },
  setGender(e) { this.setData({ gender: e.currentTarget.dataset.g }) },
  setAge(e) { this.setData({ age: e.detail.value }) },
  setHeight(e) { this.setData({ height: e.detail.value }) },
  setWeight(e) { this.setData({ weight: e.detail.value }) },
  setGoal(e) { this.setData({ goal: parseInt(e.currentTarget.dataset.i) }) },
  setAct(e) { this.setData({ act: parseInt(e.currentTarget.dataset.i) }) },

  save() {
    const d = this.data

    if (!d.nickname.trim()) {
      wx.showToast({ title: '请填写昵称', icon: 'none' }); return
    }
    if (!d.gender) {
      wx.showToast({ title: '请选择性别', icon: 'none' }); return
    }
    if (!d.age) {
      wx.showToast({ title: '请填写年龄', icon: 'none' }); return
    }
    if (!d.height || isNaN(Number(d.height))) {
      wx.showToast({ title: '请填写身高', icon: 'none' }); return
    }
    if (!d.weight || isNaN(Number(d.weight))) {
      wx.showToast({ title: '请填写体重', icon: 'none' }); return
    }

    const u = app.globalData.userInfo
    u.nickname = d.nickname.trim()
    u.gender = d.gender
    u.age = Number(d.age)
    u.height = Number(d.height)
    u.weight = Number(d.weight)
    u.goal = d.goal
    u.activity = d.act
    u.activityLevel = ACT_KEYS[d.act] || 'sedentary'
    u.goalKey = GOAL_KEYS[d.goal] || 'maintain'

    if (!u.registerDate) {
      u.registerDate = app.formatDate(new Date())
    }

    app.calcTargetCalorie()

    try { wx.setStorageSync('userInfo', u) } catch (e) {}

    wx.showToast({ title: '保存成功', icon: 'success' })

    setTimeout(() => {
      if (d.isEdit) {
        wx.navigateBack()
      } else {
        wx.switchTab({ url: '/pages/home/home' })
      }
    }, 600)
  }
})
