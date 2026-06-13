var app = getApp()

var SYSTEM_AVATARS = [
  { emoji: '🐱', name: '小猫咪' },
  { emoji: '🐶', name: '小狗狗' },
  { emoji: '🐼', name: '大熊猫' },
  { emoji: '🦊', name: '小狐狸' },
  { emoji: '🐰', name: '小白兔' },
  { emoji: '🐻', name: '小棕熊' },
  { emoji: '🐯', name: '小老虎' },
  { emoji: '🐨', name: '考拉' },
  { emoji: '🦁', name: '小狮子' },
  { emoji: '🐸', name: '小青蛙' },
  { emoji: '🦄', name: '独角兽' },
  { emoji: '🐧', name: '企鹅' },
  { emoji: '🐲', name: '小恐龙' },
  { emoji: '🐬', name: '海豚' },
  { emoji: '🦋', name: '蝴蝶' },
  { emoji: '🐢', name: '小海龟' },
  { emoji: '🐙', name: '小章鱼' },
  { emoji: '🐣', name: '小鸡仔' },
  { emoji: '🌸', name: '樱花' },
  { emoji: '🌟', name: '星星' },
  { emoji: '💎', name: '钻石' },
  { emoji: '🎀', name: '蝴蝶结' },
  { emoji: '🍰', name: '蛋糕' },
  { emoji: '🧁', name: '纸杯蛋糕' }
]

var MAX_IMAGE_EDGE = 2048

