var app = getApp()

var WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

Page({
  data: {
    records: [],
    displayRecords: [],
    currentWeight: '0.0',
    bmi: '--',
    bmiLevel: '',
    trendIcon: '→',
    trendDiff: '0.0',
    trendLabel: '持平',
    trendClass: 'flat',
    totalChange: '0.0',
    totalChangeLabel: '变化',
    range: 0,
    latestBodyFat: '',
    latestMuscleMass: '',
    latestWaistline: '',
    hasBodyData: false
  },

  onShow: function () { this._loadData() },

  onReady: function () {
    this._canvasReady = true
    if (this.data.records.length >= 2) {
      var self = this
      setTimeout(function () { self._drawChart() }, 250)
    }
  },

  _loadData: function () {
    var records = []
    try { records = wx.getStorageSync('weightRecords') || [] } catch (e) {}
    records.sort(function (a, b) { return a.date > b.date ? -1 : 1 })

    var userInfo = {}
    try { userInfo = app.globalData.userInfo || {} } catch (e) {}
    if (!userInfo.height) { try { userInfo = wx.getStorageSync('userInfo') || {} } catch (e) {} }
    var height = parseFloat(userInfo.height) || 0

    /* 批量加载身体数据 */
    var bodyCache = {}
    try {
      var storageInfo = wx.getStorageInfoSync()
      var keys = storageInfo.keys || []
      for (var k = 0; k < keys.length; k++) {
        if (keys[k].indexOf('bodyData_') === 0) {
          try {
            bodyCache[keys[k].replace('bodyData_', '')] = wx.getStorageSync(keys[k]) || {}
          } catch (e) {}
        }
      }
    } catch (e) {}

    var display = []
    var latestBodyFat = '', latestMuscleMass = '', latestWaistline = '', hasBodyData = false

    for (var i = 0; i < records.length; i++) {
      var r = records[i]
      var parts = r.date.split('-')
      var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
      var bmiVal = '', bmiLevel = '', bmiClass = ''
      if (height > 0 && r.weight > 0) {
        bmiVal = (r.weight / ((height / 100) * (height / 100))).toFixed(1)
        var bv = parseFloat(bmiVal)
        if (bv < 18.5) { bmiLevel = '偏瘦'; bmiClass = 'underweight' }
        else if (bv < 24) { bmiLevel = '正常'; bmiClass = 'normal' }
        else if (bv < 28) { bmiLevel = '偏胖'; bmiClass = 'overweight' }
        else { bmiLevel = '肥胖'; bmiClass = 'obese' }
      }

      /* 变化量：最后一条（最早）无上一次记录，显示 '--' */
      var change = '--'
      var changeDir = 'none'
      if (i < records.length - 1) {
        var diff = r.weight - records[i + 1].weight
        change = Math.abs(diff).toFixed(1)
        if (diff > 0.005) changeDir = 'up'
        else if (diff < -0.005) changeDir = 'down'
        else changeDir = 'flat'
      }

      var bd = bodyCache[r.date] || {}
      var bodyFat = bd.bodyFat || ''
      var muscleMass = bd.muscleMass || ''
      var waistline = bd.waistline || ''
      var hasBody = !!(bodyFat || muscleMass || waistline)
      if (hasBody) hasBodyData = true

      if (!latestBodyFat && bodyFat) latestBodyFat = bodyFat
      if (!latestMuscleMass && muscleMass) latestMuscleMass = muscleMass
      if (!latestWaistline && waistline) latestWaistline = waistline

      display.push({
        date: r.date,
        dateLabel: parseInt(parts[1]) + '月' + parseInt(parts[2]) + '日',
        weekday: WEEKDAYS[d.getDay()],
        weight: r.weight.toFixed(1),
        bmi: bmiVal,
        bmiLevel: bmiLevel,
        bmiClass: bmiClass,
        change: change,
        changeDir: changeDir,
        bodyFat: bodyFat,
        muscleMass: muscleMass,
        waistline: waistline,
        hasBody: hasBody
      })
    }

    var currentWeight = display.length > 0 ? display[0].weight : '0.0'
    var bmi = '--', bmiLevel = ''
    if (display.length > 0 && display[0].bmi) {
      bmi = display[0].bmi
      bmiLevel = display[0].bmiLevel
    }

    var trendIcon = '→', trendDiff = '0.0', trendLabel = '持平', trendClass = 'flat'
    if (records.length >= 2) {
      var diff = records[0].weight - records[1].weight
      trendDiff = Math.abs(diff).toFixed(1)
      if (diff < -0.05) { trendIcon = '↓'; trendLabel = '下降'; trendClass = 'down' }
      else if (diff > 0.05) { trendIcon = '↑'; trendLabel = '上升'; trendClass = 'up' }
    }

    var totalChange = '0.0', totalChangeLabel = '变化'
    if (records.length >= 2) {
      var tc = records[0].weight - records[records.length - 1].weight
      totalChange = Math.abs(tc).toFixed(1)
      if (tc < -0.05) totalChangeLabel = '减重'
      else if (tc > 0.05) totalChangeLabel = '增重'
      else totalChangeLabel = '变化'
    }

    this.setData({
      records: records,
      displayRecords: display,
      currentWeight: currentWeight,
      bmi: bmi, bmiLevel: bmiLevel,
      trendIcon: trendIcon, trendDiff: trendDiff, trendLabel: trendLabel, trendClass: trendClass,
      totalChange: totalChange, totalChangeLabel: totalChangeLabel,
      range: 0,
      latestBodyFat: latestBodyFat,
      latestMuscleMass: latestMuscleMass,
      latestWaistline: latestWaistline,
      hasBodyData: hasBodyData
    })

    if (this._canvasReady && records.length >= 2) {
      var self = this
      setTimeout(function () { self._drawChart() }, 120)
    }
  },

  setRange: function (e) {
    var range = parseInt(e.currentTarget.dataset.range)
    this.setData({ range: range })
    var self = this
    setTimeout(function () { self._drawChart() }, 80)
  },

  _getChartRecords: function () {
    var all = this.data.records.slice().reverse()
    var range = this.data.range
    if (range > 0) {
      var cutoff = this._fmtDate(new Date(Date.now() - range * 86400000))
      all = all.filter(function (r) { return r.date >= cutoff })
    }
    return all
  },

  _drawChart: function () {
    if (!this._canvasReady) return
    var self = this
    wx.createSelectorQuery().select('#statsChart').fields({ node: true, size: true }).exec(function (res) {
      if (!res || !res[0] || !res[0].node) return
      var canvas = res[0].node, ctx = canvas.getContext('2d'), dpr = 2
      try { dpr = wx.getSystemInfoSync().pixelRatio || 2 } catch (e) {}
      var w = res[0].width, h = res[0].height
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.scale(dpr, dpr)
      self._renderChart(ctx, w, h)
    })
  },

  _renderChart: function (ctx, w, h) {
    var records = this._getChartRecords()
    if (records.length < 2) return

    var pad = { t: 32, r: 24, b: 40, l: 52 }, cw = w - pad.l - pad.r, ch = h - pad.t - pad.b
    var weights = records.map(function (r) { return r.weight })
    var minW = Math.min.apply(null, weights), maxW = Math.max.apply(null, weights)
    var margin = Math.max((maxW - minW) * 0.2, 0.4); minW -= margin; maxW += margin
    var range = maxW - minW || 1

    function xPos(i) { return records.length > 1 ? pad.l + i / (records.length - 1) * cw : pad.l + cw / 2 }
    function yPos(v) { return pad.t + (1 - (v - minW) / range) * ch }
    var points = []; for (var i = 0; i < records.length; i++) points.push({ x: xPos(i), y: yPos(records[i].weight) })

    ctx.clearRect(0, 0, w, h)
    ctx.save(); ctx.setLineDash([4, 4]); ctx.lineWidth = 0.5
    for (var i = 0; i <= 5; i++) { var gy = pad.t + i / 5 * ch; ctx.strokeStyle = '#EEE'; ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(w - pad.r, gy); ctx.stroke(); ctx.fillStyle = '#BBB'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText((maxW - i / 5 * range).toFixed(1), pad.l - 10, gy) }
    ctx.restore()
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = '#BBB'; ctx.font = '10px sans-serif'
    var step = Math.max(1, Math.ceil(records.length / 6)); for (var i = 0; i < records.length; i += step) ctx.fillText(records[i].date.substring(5), xPos(i), h - pad.b + 12)
    var last = records.length - 1; if (last % step !== 0) ctx.fillText(records[last].date.substring(5), xPos(last), h - pad.b + 12)

    function drawSmooth() { ctx.moveTo(points[0].x, points[0].y); if (points.length < 3) { for (var i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y); return }; var tn = 0.3; for (var i = 0; i < points.length - 1; i++) { var p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)]; ctx.bezierCurveTo(p1.x + (p2.x - p0.x) * tn, p1.y + (p2.y - p0.y) * tn, p2.x - (p3.x - p1.x) * tn, p2.y - (p3.y - p1.y) * tn, p2.x, p2.y) } }

    var bottomY = pad.t + ch, grad = ctx.createLinearGradient(0, pad.t, 0, bottomY)
    grad.addColorStop(0, 'rgba(251,114,153,0.18)'); grad.addColorStop(1, 'rgba(251,114,153,0.01)')
    ctx.beginPath(); drawSmooth(); ctx.lineTo(points[points.length - 1].x, bottomY); ctx.lineTo(points[0].x, bottomY); ctx.closePath(); ctx.fillStyle = grad; ctx.fill()

    ctx.save(); ctx.shadowColor = '#FB7299'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4; ctx.beginPath(); drawSmooth(); ctx.strokeStyle = '#FB7299'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore()

    for (var i = 0; i < points.length; i++) { var px = points[i].x, py = points[i].y; ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fillStyle = 'rgba(251,114,153,0.12)'; ctx.fill(); ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fillStyle = '#FB7299'; ctx.fill() }

    if (points.length > 0) { var lp = points[last], lv = records[last].weight.toFixed(1), ly = lp.y - 22; if (ly < pad.t + 10) ly = lp.y + 22; ctx.font = 'bold 11px sans-serif'; var tw = ctx.measureText(lv).width, pw = tw + 16, ph = 22, pr2 = 11, px2 = lp.x - pw / 2, py2 = ly - ph / 2; ctx.beginPath(); ctx.moveTo(px2 + pr2, py2); ctx.lineTo(px2 + pw - pr2, py2); ctx.arcTo(px2 + pw, py2, px2 + pw, py2 + pr2, pr2); ctx.lineTo(px2 + pw, py2 + ph - pr2); ctx.arcTo(px2 + pw, py2 + ph, px2 + pw - pr2, py2 + ph, pr2); ctx.lineTo(px2 + pr2, py2 + ph); ctx.arcTo(px2, py2 + ph, px2, py2 + ph - pr2, pr2); ctx.lineTo(px2, py2 + pr2); ctx.arcTo(px2, py2, px2 + pr2, py2, pr2); ctx.closePath(); ctx.fillStyle = '#FB7299'; ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lv, lp.x, ly) }
  },

  _fmtDate: function (d) { var m = (d.getMonth() + 1).toString(), dd = d.getDate().toString(); if (m.length < 2) m = '0' + m; if (dd.length < 2) dd = '0' + dd; return d.getFullYear() + '-' + m + '-' + dd }
})
