const app = getApp()

Component({
  data: {
    /* 播放状态 */
    isPlaying: false,
    isMuted: false,
    isReady: false,
    trackTitle: '',
    trackIndex: 0,
    trackTotal: 0,
    trackList: [],
    loopMode: 'all',

    /* 面板 */
    showPlaylist: false,
    scrollIntoId: '',
    showThemePicker: false,
    playlistTheme: 'pink',
    themeList: [
      { key: 'pink',   name: '粉色', icon: '🌸' },
      { key: 'blue',   name: '蓝色', icon: '💧' },
      { key: 'green',  name: '绿色', icon: '🌿' },
      { key: 'yellow', name: '黄色', icon: '🌻' },
      { key: 'purple', name: '紫色', icon: '💜' }
    ],

    /* 进度 */
    progressPercent: 0,
    currentTimeStr: '0:00',
    durationStr: '0:00',

    /* 跑马灯 */
    scrollText: '',
    marqueeOffset: 0,
    needMarquee: false,

    /* Toast & Modal */
    toastShow: false, toastType: 'success', toastIcon: '✓', toastText: '',
    modalShow: false, modalEmoji: '', modalTitle: '', modalContent: '',
    modalConfirmText: '确定', modalCancelText: '取消',
    modalInputShow: false, modalInputValue: '', modalInputPlaceholder: '', modalInputFocus: false,

    /* 管理 */
    manageMode: false,
    manageChecks: [],
    manageSelectedCount: 0,
    manageAllSelected: false
  },

  lifetimes: {
    attached() {
      this._destroyed = false
      this._dragging = false
      this._barRect = null
      this._seekTargetPct = null
      this._seekClearTimer = null
      this._modalCallbacks = {}
      this._importing = false
      this._sync()
      this._startStatePoller()
    },
    detached() {
      this._destroyed = true
      this._dragging = false
      this._importing = false
      this._stopStatePoller()
      this._stopProgressTimer()
      this._stopMarquee()
      if (this._seekClearTimer) { clearTimeout(this._seekClearTimer); this._seekClearTimer = null }
      if (this._toastTimer) { clearTimeout(this._toastTimer); this._toastTimer = null }
    }
  },

  pageLifetimes: {
    show() {
      if (this._destroyed) return
      this._sync()
      this._checkMarquee()
    },
    hide() { this._stopMarquee() }
  },

  methods: {

    /* ==================== 基础工具 ==================== */

    _safeSet(obj) {
      if (this._destroyed) return
      try { this.setData(obj) } catch (e) {}
    },

    _isApp() {
      try {
        const s = wx.getSystemInfoSync()
        return s.platform === 'android' || s.platform === 'ios'
      } catch (e) { return false }
    },

    _getCleanMusicName(rawName, tempPath) {
      let name = (rawName || '').trim()
      if (/^wq[_-]/i.test(name) && tempPath) {
        const fromPath = tempPath.split('/').pop().split('\\').pop()
        if (fromPath && !/^wq[_-]/i.test(fromPath)) name = fromPath
      }
      if (!name && tempPath) name = tempPath.split('/').pop().split('\\').pop()
      name = name.split('/').pop().split('\\').pop()
      name = name.replace(/\.(mp3|wav|m4a|aac|flac|ogg|wma|amr|mid)$/i, '')
      name = name.replace(/^wq[_-]/i, '')
      return name.trim() || '未知歌曲'
    },

    _isHashLike(str) {
      if (!str || str.length < 20) return false
      return !/[^a-zA-Z0-9]/i.test(str)
    },

    _isDuplicate(origName, cleanTitle, filePath) {
      const list = app.globalData.customTracks
      if (filePath && list.some(item => item.src === filePath)) return true
      return false
    },

    /* ==================== Toast & Modal ==================== */

    _showToast({ type, icon, text, duration }) {
      if (this._toastTimer) { clearTimeout(this._toastTimer); this._toastTimer = null }
      const icons = { success: '✓', error: '✕', warning: '!', info: 'i' }
      this._safeSet({
        toastShow: true, toastType: type || 'success',
        toastIcon: icon || icons[type] || '✓', toastText: text || ''
      })
      if (duration !== 0) {
        this._toastTimer = setTimeout(() => {
          this._toastTimer = null; this._safeSet({ toastShow: false })
        }, duration || 2200)
      }
    },

    _showModal({ emoji, title, content, confirmText, cancelText, onConfirm, onCancel }) {
      this._modalCallbacks = { onConfirm, onCancel }
      this._safeSet({
        modalShow: true, modalEmoji: emoji || '🌸', modalTitle: title || '',
        modalContent: content || '', modalConfirmText: confirmText || '确定',
        modalCancelText: cancelText || '取消', modalInputShow: false,
        modalInputValue: '', modalInputFocus: false
      })
    },

    _showInputModal({ emoji, title, placeholder, value, confirmText, cancelText, onConfirm, onCancel }) {
      const self = this
      this._modalCallbacks = {
        onConfirm() { onConfirm && onConfirm(self.data.modalInputValue) },
        onCancel
      }
      this._safeSet({
        modalShow: true, modalEmoji: emoji || '✏️', modalTitle: title || '',
        modalContent: '', modalConfirmText: confirmText || '确定',
        modalCancelText: cancelText || '取消', modalInputShow: true,
        modalInputValue: value || '', modalInputPlaceholder: placeholder || '',
        modalInputFocus: true
      })
    },

    _onModalInput(e) { this._safeSet({ modalInputValue: e.detail.value }) },

    _onModalConfirm() {
      const cb = this._modalCallbacks.onConfirm
      this._modalCallbacks = {}
      cb && cb()
      this._safeSet({ modalShow: false, modalInputShow: false, modalInputValue: '', modalInputFocus: false })
    },

    _onModalCancel() {
      const cb = this._modalCallbacks.onCancel
      this._modalCallbacks = {}
      this._safeSet({ modalShow: false, modalInputShow: false, modalInputValue: '', modalInputFocus: false })
      cb && cb()
    },

    /* ==================== 状态同步 ==================== */

    _sync() {
      if (this._destroyed) return
      const g = app.globalData
      const t = (g.trackList || [])[g.currentTrackIndex || 0]
      const title = t ? t.title : ''
      this._safeSet({
        isPlaying: g.isPlaying || false,
        isMuted: g.isMuted || false,
        isReady: !!g.audioCtx,
        trackList: g.trackList || [],
        trackIndex: g.currentTrackIndex || 0,
        trackTotal: (g.trackList || []).length,
        trackTitle: title,
        scrollText: title,
        loopMode: g.loopMode || 'all',
        playlistTheme: g.playlistTheme || 'pink'
      })
      this._checkMarquee()
    },

    _startStatePoller() {
      if (this._poller) return
      this._poller = setInterval(() => {
        if (this._destroyed) { this._stopStatePoller(); return }
        try {
          const g = app.globalData
          if (!g.trackList || !g.trackList.length) return
          const t = g.trackList[g.currentTrackIndex]
          const c = {}
          if (t && t.title !== this.data.trackTitle) {
            c.trackTitle = t.title; c.scrollText = t.title; c.trackIndex = g.currentTrackIndex
          }
          if (g.isPlaying !== this.data.isPlaying) c.isPlaying = g.isPlaying
          if (g.isMuted !== this.data.isMuted) c.isMuted = g.isMuted
          if (Object.keys(c).length) { this._safeSet(c); if (c.scrollText) this._checkMarquee() }
        } catch (e) {}
      }, 800)
    },

    _stopStatePoller() {
      if (this._poller) { clearInterval(this._poller); this._poller = null }
    },

    /* ==================== 跑马灯 ==================== */

    _checkMarquee() {
      const title = this.data.scrollText || ''
      if (title.length > 7) {
        this._safeSet({ needMarquee: true, marqueeOffset: 0 })
        this._startMarquee()
      } else {
        this._safeSet({ needMarquee: false, marqueeOffset: 0 })
        this._stopMarquee()
      }
    },

    _startMarquee() {
      this._stopMarquee()
      let offset = 0
      this._marqueeTimer = setInterval(() => {
        if (this._destroyed) { this._stopMarquee(); return }
        offset -= 0.3
        if (offset < -210) offset = 0
        this._safeSet({ marqueeOffset: offset })
      }, 60)
    },

    _stopMarquee() {
      if (this._marqueeTimer) { clearInterval(this._marqueeTimer); this._marqueeTimer = null }
    },

    /* ==================== 进度条 ==================== */

    _startProgressTimer() {
      if (this._progressTimer) return
      this._pullProgress()
      this._progressTimer = setInterval(() => {
        if (this._destroyed) { this._stopProgressTimer(); return }
        if (this._dragging) return
        this._pullProgress()
      }, 500)
    },

    _stopProgressTimer() {
      if (this._progressTimer) { clearInterval(this._progressTimer); this._progressTimer = null }
    },

    _clearSeekTarget() {
      if (this._seekClearTimer) clearTimeout(this._seekClearTimer)
      this._seekClearTimer = setTimeout(() => { this._seekTargetPct = null; this._seekClearTimer = null }, 2000)
    },

    _pullProgress() {
      try {
        const ctx = app.globalData.audioCtx
        if (!ctx) return
        const dur = ctx.duration || 0
        const cur = ctx.currentTime || 0
        if (dur > 0) {
          const pct = Math.min(Math.round(cur / dur * 100), 100)
          if (this._seekTargetPct != null) {
            if (Math.abs(cur - this._seekTargetPct / 100 * dur) > 0.5) {
              this._safeSet({ progressPercent: this._seekTargetPct, currentTimeStr: this._pctToTime(this._seekTargetPct), durationStr: this._fmt(dur) })
              return
            }
            this._seekTargetPct = null
          }
          this._safeSet({ progressPercent: pct, currentTimeStr: this._fmt(cur), durationStr: this._fmt(dur) })
        }
      } catch (e) {}
    },

    _fmt(s) {
      if (!s || s < 0) return '0:00'
      return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0')
    },

    _pctToTime(pct) {
      const ctx = app.globalData.audioCtx
      return this._fmt((ctx ? ctx.duration || 0 : 0) * pct / 100)
    },

    _pctFromTouch(touch) {
      const r = this._barRect
      if (!r || r.width <= 0) return this.data.progressPercent
      return Math.max(0, Math.min(100, (touch.clientX - r.left) / r.width * 100))
    },

    onBarTouchStart(e) {
      if (this._destroyed) return
      this._dragging = true; this._seekTargetPct = null
      if (this._barRect) {
        const pct = this._pctFromTouch(e.touches[0])
        this._safeSet({ progressPercent: pct, currentTimeStr: this._pctToTime(pct) })
      } else {
        const touch = e.touches[0]
        this.createSelectorQuery().select('.mp-pg-track').boundingClientRect(rect => {
          if (this._destroyed || !rect) return
          this._barRect = rect
          const pct = this._pctFromTouch(touch)
          this._safeSet({ progressPercent: pct, currentTimeStr: this._pctToTime(pct) })
        }).exec()
      }
    },

    onBarTouchMove(e) {
      if (this._destroyed || !this._dragging || !this._barRect) return
      const pct = this._pctFromTouch(e.touches[0])
      this._safeSet({ progressPercent: pct, currentTimeStr: this._pctToTime(pct) })
    },

    onBarTouchEnd() {
      if (this._destroyed) return
      const pct = this.data.progressPercent
      const ctx = app.globalData.audioCtx
      const dur = ctx ? ctx.duration || 0 : 0
      if (dur > 0) ctx.seek(pct / 100 * dur)
      this._seekTargetPct = pct; this._clearSeekTarget()
      setTimeout(() => { if (!this._destroyed) this._dragging = false }, 300)
    },

    onBarTap(e) {
      if (this._destroyed || this._dragging) return
      const ctx = app.globalData.audioCtx
      if (!ctx || !(ctx.duration > 0)) return
      this.createSelectorQuery().select('.mp-pg-track').boundingClientRect(rect => {
        if (this._destroyed || !rect) return
        const pct = Math.max(0, Math.min(100, (e.detail.clientX - rect.left) / rect.width * 100))
        ctx.seek(pct / 100 * ctx.duration)
        this._seekTargetPct = pct; this._clearSeekTarget()
        this._safeSet({ progressPercent: pct, currentTimeStr: this._pctToTime(pct) })
      }).exec()
    },

    /* ==================== 播放控制 ==================== */

    togglePlay() {
      if (this._destroyed) return
      if (!this.data.isReady) {
        app.initAndPlay(); this._safeSet({ isReady: true, isPlaying: true }); this._sync(); return
      }
      const ctx = app.globalData.audioCtx
      if (this.data.isPlaying) {
        ctx.pause(); app.globalData.isPlaying = false; this._safeSet({ isPlaying: false })
      } else {
        ctx.play(); app.globalData.isPlaying = true; this._safeSet({ isPlaying: true })
      }
    },

    toggleMute() {
      if (this._destroyed) return
      if (!this.data.isReady) { app.initAndPlay(); this._safeSet({ isReady: true, isPlaying: true }) }
      const r = app.toggleMute()
      this._safeSet({ isMuted: r.isMuted })
      this._showToast({ type: 'info', icon: r.isMuted ? '🔇' : '🔊', text: r.isMuted ? '已静音' : '已取消静音', duration: 1500 })
    },

    prevTrack() {
      if (this._destroyed) return
      if (!this.data.isReady) { app.initAndPlay(); this._safeSet({ isReady: true }) }
      else app.playPrev()
      this._safeSet({ isPlaying: true, isMuted: false }); this._sync()
    },

    nextTrack() {
      if (this._destroyed) return
      if (!this.data.isReady) { app.initAndPlay(); this._safeSet({ isReady: true }) }
      else app.playNextManual()
      this._safeSet({ isPlaying: true, isMuted: false }); this._sync()
    },

    toggleLoop() {
      app.toggleLoopMode(); this._sync()
      const single = app.globalData.loopMode === 'single'
      this._showToast({ type: 'info', icon: single ? '🔂' : '🔁', text: single ? '单曲循环' : '列表循环', duration: 1600 })
    },

    /* ==================== 歌曲选择 ==================== */

    selectTrack(e) {
      if (this._destroyed) return
      const idx = Number(e.currentTarget.dataset.index)
      if (!this.data.isReady) this._safeSet({ isReady: true })
      app.playTrack(idx)
      this._safeSet({ isPlaying: true, isMuted: false, scrollIntoId: 't' + idx }); this._sync()
    },

    onItemTap(e) {
      if (this.data.manageMode) this.onManageCheck(e)
      else this.selectTrack(e)
    },

    onSongLongPress(e) {
      if (this.data.manageMode) return
      const idx = Number(e.currentTarget.dataset.index)
      const track = this.data.trackList[idx]
      if (!track || !track.custom) {
        this._showToast({ type: 'info', icon: 'ℹ', text: '默认歌曲不支持重命名', duration: 1500 }); return
      }
      this._showInputModal({
        emoji: '✏️', title: '重命名', placeholder: '输入歌曲名称', value: track.title,
        confirmText: '保存', cancelText: '取消',
        onConfirm: (name) => {
          name = (name || '').trim()
          if (!name) { this._showToast({ type: 'warning', icon: '⚠', text: '名称不能为空', duration: 1500 }); return }
          if (name === track.title) return
          const gt = app.globalData.trackList.find(t => t.src === track.src)
          if (gt) gt.title = name
          const ct = app.globalData.customTracks.find(t => t.src === track.src)
          if (ct) ct.title = name
          wx.setStorageSync('customTracks', app.globalData.customTracks)
          this._sync()
          this._showToast({ type: 'success', icon: '✓', text: '已重命名', duration: 1500 })
        }
      })
    },

    deleteTrack(e) {
      const idx = Number(e.currentTarget.dataset.index)
      const name = this.data.trackList[idx] ? this.data.trackList[idx].title : ''
      this._showModal({
        emoji: '🗑️', title: '删除歌曲', content: '确定删除「' + name + '」吗？',
        confirmText: '删除', cancelText: '再想想',
        onConfirm: () => {
          if (this._destroyed) return
          app.removeCustomTrack(idx); this._sync()
          if (!app.globalData.trackList.length) this.closePlaylist()
          this._showToast({ type: 'success', icon: '✓', text: '已删除', duration: 1600 })
        }
      })
    },

    /* ==================== 管理模式 ==================== */

    enterManage() {
      if (this._destroyed) return
      this._sync()
      this._safeSet({ manageMode: true, manageChecks: this.data.trackList.map(() => false), manageSelectedCount: 0, manageAllSelected: false })
    },

    exitManage() {
      this._safeSet({ manageMode: false, manageChecks: [], manageSelectedCount: 0, manageAllSelected: false })
    },

    onManageCheck(e) {
      const idx = Number(e.currentTarget.dataset.index)
      const track = this.data.trackList[idx]
      if (!track || !track.custom) {
        this._showToast({ type: 'info', icon: 'ℹ', text: '默认歌曲不可删除', duration: 1200 }); return
      }
      const checks = this.data.manageChecks.slice()
      checks[idx] = !checks[idx]
      const customCount = this.data.trackList.filter(t => t.custom).length
      const count = checks.filter(Boolean).length
      this._safeSet({ manageChecks: checks, manageSelectedCount: count, manageAllSelected: count === customCount && customCount > 0 })
    },

    manageSelectAll() {
      const customCount = this.data.trackList.filter(t => t.custom).length
      const allSel = this.data.manageAllSelected
      const checks = this.data.trackList.map(t => t.custom ? !allSel : false)
      this._safeSet({ manageChecks: checks, manageSelectedCount: allSel ? 0 : customCount, manageAllSelected: !allSel })
    },

    manageDeleteSelected() {
      const toDelete = []
      for (let i = this.data.manageChecks.length - 1; i >= 0; i--) {
        if (this.data.manageChecks[i]) toDelete.push(i)
      }
      if (!toDelete.length) {
        this._showToast({ type: 'warning', icon: '⚠', text: '请先选择歌曲', duration: 1500 }); return
      }
      this._showModal({
        emoji: '🗑️', title: '批量删除', content: '确定删除选中的 ' + toDelete.length + ' 首歌曲吗？',
        confirmText: '删除', cancelText: '再想想',
        onConfirm: () => {
          if (this._destroyed) return
          app.removeCustomTracks(toDelete); this._sync(); this.exitManage()
          if (!app.globalData.trackList.length) this.closePlaylist()
          this._showToast({ type: 'success', icon: '✓', text: '已删除 ' + toDelete.length + ' 首', duration: 1600 })
        }
      })
    },

    /* ==================== 导入歌曲 ==================== */

    importSong() {
      if (this._destroyed) return
      this._isApp() ? this._chooseAppMusicFiles() : this._importFromWeChat()
    },

    _importFromWeChat() {
      const self = this
      this._importing = true
      wx.chooseMessageFile({
        count: 100, type: 'file',
        extension: ['mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg', 'wma'],
        success(res) {
          if (!res.tempFiles || !res.tempFiles.length) { self._importing = false; return }
          self._saveMp3Files(res.tempFiles)
        },
        fail(err) {
          self._importing = false
          if (!err.errMsg || !err.errMsg.includes('cancel')) self._showToast({ type: 'error', text: '选择文件失败' })
        }
      })
    },

    _chooseAppMusicFiles() {
      const self = this
      self._importing = true
      wx.showLoading({ title: '正在打开文件选择器...', mask: true })
      wx.miniapp.chooseFile({
        allowsMultipleSelection: true,
        success(res) {
          wx.hideLoading()
          if (!res || !res.tempFiles || !res.tempFiles.length) { self._importing = false; self._showToast({ type: 'info', text: '未选择任何文件' }); return }
          const exts = ['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg', '.wma', '.amr', '.mid']
          const audio = res.tempFiles.filter(f => exts.some(ext => (f.name || f.path || '').toLowerCase().endsWith(ext)))
          if (!audio.length) { self._importing = false; self._showToast({ type: 'warning', text: '请选择音频文件' }); return }
          self._importAppFiles(audio)
        },
        fail() { wx.hideLoading(); self._importing = false; self._showToast({ type: 'error', text: '选择文件失败或已取消' }) }
      })
    },

    _importAppFiles(files) {
      const self = this
      wx.showLoading({ title: '导入中...', mask: true })
      const fs = wx.getFileSystemManager()
      const dir = wx.env.USER_DATA_PATH + '/music/'
      try { fs.mkdirSync(dir, true) } catch (e) {}
      let ok = 0, skip = 0, unnamedIdx = 1, i = 0
      const next = () => {
        if (i >= files.length) {
          wx.setStorageSync('customTracks', app.globalData.customTracks)
          wx.hideLoading(); self._importing = false; self._sync()
          let msg = `成功导入 ${ok} 首`; if (skip) msg += `，跳过重复 ${skip} 首`
          if (unnamedIdx > 1) msg += '\n长按歌曲可重命名'
          self._showToast({ type: 'success', text: msg, duration: 3000 }); return
        }
        const f = files[i++]
        let title = self._getCleanMusicName(f.name || '未知文件', f.path)
        if (self._isHashLike(title)) {
          let n = unnamedIdx
          while (app.globalData.customTracks.some(t => t.title === '未命名歌曲 ' + n)) n++
          title = '未命名歌曲 ' + n; unnamedIdx = n + 1
        }
        if (self._isDuplicate(f.name, title, f.path)) { skip++; next(); return }
        const dest = dir + Date.now() + '_' + (f.name || '').replace(/[\\/:*?"<>|]/g, '_')
        fs.copyFile({ srcPath: f.path, destPath: dest, success() { app.addCustomTrack(title, dest, f.name); ok++; next() }, fail() { next() } })
      }
      next()
    },

    _saveMp3Files(files) {
      const self = this
      wx.showLoading({ title: '导入中…', mask: true })
      const batch = files.filter(f => /\.(mp3|wav|m4a|aac|flac|ogg|wma|amr|mid)$/i.test(f.name || f.tempFilePath || ''))
      if (!batch.length) { wx.hideLoading(); self._importing = false; self._showToast({ type: 'warning', text: '没有找到可导入的音频文件' }); return }
      let ok = 0, done = 0, skip = 0, unnamedIdx = 1
      const finish = () => {
        wx.setStorageSync('customTracks', app.globalData.customTracks)
        wx.hideLoading(); self._importing = false; self._sync()
        let msg = `导入${ok}首`; if (skip) msg += `，跳过重复${skip}首`
        if (unnamedIdx > 1) msg += '\n长按可重命名'
        self._showToast({ type: 'info', text: msg, duration: 2500 })
      }
      batch.forEach(file => {
        const tempPath = file.tempFilePath || file.path || ''
        let title = self._getCleanMusicName(file.name, tempPath)
        if (self._isHashLike(title)) {
          let n = unnamedIdx
          while (app.globalData.customTracks.some(t => t.title === '未命名歌曲 ' + n)) n++
          title = '未命名歌曲 ' + n; unnamedIdx = n + 1
        }
        if (self._isDuplicate(file.name, title, tempPath)) { skip++; done++; if (done >= batch.length) finish(); return }
        if (self._isApp()) {
          app.addCustomTrack(title, tempPath, file.name); ok++; done++
          if (done >= batch.length) finish()
        } else {
          wx.saveFile({
            tempFilePath: tempPath,
            success(sr) { app.addCustomTrack(title, sr.savedFilePath, file.name) },
            fail() { app.addCustomTrack(title, tempPath, file.name) },
            complete() { ok++; done++; if (done >= batch.length) finish() }
          })
        }
      })
    },

    /* ==================== 面板开关 ==================== */

    openPlaylist() {
      if (this._destroyed) return
      this._sync()
      this._safeSet({ showPlaylist: true, scrollIntoId: 't' + this.data.trackIndex })
      this._startProgressTimer()
      app.globalData.playlistVisible = true
      this.triggerEvent('playlistStateChange', { visible: true })
      setTimeout(() => {
        if (this._destroyed) return
        this.createSelectorQuery().select('.mp-pg-track').boundingClientRect(rect => {
          if (!this._destroyed && rect) this._barRect = rect
        }).exec()
      }, 400)
    },

    closePlaylist() {
      if (this._destroyed) return
      this.exitManage()
      this._safeSet({ showPlaylist: false, showThemePicker: false })
      this._stopProgressTimer(); this._barRect = null
      app.globalData.playlistVisible = false
      this.triggerEvent('playlistStateChange', { visible: false })
    },

    openThemePicker() { this._safeSet({ showThemePicker: true }) },
    closeThemePicker() { this._safeSet({ showThemePicker: false }) },

    selectTheme(e) {
      const key = e.currentTarget.dataset.key
      const names = { pink: '粉色', blue: '蓝色', green: '绿色', yellow: '黄色', purple: '紫色' }
      this._safeSet({ playlistTheme: key, showThemePicker: false })
      app.globalData.playlistTheme = key
      wx.setStorageSync('playlistTheme', key)
      this._showToast({ type: 'success', icon: '🎨', text: names[key] + '主题', duration: 1600 })
    }
  }
})
