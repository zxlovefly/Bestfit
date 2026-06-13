App({
  globalData: {
    userInfo: {
      gender: '', nickname: '', age: '', height: '', weight: '',
      targetWeight: '', goal: '', activity: '', cycle: '',
      periodDays: '', lastPeriodDate: '', registerDate: '',
      activityLevel: '', goalKey: ''
    },
    calorieTarget: 3130, calorieIntake: 0, calorieBurn: 0, calorieSurplus: 0,
    tdeeDetail: { bmr: 0, tdee: 0, exerciseCal: 0, dailyBurn: 0, adjust: 0, target: 0 },
    todayFood: { breakfast: [], lunch: [], dinner: [], snack: [] },
    todaySport: [], weightLogs: [], periodLogs: [],
    nextPeriodDate: '', ovulationDate: '', isRemind: true,
    waterTotalTargetML: 1800, waterTodayML: 0, waterCupML: 225, waterRecords: [],
    pooLogs: [], todayPlan: {},

    audioCtx: null, audioStarted: false,
    isPlaying: false, isMuted: false,
    currentTrackIndex: 0, loopMode: 'all',
    playlistTheme: 'pink',

    playlistVisible: false,

    customTracks: [],
    trackList: []
  },

  _ACT_KEYS: ['sedentary', 'light', 'moderate', 'active'],
  _GOAL_KEYS: ['lose', 'gain', 'maintain', 'maintain'],
  _ACT_MULTI: [1.2, 1.375, 1.55, 1.725],
  _GOAL_ADJ: [-500, 400, 0, 0],

  _getCleanMusicName(rawName, tempPath) {
    let name = (rawName || '').trim()
    if (/^wq[_-]/i.test(name) && tempPath) {
      const fromPath = tempPath.split('/').pop().split('\\').pop()
      if (fromPath && !/^wq[_-]/i.test(fromPath)) name = fromPath
    }
    if (!name && tempPath) name = tempPath.split('/').pop().split('\\').pop()
    name = name.split('/').pop().split('\\').pop()
    name = name.replace(/\.(mp3|wav|m4a|aac|flac|ogg|wma)$/i, '')
    name = name.replace(/^wq[_-]/i, '')
    return name.trim() || '未知歌曲'
  },

  calcTargetCalorie() {
    const u = this.globalData.userInfo
    if (!u.weight || !u.height || !u.age) return
    let bmr = u.gender === 'female'
      ? 10 * u.weight + 6.25 * u.height - 5 * u.age - 161
      : 10 * u.weight + 6.25 * u.height - 5 * u.age + 5
    const ai = typeof u.activity === 'number' ? u.activity : 0
    const gi = typeof u.goal === 'number' ? u.goal : 2
    const mult = this._ACT_MULTI[ai] || 1.2
    const adj = this._GOAL_ADJ[gi] || 0
    const ex = this.globalData.calorieBurn || 0
    const tdee = Math.round(bmr * mult)
    const db = tdee + ex
    let t = Math.round(db + adj)
    if (u.gender === 'female' && t < 1200) t = 1200
    if (u.gender === 'male' && t < 1500) t = 1500
    this.globalData.calorieTarget = t
    u.activityLevel = this._ACT_KEYS[ai] || 'sedentary'
    u.goalKey = this._GOAL_KEYS[gi] || 'maintain'
    this.globalData.tdeeDetail = {
      bmr: Math.round(bmr), tdee, exerciseCal: ex,
      dailyBurn: db, adjust: adj, target: t
    }
  },

  calcSurplus() {
    const { calorieIntake, calorieBurn } = this.globalData
    this.globalData.calorieSurplus = calorieIntake - calorieBurn
  },

  calcPeriodPredict() {
    const { lastPeriodDate, cycle } = this.globalData.userInfo
    if (!lastPeriodDate || !cycle) return
    const l = new Date(lastPeriodDate)
    const n = new Date(l.getTime() + cycle * 864e5)
    const o = new Date(n.getTime() - 14 * 864e5)
    this.globalData.nextPeriodDate = this.formatDate(n)
    this.globalData.ovulationDate = this.formatDate(o)
    const d = Math.round((n - new Date()) / 864e5)
    if (d <= 5 && d > 0 && this.globalData.isRemind) {
      wx.showModal({ title: '经期提醒 🌸', content: `距离下次经期还有${d}天`, confirmText: '知道啦', showCancel: false })
    }
  },

  generateTodayPlan() {
    const u = this.globalData.userInfo
    let fp, sp, pt
    if (u.goal === 0) {
      const d = new Date().getDate()
      fp = d % 3 === 0 ? '碳循环高碳日·鸡胸肉+杂粮饭·480千卡'
        : d % 3 === 1 ? '碳水渐降·鱼虾+红薯·420千卡'
        : '低碳日·牛肉+菌菇·380千卡'
      sp = '有氧瑜伽/慢跑·30分钟'
    } else if (u.goal === 1) {
      fp = '增肌高蛋白餐·牛排+意面·650千卡'; sp = '力量训练·45分钟'
    } else {
      fp = '均衡营养餐·500千卡'; sp = '快走/拉伸·25分钟'
    }
    if (u.gender === 'female') {
      const d = Math.round((new Date(this.globalData.nextPeriodDate) - new Date()) / 864e5)
      pt = d > 7 ? '卵泡期减脂期' : d > 0 ? `经期倒计时${d}天` : '经期中·减少剧烈运动'
    } else { pt = '' }
    this.globalData.todayPlan = { food: fp, sport: sp, periodTip: pt }
  },

  getTimeGreet() {
    const h = new Date().getHours()
    return h >= 5 && h < 12 ? '早安' : h >= 12 && h < 18 ? '午安' : '晚安'
  },

  getJourneyDays() {
    if (!this.globalData.userInfo.registerDate) this.globalData.userInfo.registerDate = this.formatDate(new Date())
    const r = new Date(this.globalData.userInfo.registerDate), n = new Date()
    r.setHours(0,0,0,0); n.setHours(0,0,0,0)
    return Math.floor((n - r) / 864e5) + 1 || 1
  },

  formatDate(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
  },

  _todayKey() {
    const n = new Date()
    return n.getFullYear() + '-' + (n.getMonth() + 1) + '-' + n.getDate()
  },

  _mergeTrackList() {
    this.globalData.trackList = [...this.globalData.customTracks]
  },

  _createAudio() {
    const g = this.globalData
    const ctx = wx.createInnerAudioContext()
    ctx.loop = false
    ctx.volume = 1.0
    this._errSkip = 0

    ctx.onCanplay(() => console.log('[Audio] 可播放'))

    ctx.onPlay(() => {
      g.isPlaying = true
      this._errSkip = 0
    })

    ctx.onPause(() => { g.isPlaying = false })
    ctx.onStop(() => { g.isPlaying = false })

    ctx.onEnded(() => {
      this._errSkip = 0
      this._playNext()
    })

    ctx.onError((e) => {
      console.error('[Audio] 错误:', JSON.stringify(e))
      g.isPlaying = false
      this._errSkip++

      if (this._errSkip >= 3) {
        wx.showToast({ title: '已自动跳过损坏歌曲', icon: 'none' })
        this._errSkip = 0
      }

      const currentTrack = g.trackList[g.currentTrackIndex]
      if (currentTrack && currentTrack.custom) {
        this.removeCustomTrack(g.currentTrackIndex)
      } else {
        if (g.trackList.length > 1) {
          g.currentTrackIndex = (g.currentTrackIndex + 1) % g.trackList.length
          ctx.stop()
          this._ensureSrc(g.currentTrackIndex)
          ctx.volume = g.isMuted ? 0 : 1
          ctx.play()
          wx.setStorageSync('currentTrackIndex', g.currentTrackIndex)
        } else {
          wx.showToast({ title: '歌曲无法播放', icon: 'none' })
        }
      }
    })

    g.audioCtx = ctx
  },

  _ensureSrc(idx) {
    const g = this.globalData, ctx = g.audioCtx
    if (!ctx || !g.trackList[idx]) return false
    ctx.src = g.trackList[idx].src; return true
  },

  _playNext() {
    const g = this.globalData, ctx = g.audioCtx
    if (!ctx || g.trackList.length === 0) return
    if (g.loopMode === 'single') {
      ctx.stop(); this._ensureSrc(g.currentTrackIndex)
      ctx.volume = g.isMuted ? 0 : 1; ctx.play()
    } else {
      g.currentTrackIndex = (g.currentTrackIndex + 1) % g.trackList.length
      ctx.stop(); this._ensureSrc(g.currentTrackIndex)
      ctx.volume = g.isMuted ? 0 : 1; ctx.play()
    }
    wx.setStorageSync('currentTrackIndex', g.currentTrackIndex)
  },

  playTrack(idx) {
    const g = this.globalData, ctx = g.audioCtx
    if (!ctx || !g.trackList[idx]) return
    g.currentTrackIndex = idx; ctx.stop(); this._ensureSrc(idx)
    ctx.volume = g.isMuted ? 0 : 1; ctx.play()
    wx.setStorageSync('currentTrackIndex', idx)
  },

  playPrev() {
    const g = this.globalData, ctx = g.audioCtx
    if (!ctx || g.trackList.length === 0) return
    g.currentTrackIndex = (g.currentTrackIndex - 1 + g.trackList.length) % g.trackList.length
    ctx.stop(); this._ensureSrc(g.currentTrackIndex)
    ctx.volume = g.isMuted ? 0 : 1; ctx.play()
  },

  playNextManual() { this._playNext() },

  initAndPlay() {
    const g = this.globalData
    if (!g.audioCtx) this._createAudio()
    this._ensureSrc(g.currentTrackIndex)
    g.audioCtx.volume = g.isMuted ? 0 : 1; g.audioCtx.play()
    g.isPlaying = true
    g.audioStarted = true
  },

  toggleMute() {
    const ctx = this.globalData.audioCtx
    if (!ctx) return { isPlaying: false, isMuted: true }
    this.globalData.isMuted = !this.globalData.isMuted
    ctx.volume = this.globalData.isMuted ? 0 : 1
    return { isPlaying: this.globalData.isPlaying, isMuted: this.globalData.isMuted }
  },

  toggleLoopMode() {
    this.globalData.loopMode = this.globalData.loopMode === 'all' ? 'single' : 'all'
    wx.setStorageSync('loopMode', this.globalData.loopMode)
    return this.globalData.loopMode
  },

  importPickedFiles(tempFiles, callback) {
    if (!tempFiles || tempFiles.length === 0) { callback && callback({ ok: 0, fail: 0, skipped: 0, cancelled: true }); return }
    this._handleFileResult({ tempFiles: tempFiles }, callback)
  },

  importMp3Files(callback) {
    if (typeof wx.chooseMessageFile === 'function') {
      try {
        wx.chooseMessageFile({
          count: 100, type: 'file', extension: ['mp3'],
          success: (res) => this._handleFileResult(res, callback),
          fail: (err) => {
            const msg = (err && err.errMsg) || ''
            if (msg.indexOf('cancel') !== -1) callback && callback({ ok: 0, fail: 0, skipped: 0, cancelled: true })
            else this._fallbackChooseFile(callback)
          }
        }); return
      } catch (e) { this._fallbackChooseFile(callback); return }
    }
    this._fallbackChooseFile(callback)
  },

  _fallbackChooseFile(callback) {
    if (typeof wx.chooseFile === 'function') {
      wx.chooseFile({
        count: 100, type: 'file', extension: ['mp3'],
        success: (res) => {
          const files = (res.tempFiles || []).map(f => ({ path: f.path, size: f.size, name: f.name || '' }))
          this._handleFileResult({ tempFiles: files }, callback)
        },
        fail: () => callback && callback({ ok: 0, fail: 0, skipped: 0, unsupported: true })
      })
    } else callback && callback({ ok: 0, fail: 0, skipped: 0, unsupported: true })
  },

  _handleFileResult(res, callback) {
    const MIN = 10 * 1024, MAX = 20 * 1024 * 1024
    const all = res.tempFiles || []
    const valid = all.filter(f => f.size >= MIN && f.size <= MAX)
    const skipped = all.length - valid.length
    if (valid.length === 0) { callback && callback({ ok: 0, fail: 0, skipped, cancelled: false }); return }
    let done = 0, ok = 0, fail = 0, batch = []
    valid.forEach(file => {
      const tempPath = file.path || file.tempFilePath || ''
      const origName = (file.name || '').trim()
      let title = this._getCleanMusicName(origName, tempPath)
      wx.saveFile({
        tempFilePath: tempPath,
        success: (sr) => {
          batch.push({ title, src: sr.savedFilePath, custom: true, origName: origName })
          ok++
        },
        fail: () => { fail++ },
        complete: () => {
          done++
          if (done >= valid.length) {
            if (batch.length > 0) {
              this.globalData.customTracks = this.globalData.customTracks.concat(batch)
              this._mergeTrackList()
              wx.setStorageSync('customTracks', this.globalData.customTracks)
            }
            callback && callback({ ok, fail, skipped, cancelled: false })
          }
        }
      })
    })
  },

  addCustomTrack(title, fp, origName) {
    const t = { title, src: fp, custom: true, origName: origName || '' }
    this.globalData.customTracks.push(t)
    this.globalData.trackList.push(t)
    wx.setStorageSync('customTracks', this.globalData.customTracks)
    return this.globalData.trackList.length - 1
  },

  removeCustomTrack(idx) {
    const g = this.globalData
    const track = g.trackList[idx]
    if (!track || !track.custom) return false
    const wasCurrentPlaying = (idx === g.currentTrackIndex)
    g.trackList.splice(idx, 1)
    g.customTracks = g.customTracks.filter(item => item.src !== track.src)
    if (g.trackList.length === 0) {
      g.currentTrackIndex = 0
    } else if (idx < g.currentTrackIndex) {
      g.currentTrackIndex--
    } else if (g.currentTrackIndex >= g.trackList.length) {
      g.currentTrackIndex = g.trackList.length - 1
    }
    wx.setStorageSync('customTracks', g.customTracks)
    wx.setStorageSync('currentTrackIndex', g.currentTrackIndex)
    if (wasCurrentPlaying && g.audioCtx) {
      g.audioCtx.stop()
      g.isPlaying = false
      if (g.trackList.length > 0) {
        this._ensureSrc(g.currentTrackIndex)
        g.audioCtx.volume = g.isMuted ? 0 : 1
        g.audioCtx.play()
        g.isPlaying = true
      }
    }
    return true
  },

  removeCustomTracks(indices) {
    const g = this.globalData
    const sorted = [...indices].sort((a, b) => b - a)
    const playingSrc = g.trackList[g.currentTrackIndex] ? g.trackList[g.currentTrackIndex].src : null
    const deletedSrcs = new Set()
    sorted.forEach(idx => {
      const track = g.trackList[idx]
      if (!track || !track.custom) return
      deletedSrcs.add(track.src)
      g.trackList.splice(idx, 1)
    })
    g.customTracks = g.customTracks.filter(item => !deletedSrcs.has(item.src))
    if (g.trackList.length === 0) {
      g.currentTrackIndex = 0
    } else if (deletedSrcs.has(playingSrc)) {
      g.currentTrackIndex = Math.min(g.currentTrackIndex, g.trackList.length - 1)
      if (g.audioCtx) {
        g.audioCtx.stop(); g.isPlaying = false
        this._ensureSrc(g.currentTrackIndex)
        g.audioCtx.volume = g.isMuted ? 0 : 1
        g.audioCtx.play(); g.isPlaying = true
      }
    } else {
      const newIdx = g.trackList.findIndex(t => t.src === playingSrc)
      g.currentTrackIndex = newIdx >= 0 ? newIdx : 0
    }
    wx.setStorageSync('customTracks', g.customTracks)
    wx.setStorageSync('currentTrackIndex', g.currentTrackIndex)
  },

  getCurrentTrack() {
    const g = this.globalData, t = g.trackList[g.currentTrackIndex]
    return { title: t ? t.title : '未知', index: g.currentTrackIndex, total: g.trackList.length, loopMode: g.loopMode }
  },

  /* ==================================================================
     ★ 新增：通知初始化 + 本地通知 + 全局提醒（仅此区域为新增代码）
     ================================================================== */

  _notifyReady: false,

  _initNotification: function () {
    var methods = [
      function () { if (typeof wx.createNotification === 'function') return 'createNotification' },
      function () { if (typeof wx.getNotificationManager === 'function') return 'getNotificationManager' },
      function () { if (typeof wx.nativeNotification === 'function') return 'nativeNotification' },
      function () { if (typeof wx.showNotify === 'function') return 'showNotify' }
    ]
    for (var i = 0; i < methods.length; i++) {
      try {
        var name = methods[i]()
        if (name) {
          this._notifyMethod = name
          this._notifyReady = true
          console.log('[Reminder] 通知方式:', name)
          return
        }
      } catch (e) {}
    }
    console.log('[Reminder] 无本地通知 API，将使用应用内弹窗')
  },

  _sendLocalNotification: function (title, content) {
    var m = this._notifyMethod
    try {
      if (m === 'createNotification') {
        var n = wx.createNotification({ title: title, content: content, vibrate: true, sound: 'default', autoCancel: true })
        if (n) { n.show(); return true }
      }
      if (m === 'getNotificationManager') {
        var mgr = wx.getNotificationManager()
        if (mgr && typeof mgr.notify === 'function') {
          mgr.notify({ title: title, content: content, vibrate: true, autoCancel: true })
          return true
        }
      }
      if (m === 'nativeNotification') {
        wx.nativeNotification({ title: title, body: content, vibrate: true, sound: 'default' })
        return true
      }
      if (m === 'showNotify') {
        wx.showNotify({ title: title, content: content, autoCancel: true })
        return true
      }
    } catch (e) {
      console.warn('[Reminder] 通知发送失败:', e)
    }
    return false
  },

  _startGlobalReminder: function () {
    var that = this
    setTimeout(function () {
      that._checkGlobalReminder()
      setInterval(function () { that._checkGlobalReminder() }, 60000)
    }, 15000)
  },

  _checkGlobalReminder: function () {
    var that = this
    function pad(n) { return n < 10 ? '0' + n : '' + n }
    function fmtDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) }
    function toMin(s) { var p = s.split(':'); return parseInt(p[0]) * 60 + parseInt(p[1]) }

    var enabled = wx.getStorageSync('clockEnabled')
    if (!enabled) return

    var now = new Date()
    var cur = pad(now.getHours()) + ':' + pad(now.getMinutes())
    var today = fmtDate(now)
    if (wx.getStorageSync('clockLastReminderDate') === today) return

    var reminderTime = wx.getStorageSync('clockReminderTime') || '22:00'
    if (toMin(cur) < toMin(reminderTime) - 2) return

    var itemEnabled = wx.getStorageSync('clockItemEnabled') || {
      account: true, diet: true, exercise: true, poo: true, water: true, period: true
    }
    var missing = []

    if (itemEnabled.account !== false) {
      var allRec = wx.getStorageSync('accountRecords') || []
      if (!allRec.some(function (r) { return r.date && r.date.startsWith(today) })) {
        missing.push('记账')
      }
    }
    if (itemEnabled.diet !== false) {
      var foodRec = wx.getStorageSync('foodRecords') || {}
      var tf = foodRec[today]; var has = false
      if (tf) { for (var k in tf) { if (tf[k] && tf[k].length) { has = true; break } } }
      if (!has) missing.push('饮食')
    }
    if (itemEnabled.exercise !== false) {
      var exRec = that.globalData.exerciseRecords || wx.getStorageSync('exerciseRecords') || []
      if (!exRec.some(function (r) { return r.date === today })) missing.push('运动')
    }
    if (itemEnabled.poo !== false) {
      var pooLogs = that.globalData.pooLogs || wx.getStorageSync('pooLogs') || []
      if (!pooLogs.some(function (r) { return r.date === today })) missing.push('便便')
    }
    if (itemEnabled.water !== false) {
      var waterH = wx.getStorageSync('waterHistory') || {}
      var tw = waterH[today]
      if (!(tw && tw.totalML > 0)) missing.push('饮水')
    }
    if (itemEnabled.period !== false) {
      var syms = that.globalData.dailySymptoms || {}
      if (!(syms[today] && syms[today].length)) missing.push('经期')
    }

    var periodWarn = ''
    var npd = that.globalData.nextPeriodDate
    if (npd) {
      var nextP = new Date(npd + 'T00:00:00')
      var du = Math.ceil((nextP - now) / 86400000)
      if (du === 0) periodWarn = '今天可能是经期开始日，请做好准备'
      else if (du === 1) periodWarn = '明天可能来经期，请注意休息'
      else if (du >= 2 && du <= 3) periodWarn = '还有' + du + '天来经期，请注意保暖'
    }

    if (missing.length === 0 && !periodWarn) return

    wx.setStorageSync('clockLastReminderDate', today)

    var title = '🔔 健康记录提醒'
    var content = ''
    if (missing.length > 0) {
      content = '今日还有 ' + missing.length + ' 项未记录：' + missing.join('、')
    }
    if (periodWarn) {
      content += (content ? '\n' : '') + '🌸 ' + periodWarn
    }

    var sent = that._sendLocalNotification(title, content)

    if (!sent) {
      wx.showModal({
        title: title,
        content: content,
        confirmText: '去记录',
        confirmColor: '#9B8FE8',
        cancelText: '稍后',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/clock/clock' })
          }
        }
      })
    }
  },

  /* ==================================================================
     ★ 原有 onLaunch，在末尾追加了两行初始化调用
     ================================================================== */

  onLaunch() {
    try {
      const s = wx.getStorageSync('userInfo')
      if (s && s.nickname) {
        const u = this.globalData.userInfo
        for (let k in s) if (s[k] !== undefined && s[k] !== '') u[k] = s[k]
        if (!u.activityLevel) u.activityLevel = this._ACT_KEYS[u.activity] || 'sedentary'
        if (!u.goalKey) u.goalKey = this._GOAL_KEYS[u.goal] || 'maintain'
      }
    } catch (e) {}
    if (!this.globalData.userInfo.registerDate) this.globalData.userInfo.registerDate = this.formatDate(new Date())
    const tk = this._todayKey()
    if (wx.getStorageSync('waterDate') === tk) {
      this.globalData.waterTodayML = wx.getStorageSync('waterTodayML') || 0
      this.globalData.waterRecords = wx.getStorageSync('waterRecords') || []
    } else {
      this.globalData.waterTodayML = 0; this.globalData.waterRecords = []
      wx.setStorageSync('waterDate', tk); wx.setStorageSync('waterTodayML', 0); wx.setStorageSync('waterRecords', [])
    }
    const st = wx.getStorageSync('waterTotalTargetML')
    if (st) this.globalData.waterTotalTargetML = st
    this.calcTargetCalorie(); this.calcPeriodPredict(); this.generateTodayPlan()
    this.globalData.customTracks = wx.getStorageSync('customTracks') || []
    this._mergeTrackList()
    this.globalData.loopMode = wx.getStorageSync('loopMode') || 'all'
    this.globalData.currentTrackIndex = wx.getStorageSync('currentTrackIndex') || 0
    if (this.globalData.currentTrackIndex >= this.globalData.trackList.length) this.globalData.currentTrackIndex = 0
    this.globalData.playlistTheme = wx.getStorageSync('playlistTheme') || 'pink'
    this._createAudio()

    /* ★ 新增：初始化通知 + 启动全局提醒（仅这两行） */
    this._initNotification()
    this._startGlobalReminder()
  }
})
