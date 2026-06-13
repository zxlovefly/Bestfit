const app = getApp()
const fmtDate = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

Page({
  data: { weight: '', list: [] },
  onShow() { this.loadData() },
  onWeight(e) { this.setData({ weight: e.detail.value }) },

  saveWeight() {
    const w = Number(this.data.weight)
    if (!w || w < 20 || w > 300) { wx.showToast({ title: '请输入20–300有效体重', icon: 'none' }); return }
    let list = wx.getStorageSync('weightList')
    if (!Array.isArray(list)) list = []
    list = list.filter(item => item && item.date !== fmtDate())
    list.push({ date: fmtDate(), weight: w })
    wx.setStorageSync('weightList', list)

    const profile = app.getProfile() || {}
    profile.weight = w
    app.saveProfile(profile)
    this.updateDayLog('weight', w)

    wx.showToast({ title: '体重保存成功', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 1000)
  },

  loadData() {
    let all = wx.getStorageSync('weightList')
    if (!Array.isArray(all)) all = []
    all.sort((a, b) => new Date(a.date) - new Date(b.date))
    this.setData({ list: all.slice(-7) })
    this.drawChart(this.data.list)
  },

  drawChart(list) {
    if (!list || !Array.isArray(list) || list.length < 1) return
    const ctx = wx.createCanvasContext('weightCanvas')
    const [w, h, p] = [680, 220, 30]
    ctx.clearRect(0, 0, w, h)
    const vals = list.map(item => Number(item.weight || 0))
    const max = Math.max(...vals) + 2
    const min = Math.min(...vals) - 2
    const range = max - min || 1
    const dx = (w - p * 2) / (list.length - 1 || 1)
    ctx.beginPath()
    ctx.setStrokeStyle('#ff7fa8')
    ctx.setLineWidth(3)
    list.forEach((item, i) => {
      const x = p + i * dx
      const y = h - p - (Number(item.weight || 0) - min) / range * (h - p * 2)
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      ctx.fillStyle = '#ff7fa8'
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, 2 * Math.PI)
      ctx.fill()
    })
    ctx.stroke()
    ctx.draw(true)
  },

  updateDayLog(type, value) {
    let logs = app.getAllLogs()
    if (!Array.isArray(logs)) logs = []
    const today = fmtDate()
    let dayLog = logs.find(item => item && item.date === today) || { date: today, intake: { cal: 0 }, burn: 0, weight: '', height: '' }
    dayLog[type] = value
    if (!logs.find(item => item && item.date === today)) logs.push(dayLog)
    app.saveLogs(logs)
  }
})