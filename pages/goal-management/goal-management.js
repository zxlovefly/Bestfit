var app = getApp()

var GOAL_META = {
  lose: { emoji: '🔥', short: '减脂减重', title: '设定减重目标', sub: '科学减脂，稳步达成', heroLabel: '当前体重', tip: '建议每周减重 0.2~0.5kg，过快减重不利于健康', ctaText: '📊 查看数据统计', ctaSub: '记录每一次变化 · 看见进步', weeklyTarget: 0.2 },
  gain: { emoji: '💪', short: '增肌增重', title: '设定增肌目标', sub: '科学增肌，稳步增重', heroLabel: '当前体重', tip: '建议每周增重 0.2~0.5kg，配合力量训练效果更佳', ctaText: '📊 查看数据统计', ctaSub: '记录每一次变化 · 看见进步', weeklyTarget: 0.3 },
  tone: { emoji: '✨', short: '塑形紧致', title: '设定塑形目标', sub: '改善体态，塑造线条', heroLabel: '当前体重', tip: '塑形不只看体重，建议同时记录体脂率和围度变化', ctaText: '📊 查看数据统计', ctaSub: '记录每一次变化 · 看见进步', weeklyTarget: 0.15 },
  maintain: { emoji: '⚖️', short: '维持体重', title: '设定维持目标', sub: '保持体重，养成习惯', heroLabel: '当前体重', tip: '维持阶段建议体重波动控制在 ±1kg 以内', ctaText: '📊 查看数据统计', ctaSub: '记录每一次变化 · 看见进步', weeklyTarget: 0 }
}

var GOAL_INDEX_TO_TYPE = ['lose', 'gain', 'maintain', 'tone']

var PLANS_BY_TYPE = {
  lose: [
    { id: 'lose_1', badge: '🔥 高效燃脂', badgeClass: 'hot', name: '16+8 轻断食减肥法', desc: '每天在 8 小时内完成进食，其余 16 小时仅饮水或无热量饮品。', stats: [{ val: '8 小时', label: '进食窗口' }, { val: '16 小时', label: '断食时间' }, { val: '温和', label: '难度等级' }] },
    { id: 'lose_2', badge: '🏃 有氧推荐', badgeClass: 'secondary', name: '每周 3~5 次有氧运动', desc: '快走、慢跑、游泳、骑行等中低强度有氧，每次 30~45 分钟。', stats: [{ val: '3~5 次', label: '每周频率' }, { val: '30~45分', label: '每次时长' }, { val: '中低', label: '运动强度' }] }
  ],
  gain: [
    { id: 'gain_1', badge: '💪 增肌计划', badgeClass: 'gains', name: '渐进超负荷力量训练', desc: '逐步增加负荷重量，注重复合动作，配合充足蛋白质促进肌肉合成。', stats: [{ val: '4~5 次', label: '每周训练' }, { val: '8~12 次', label: '每组次数' }, { val: '中高', label: '训练强度' }] },
    { id: 'gain_2', badge: '🥩 饮食策略', badgeClass: 'secondary', name: '高蛋白增肌饮食', desc: '每日蛋白质 1.6~2.2g/kg，适当提高总热量摄入 300~500kcal。', stats: [{ val: '1.6~2.2g', label: '每kg蛋白质' }, { val: '+300~500', label: '热量盈余' }, { val: '4~6 餐', label: '每日餐数' }] }
  ],
  tone: [
    { id: 'tone_1', badge: '✨ 塑形方案', badgeClass: 'tone', name: '力量 + 有氧组合训练', desc: '力量训练提升紧致度，有氧降低体脂率，中小重量高次数为主。', stats: [{ val: '3~4 次', label: '力量训练' }, { val: '2~3 次', label: '有氧训练' }, { val: '中等', label: '训练强度' }] },
    { id: 'tone_2', badge: '🥗 饮食建议', badgeClass: 'secondary', name: '地中海饮食法', desc: '以蔬果、全谷物、优质蛋白和健康脂肪为主，营养均衡。', stats: [{ val: '均衡', label: '营养结构' }, { val: '适量', label: '热量控制' }, { val: '轻松', label: '执行难度' }] }
  ],
  maintain: [
    { id: 'maintain_1', badge: '⚖️ 维持方案', badgeClass: 'maintain', name: '均衡饮食 + 规律运动', desc: '保持热量收支平衡，每周 3 次中等强度运动，养成可持续习惯。', stats: [{ val: '3 次', label: '每周运动' }, { val: '±2%', label: '体重波动' }, { val: '轻松', label: '执行难度' }] },
    { id: 'maintain_2', badge: '🧘 习惯养成', badgeClass: 'secondary', name: '21 天习惯巩固法', desc: '规律作息、定时进餐、每周固定运动日程，21 天建立健康节奏。', stats: [{ val: '21 天', label: '习惯周期' }, { val: '3 餐定时', label: '饮食规律' }, { val: '固定', label: '运动日程' }] }
  ]
}

