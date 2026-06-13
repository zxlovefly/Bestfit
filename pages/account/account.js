const app = getApp()

Page({
  data: {
    currentYear: 0,
    currentMonth: 0,
    datePickerValue: '',
    monthLabel: '',
    selectedDay: 0,
    dayList: [],
    _scrollTarget: '',
    isToday: true,

    totalExpense: 0,
    totalIncome: 0,
    balance: 0,

    budget: 0,
    budgetPercent: 0,
    budgetOver: false,
    showBudgetModal: false,
    budgetInput: '',

    budgetWarnType: '',
    budgetWarnText: '',

    totalRecordDays: 0,
    totalRecordCount: 0,

    activeTab: 'list',
    records: [],
    dateGroups: [],
    categoryStats: [],

    statsSubTab: 'expense',
    incomeCategoryStats: [],

    showAdd: false,
    isEditing: false,
    editId: null,
    addType: 'expense',
    addAmount: '',
    addNote: '',
    addCategory: '',
    categoryList: [],

    showDeleteModal: false,
    deleteTargetId: null,

    showMonthPicker: false,
    pickerYear: 0,
    pickerMonth: 0,
    pickerMonthGrid: [],

    expenseCategories: [
      { key: 'food', icon: '🍔', name: '餐饮' },
      { key: 'drink', icon: '🧋', name: '饮品' },
      { key: 'fruit', icon: '🍎', name: '水果' },
      { key: 'snack', icon: '🍪', name: '零食' },
      { key: 'transport', icon: '🚌', name: '交通' },
      { key: 'shopping', icon: '🛍️', name: '购物' },
      { key: 'entertain', icon: '🎮', name: '娱乐' },
      { key: 'health', icon: '💊', name: '医疗' },
      { key: 'daily', icon: '🧴', name: '日用' },
      { key: 'sport', icon: '🏋️', name: '运动' },
      { key: 'edu', icon: '📚', name: '学习' },
      { key: 'travel', icon: '✈️', name: '旅游' },
      { key: 'digital', icon: '💻', name: '数码' },
      { key: 'social', icon: '💬', name: '社交' },
      { key: 'beauty', icon: '💄', name: '美妆' },
      { key: 'housing', icon: '🏠', name: '住房' },
      { key: 'pet', icon: '🐾', name: '宠物' },
      { key: 'gift', icon: '🎁', name: '礼物' },
      { key: 'car', icon: '🚗', name: '车辆' },
      { key: 'other', icon: '📦', name: '其他' }
    ],
    incomeCategories: [
      { key: 'salary', icon: '💰', name: '工资' },
      { key: 'bonus', icon: '🎁', name: '奖金' },
      { key: 'invest', icon: '📈', name: '理财' },
      { key: 'parttime', icon: '💼', name: '兼职' },
      { key: 'refund', icon: '🔄', name: '退款' },
      { key: 'gift', icon: '🧧', name: '红包' },
      { key: 'other', icon: '💎', name: '其他' }
    ]
  },

  /* ======================== 生命周期 ======================== */

  onLoad() {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth() + 1
    const d = now.getDate()
    this.setData({
      currentYear: y,
      currentMonth: m,
      monthLabel: m + '月',
      datePickerValue: y + '-' + String(m).padStart(2, '0'),
      selectedDay: d,
      isToday: true
    })
    this._buildDayList(y, m)
  },

  onShow() {
    this._loadBudget()
    this._loadRecords()
    this._loadLifetimeStats()
    if (this.data.showAdd || this.data.showBudgetModal || this.data.showMonthPicker) {
      this._hideTab()
    }
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })}
  },

  onHide() { this._showTab() },
  onUnload() { this._showTab() },

  /* ======================== 音乐播放器面板联动 ======================== */

  onPlaylistChange(e) {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ visible: !e.detail.visible })
    }
  },

  /* ======================== 导航栏显隐 ======================== */

  _hideTab() {
    try {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ visible: false })
      }
    } catch (e) {}
  },

  _showTab() {
    try {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ visible: true })
      }
    } catch (e) {}
  },

  preventScroll() {},

  /* ======================== 自定义月份选择器 ======================== */

  openMonthPicker() {
    this._origPickerYear = this.data.currentYear
    this._origPickerMonth = this.data.currentMonth
    this.setData({
      showMonthPicker: true,
      pickerYear: this.data.currentYear,
      pickerMonth: this.data.currentMonth
    })
    this._buildPickerData()
    this._hideTab()
  },

  closeMonthPicker() {
    this.setData({
      showMonthPicker: false,
      pickerYear: this._origPickerYear || this.data.currentYear,
      pickerMonth: this._origPickerMonth || this.data.currentMonth
    })
    this._showTab()
  },

  _buildPickerData() {
    const now = new Date()
    const thisYear = now.getFullYear()
    const thisMonth = now.getMonth() + 1
    const py = this.data.pickerYear
    const emojis = ['🌸', '🍀', '🌷', '🌻', '🌈', '🍉', '🌺', '🌊', '🍁', '🎃', '❄️', '🎄']
    const grid = []
    for (let m = 1; m <= 12; m++) {
      grid.push({
        month: m,
        label: m + '月',
        emoji: emojis[m - 1],
        future: (py > thisYear) || (py === thisYear && m > thisMonth)
      })
    }
    this.setData({ pickerMonthGrid: grid })
  },

  pickerPrevYear() {
    let y = this.data.pickerYear - 1
    if (y < 2020) y = 2020
    this.setData({ pickerYear: y })
    this._buildPickerData()
  },

  pickerNextYear() {
    const now = new Date()
    let y = this.data.pickerYear + 1
    if (y > now.getFullYear() + 1) y = now.getFullYear() + 1
    this.setData({ pickerYear: y })
    this._buildPickerData()
  },

  pickerSelectMonth(e) {
    const m = Number(e.currentTarget.dataset.month)
    const y = this.data.pickerYear
    const now = new Date()
    if (y > now.getFullYear() || (y === now.getFullYear() && m > now.getMonth() + 1)) return
    this.setData({ pickerMonth: m })
  },

  pickerConfirm() {
    const { pickerYear, pickerMonth } = this.data
    const now = new Date()
    if (pickerYear > now.getFullYear()) return
    if (pickerYear === now.getFullYear() && pickerMonth > now.getMonth() + 1) return

    let day = 1
    if (pickerYear === now.getFullYear() && pickerMonth === now.getMonth() + 1) {
      day = now.getDate()
    }
    this.setData({ showMonthPicker: false })
    this._showTab()
    this._applyMonth(pickerYear, pickerMonth, day)
  },

  /* ======================== 日期条滑动跨月 ======================== */

  onDayTouchStart(e) {
    this._dayTouchStartX = e.touches[0].clientX
  },

  onDayTouchEnd(e) {
    if (this._dayTouchStartX == null) return
    const endX = e.changedTouches[0].clientX
    const dx = endX - this._dayTouchStartX
    this._dayTouchStartX = null
    if (Math.abs(dx) < 60) return

    const { selectedDay, currentMonth, currentYear } = this.data
    const maxDay = new Date(currentYear, currentMonth, 0).getDate()

    if (dx > 0 && selectedDay <= 1) {
      this.prevDay()
    } else if (dx < 0 && selectedDay >= maxDay) {
      this.nextDay()
    }
  },

  /* ======================== 年月切换 ======================== */

  prevMonth() {
    let { currentYear, currentMonth } = this.data
    currentMonth--
    if (currentMonth < 1) { currentMonth = 12; currentYear-- }
    const lastDay = new Date(currentYear, currentMonth, 0).getDate()
    this._applyMonth(currentYear, currentMonth, lastDay)
  },

  nextMonth() {
    let { currentYear, currentMonth } = this.data
    const now = new Date()
    if (currentYear >= now.getFullYear() && currentMonth >= now.getMonth() + 1) return
    currentMonth++
    if (currentMonth > 12) { currentMonth = 1; currentYear++ }
    this._applyMonth(currentYear, currentMonth, 1)
  },

  goToday() {
    const n = new Date()
    this._applyMonth(n.getFullYear(), n.getMonth() + 1, n.getDate())
  },

  _applyMonth(y, m, day) {
    const now = new Date()
    const total = new Date(y, m, 0).getDate()

    if (day <= 0) {
      day = (y === now.getFullYear() && m === now.getMonth() + 1) ? now.getDate() : 1
    }
    if (day > total) day = total

    const wk = ['日', '一', '二', '三', '四', '五', '六']
    const list = []
    for (let i = 1; i <= total; i++) {
      list.push({ day: i, weekday: wk[new Date(y, m - 1, i).getDay()] })
    }
    const isToday = (y === now.getFullYear() && m === now.getMonth() + 1 && day === now.getDate())
    this.setData({
      currentYear: y,
      currentMonth: m,
      monthLabel: m + '月',
      datePickerValue: y + '-' + String(m).padStart(2, '0'),
      dayList: list,
      selectedDay: day,
      _scrollTarget: '',
      isToday: isToday
    })
    setTimeout(() => {
      this.setData({ _scrollTarget: 'ds' + day })
    }, 120)
    this._loadRecords()
  },

  /* ======================== 日期条 ======================== */

  _buildDayList(year, month) {
    const total = new Date(year, month, 0).getDate()
    const wk = ['日', '一', '二', '三', '四', '五', '六']
    const list = []
    for (let i = 1; i <= total; i++) {
      list.push({ day: i, weekday: wk[new Date(year, month - 1, i).getDay()] })
    }
    this.setData({ dayList: list })
  },

  selectDay(e) {
    const d = Number(e.currentTarget.dataset.day)
    const now = new Date()
    const isToday = (
      this.data.currentYear === now.getFullYear() &&
      this.data.currentMonth === now.getMonth() + 1 &&
      d === now.getDate()
    )
    this.setData({
      selectedDay: d,
      _scrollTarget: 'ds' + d,
      isToday: isToday
    })
    this._loadRecords()
  },

  prevDay() {
    let { selectedDay, currentYear, currentMonth } = this.data
    if (selectedDay <= 1) {
      currentMonth--
      if (currentMonth < 1) { currentMonth = 12; currentYear-- }
      const lastDay = new Date(currentYear, currentMonth, 0).getDate()
      this._applyMonth(currentYear, currentMonth, lastDay)
    } else {
      const newDay = selectedDay - 1
      const now = new Date()
      const isToday = (currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1 && newDay === now.getDate())
      this.setData({ selectedDay: newDay, _scrollTarget: 'ds' + newDay, isToday: isToday })
      this._loadRecords()
    }
  },

  nextDay() {
    let { selectedDay, currentYear, currentMonth } = this.data
    const max = new Date(currentYear, currentMonth, 0).getDate()
    if (selectedDay >= max) {
      currentMonth++
      if (currentMonth > 12) { currentMonth = 1; currentYear++ }
      this._applyMonth(currentYear, currentMonth, 1)
    } else {
      const newDay = selectedDay + 1
      const now = new Date()
      const isToday = (currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1 && newDay === now.getDate())
      this.setData({ selectedDay: newDay, _scrollTarget: 'ds' + newDay, isToday: isToday })
      this._loadRecords()
    }
  },

  /* ======================== 预算 ======================== */

  _loadBudget() {
    this.setData({ budget: wx.getStorageSync('monthlyBudget') || 0 })
  },

  openBudget() {
    this.setData({
      showBudgetModal: true,
      budgetInput: this.data.budget ? String(this.data.budget) : ''
    })
    this._hideTab()
  },

  closeBudget() {
    this.setData({ showBudgetModal: false })
    this._showTab()
  },

  onBudgetInput(e) { this.setData({ budgetInput: e.detail.value }) },
  setBudgetPreset(e) { this.setData({ budgetInput: String(e.currentTarget.dataset.val) }) },

  saveBudget() {
    const b = Number(this.data.budgetInput) || 0
    wx.setStorageSync('monthlyBudget', b)
    this.setData({ budget: b, showBudgetModal: false })
    this._showTab()
    this._updateBudget()
    this._loadRecords()
    wx.showToast({ title: '预算已设置', icon: 'none' })
  },

  _updateBudget() {
    const { budget, totalExpense } = this.data
    if (budget <= 0) {
      this.setData({ budgetPercent: 0, budgetOver: false })
      return
    }
    this.setData({
      budgetPercent: Math.min(Math.round(totalExpense / budget * 100), 100),
      budgetOver: totalExpense > budget
    })
  },

  /* ======================== 预算预警 ======================== */

  _checkBudgetWarn() {
    const { budget, totalExpense, currentYear, currentMonth } = this.data
    const now = new Date()
    const isCurrentMonth = (currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1)

    let budgetWarnType = ''
    let budgetWarnText = ''

    if (budget > 0 && isCurrentMonth) {
      const pct = totalExpense / budget
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
      const daysLeft = daysInMonth - now.getDate()

      if (pct >= 1) {
        budgetWarnType = 'danger'
        budgetWarnText = '本月已超支 ¥' + (totalExpense - budget) + '，请注意控制消费哦'
      } else if (pct >= 0.8) {
        budgetWarnType = 'caution'
        budgetWarnText = '预算已使用 ' + Math.round(pct * 100) + '%，还剩 ¥' + (budget - totalExpense)
      } else if (daysLeft <= 5) {
        budgetWarnType = 'encourage'
        budgetWarnText = '本月预算控制得真棒，继续加油 ✨'
      }
    }
    this.setData({ budgetWarnType, budgetWarnText })
  },

  /* ======================== 累计统计 ======================== */

  _loadLifetimeStats() {
    const all = wx.getStorageSync('accountRecords') || []
    const days = new Set()
    all.forEach(r => { if (r.date) days.add(r.date.split(' ')[0]) })
    this.setData({ totalRecordDays: days.size, totalRecordCount: all.length })
  },

  /* ======================== 工具 ======================== */

  _fmt(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0')
  },

  /* ======================== 数据加载 ======================== */

  _loadRecords() {
    const { currentYear, currentMonth, selectedDay } = this.data
    const mk = currentYear + '-' + String(currentMonth).padStart(2, '0')
    const all = wx.getStorageSync('accountRecords') || []
    const monthRec = all.filter(r => r.date && r.date.startsWith(mk))

    let totalExpense = 0, totalIncome = 0
    monthRec.forEach(r => {
      if (r.type === 'expense') totalExpense += r.amount
      else totalIncome += r.amount
    })

    let filtered
    if (selectedDay > 0) {
      const dk = mk + '-' + String(selectedDay).padStart(2, '0')
      filtered = monthRec.filter(r => r.date.startsWith(dk))
    } else {
      filtered = [...monthRec]
    }
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date))

    const gm = {}
    filtered.forEach(r => {
      const dk = r.date.split(' ')[0]
      if (!gm[dk]) gm[dk] = { date: dk, records: [], dayExpense: 0, dayIncome: 0 }
      gm[dk].records.push(r)
      if (r.type === 'expense') gm[dk].dayExpense += r.amount
      else gm[dk].dayIncome += r.amount
    })
    const wk = ['日', '一', '二', '三', '四', '五', '六']
    const now = new Date()
    const today = this._fmt(now)
    const yest = this._fmt(new Date(now.getTime() - 86400000))
    const dateGroups = Object.values(gm)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(g => {
        const d = new Date(g.date + 'T00:00:00')
        if (g.date === today) g.dateLabel = '今天'
        else if (g.date === yest) g.dateLabel = '昨天'
        else {
          const p = g.date.split('-')
          g.dateLabel = parseInt(p[1]) + '月' + parseInt(p[2]) + '日'
        }
        g.weekday = '周' + wk[d.getDay()]
        return g
      })

    const cmExp = {}
    monthRec.filter(r => r.type === 'expense').forEach(r => {
      if (!cmExp[r.category]) {
        cmExp[r.category] = { key: r.category, name: r.categoryName, icon: r.categoryIcon, amount: 0, count: 0 }
      }
      cmExp[r.category].amount += r.amount
      cmExp[r.category].count++
    })
    const categoryStats = Object.values(cmExp).sort((a, b) => b.amount - a.amount)
    const mxExp = categoryStats.length ? categoryStats[0].amount : 0
    categoryStats.forEach(c => {
      c.percent = totalExpense > 0 ? (c.amount / totalExpense * 100).toFixed(1) : '0.0'
      c.barWidth = mxExp > 0 ? Math.round(c.amount / mxExp * 100) : 0
    })

    const cmInc = {}
    monthRec.filter(r => r.type === 'income').forEach(r => {
      if (!cmInc[r.category]) {
        cmInc[r.category] = { key: r.category, name: r.categoryName, icon: r.categoryIcon, amount: 0, count: 0 }
      }
      cmInc[r.category].amount += r.amount
      cmInc[r.category].count++
    })
    const incomeCategoryStats = Object.values(cmInc).sort((a, b) => b.amount - a.amount)
    const mxInc = incomeCategoryStats.length ? incomeCategoryStats[0].amount : 0
    incomeCategoryStats.forEach(c => {
      c.percent = totalIncome > 0 ? (c.amount / totalIncome * 100).toFixed(1) : '0.0'
      c.barWidth = mxInc > 0 ? Math.round(c.amount / mxInc * 100) : 0
    })

    this.setData({
      monthLabel: currentMonth + '月',
      totalExpense, totalIncome, balance: totalIncome - totalExpense,
      records: filtered, dateGroups, categoryStats, incomeCategoryStats
    })
    this._updateBudget()
    this._checkBudgetWarn()
  },

  /* ======================== 统计子标签 ======================== */

  switchStatsTab(e) {
    this.setData({ statsSubTab: e.currentTarget.dataset.tab })
  },

  /* ======================== 添加 / 编辑 ======================== */

  openAdd() {
    this.setData({
      showAdd: true, isEditing: false, editId: null,
      addType: 'expense', addAmount: '', addNote: '',
      addCategory: 'food', categoryList: this.data.expenseCategories
    })
    this._hideTab()
  },

  closeAdd() {
    this.setData({ showAdd: false })
    this._showTab()
  },

  editRecord(e) {
    const id = e.currentTarget.dataset.id
    const all = wx.getStorageSync('accountRecords') || []
    const rec = all.find(r => r.id === id)
    if (!rec) return
    this.setData({
      showAdd: true, isEditing: true, editId: id,
      addType: rec.type, addAmount: String(rec.amount),
      addNote: rec.note || '', addCategory: rec.category,
      categoryList: rec.type === 'expense' ? this.data.expenseCategories : this.data.incomeCategories
    })
    this._hideTab()
  },

  switchType(e) {
    const t = e.currentTarget.dataset.type
    this.setData({
      addType: t,
      addCategory: t === 'expense' ? 'food' : 'salary',
      categoryList: t === 'expense' ? this.data.expenseCategories : this.data.incomeCategories
    })
  },

  selectCategory(e) { this.setData({ addCategory: e.currentTarget.dataset.key }) },
  onAmountInput(e) { this.setData({ addAmount: e.detail.value }) },
  onNoteInput(e) { this.setData({ addNote: e.detail.value }) },

  saveRecord() {
    const amount = Number(this.data.addAmount)
    if (!amount || amount <= 0) {
      wx.showToast({ title: '请输入金额', icon: 'none' })
      return
    }
    const catList = this.data.addType === 'expense' ? this.data.expenseCategories : this.data.incomeCategories
    const cat = catList.find(c => c.key === this.data.addCategory)

    if (this.data.isEditing) {
      const all = wx.getStorageSync('accountRecords') || []
      const idx = all.findIndex(r => r.id === this.data.editId)
      if (idx >= 0) {
        all[idx].type = this.data.addType
        all[idx].amount = amount
        all[idx].category = this.data.addCategory
        all[idx].categoryName = cat ? cat.name : '其他'
        all[idx].categoryIcon = cat ? cat.icon : '📦'
        all[idx].note = this.data.addNote || ''
        wx.setStorageSync('accountRecords', all)
      }
      wx.showToast({ title: '修改成功', icon: 'none' })
    } else {
      const now = new Date()
      const ry = this.data.currentYear
      const rm = this.data.currentMonth
      const rd = this.data.selectedDay > 0 ? this.data.selectedDay : now.getDate()
      const dateStr = ry + '-' +
        String(rm).padStart(2, '0') + '-' +
        String(rd).padStart(2, '0') + ' ' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0')

      const all = wx.getStorageSync('accountRecords') || []
      all.push({
        id: Date.now(),
        type: this.data.addType,
        amount,
        category: this.data.addCategory,
        categoryName: cat ? cat.name : '其他',
        categoryIcon: cat ? cat.icon : '📦',
        note: this.data.addNote || '',
        date: dateStr
      })
      wx.setStorageSync('accountRecords', all)
      wx.showToast({ title: '记录成功', icon: 'none' })
    }
    this.setData({ showAdd: false })
    this._showTab()
    this._loadRecords()
    this._loadLifetimeStats()
  },

  /* ======================== 删除 ======================== */

  confirmDelete(e) {
    this.setData({ showDeleteModal: true, deleteTargetId: e.currentTarget.dataset.id })
  },

  cancelDelete() {
    this.setData({ showDeleteModal: false, deleteTargetId: null })
  },

  doDelete() {
    let all = wx.getStorageSync('accountRecords') || []
    all = all.filter(r => r.id !== this.data.deleteTargetId)
    wx.setStorageSync('accountRecords', all)
    this.setData({ showDeleteModal: false, deleteTargetId: null })
    this._loadRecords()
    this._loadLifetimeStats()
    wx.showToast({ title: '已删除', icon: 'none' })
  },

  /* ======================== 视图切换 ======================== */

  switchView(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
  }
})