Page({
  data: {
    nickname: '',
    signature: '',
    gender: '',
    avatarType: 'default',
    avatarEmoji: '',
    avatarUrl: '',
    journeyDays: 0,
    periodCount: 0,
    isFemale: false,
    showAvatarPreview: false,
    menuList: [
      { icon: '✏️', name: '编辑资料' },
      { icon: '🔔', name: '提醒设置' },
      { icon: '🎯', name: '目标管理' },
      { icon: '📊', name: '数据统计' }
    ],
    showAvatarPicker: false,
    systemAvatars: SYSTEM_AVATARS,
    selectedSysEmoji: '',
    cropVisible: false,
    cropSrc: '',
    cropProcessing: false,
    scale: 1,
    imgBaseW: 0,
    imgBaseH: 0,
    imgCX: 0,
    imgCY: 0,
    imgVisL: 0,
    imgVisT: 0,
    imgVisW: 0,
    imgVisH: 0
  },

  /* ========== 工具方法 ========== */

  _getWindowSize: function () {
    try {
      if (wx.getWindowInfo) {
        var info = wx.getWindowInfo()
        return { windowWidth: info.windowWidth, windowHeight: info.windowHeight }
      }
    } catch (e) {}
    try {
      var info2 = wx.getSystemInfoSync()
      return { windowWidth: info2.windowWidth, windowHeight: info2.windowHeight }
    } catch (e) {}
    return { windowWidth: 375, windowHeight: 667 }
  },

  _hideTab: function () {
    try {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ visible: false })
      }
    } catch (e) {}
  },

  _showTab: function () {
    try {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ visible: true })
      }
    } catch (e) {}
  },

  _hasOverlay: function () {
    return this.data.showAvatarPreview || this.data.showAvatarPicker || this.data.cropVisible
  },

  /* ========== 音乐播放器面板联动 ========== */

  onPlaylistChange: function (e) {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ visible: !e.detail.visible })
    }
  },

  /* ========== 生命周期 ========== */

  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 4 })}
    var g = app.globalData
    var gender = g.userInfo.gender || ''
    var isFemale = gender === 'female'

    var journeyDays = 1
    try { journeyDays = app.getJourneyDays() } catch (e) { journeyDays = 1 }

    var signature = ''
    try {
      var stored = wx.getStorageSync('userInfo') || {}
      signature = stored.signature || g.userInfo.signature || ''
    } catch (e) {}

    var avatarType = 'default'
    var avatarEmoji = ''
    var avatarUrl = ''
    try {
      avatarType = wx.getStorageSync('avatarType') || 'default'
      avatarEmoji = wx.getStorageSync('avatarEmoji') || ''
      avatarUrl = wx.getStorageSync('avatarUrl') || ''
    } catch (e) {}

    var defaultEmoji = isFemale ? '👩' : '👨'
    if (avatarType === 'default') avatarEmoji = defaultEmoji

    this.setData({
      nickname: g.userInfo.nickname || '用户',
      signature: signature,
      gender: gender,
      isFemale: isFemale,
      avatarType: avatarType,
      avatarEmoji: avatarEmoji,
      avatarUrl: avatarUrl,
      journeyDays: journeyDays,
      periodCount: (g.periodLogs || []).length,
      showAvatarPreview: false,
      showAvatarPicker: false,
      cropVisible: false,
      cropSrc: '',
      cropProcessing: false
    })

    if (this._hasOverlay()) {
      this._hideTab()
    }
  },

  onHide: function () {
    this.setData({
      showAvatarPreview: false,
      showAvatarPicker: false,
      cropVisible: false,
      cropSrc: '',
      cropProcessing: false
    })
    this._showTab()
  },

  /* ========== 头像放大预览 ========== */

  onAvatarTap: function () {
    this.setData({ showAvatarPreview: true })
    this._hideTab()
  },

  closeAvatarPreview: function () {
    this.setData({ showAvatarPreview: false })
    if (!this._hasOverlay()) this._showTab()
  },

  onChangeAvatar: function () {
    var self = this
    self.setData({ showAvatarPreview: false })
    self._showTab()
    setTimeout(function () { self._showAvatarActionSheet() }, 350)
  },

  _showAvatarActionSheet: function () {
    var self = this
    var list = ['系统头像', '从相册选择']
    if (this.data.avatarType !== 'default') list.push('恢复默认头像')
    wx.showActionSheet({
      itemList: list,
      success: function (res) {
        if (res.tapIndex === 0) self._openSysPicker()
        else if (res.tapIndex === 1) self._chooseImage()
        else if (res.tapIndex === 2) self._resetAvatar()
      }
    })
  },

  /* ========== 系统头像 ========== */

  _openSysPicker: function () {
    var cur = this.data.avatarType === 'system' ? this.data.avatarEmoji : ''
    this.setData({ showAvatarPicker: true, selectedSysEmoji: cur })
    this._hideTab()
  },

  closeAvatarPicker: function () {
    this.setData({ showAvatarPicker: false })
    if (!this._hasOverlay()) this._showTab()
  },

  selectSysAvatar: function (e) {
    this.setData({ selectedSysEmoji: e.currentTarget.dataset.emoji })
  },

  confirmSysAvatar: function () {
    var emoji = this.data.selectedSysEmoji
    if (!emoji) {
      wx.showToast({ title: '请选择一个头像', icon: 'none' })
      return
    }
    wx.setStorageSync('avatarType', 'system')
    wx.setStorageSync('avatarEmoji', emoji)
    try { wx.removeStorageSync('avatarUrl') } catch (e) {}
    this.setData({
      avatarType: 'system',
      avatarEmoji: emoji,
      avatarUrl: '',
      showAvatarPicker: false
    })
    this._showTab()
    wx.showToast({ title: '头像更新啦', icon: 'none' })
  },

  /* ========== 相册选图 ========== */

  _chooseImage: function () {
    var self = this
    if (typeof wx.chooseMedia === 'function') {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        sizeType: ['compressed'],
        success: function (res) {
          var path = res.tempFiles && res.tempFiles[0] && res.tempFiles[0].tempFilePath
          if (path) {
            self._preprocessAndOpenCrop(path)
          } else {
            wx.showToast({ title: '获取图片失败', icon: 'none' })
          }
        }
      })
    } else {
      wx.chooseImage({
        count: 1,
        sourceType: ['album', 'camera'],
        sizeType: ['compressed'],
        success: function (res) {
          if (res.tempFilePaths && res.tempFilePaths[0]) {
            self._preprocessAndOpenCrop(res.tempFilePaths[0])
          }
        }
      })
    }
  },

  /* ========== 恢复默认 ========== */

  _resetAvatar: function () {
    try { wx.removeStorageSync('avatarType') } catch (e) {}
    try { wx.removeStorageSync('avatarEmoji') } catch (e) {}
    try { wx.removeStorageSync('avatarUrl') } catch (e) {}
    this.setData({
      avatarType: 'default',
      avatarEmoji: this.data.gender === 'female' ? '👩' : '👨',
      avatarUrl: ''
    })
    wx.showToast({ title: '已恢复默认', icon: 'none' })
  },

  /* ========== 预处理 ========== */

  _preprocessAndOpenCrop: function (src) {
    var self = this
    wx.showLoading({ title: '加载中...', mask: true })

    wx.getImageInfo({
      src: src,
      success: function (img) {
        if (img.width > MAX_IMAGE_EDGE || img.height > MAX_IMAGE_EDGE) {
          self._compressAndOpenCrop(src, img.width, img.height)
        } else {
          wx.hideLoading()
          self._openCrop(src, img.width, img.height)
        }
      },
      fail: function () {
        wx.hideLoading()
        if (wx.compressImage) {
          wx.compressImage({
            src: src,
            quality: 80,
            success: function (res) {
              self._openCropWithFallback(res.tempFilePath)
            },
            fail: function () {
              wx.showToast({ title: '暂不支持该图片格式', icon: 'none' })
            }
          })
        } else {
          wx.showToast({ title: '暂不支持该图片格式', icon: 'none' })
        }
      }
    })
  },

  _compressAndOpenCrop: function (src, origW, origH) {
    var self = this
    var ratio = MAX_IMAGE_EDGE / Math.max(origW, origH)
    var targetW = Math.round(origW * ratio)
    var targetH = Math.round(origH * ratio)

    if (wx.compressImage) {
      wx.compressImage({
        src: src,
        quality: 75,
        success: function (res) {
          self._canvasResize(res.tempFilePath, targetW, targetH, function (outPath) {
            wx.hideLoading()
            self._openCrop(outPath || res.tempFilePath, targetW, targetH)
          })
        },
        fail: function () {
          self._canvasResize(src, targetW, targetH, function (outPath) {
            wx.hideLoading()
            if (outPath) {
              self._openCrop(outPath, targetW, targetH)
            } else {
              self._openCropWithFallback(src)
            }
          })
        }
      })
    } else {
      self._canvasResize(src, targetW, targetH, function (outPath) {
        wx.hideLoading()
        self._openCrop(outPath || src, targetW, targetH)
      })
    }
  },

  _canvasResize: function (src, targetW, targetH, cb) {
    try {
      wx.createSelectorQuery().select('#avatarCropCanvas')
        .fields({ node: true, size: true })
        .exec(function (res) {
          if (!res || !res[0] || !res[0].node) { cb(null); return }
          var canvas = res[0].node
          var ctx = canvas.getContext('2d')
          canvas.width = targetW
          canvas.height = targetH

          var img = canvas.createImage()
          var timedOut = false
          var timer = setTimeout(function () { timedOut = true; cb(null) }, 6000)

          img.onload = function () {
            if (timedOut) return
            clearTimeout(timer)
            try {
              ctx.clearRect(0, 0, targetW, targetH)
              ctx.drawImage(img, 0, 0, targetW, targetH)
              wx.canvasToTempFilePath({
                canvas: canvas,
                x: 0, y: 0,
                width: targetW, height: targetH,
                destWidth: targetW, destHeight: targetH,
                fileType: 'jpg', quality: 0.85,
                success: function (r) { cb(r.tempFilePath) },
                fail: function () { cb(null) }
              })
            } catch (e) { cb(null) }
          }
          img.onerror = function () {
            if (timedOut) return
            clearTimeout(timer)
            cb(null)
          }
          img.src = src
        })
    } catch (e) { cb(null) }
  },

  _openCropWithFallback: function (src) {
    var self = this
    wx.getImageInfo({
      src: src,
      success: function (img) { self._openCrop(src, img.width, img.height) },
      fail: function () { wx.showToast({ title: '图片格式不支持', icon: 'none' }) }
    })
  },

  /* ========== 裁剪 ========== */

  _openCrop: function (src, imgW, imgH) {
    var self = this
    var win = self._getWindowSize()
    var screenW = win.windowWidth
    var screenH = win.windowHeight
    var rpxPx = screenW / 750
    var circleDiam = 520 * rpxPx

    var fs = Math.max(circleDiam / imgW, circleDiam / imgH)
    var bw = imgW * fs
    var bh = imgH * fs

    self._ciw = imgW
    self._cih = imgH

    self.setData({
      cropVisible: true,
      cropSrc: src,
      cropProcessing: false,
      scale: 1,
      imgBaseW: bw,
      imgBaseH: bh,
      imgCX: screenW / 2,
      imgCY: screenH / 2,
      imgVisW: bw,
      imgVisH: bh,
      imgVisL: screenW / 2 - bw / 2,
      imgVisT: screenH / 2 - bh / 2
    })
    self._hideTab()
  },

  onCropTouchStart: function (e) {
    if (this.data.cropProcessing) return
    var t = e.touches
    if (t.length === 1) {
      this._dx = t[0].clientX
      this._dy = t[0].clientY
      this._dcx = this.data.imgCX
      this._dcy = this.data.imgCY
    } else if (t.length === 2) {
      var dx = t[1].clientX - t[0].clientX
      var dy = t[1].clientY - t[0].clientY
      this._pd = Math.sqrt(dx * dx + dy * dy)
      this._ps = this.data.scale
      this._pmx = (t[0].clientX + t[1].clientX) / 2
      this._pmy = (t[0].clientY + t[1].clientY) / 2
      this._pcx = this.data.imgCX
      this._pcy = this.data.imgCY
    }
  },

  onCropTouchMove: function (e) {
    if (this.data.cropProcessing) return
    var t = e.touches
    var d = this.data
    if (t.length === 1) {
      var ncx = this._dcx + (t[0].clientX - this._dx)
      var ncy = this._dcy + (t[0].clientY - this._dy)
      var vw = d.imgBaseW * d.scale
      var vh = d.imgBaseH * d.scale
      this.setData({
        imgCX: ncx, imgCY: ncy,
        imgVisW: vw, imgVisH: vh,
        imgVisL: ncx - vw / 2, imgVisT: ncy - vh / 2
      })
    } else if (t.length === 2) {
      var dx2 = t[1].clientX - t[0].clientX
      var dy2 = t[1].clientY - t[0].clientY
      var dist = Math.sqrt(dx2 * dx2 + dy2 * dy2)
      var ns = Math.max(1, Math.min(4, this._ps * (dist / this._pd)))
      var localX = (this._pmx - this._pcx) / this._ps
      var localY = (this._pmy - this._pcy) / this._ps
      var mx = (t[0].clientX + t[1].clientX) / 2
      var my = (t[0].clientY + t[1].clientY) / 2
      var ncx2 = mx - localX * ns
      var ncy2 = my - localY * ns
      var vw2 = d.imgBaseW * ns
      var vh2 = d.imgBaseH * ns
      this.setData({
        scale: ns, imgCX: ncx2, imgCY: ncy2,
        imgVisW: vw2, imgVisH: vh2,
        imgVisL: ncx2 - vw2 / 2, imgVisT: ncy2 - vh2 / 2
      })
    }
  },

  onCropTouchEnd: function (e) {
    if (e.touches.length === 1) {
      this._dx = e.touches[0].clientX
      this._dy = e.touches[0].clientY
      this._dcx = this.data.imgCX
      this._dcy = this.data.imgCY
    }
  },

  onCropCancel: function () {
    this.setData({ cropVisible: false, cropSrc: '', cropProcessing: false })
    this._showTab()
  },

  onCropConfirm: function () {
    var self = this
    var d = this.data
    if (d.cropProcessing) return

    var win = self._getWindowSize()
    var screenW = win.windowWidth
    var screenH = win.windowHeight
    var rpxPx = screenW / 750
    var circleDiam = 520 * rpxPx
    var circleR = circleDiam / 2
    var out = 400

    var ccx = screenW / 2
    var ccy = screenH / 2

    var origCX = (ccx - d.imgVisL) / d.imgVisW * self._ciw
    var origCY = (ccy - d.imgVisT) / d.imgVisH * self._cih
    var origR = circleR / d.imgVisW * self._ciw

    var sx = Math.round(origCX - origR)
    var sy = Math.round(origCY - origR)
    var sw = Math.round(origR * 2)
    var sh = Math.round(origR * 2)

    if (sx < 0) { sw += sx; sx = 0 }
    if (sy < 0) { sh += sy; sy = 0 }
    if (sx + sw > self._ciw) sw = self._ciw - sx
    if (sy + sh > self._cih) sh = self._cih - sy
    sw = Math.max(1, sw)
    sh = Math.max(1, sh)

    if (sx >= self._ciw || sy >= self._cih) {
      wx.showToast({ title: '裁剪区域无效', icon: 'none' })
      return
    }

    self.setData({ cropProcessing: true })
    wx.showLoading({ title: '处理中...', mask: true })

    var done = false
    var srcPath = d.cropSrc

    function cleanUp () {
      wx.hideLoading()
      self.setData({ cropVisible: false, cropProcessing: false })
      setTimeout(function () { self.setData({ cropSrc: '' }) }, 300)
      self._showTab()
    }

    function finish (path) {
      if (done) return
      done = true
      if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null }
      cleanUp()
      if (path) {
        self._saveCustomAvatar(path)
      } else {
        wx.showToast({ title: '保存失败', icon: 'none' })
      }
    }

    function fallback () {
      console.warn('裁剪回退：保存原图')
      finish(srcPath)
    }

    var safetyTimer = setTimeout(function () {
      safetyTimer = null
      if (!done) fallback()
    }, 8000)

    try {
      wx.createSelectorQuery().select('#avatarCropCanvas')
        .fields({ node: true, size: true })
        .exec(function (res) {
          if (done) return
          if (!res || !res[0] || !res[0].node) {
            console.error('Canvas 2D 节点未找到')
            fallback()
            return
          }

          var canvas = res[0].node
          var ctx = canvas.getContext('2d')
          canvas.width = out
          canvas.height = out

          var img = canvas.createImage()
          img.onload = function () {
            if (done) return
            try {
              var drawSX = Math.max(0, Math.min(sx, self._ciw - 1))
              var drawSY = Math.max(0, Math.min(sy, self._cih - 1))
              var drawSW = Math.min(sw, self._ciw - drawSX)
              var drawSH = Math.min(sh, self._cih - drawSY)
              if (drawSW <= 0 || drawSH <= 0) { fallback(); return }

              ctx.clearRect(0, 0, out, out)
              ctx.save()
              ctx.beginPath()
              ctx.arc(out / 2, out / 2, out / 2, 0, Math.PI * 2)
              ctx.clip()
              ctx.drawImage(img, drawSX, drawSY, drawSW, drawSH, 0, 0, out, out)
              ctx.restore()

              wx.canvasToTempFilePath({
                canvas: canvas,
                x: 0, y: 0,
                width: out, height: out,
                destWidth: out * 2, destHeight: out * 2,
                fileType: 'jpg', quality: 0.9,
                success: function (r) { finish(r.tempFilePath) },
                fail: function (err) { console.error('导出失败:', err); fallback() }
              })
            } catch (e) { console.error('Canvas 绘制异常:', e); fallback() }
          }
          img.onerror = function () { console.error('图片加载失败'); fallback() }
          img.src = srcPath
        })
    } catch (e) { console.error('SelectorQuery 异常:', e); fallback() }
  },

  /* ========== 保存头像 ========== */

  _saveCustomAvatar: function (path) {
    if (!path) { wx.showToast({ title: '保存失败', icon: 'none' }); return }
    var self = this
    var fileName = 'avatar_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6) + '.jpg'

    try {
      var fs = wx.getFileSystemManager()
      fs.saveFile({
        tempFilePath: path,
        filePath: wx.env.USER_DATA_PATH + '/' + fileName,
        success: function (res) {
          self._applyAvatar(res.savedFilePath || (wx.env.USER_DATA_PATH + '/' + fileName))
        },
        fail: function () { self._applyAvatar(path) }
      })
    } catch (e) {
      self._applyAvatar(path)
    }
  },

  _applyAvatar: function (url) {
    wx.setStorageSync('avatarType', 'custom')
    wx.setStorageSync('avatarUrl', url)
    try { wx.removeStorageSync('avatarEmoji') } catch (e) {}
    this.setData({ avatarType: 'custom', avatarUrl: url, avatarEmoji: '' })
    wx.showToast({ title: '头像更新啦', icon: 'none' })
  },

  /* ========== 导航 ========== */

  goEditProfile: function () {
    wx.navigateTo({ url: '/pages/user-info/user-info' })
  },

  goMenu: function (e) {
    var name = e.currentTarget.dataset.name
    if (name === '编辑资料') {
      wx.navigateTo({ url: '/pages/user-info/user-info' })
      return
    }
    if (name === '目标管理') {
      wx.navigateTo({ url: '/pages/goal-management/goal-management' })
      return
    }
    if (name === '数据统计') {
      wx.navigateTo({ url: '/pages/stats/stats' })
      return
    }
    if (name === '提醒设置') {
      wx.navigateTo({ url: '/pages/clock/clock' })
      return
    }
    wx.showToast({ title: name + '开发中', icon: 'none' })
  }
})