var PLAN_DETAILS = {
  lose_1: {
    icon: '⏰', title: '16+8 轻断食减肥法', subtitle: '最受欢迎的间歇性断食方案',
    sections: [
      { type: 'text', heading: '📖 什么是16+8轻断食', content: '将一天进食时间控制在 8 小时内，其余 16 小时只喝水或无热量饮品。不需要精确计算卡路里，温和且可持续。' },
      { type: 'list', heading: '🔑 核心原则', items: ['每天固定 8 小时进食窗口，16 小时断食', '进食期间正常饮食，不暴饮暴食', '断食期间可喝水、黑咖啡、无糖茶', '建议从 12:00-20:00 或 10:00-18:00 开始', '循序渐进，不必第一天就严格执行'] },
      { type: 'steps', heading: '📋 推荐执行步骤', items: ['第 1~3 天：从 12+12 开始，12 小时进食 + 12 小时断食', '第 4~7 天：缩短进食窗口至 10 小时', '第 2 周起：正式执行 8 小时进食窗口', '第 3 周起：优化进食窗口内营养搭配'] },
      { type: 'list', heading: '✅ 适合人群', items: ['想简单减脂但不想精确计算卡路里的人', '作息规律的上班族', '体重偏重、体脂率偏高的人群'] },
      { type: 'list', heading: '⚠️ 注意事项', items: ['孕妇、哺乳期不建议使用', '低血糖患者请先咨询医生', '断食期间头晕心慌请立即进食', '进食窗口内仍需注意饮食质量'] }
    ]
  },
  lose_2: {
    icon: '🏃', title: '有氧运动燃脂指南', subtitle: '科学有氧，高效燃脂',
    sections: [
      { type: 'text', heading: '📖 为什么有氧能减脂', content: '中低强度持续运动中身体主要通过氧化脂肪供能，每周 3~5 次、每次 30 分钟以上配合合理饮食可显著减少体脂。' },
      { type: 'list', heading: '🔑 推荐运动', items: ['快走：最简单的入门方式', '慢跑：经典燃脂，心率 60%~70%最大心率', '游泳：全身运动，对关节压力小', '骑行：低冲击、趣味性强', '跳绳：短时间高消耗'] },
      { type: 'steps', heading: '📋 每周计划', items: ['周一：慢跑 30 分钟', '周三：游泳或骑行 40 分钟', '周五：快走 45 分钟', '周末：户外徒步 30~60 分钟'] },
      { type: 'list', heading: '💡 技巧', items: ['保持中等强度（能说话不能唱歌）', '运动后 30 分钟内避免高热量饮食', '配合力量训练防止肌肉流失'] }
    ]
  },
  gain_1: {
    icon: '🏋️', title: '渐进超负荷力量训练', subtitle: '科学增肌的核心方法',
    sections: [
      { type: 'text', heading: '📖 什么是渐进超负荷', content: '逐步增加训练负荷——更大重量、更多次数或更短休息。肌肉只有持续受到超出当前能力的刺激才会生长变强。' },
      { type: 'list', heading: '🔑 核心原则', items: ['以复合动作为主：深蹲、硬拉、卧推', '每组 8~12 次达到力竭', '每周 4~5 次，推拉腿分化', '每 1~2 周尝试增加一点重量'] },
      { type: 'steps', heading: '📋 推拉腿计划', items: ['周一（推）：卧推、肩推、三头下压', '周二（拉）：引体向上、杠铃划船、弯举', '周三（腿）：深蹲、硬拉、腿举', '周四休息，周五~周六重复推拉'] },
      { type: 'list', heading: '🥩 饮食配合', items: ['蛋白质：每公斤 1.6~2.2g', '热量盈余：比维持多 300~500kcal', '训练后 30 分钟补充蛋白质+碳水', '保证 7~9 小时睡眠'] }
    ]
  },
  gain_2: {
    icon: '🥩', title: '高蛋白增肌饮食指南', subtitle: '吃对了，肌肉才能长',
    sections: [
      { type: 'text', heading: '📖 为什么要高蛋白', content: '蛋白质是修复和构建肌肉的原材料。每公斤体重 1.6~2.2g 蛋白质可最大化肌肉蛋白合成速率。' },
      { type: 'list', heading: '🥩 优质蛋白来源', items: ['鸡胸肉：每100g含31g蛋白质', '鸡蛋：每天 3~4 个', '牛肉：富含铁和锌', '鱼虾：优质蛋白+omega-3', '乳清蛋白粉：训练后快速补充'] },
      { type: 'steps', heading: '📋 一日参考（70kg）', items: ['早餐：3个鸡蛋+全麦面包+牛奶 ≈30g', '午餐：鸡胸肉200g+糙米+蔬菜 ≈45g', '训练后：蛋白粉1勺+香蕉 ≈25g', '晚餐：三文鱼150g+红薯 ≈35g'] }
    ]
  },
  tone_1: {
    icon: '✨', title: '力量+有氧组合训练', subtitle: '最佳塑形方案',
    sections: [
      { type: 'text', heading: '📖 为什么需要组合训练', content: '力量训练维持增加肌肉量，有氧加速脂肪消耗，两者协同让你减重同时拥有紧致线条。' },
      { type: 'steps', heading: '📋 每周安排', items: ['周一：上肢力量 45 分钟', '周二：慢跑 30 分钟', '周三：下肢力量 45 分钟', '周四：瑜伽拉伸 30 分钟', '周五：全身力量+核心 40 分钟', '周六：游泳或有氧操 40 分钟'] },
      { type: 'list', heading: '🥗 饮食建议', items: ['热量略低于维持水平', '蛋白质每公斤 1.4~1.8g', '多摄入蔬菜水果', '减少精加工食品'] }
    ]
  },
  tone_2: {
    icon: '🥗', title: '地中海饮食法', subtitle: '全球公认最健康的饮食模式',
    sections: [
      { type: 'text', heading: '📖 什么是地中海饮食', content: '以植物性食物为基础，搭配优质蛋白和健康脂肪，不仅助于控制体重，还能降低心血管疾病风险。' },
      { type: 'list', heading: '🔑 核心构成', items: ['大量蔬菜水果（每餐必有）', '全谷物为主食', '橄榄油为主要脂肪来源', '适量鱼虾（每周2~3次）', '坚果豆类作为零食'] },
      { type: 'list', heading: '📋 减少的食物', items: ['精制糖和含糖饮料', '精制面粉制品', '加工肉类', '反式脂肪'] }
    ]
  },
  maintain_1: {
    icon: '⚖️', title: '均衡饮食+规律运动', subtitle: '维持体重的长期策略',
    sections: [
      { type: 'text', heading: '📖 为什么维持不容易', content: '成功减重后约80%会反弹。维持体重需要将健康饮食和运动变成终身习惯。' },
      { type: 'list', heading: '🔑 维持原则', items: ['计算维持热量（TDEE）保持平衡', '80/20法则：80%健康+20%自由', '每天定时三餐避免暴食', '多吃高饱腹感食物'] },
      { type: 'steps', heading: '📋 每日习惯', items: ['早晨：称体重并记录趋势', '三餐：定时定量含蛋白质+蔬菜', '傍晚：完成运动计划', '睡前：保证7~8小时睡眠'] }
    ]
  },
  maintain_2: {
    icon: '🧘', title: '21天习惯巩固法', subtitle: '让好习惯成为自然',
    sections: [
      { type: 'text', heading: '📖 21天养成习惯', content: '21天是重要的心理节点，行为开始从「刻意执行」过渡到「半自动化」。' },
      { type: 'steps', heading: '📋 挑战计划', items: ['第1~7天：每天喝水8杯+步行30分钟', '第8~14天：固定三餐+每周3次运动', '第15~21天：全面执行+记录完成情况', '21天后：保持习惯，开始新挑战'] },
      { type: 'list', heading: '💡 坚持技巧', items: ['每天固定时间执行习惯', '使用打卡表记录完成情况', '找伙伴互相监督', '每完成一周给自己小奖励'] }
    ]
  }
}

Page({
  data: {
    setupStep: 0, selectedGoalType: '',
    goalTypeEmoji: '', goalTypeTitle: '', goalTypeSub: '', goalTypeShort: '',
    setupWeight: '66.0', setupTarget: '60.0', setupTip: '',
    initialWeight: 0, currentWeight: 0, targetWeight: 0,
    changeAmount: '0.0', waveRange: '0.0',
    progressPercent: 0, daysToGoal: 0,
    latestTrend: 'flat', trendDiff: '0.0', hasEnoughRecords: false,
    heroLabel: '当前体重',
    maintainDays: 0, maintainOk: true, maintainStatus: '稳定', avgWeight: '0.0',
    bodyFat: '', muscleMass: '', waistline: '', bmi: '',
    chartRange: 7, chartRecords: [],
    milestones: [], plans: [],
    showRecord: false,
    recordWeight: '66.0',
    recordInputFocused: false,
    recordDateLabel: '',
    selectedRecordDate: '',
    calYear: 0, calMonth: 0, calWeeks: [], weekdays: ['一', '二', '三', '四', '五', '六', '日'],
    showBodyModal: false, bodyModalTitle: '', bodyField: '',
    bodyInputVal: '', bodyUnit: '', bodyStep: '0.1', bodyInputFocused: false,
    showGoalModal: false, goalModalType: '',
    showDetail: false, detailData: {},
    ctaText: '', ctaSub: '',
    /* 弹窗是否有任意一个打开，控制 canvas 显隐 */
    _anyModalOpen: false,
    _allRecords: [], _goal: null
  },

  onShow: function () { this._loadData() },
  onReady: function () {
    this._canvasReady = true
    if (this.data.hasEnoughRecords) { var self = this; setTimeout(function () { self._drawChart() }, 250) }
  },

  preventBubble: function () {},

  /* =============== 弹窗显隐统一管理 =============== */
  _updateModalState: function () {
    var any = this.data.showRecord || this.data.showBodyModal || this.data.showGoalModal || this.data.showDetail
    this.setData({ _anyModalOpen: any })
  },

  /* =============== 数据源 =============== */
  _readUserInfo: function () {
    var info = {}; try { info = app.globalData.userInfo || {} } catch (e) {}
    if (!info.height) { try { info = wx.getStorageSync('userInfo') || info } catch (e) {} }
    return info
  },
  _syncWeightToUserInfo: function (w) {
    try { if (!app.globalData.userInfo) app.globalData.userInfo = {}; app.globalData.userInfo.weight = w; wx.setStorageSync('userInfo', app.globalData.userInfo) } catch (e) {}
  },

  /* =============== 数据加载 =============== */
  _loadData: function () {
    var records = [], goal = null
    try { records = wx.getStorageSync('weightRecords') || [] } catch (e) {}
    try { goal = wx.getStorageSync('weightGoal') || null } catch (e) {}
    var userInfo = this._readUserInfo()
    var userWeight = userInfo.weight ? parseFloat(userInfo.weight) : 0
    var userHeight = userInfo.height ? parseFloat(userInfo.height) : 0

    if (!goal || !goal.initialWeight) {
      var userGoalIndex = typeof userInfo.goal === 'number' ? userInfo.goal : -1
      var goalType = (userGoalIndex >= 0 && userGoalIndex < 4) ? GOAL_INDEX_TO_TYPE[userGoalIndex] : ''
      var userTargetWeight = userInfo.targetWeight ? parseFloat(userInfo.targetWeight) : 0
      if (goalType && userWeight > 0 && userTargetWeight > 0) {
        var meta = GOAL_META[goalType], today = this._fmtDate(new Date())
        var newGoal = { goalType: goalType, initialWeight: userWeight, targetWeight: userTargetWeight, startDate: today, weeklyTarget: meta.weeklyTarget, userHeight: userHeight }
        var found = false
        for (var i = 0; i < records.length; i++) { if (records[i].date === today) { records[i].weight = userWeight; found = true; break } }
        if (!found) records.push({ date: today, weight: userWeight })
        records.sort(function (a, b) { return a.date > b.date ? 1 : -1 })
        wx.setStorageSync('weightGoal', newGoal); wx.setStorageSync('weightRecords', records)
        this._loadData(); return
      }
      if (goalType) {
        var m2 = GOAL_META[goalType], sw2 = userWeight || 66, st2 = sw2
        if (goalType === 'lose') st2 = Math.max(30, sw2 - 6); else if (goalType === 'gain') st2 = sw2 + 5; else if (goalType === 'tone') st2 = sw2 - 2
        this.setData({ setupStep: 2, selectedGoalType: goalType, goalTypeEmoji: m2.emoji, goalTypeTitle: m2.title, goalTypeSub: m2.sub, setupTip: m2.tip, setupWeight: sw2.toFixed(1), setupTarget: st2.toFixed(1) }); return
      }
      var latest = records.length > 0 ? records[records.length - 1].weight : (userWeight || 66)
      this.setData({ setupStep: 1, setupWeight: latest.toFixed(1) }); return
    }

    var type = goal.goalType || 'lose', meta = GOAL_META[type]
    records.sort(function (a, b) { return a.date > b.date ? 1 : -1 })
    var currentWeight = records.length > 0 ? records[records.length - 1].weight : goal.initialWeight
    var initialWeight = goal.initialWeight, targetWeight = goal.targetWeight || initialWeight
    this._syncWeightToUserInfo(currentWeight)

    var latestTrend = 'flat', trendDiff = '0.0', hasEnoughRecords = records.length >= 2
    if (hasEnoughRecords) {
      var diff = records[records.length - 1].weight - records[records.length - 2].weight
      trendDiff = Math.abs(diff).toFixed(1)
      if (diff < -0.05) latestTrend = type === 'gain' ? 'up' : 'down'
      else if (diff > 0.05) latestTrend = type === 'gain' ? 'down' : 'up'
    }

    var now = new Date(), today = this._fmtDate(now)
    var chartRecords = this._filterRecords(records, this.data.chartRange)
    var milestones = this._buildMilestones(goal, currentWeight)

    var changeAmount = '0.0', waveRange = '0.0', progressPercent = 0, daysToGoal = 0
    var maintainDays = 0, maintainOk = true, maintainStatus = '稳定', avgWeight = '0.0'
    if (type === 'lose') { var t = initialWeight - targetWeight, l = initialWeight - currentWeight; changeAmount = Math.max(0, currentWeight - targetWeight).toFixed(1); progressPercent = t > 0 ? Math.max(0, Math.min(100, Math.round(l / t * 100))) : 100; daysToGoal = parseFloat(changeAmount) > 0.05 ? Math.ceil(parseFloat(changeAmount) / meta.weeklyTarget * 7) : 0 }
    else if (type === 'gain') { var t2 = targetWeight - initialWeight, g = currentWeight - initialWeight; changeAmount = Math.max(0, targetWeight - currentWeight).toFixed(1); progressPercent = t2 > 0 ? Math.max(0, Math.min(100, Math.round(g / t2 * 100))) : 100; daysToGoal = parseFloat(changeAmount) > 0.05 ? Math.ceil(parseFloat(changeAmount) / meta.weeklyTarget * 7) : 0 }
    else if (type === 'tone') { var d2 = Math.abs(currentWeight - targetWeight); changeAmount = d2.toFixed(1); var td = Math.abs(initialWeight - targetWeight), mv = Math.abs(initialWeight - currentWeight); progressPercent = td > 0 ? Math.max(0, Math.min(100, Math.round(mv / td * 100))) : 100; daysToGoal = d2 > 0.3 ? Math.ceil(d2 / meta.weeklyTarget * 7) : 0 }
    else { var sd = new Date(goal.startDate); maintainDays = Math.max(1, Math.floor((now - sd) / 86400000)); var rec = records.slice(-7), sum = 0; for (var ii = 0; ii < rec.length; ii++) sum += rec[ii].weight; avgWeight = rec.length > 0 ? (sum / rec.length).toFixed(1) : currentWeight.toFixed(1); var wv = Math.abs(currentWeight - initialWeight); waveRange = wv.toFixed(1); maintainOk = wv <= 1.0; maintainStatus = wv <= 0.5 ? '稳定' : wv <= 1.0 ? '轻微波动' : '波动较大' }

    var bodyData = {}; try { bodyData = wx.getStorageSync('bodyData_' + today) || {} } catch (e) {}
    var bmi = ''; var h2 = userHeight || (goal.userHeight ? parseFloat(goal.userHeight) : 0)
    if (currentWeight > 0 && h2 > 0) bmi = (currentWeight / ((h2 / 100) * (h2 / 100))).toFixed(1)

    var now2 = new Date()
    this.setData({
      setupStep: 0, selectedGoalType: type, goalTypeEmoji: meta.emoji, goalTypeShort: meta.short,
      heroLabel: meta.heroLabel, ctaText: meta.ctaText, ctaSub: meta.ctaSub,
      initialWeight: initialWeight.toFixed(1), currentWeight: currentWeight.toFixed(1), targetWeight: targetWeight.toFixed(1),
      changeAmount: changeAmount, waveRange: waveRange, progressPercent: progressPercent, daysToGoal: daysToGoal,
      latestTrend: latestTrend, trendDiff: trendDiff, hasEnoughRecords: hasEnoughRecords,
      maintainDays: maintainDays, maintainOk: maintainOk, maintainStatus: maintainStatus, avgWeight: avgWeight,
      bodyFat: bodyData.bodyFat || '', muscleMass: bodyData.muscleMass || '', waistline: bodyData.waistline || '', bmi: bmi,
      chartRecords: chartRecords, milestones: milestones, plans: PLANS_BY_TYPE[type] || [],
      selectedRecordDate: today,
      recordDateLabel: now2.getFullYear() + '年' + (now2.getMonth() + 1) + '月' + now2.getDate() + '日',
      calYear: now2.getFullYear(), calMonth: now2.getMonth() + 1,
      _allRecords: records, _goal: goal
    })

    this._buildCal()
    if (this._canvasReady && hasEnoughRecords && !this.data._anyModalOpen) { var self = this; setTimeout(function () { self._drawChart() }, 120) }
  },

  /* =============== Setup =============== */
  selectGoalType: function (e) { var t = e.currentTarget.dataset.type, m = GOAL_META[t]; this.setData({ selectedGoalType: t, goalTypeEmoji: m.emoji, goalTypeTitle: m.title, goalTypeSub: m.sub, setupTip: m.tip }) },
  toStep1: function () { this.setData({ setupStep: 1 }) },
  toStep2: function () {
    if (!this.data.selectedGoalType) { wx.showToast({ title: '请先选择目标', icon: 'none' }); return }
    var t = this.data.selectedGoalType, sw = parseFloat(this.data.setupWeight) || 66, st = sw
    if (t === 'lose') st = Math.max(30, sw - 6); else if (t === 'gain') st = sw + 5; else if (t === 'tone') st = sw - 2
    this.setData({ setupStep: 2, setupWeight: sw.toFixed(1), setupTarget: st.toFixed(1) })
  },
  onSetupInput: function (e) { var f = e.currentTarget.dataset.f; if (f === 'sw') this.setData({ setupWeight: e.detail.value }); else this.setData({ setupTarget: e.detail.value }) },
  adjSetup: function (e) { var delta = parseFloat(e.currentTarget.dataset.d), f = e.currentTarget.dataset.f, val = parseFloat(f === 'sw' ? this.data.setupWeight : this.data.setupTarget) || 60; val = Math.max(20, Math.min(200, val + delta)); var o = {}; o[f === 'sw' ? 'setupWeight' : 'setupTarget'] = val.toFixed(1); this.setData(o) },
  confirmSetup: function () {
    var sw = parseFloat(this.data.setupWeight), st = parseFloat(this.data.setupTarget), type = this.data.selectedGoalType, meta = GOAL_META[type]
    if (!sw || sw < 20 || sw > 200) { wx.showToast({ title: '请输入有效体重', icon: 'none' }); return }
    if (type !== 'maintain') { if (!st || st < 20 || st > 200) { wx.showToast({ title: '请输入有效目标', icon: 'none' }); return }; if (type === 'lose' && st >= sw) { wx.showToast({ title: '目标体重需小于当前', icon: 'none' }); return }; if (type === 'gain' && st <= sw) { wx.showToast({ title: '目标体重大于当前', icon: 'none' }); return } } else { st = sw }
    var today = this._fmtDate(new Date()), uInfo = this._readUserInfo()
    var goal = { goalType: type, initialWeight: sw, targetWeight: st, startDate: today, weeklyTarget: meta.weeklyTarget, userHeight: uInfo.height || 0 }
    var records = []; try { records = wx.getStorageSync('weightRecords') || [] } catch (e) {}
    var found = false; for (var i = 0; i < records.length; i++) { if (records[i].date === today) { records[i].weight = sw; found = true; break } }
    if (!found) records.push({ date: today, weight: sw }); records.sort(function (a, b) { return a.date > b.date ? 1 : -1 })
    wx.setStorageSync('weightGoal', goal); wx.setStorageSync('weightRecords', records); this._syncWeightToUserInfo(sw)
    wx.showToast({ title: '目标已设定 ✓', icon: 'none' }); this._loadData()
  },

  /* =============== 更换目标 =============== */
  onResetGoal: function () { this.setData({ showGoalModal: true, goalModalType: this.data.selectedGoalType }); this._updateModalState() },
  closeGoalModal: function () { this.setData({ showGoalModal: false }); this._updateModalState(); this._redrawAfterModal() },
  selectGoalModalType: function (e) { this.setData({ goalModalType: e.currentTarget.dataset.type }) },
  confirmGoalChange: function () {
    var newType = this.data.goalModalType
    if (!newType) { wx.showToast({ title: '请先选择目标', icon: 'none' }); return }
    if (newType === this.data.selectedGoalType) { this.closeGoalModal(); wx.showToast({ title: '目标未变更', icon: 'none' }); return }
    var records = this.data._allRecords || [], latest = records.length > 0 ? records[records.length - 1].weight : parseFloat(this.data.currentWeight)
    var meta = GOAL_META[newType], st = latest
    if (newType === 'lose') st = Math.max(30, latest - 6); else if (newType === 'gain') st = latest + 5; else if (newType === 'tone') st = latest - 2
    this.setData({ showGoalModal: false, selectedGoalType: newType, goalTypeEmoji: meta.emoji, goalTypeTitle: meta.title, goalTypeSub: meta.sub, setupTip: meta.tip, setupStep: 2, setupWeight: latest.toFixed(1), setupTarget: st.toFixed(1) })
    this._updateModalState(); this._redrawAfterModal()
  },

  /* =============== 日历 =============== */
  _buildCal: function () {
    var y = this.data.calYear, m = this.data.calMonth, today = this._fmtDate(new Date())
    var firstDow = new Date(y, m - 1, 1).getDay(), daysInMonth = new Date(y, m, 0).getDate()
    var offset = firstDow === 0 ? 6 : firstDow - 1, cells = []
    for (var i = 0; i < offset; i++) cells.push({ day: 0, dateStr: '', empty: true })
    for (var d = 1; d <= daysInMonth; d++) {
      var ds = y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d)
      cells.push({ day: d, dateStr: ds, empty: false, isToday: ds === today, isFuture: ds > today })
    }
    while (cells.length % 7 !== 0) cells.push({ day: 0, dateStr: '', empty: true })
    var weeks = []; for (var i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
    this.setData({ calWeeks: weeks })
  },
  prevMonth: function () { var y = this.data.calYear, m = this.data.calMonth - 1; if (m < 1) { m = 12; y-- } this.setData({ calYear: y, calMonth: m }); this._buildCal() },
  nextMonth: function () { var y = this.data.calYear, m = this.data.calMonth + 1; if (m > 12) { m = 1; y++ } this.setData({ calYear: y, calMonth: m }); this._buildCal() },
  selectCalDate: function (e) {
    var ds = e.currentTarget.dataset.date, future = e.currentTarget.dataset.future
    if (!ds || future === 'true' || future === true) return
    var weight = this._getWeightForDate(ds)
    var parts = ds.split('-')
    this.setData({ selectedRecordDate: ds, recordWeight: weight, recordDateLabel: parseInt(parts[0]) + '年' + parseInt(parts[1]) + '月' + parseInt(parts[2]) + '日' })
  },
  _getWeightForDate: function (dateStr) {
    var records = this.data._allRecords || []
    for (var i = 0; i < records.length; i++) { if (records[i].date === dateStr) return records[i].weight.toFixed(1) }
    return this.data.currentWeight
  },

  /* =============== 记录弹窗 =============== */
  showRecord: function () {
    var now = new Date(), today = this._fmtDate(now)
    var weight = this._getWeightForDate(today)
    this.setData({
      showRecord: true, selectedRecordDate: today, recordWeight: weight,
      recordDateLabel: now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日',
      calYear: now.getFullYear(), calMonth: now.getMonth() + 1, recordInputFocused: false
    })
    this._buildCal(); this._updateModalState()
  },
  hideRecord: function () { this.setData({ showRecord: false, recordInputFocused: false }); this._updateModalState(); this._redrawAfterModal() },
  onRecordWeightInput: function (e) { this.setData({ recordWeight: e.detail.value }) },
  adjRecordWeight: function (e) { var v = parseFloat(this.data.recordWeight) || 60; v = Math.max(20, Math.min(200, v + parseFloat(e.currentTarget.dataset.d))); this.setData({ recordWeight: v.toFixed(1) }) },
  focusRecordInput: function () { this.setData({ recordInputFocused: true }) },
  blurRecordInput: function () { this.setData({ recordInputFocused: false }) },
  confirmRecord: function () {
    var weight = parseFloat(this.data.recordWeight), dateStr = this.data.selectedRecordDate
    if (!weight || weight < 20 || weight > 200) { wx.showToast({ title: '请输入有效体重', icon: 'none' }); return }
    var records = []; try { records = wx.getStorageSync('weightRecords') || [] } catch (e) {}
    var found = false; for (var i = 0; i < records.length; i++) { if (records[i].date === dateStr) { records[i].weight = weight; found = true; break } }
    if (!found) records.push({ date: dateStr, weight: weight }); records.sort(function (a, b) { return a.date > b.date ? 1 : -1 })
    wx.setStorageSync('weightRecords', records)
    var today = this._fmtDate(new Date()); if (dateStr === today) this._syncWeightToUserInfo(weight)
    this.setData({ showRecord: false, recordInputFocused: false }); this._updateModalState()
    wx.showToast({ title: '记录成功 ✓', icon: 'none' }); this._loadData()
  },

  /* =============== 身体数据弹窗 =============== */
  showBodyInput: function (e) {
    var f = e.currentTarget.dataset.field, t = { bodyFat: '体脂率', muscleMass: '肌肉量', waistline: '腰围' }, u = { bodyFat: '%', muscleMass: 'kg', waistline: 'cm' }, s = { bodyFat: '0.1', muscleMass: '0.1', waistline: '1' }
    this.setData({ showBodyModal: true, bodyField: f, bodyModalTitle: t[f], bodyUnit: u[f], bodyStep: s[f], bodyInputVal: this.data[f] || '', bodyInputFocused: false })
    this._updateModalState()
  },
  hideBodyModal: function () { this.setData({ showBodyModal: false, bodyInputFocused: false }); this._updateModalState(); this._redrawAfterModal() },
  onBodyInput: function (e) { this.setData({ bodyInputVal: e.detail.value }) },
  adjBody: function (e) { var v = parseFloat(this.data.bodyInputVal) || 0; v = Math.max(0, v + parseFloat(e.currentTarget.dataset.d)); this.setData({ bodyInputVal: v.toFixed(1) }) },
  confirmBody: function () {
    var f = this.data.bodyField, val = this.data.bodyInputVal
    if (!val || isNaN(parseFloat(val))) { wx.showToast({ title: '请输入有效数值', icon: 'none' }); return }
    var today = this._fmtDate(new Date()), bd = {}; try { bd = wx.getStorageSync('bodyData_' + today) || {} } catch (e) {}
    bd[f] = val; wx.setStorageSync('bodyData_' + today, bd); var up = { showBodyModal: false, bodyInputFocused: false }; up[f] = val; this.setData(up); this._updateModalState()
    var cw = parseFloat(this.data.currentWeight) || 0, ui = this._readUserInfo(), hh = ui.height ? parseFloat(ui.height) : 0
    if (cw > 0 && hh > 0) this.setData({ bmi: (cw / ((hh / 100) * (hh / 100))).toFixed(1) })
    wx.showToast({ title: '已记录', icon: 'none' }); this._redrawAfterModal()
  },

  /* =============== 方案详情 =============== */
  openPlanDetail: function (e) {
    var id = e.currentTarget.dataset.id, src = PLAN_DETAILS[id]; if (!src) return
    var theme = id.indexOf('lose') === 0 ? 'green' : id.indexOf('gain') === 0 ? 'blue' : id.indexOf('tone') === 0 ? 'purple' : 'teal'
    this.setData({ showDetail: true, detailData: { theme: theme, icon: src.icon, title: src.title, subtitle: src.subtitle, sections: src.sections } })
    this._updateModalState()
  },
  closeDetail: function () { this.setData({ showDetail: false }); this._updateModalState(); this._redrawAfterModal() },

  /* =============== 弹窗关闭后重新绘制图表 =============== */
  _redrawAfterModal: function () {
    if (!this.data.hasEnoughRecords) return
    var self = this
    setTimeout(function () { self._drawChart() }, 150)
  },

  /* =============== CTA =============== */
  goStats: function () { wx.navigateTo({ url: '/pages/stats/stats' }) },

  /* =============== 图表 =============== */
  setRange: function (e) {
    var range = parseInt(e.currentTarget.dataset.range), all = this.data._allRecords || []
    this.setData({ chartRange: range, chartRecords: this._filterRecords(all, range) })
    var self = this; setTimeout(function () { self._drawChart() }, 80)
  },
  _filterRecords: function (records, days) { var cs = this._fmtDate(new Date(Date.now() - days * 86400000)); return records.filter(function (r) { return r.date >= cs }) },
  _drawChart: function () {
    if (!this._canvasReady || this.data._anyModalOpen) return
    var self = this
    wx.createSelectorQuery().select('#weightChart').fields({ node: true, size: true }).exec(function (res) {
      if (!res || !res[0] || !res[0].node) return
      var canvas = res[0].node, ctx = canvas.getContext('2d'), dpr = 2
      try { dpr = wx.getSystemInfoSync().pixelRatio || 2 } catch (e) {}
      var w = res[0].width, h = res[0].height; canvas.width = w * dpr; canvas.height = h * dpr; ctx.scale(dpr, dpr)
      self._renderChart(ctx, w, h)
    })
  },
  _renderChart: function (ctx, w, h) {
    var records = this.data.chartRecords; if (!records || records.length < 1) return
    var target = parseFloat(this.data.targetWeight) || 0, type = this.data.selectedGoalType
    var colors = { lose: { main: '#34C759', f1: 'rgba(52,199,89,0.18)', f2: 'rgba(52,199,89,0.01)' }, gain: { main: '#5C6BC0', f1: 'rgba(92,107,192,0.18)', f2: 'rgba(92,107,192,0.01)' }, tone: { main: '#AB47BC', f1: 'rgba(171,71,188,0.18)', f2: 'rgba(171,71,188,0.01)' }, maintain: { main: '#78909C', f1: 'rgba(120,144,156,0.18)', f2: 'rgba(120,144,156,0.01)' } }
    var c = colors[type] || colors.lose, pad = { t: 32, r: 24, b: 40, l: 52 }, cw = w - pad.l - pad.r, ch = h - pad.t - pad.b
    var weights = records.map(function (r) { return r.weight }), minW = Math.min.apply(null, weights), maxW = Math.max.apply(null, weights)
    if (target > 0) { if (target < minW) minW = target; if (target > maxW) maxW = target }
    var margin = Math.max((maxW - minW) * 0.2, 0.4); minW -= margin; maxW += margin; var range = maxW - minW || 1
    function xPos(i) { return records.length > 1 ? pad.l + i / (records.length - 1) * cw : pad.l + cw / 2 }
    function yPos(v) { return pad.t + (1 - (v - minW) / range) * ch }
    var points = []; for (var i = 0; i < records.length; i++) points.push({ x: xPos(i), y: yPos(records[i].weight) })
    ctx.clearRect(0, 0, w, h)
    ctx.save(); ctx.setLineDash([4, 4]); ctx.lineWidth = 0.5
    for (var i = 0; i <= 5; i++) { var gy = pad.t + i / 5 * ch; ctx.strokeStyle = '#EEEEEE'; ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(w - pad.r, gy); ctx.stroke(); ctx.fillStyle = '#BBB'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText((maxW - i / 5 * range).toFixed(1), pad.l - 10, gy) }
    ctx.restore()
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = '#BBB'; ctx.font = '10px sans-serif'
    var step = Math.max(1, Math.ceil(records.length / 7)); for (var i = 0; i < records.length; i += step) ctx.fillText(records[i].date.substring(5), xPos(i), h - pad.b + 12)
    var last = records.length - 1; if (last % step !== 0 && last > 0) ctx.fillText(records[last].date.substring(5), xPos(last), h - pad.b + 12)
    if (type !== 'maintain' && target > 0 && target >= minW && target <= maxW) { ctx.save(); ctx.setLineDash([6, 5]); ctx.strokeStyle = '#FF8C69'; ctx.lineWidth = 1.2; var ty = yPos(target); ctx.beginPath(); ctx.moveTo(pad.l, ty); ctx.lineTo(w - pad.r, ty); ctx.stroke(); ctx.restore(); ctx.fillStyle = '#FF8C69'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText('目标 ' + target.toFixed(1) + 'kg', w - pad.r, ty - 6) }
    function drawSmooth() { ctx.moveTo(points[0].x, points[0].y); if (points.length < 3) { for (var i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y); return }; var tn = 0.3; for (var i = 0; i < points.length - 1; i++) { var p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)]; ctx.bezierCurveTo(p1.x + (p2.x - p0.x) * tn, p1.y + (p2.y - p0.y) * tn, p2.x - (p3.x - p1.x) * tn, p2.y - (p3.y - p1.y) * tn, p2.x, p2.y) } }
    var bottomY = pad.t + ch, grad = ctx.createLinearGradient(0, pad.t, 0, bottomY); grad.addColorStop(0, c.f1); grad.addColorStop(1, c.f2)
    ctx.beginPath(); drawSmooth(); ctx.lineTo(points[points.length - 1].x, bottomY); ctx.lineTo(points[0].x, bottomY); ctx.closePath(); ctx.fillStyle = grad; ctx.fill()
    ctx.save(); ctx.shadowColor = c.main; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4; ctx.beginPath(); drawSmooth(); ctx.strokeStyle = c.main; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore()
    for (var i = 0; i < points.length; i++) { var px = points[i].x, py = points[i].y; ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fillStyle = c.main.replace(')', ',0.12)').replace('rgb', 'rgba'); ctx.fill(); ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fillStyle = c.main; ctx.fill() }
    if (points.length > 0) { var lp = points[last], lv = records[last].weight.toFixed(1), ly = lp.y - 22; if (ly < pad.t + 10) ly = lp.y + 22; ctx.font = 'bold 11px sans-serif'; var tw = ctx.measureText(lv).width, pw = tw + 16, ph = 22, pr2 = 11, px2 = lp.x - pw / 2, py2 = ly - ph / 2; ctx.beginPath(); ctx.moveTo(px2 + pr2, py2); ctx.lineTo(px2 + pw - pr2, py2); ctx.arcTo(px2 + pw, py2, px2 + pw, py2 + pr2, pr2); ctx.lineTo(px2 + pw, py2 + ph - pr2); ctx.arcTo(px2 + pw, py2 + ph, px2 + pw - pr2, py2 + ph, pr2); ctx.lineTo(px2 + pr2, py2 + ph); ctx.arcTo(px2, py2 + ph, px2, py2 + ph - pr2, pr2); ctx.lineTo(px2, py2 + pr2); ctx.arcTo(px2, py2, px2 + pr2, py2, pr2); ctx.closePath(); ctx.fillStyle = c.main; ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lv, lp.x, ly) }
  },

  /* =============== 阶段目标 =============== */
  _buildMilestones: function (goal, currentWeight) {
    var type = goal.goalType || 'lose', list = []
    if (type === 'maintain') { var s = new Date(goal.startDate), n = new Date(); for (var w = 1; w <= 4; w++) { var d = new Date(s.getTime() + w * 7 * 86400000); list.push({ dateLabel: (d.getMonth() + 1) + '月' + d.getDate() + '日', desc: '第' + w + '周维持检查', reached: n >= d }) }; return list }
    var w2 = goal.initialWeight, target = goal.targetWeight, weekly = goal.weeklyTarget || 0.2, s2 = new Date(goal.startDate), week = 1, isGain = type === 'gain'
    while (week <= 20) { if (isGain) { w2 = Math.min(target, w2 + weekly); if (w2 >= target - 0.01 && week > 1) break } else { w2 = Math.max(target, w2 - weekly); if (w2 <= target + 0.01 && week > 1) break }; var d2 = new Date(s2.getTime() + week * 7 * 86400000); list.push({ dateLabel: (d2.getMonth() + 1) + '月' + d2.getDate() + '日', desc: '目标 ' + w2.toFixed(1) + ' kg', reached: isGain ? currentWeight >= w2 : currentWeight <= w2 }); week++; if ((isGain && w2 >= target - 0.01) || (!isGain && w2 <= target + 0.01)) break }
    if (list.length > 8) list = list.slice(list.length - 8); return list
  },

  _fmtDate: function (d) { var m = (d.getMonth() + 1).toString(), dd = d.getDate().toString(); if (m.length < 2) m = '0' + m; if (dd.length < 2) dd = '0' + dd; return d.getFullYear() + '-' + m + '-' + dd }
})
