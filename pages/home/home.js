const app = getApp()
/* ★ 引入 getTodayIntake */
var { fmtDate, getTargetsForDate, getIntakeForDate, getTodayIntake } = require('../../utils/diet-targets')

/* ★ 修改点：本地带补零的日期格式化，与运动记录页格式一致 */
function fmtDatePad(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0')
}

const ACT_MULTI = [1.2, 1.375, 1.55, 1.725]
const ACT_LABELS = ['久坐不动', '轻度活动', '中度活动', '高度活动']
const ACT_ICONS = ['🪑', '🚶', '🏃', '🏋️']
const ACT_DESCS = ['办公室工作，几乎不运动', '每周运动 1-3 次', '每周运动 3-5 次', '每周运动 6-7 次']
const GOAL_LABELS = ['减脂塑形', '增肌增重', '维持体重', '健康调理']
const GOAL_COLORS = ['#FF6B6B', '#6C8EEF', '#6BCB77', '#F5A623']
const GOAL_ICONS = ['📉', '📈', '⚖️', '🧘']
const GOAL_DESCS = ['每日热量缺口 500 千卡', '每日热量盈余 400 千卡', '保持热量收支平衡', '均衡营养调理身体']
const WEATHER_BG = {
  sunny: 'linear-gradient(180deg,#4A90D9 0%,#74B9FF 40%,#FFF8E7 100%)',
  rainy: 'linear-gradient(180deg,#2C3E50 0%,#3D566E 40%,#7B8D9E 100%)',
  snowy: 'linear-gradient(180deg,#6B7B8D 0%,#A8B8C8 35%,#E8EFF5 100%)',
  cloudy: 'linear-gradient(180deg,#636E72 0%,#95A5A6 35%,#DFE6E9 100%)',
  thunder: 'linear-gradient(180deg,#1A1A2E 0%,#16213E 40%,#34495E 100%)',
  foggy: 'linear-gradient(180deg,#B2BEC3 0%,#CFD8DC 35%,#ECEFF1 100%)'
}
const WD_TEXT = { sunny: '#FFF', rainy: '#E8F4FD', snowy: '#FFF', cloudy: '#FFF', thunder: '#FFD700', foggy: '#455A64' }

let _askedLocation = false
const QW_KEY = '5701f683fdf64813a77614192b39be78'
const QW_BASE = 'https://my3dn9y6te.re.qweatherapi.com'
const QW_GEO = 'https://my3dn9y6te.re.qweatherapi.com'
const QW_AUTH = { 'X-QW-Api-Key': QW_KEY }

const RAIN_DROPS = []
for (let i = 0; i < 15; i++) {
  const p = [4, 10, 17, 24, 31, 38, 45, 52, 59, 66, 73, 80, 87, 93, 7]
  RAIN_DROPS.push({ l: p[i] + '%', d: (0.8 + i % 5 * 0.15).toFixed(2) + 's', del: ((i * 0.31) % 2.2).toFixed(2) + 's', h: (18 + i % 4 * 7) + 'rpx' })
}
const SNOW_FLAKES = []
for (let i = 0; i < 13; i++) {
  const p = [6, 15, 25, 34, 44, 53, 63, 72, 82, 91, 20, 50, 78]
  SNOW_FLAKES.push({ l: p[i] + '%', d: (3.5 + i % 4 * 1.2).toFixed(1) + 's', del: ((i * 0.8) % 4.5).toFixed(1) + 's', s: (6 + i % 3 * 4) + 'rpx' })
}
const SUN_PARTICLES = []
for (let i = 0; i < 10; i++) {
  SUN_PARTICLES.push({ l: (8 + i * 9) + '%', t: (12 + (i * 17) % 70) + '%', d: (3 + i % 3 * 1.8).toFixed(1) + 's', del: ((i * 0.7) % 3.5).toFixed(1) + 's', s: (5 + i % 3 * 3) + 'rpx' })
}
const CLOUD_LIST = [
  { t: '10%', s: '70rpx', d: '28s', del: '0s' },
  { t: '30%', s: '90rpx', d: '35s', del: '-10s' },
  { t: '55%', s: '60rpx', d: '22s', del: '-16s' },
  { t: '22%', s: '80rpx', d: '30s', del: '-22s' },
  { t: '65%', s: '55rpx', d: '38s', del: '-6s' }
]
const FOG_LAYERS = [
  { t: '18%', o: '0.35', d: '14s' },
  { t: '45%', o: '0.25', d: '18s' },
  { t: '72%', o: '0.40', d: '11s' }
]
const GLASS_DROPS = []
for (let i = 0; i < 24; i++) {
  GLASS_DROPS.push({ l: (3 + (i * 13) % 94) + '%', t: (-5 + (i * 7) % 30) + '%', d: (3 + (i % 6) * 1.4).toFixed(1) + 's', del: ((i * 0.55) % 4.8).toFixed(1) + 's', s: (5 + (i % 5) * 3) + 'rpx', o: (0.25 + (i % 4) * 0.15).toFixed(2) })
}

function formatAstronomyTime(timeStr) {
  if (!timeStr || timeStr === '--') return '--'
  const tPart = timeStr.split('T')[1]
  if (!tPart) return '--'
  return tPart.split('+')[0].slice(0, 5)
}

Page({
  data: {
    greet: '', nickname: '', currentDate: '', journeyDays: 0, gender: '',
    timePeriod: 'morning', greetText: '', greetEmoji: '', greetDesc: '',
    weatherLoaded: false, weatherIcon: '', weatherText: '', weatherTemp: '',
    weatherCity: '', weatherTip: '', showLocationModal: false,
    showWeatherDetail: false, weatherAnimType: 'sunny',
    weatherBg: WEATHER_BG.sunny, wdTextColor: '#fff', wd: {},
    rainDrops: RAIN_DROPS, snowFlakes: SNOW_FLAKES,
    sunParticles: SUN_PARTICLES, cloudList: CLOUD_LIST, fogLayers: FOG_LAYERS,
    greetWeatherReady: false, greetBg: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)', greetAnimType: '', glassDrops: GLASS_DROPS,
    calIntake: 0, calBurn: 0, calTarget: 0, calPercent: 0, isOverTarget: false,
    surplusText: '热量缺口', calSurplusShow: 0, surplusColor: '#6BCB77',
    remainingCal: 0, remainingText: '还可吃', remainingColor: '#6BCB77',
    burnPct: 0, intakePct: 0, ringGrad: 'conic-gradient(from 270deg,#F0ECF5 0deg 360deg)',
    calWarning: '', calWarningText: '', calPlan: null, hasProfile: false, showTDEEDetails: false,
    waterTotalTargetML: 1800, waterTodayML: 0, waterPercent: 0,
    dietPercent: 0,
    /* ★ 修改点：新增 exerciseCalOnly，用于快捷卡片显示纯运动热量 */
    exerciseCalOnly: 0,
    foodBursting: false, sportBursting: false, moodBursting: false, sleepBursting: false,
    foodBurstList: ['🍎', '🥑', '🥕', '🍚', '🍇', '🥗', '🍲', '🥙', '🍌', '🍓'],
    sportBurstList: ['🏃', '💪', '🔥', '⚡', '💦', '🎯', '🚴', '🏊', '🧘', '🌟'],
    moodBurstList: ['🥰', '💖', '✨', '🌸', '🌈', '😊', '💕', '🦋', '☀️', '🎵'],
    sleepBurstList: ['🌙', '⭐', '💤', '🌟', '☁️', '✨', '🧸', '🌜', '💫', '🫧'],
    showCutePopup: false, cutePopupEmoji: '', cutePopupTitle: '', cutePopupDesc: ''
  },

  /* ===== tabbar 统一控制 ===== */
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

  onShow() {
    const g = app.globalData, now = new Date(), tInfo = this.getTimeInfo()
    let journeyDays = 1
    try { journeyDays = app.getJourneyDays() } catch (e) {}

    const waterTotalTargetML = g.waterTotalTargetML || 1800
    const waterTodayML = g.waterTodayML || 0
    const waterPercent = waterTotalTargetML > 0 ? Math.min(Math.round(waterTodayML / waterTotalTargetML * 100), 100) : 0

    if (app.globalData.playlistVisible) {
      this._hideTab()
      return
    }
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })}
    if (!this.data.showWeatherDetail) {
      this._showTab()
    }

    this.setData({
      timePeriod: tInfo.period, greet: tInfo.text, greetText: tInfo.text,
      greetEmoji: tInfo.emoji, greetDesc: tInfo.desc, nickname: g.userInfo?.nickname || '',
      currentDate: now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日',
      journeyDays, gender: g.userInfo?.gender || '',
      waterTotalTargetML, waterTodayML, waterPercent,
      weatherAnimType: this.data.weatherAnimType || 'sunny'
    })
    this._fetchWeather()
    this._calcCalorie(g)
  },

  onPlaylistChange(e) {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ visible: !e.detail.visible })
    }
  },

  _updateGreetByWeather(anim) {
    this.setData({ greetWeatherReady: true, greetBg: WEATHER_BG[anim] || WEATHER_BG.sunny, greetAnimType: anim })
  },

  _fetchWeather() {
    if (this.data.weatherLoaded) return
    const that = this
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userLocation'] === true) that._doWeatherRequest()
        else if (!_askedLocation) that.setData({ showLocationModal: true })
      },
      fail() { if (!_askedLocation) that.setData({ showLocationModal: true }) }
    })
  },

  onAllowLocation() {
    _askedLocation = true; this.setData({ showLocationModal: false }); const that = this
    wx.getLocation({ type: 'gcj02', isHighAccuracy: false, success() { that._doWeatherRequest() }, fail() { wx.showToast({ title: '需要位置权限才能获取天气', icon: 'none' }) } })
  },
  onDenyLocation() { _askedLocation = true; this.setData({ showLocationModal: false }) },
  onTapWeather() {
    if (!this.data.weatherLoaded) { _askedLocation = false; this._fetchWeather(); return }
    this._hideTab()
    this.setData({ showWeatherDetail: true })
  },
  closeWeatherDetail() {
    this._showTab()
    this.setData({ showWeatherDetail: false })
  },

  _doWeatherRequest() {
    const that = this
    wx.getLocation({
      type: 'gcj02', isHighAccuracy: false,
      success(loc) {
        const lat = parseFloat(loc.latitude), lon = parseFloat(loc.longitude)
        const locStr = lon.toFixed(2) + ',' + lat.toFixed(2)
        that._fetchQWeather(locStr, function(ok) { if (!ok) that._fetchOpenMeteo(lon, lat) })
      },
      fail() { wx.showToast({ title: '定位失败', icon: 'none' }) }
    })
  },

  _fetchQWeather(locStr, callback) {
    const that = this; let nowDone = false, dayDone = false, nowOK = false, nowResp = null, dayResp = null
    const check = function() {
      if (!nowDone || !dayDone) return
      if (!nowOK) { callback(false); return }
      try { that._renderCoreWeather(nowResp, dayResp) } catch (e) { callback(false); return }
      callback(true); that._fetchAdditionalWeather(locStr)
    }
    this.qwRequest(QW_BASE + '/v7/weather/now?location=' + locStr, function(d) { nowResp = d; nowOK = true }, function() {}, function() { nowDone = true; check() })
    this.qwRequest(QW_BASE + '/v7/weather/7d?location=' + locStr, function(d) { dayResp = d }, function() {}, function() { dayDone = true; check() })
  },

  _renderCoreWeather(nowResp, dayResp) {
    const now = nowResp.now
    const temp = parseInt(now.temp), icon = now.icon, text = now.text, humidity = parseInt(now.humidity)
    const windSpeed = parseFloat(now.windSpeed), windDirStr = now.windDir || '--'
    const pressure = now.pressure, vis = now.vis, feelsLike = parseInt(now.feelsLike)
    let tempMax = temp, tempMin = temp, sunrise = '--', sunset = '--', uvIndex = '--', forecast7d = []
    if (dayResp && dayResp.daily) {
      const daily = dayResp.daily; let allMin = 999, allMax = -999
      daily.forEach(function(item) { const mn = parseInt(item.tempMin), mx = parseInt(item.tempMax); if (mn < allMin) allMin = mn; if (mx > allMax) allMax = mx })
      const gRange = allMax - allMin || 1
      const self = this
      daily.forEach(function(item, i) {
        const mn = parseInt(item.tempMin), mx = parseInt(item.tempMax)
        forecast7d.push({
          dayName: self.getDayName(i), iconDay: self.getQWeatherEmoji(item.iconDay), textDay: item.textDay || '',
          iconNight: self.getQWeatherEmoji(item.iconNight), textNight: item.textNight || '',
          tempMin: mn, tempMax: mx,
          barLeft: ((mn - allMin) / gRange * 100).toFixed(0),
          barWidth: Math.max(((mx - mn) / gRange * 100).toFixed(0), 8),
          humidity: item.humidity || '--', uvIndex: item.uvIndex || '--',
          windDirDay: item.windDirDay || '--', windScaleDay: item.windScaleDay || '--'
        })
      })
      if (daily[0]) {
        tempMax = parseInt(daily[0].tempMax) || temp; tempMin = parseInt(daily[0].tempMin) || temp
        sunrise = formatAstronomyTime(daily[0].sunrise) || '--'; sunset = formatAstronomyTime(daily[0].sunset) || '--'
        uvIndex = daily[0].uvIndex || '--'
      }
    }
    const anim = this.getAnimTypeByQWeather(icon, text), weatherIcon = this.getQWeatherEmoji(icon)
    this.setData({
      weatherLoaded: true, weatherTemp: temp + '°', weatherText: text, weatherIcon, weatherCity: '当前位置',
      weatherTip: this.getWeatherTip(text, temp), weatherAnimType: anim,
      weatherBg: WEATHER_BG[anim] || WEATHER_BG.sunny, wdTextColor: WD_TEXT[anim] || '#fff',
      wd: {
        temp: temp + '°', desc: text, icon: weatherIcon, feelsLike: feelsLike + '°',
        tempMin: tempMin + '°', tempMax: tempMax + '°', humidity: humidity + '%',
        windSpeed: windSpeed + ' km/h', windDir: windDirStr,
        pressure: pressure ? pressure + ' hPa' : '--', visibility: vis ? vis + ' km' : '--',
        cloudiness: (now.cloud || '--') + '%', sunrise, sunset, uvIndex,
        advices: this.getWeatherAdvices(temp, text, humidity, windSpeed),
        source: '和风天气', cityName: '当前位置', airQuality: null, warnings: [], indices: [],
        astronomy: null, minutely: null, forecast7d: forecast7d,
        weatherAnimType: anim
      }
    })
    this._updateGreetByWeather(anim)
  },

  _fetchAdditionalWeather(locStr) {
    const that = this
    const patch = { cityName: null, airQuality: null, warnings: null, indices: null, astronomy: null, minutely: null }
    let total = 7, done = 0
    const finish = function() {
      done++; if (done < total) return
      const diff = {}
      if (patch.cityName !== null) diff['wd.cityName'] = patch.cityName
      if (patch.airQuality !== null) diff['wd.airQuality'] = patch.airQuality
      if (patch.warnings !== null) diff['wd.warnings'] = patch.warnings
      if (patch.indices !== null) diff['wd.indices'] = patch.indices
      if (patch.astronomy !== null) diff['wd.astronomy'] = patch.astronomy
      if (patch.minutely !== null) diff['wd.minutely'] = patch.minutely
      if (Object.keys(diff).length > 0) that.setData(diff)
    }
    this.qwRequest(QW_GEO + '/v2/city/lookup?location=' + locStr, function(d) {
      if (d.location && d.location[0]) patch.cityName = d.location[0].adm2 || d.location[0].name || ''
    }, null, finish)
    this.qwRequest(QW_BASE + '/v7/air/now?location=' + locStr, function(d) {
      if (d.now) {
        const aqi = parseInt(d.now.aqi), info = that.getAQIInfo(aqi)
        patch.airQuality = { aqi, category: d.now.category || info.level, primary: d.now.primary || '', pm2p5: d.now.pm2p5 || '--', pm10: d.now.pm10 || '--', no2: d.now.no2 || '--', so2: d.now.so2 || '--', co: d.now.co || '--', o3: d.now.o3 || '--', color: info.color, emoji: info.emoji }
      }
    }, null, finish)
    this.qwRequest(QW_BASE + '/v7/warning/now?location=' + locStr, function(d) {
      if (d.warning && d.warning.length) {
        const arr = d.warning.filter(function(w) { return w.status === 'active' || w.status === 'actual' }).map(function(w) { return { title: w.title || (w.typeName + '预警'), text: w.text || '', level: w.level || '', color: that.getWarningColor(w.level), typeName: w.typeName || '', sender: w.sender || '' } })
        if (arr.length) patch.warnings = arr
      }
    }, null, finish)
    this.qwRequest(QW_BASE + '/v7/indices/1d?type=1,2,3,5,8,9&location=' + locStr, function(d) {
      if (d.daily && d.daily.length) patch.indices = d.daily.map(function(idx) { return { type: idx.type, name: idx.name, category: idx.category, text: idx.text || '', level: idx.level || '', icon: that.getIndicesIcon(idx.type) } })
    }, null, finish)
    const dateStr = fmtDate(new Date())
    this.qwRequest(QW_BASE + '/v7/astronomy/sun?location=' + locStr + '&date=' + dateStr, function(d) {
      patch.astronomy = patch.astronomy || {}
      patch.astronomy.sunrise = formatAstronomyTime(d.sunrise) || '--'
      patch.astronomy.sunset = formatAstronomyTime(d.sunset) || '--'
    }, null, finish)
    this.qwRequest(QW_BASE + '/v7/astronomy/moon?location=' + locStr + '&date=' + dateStr, function(d) {
      patch.astronomy = patch.astronomy || {}
      patch.astronomy.moonrise = formatAstronomyTime(d.moonrise) || '--'
      patch.astronomy.moonset = formatAstronomyTime(d.moonset) || '--'
      if (d.moonPhase && d.moonPhase[0]) {
        const mp = d.moonPhase[0]
        patch.astronomy.moonPhase = mp.moonPhase || '--'
        patch.astronomy.moonPhaseIcon = that.getMoonPhaseEmoji(mp.moonPhase)
        patch.astronomy.moonIllumination = (mp.moonIllumination !== undefined && mp.moonIllumination !== null && mp.moonIllumination !== '') ? mp.moonIllumination + '%' : '--'
      }
    }, null, finish)
    this.qwRequest(QW_BASE + '/v7/minutely/5m?location=' + locStr, function(d) {
      const obj = { summary: d.summary || '暂无短时降水预报', items: [] }
      if (d.minutely && d.minutely.length) {
        let maxP = 0; d.minutely.forEach(function(item) { const p = parseFloat(item.precip) || 0; if (p > maxP) maxP = p })
        d.minutely.forEach(function(item) {
          const p = parseFloat(item.precip) || 0
          const h = maxP > 0 ? Math.max(Math.round(p / maxP * 50), p > 0 ? 4 : 0) : 0
          obj.items.push({ precip: p, height: h, color: p > 0 ? '#5B9BD5' : '#E0E0E0' })
        })
      }
      patch.minutely = obj
    }, null, finish)
  },

  _fetchOpenMeteo(lon, lat) {
    const that = this
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,weather_code&timezone=auto&forecast_days=7'
    wx.request({
      url: url, method: 'GET', timeout: 10000,
      success(res) {
        try {
          const d = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
          if (res.statusCode !== 200 || !d || !d.current) { wx.showToast({ title: '天气获取失败', icon: 'none' }); that.setData({ weatherLoaded: false }); return }
          const cur = d.current, daily = d.daily, temp = Math.round(cur.temperature_2m), code = cur.weather_code, text = that.getOpenMeteoText(code)
          const humidity = cur.relative_humidity_2m, windSpeed = cur.wind_speed_10m, windDeg = cur.wind_direction_10m, feelsLike = Math.round(cur.apparent_temperature)
          let tempMax = temp, tempMin = temp, sunrise = '--', sunset = '--', uvIndex = '--', forecast7d = []
          if (daily) {
            tempMax = Math.round(daily.temperature_2m_max[0]); tempMin = Math.round(daily.temperature_2m_min[0])
            sunrise = (daily.sunrise[0] ? daily.sunrise[0].slice(11, 16) : '--') || '--'
            sunset = (daily.sunset[0] ? daily.sunset[0].slice(11, 16) : '--') || '--'
            uvIndex = daily.uv_index_max[0] || '--'
            let allMin = 999, allMax = -999
            daily.temperature_2m_min.forEach(function(m, i) { const mn = Math.round(m), mx = Math.round(daily.temperature_2m_max[i]); if (mn < allMin) allMin = mn; if (mx > allMax) allMax = mx })
            const gR = allMax - allMin || 1
            daily.temperature_2m_min.forEach(function(m, i) {
              const mn = Math.round(m), mx = Math.round(daily.temperature_2m_max[i]), codeD = daily.weather_code ? daily.weather_code[i] : 0
              forecast7d.push({
                dayName: that.getDayName(i), iconDay: that.getOpenMeteoEmoji(codeD), textDay: that.getOpenMeteoText(codeD),
                tempMin: mn, tempMax: mx,
                barLeft: ((mn - allMin) / gR * 100).toFixed(0),
                barWidth: Math.max(((mx - mn) / gR * 100).toFixed(0), 8)
              })
            })
          }
          const anim = that.getAnimTypeByOpenMeteo(code)
          that.setData({
            weatherLoaded: true, weatherTemp: temp + '°', weatherText: text, weatherIcon: that.getOpenMeteoEmoji(code), weatherCity: '当前位置',
            weatherTip: that.getWeatherTip(text, temp), weatherAnimType: anim,
            weatherBg: WEATHER_BG[anim] || WEATHER_BG.sunny, wdTextColor: WD_TEXT[anim] || '#fff',
            wd: {
              temp: temp + '°', desc: text, icon: that.getOpenMeteoEmoji(code), feelsLike: feelsLike + '°',
              tempMin: tempMin + '°', tempMax: tempMax + '°', humidity: humidity + '%',
              windSpeed: windSpeed + ' km/h', windDir: that.getWindDir(windDeg),
              pressure: '--', visibility: '--', cloudiness: '--', sunrise, sunset, uvIndex,
              advices: that.getWeatherAdvices(temp, text, humidity, windSpeed),
              source: 'Open-Meteo', cityName: '当前位置', airQuality: null, warnings: [], indices: [],
              astronomy: null, minutely: null, forecast7d: forecast7d,
              weatherAnimType: anim
            }
          })
          that._updateGreetByWeather(anim)
        } catch (e) { wx.showToast({ title: '天气解析失败', icon: 'none' }); that.setData({ weatherLoaded: false }) }
      },
      fail() { wx.showToast({ title: '天气获取失败', icon: 'none' }); that.setData({ weatherLoaded: false }) }
    })
  },

  /* ★ 核心修改：用 getTodayIntake() 从存储直接读取今日摄入 */
  _calcCalorie(g) {
    if (!g) g = {}
    if (!g.userInfo) g.userInfo = {}
    const u = g.userInfo
    const hasBody = u && u.weight && u.height && u.age && u.gender

    /* 从存储直接读取今日摄入，与饮食记录页完全同步 */
    var todayIntake = getTodayIntake()
    var intake = todayIntake.cal
    g.calorieIntake = intake

    /* ★ 修改点：用 fmtDatePad 确保日期格式带补零，与运动记录一致 */
    var exerciseRecords = wx.getStorageSync('exerciseRecords') || []
    var todayStr = fmtDatePad(new Date())
    var todayExRecord = null
    for (var ei = 0; ei < exerciseRecords.length; ei++) {
      if (exerciseRecords[ei].date === todayStr) {
        todayExRecord = exerciseRecords[ei]
        break
      }
    }
    var exerciseCal = 0
    if (todayExRecord && todayExRecord.sports) {
      for (var ej = 0; ej < todayExRecord.sports.length; ej++) {
        exerciseCal += (todayExRecord.sports[ej].cal || 0)
      }
    }
    g.calorieBurn = exerciseCal

    if (hasBody) {
      app.calcTargetCalorie()
      const actIdx = typeof u.activity === 'number' ? u.activity : 0
      const goalIdx = typeof u.goal === 'number' ? u.goal : 2
      const dt = g.tdeeDetail || {}
      const bmr = dt.bmr || 0

      const burnDisplay = bmr + exerciseCal
      const target = dt.target || 2000
      const adjust = dt.adjust || 0
      const surplus = intake - burnDisplay

      const burnPct = target > 0 ? Math.min(Math.round(burnDisplay / target * 100), 100) : 0
      const intakePct = target > 0 ? Math.min(Math.round(intake / target * 100), 100) : 0
      const dietPercent = target > 0 ? Math.min(Math.round(intake / target * 100), 100) : 0
      const bEnd = burnPct * 1.8
      const iEnd = 180 + intakePct * 1.8

      let ringGrad
      if (bEnd > 0 && iEnd > 180) {
        ringGrad = 'conic-gradient(from 270deg,#FFD700 0deg,#FF8C00 ' + (bEnd * 0.35).toFixed(1) + 'deg,#FF4500 ' + (bEnd * 0.7).toFixed(1) + 'deg,#FF6B6B ' + bEnd.toFixed(1) + 'deg,#F0ECF5 ' + bEnd.toFixed(1) + 'deg 180deg,#8EC5FC 180deg,#6C8EEF ' + (180 + (iEnd - 180) * 0.5).toFixed(1) + 'deg,#FFB4C2 ' + iEnd.toFixed(1) + 'deg,#F0ECF5 ' + iEnd.toFixed(1) + 'deg 360deg)'
      } else if (bEnd > 0) {
        ringGrad = 'conic-gradient(from 270deg,#FFD700 0deg,#FF4500 ' + bEnd.toFixed(1) + 'deg,#F0ECF5 ' + bEnd.toFixed(1) + 'deg 360deg)'
      } else if (iEnd > 180) {
        ringGrad = 'conic-gradient(from 270deg,#F0ECF5 0deg 180deg,#8EC5FC 180deg,#FFB4C2 ' + iEnd.toFixed(1) + 'deg,#F0ECF5 ' + iEnd.toFixed(1) + 'deg 360deg)'
      } else {
        ringGrad = 'conic-gradient(from 270deg,#F0ECF5 0deg 360deg)'
      }

      const surplusColor = surplus > 0 ? '#FF6B6B' : surplus < 0 ? '#6BCB77' : '#F5A623'
      this.setData({
        hasProfile: true,
        calPlan: {
          bmr: bmr, tdee: dt.tdee || 0, exerciseCal: exerciseCal, dailyBurn: dt.dailyBurn || 0, adjust: adjust, target: target,
          adjustText: (adjust > 0 ? '+' : '') + adjust,
          activityLabel: ACT_LABELS[actIdx] || '久坐不动',
          activityMultiplier: ACT_MULTI[actIdx] || 1.2,
          activityDesc: ACT_DESCS[actIdx] || '',
          activityIcon: ACT_ICONS[actIdx] || '🪑',
          goalLabel: GOAL_LABELS[goalIdx] || '维持体重',
          goalColor: GOAL_COLORS[goalIdx] || '#6BCB77',
          goalIcon: GOAL_ICONS[goalIdx] || '⚖️',
          goalDesc: GOAL_DESCS[goalIdx] || ''
        },
        calIntake: intake, calBurn: burnDisplay, calTarget: target, calPercent: intakePct, isOverTarget: intake > target,
        surplusText: surplus >= 0 ? '热量盈余' : '热量缺口', calSurplusShow: Math.abs(surplus), surplusColor: surplusColor,
        remainingCal: Math.abs(target - intake), remainingText: (target - intake) >= 0 ? '还可吃' : '已超出', remainingColor: (target - intake) >= 0 ? '#6BCB77' : '#FF6B6B',
        burnPct: burnPct, intakePct: intakePct, ringGrad: ringGrad,
        dietPercent: dietPercent,
        /* ★ 修改点：快捷卡片用纯运动热量 */
        exerciseCalOnly: exerciseCal
      })
    } else {
      const dt2 = g.calorieTarget || 2000

      const surplus2 = intake - exerciseCal
      const bp2 = dt2 > 0 ? Math.min(Math.round(exerciseCal / dt2 * 100), 100) : 0
      const ip2 = dt2 > 0 ? Math.min(Math.round(intake / dt2 * 100), 100) : 0
      const dietPercent2 = dt2 > 0 ? Math.min(Math.round(intake / dt2 * 100), 100) : 0
      const be2 = bp2 * 1.8
      const ie2 = 180 + ip2 * 1.8

      const rg2 = 'conic-gradient(from 270deg,#FFD700 0deg,#FF6B6B ' + be2.toFixed(1) + 'deg,#F0ECF5 ' + be2.toFixed(1) + 'deg 180deg,#8EC5FC 180deg,#FFB4C2 ' + ie2.toFixed(1) + 'deg,#F0ECF5 ' + ie2.toFixed(1) + 'deg 360deg)'
      const sc2 = surplus2 > 0 ? '#FF6B6B' : surplus2 < 0 ? '#6BCB77' : '#F5A623'

      this.setData({
        hasProfile: false, calPlan: null, calIntake: intake, calBurn: exerciseCal, calTarget: dt2, calPercent: ip2, isOverTarget: intake > dt2,
        surplusText: surplus2 >= 0 ? '热量盈余' : '热量缺口', calSurplusShow: Math.abs(surplus2), surplusColor: sc2,
        remainingCal: Math.abs(dt2 - intake), remainingText: (dt2 - intake) >= 0 ? '还可吃' : '已超出',
        remainingColor: (dt2 - intake) >= 0 ? '#6BCB77' : '#FF6B6B', burnPct: bp2, intakePct: ip2, ringGrad: rg2,
        dietPercent: dietPercent2,
        /* ★ 修改点：无身体档案时也用纯运动热量 */
        exerciseCalOnly: exerciseCal
      })
    }

    const cT = this.data.calTarget
    const cI = this.data.calIntake
    let calWarning = '', calWarningText = ''
    if (cI > 0 && cI < Math.max(800, 0.4 * cT)) {
      calWarning = 'low'
      calWarningText = '今日摄入严重不足，请注意均衡饮食'
    } else if (cT > 0 && cI > cT + 500) {
      calWarning = 'high'
      calWarningText = '今日摄入已超出目标 500 千卡以上'
    }
    this.setData({ calWarning, calWarningText })

    let todayPlan = {}
    try { todayPlan = JSON.parse(JSON.stringify(g.todayPlan || {})) } catch (e) {}
    todayPlan.foodTip = todayPlan.foodTip || '均衡饮食，好好宠爱自己~'
    todayPlan.sportTip = todayPlan.sportTip || '动一动，身体会感谢你~'
    todayPlan.moodTip = todayPlan.moodTip || '今天也要开心鸭~'
    todayPlan.sleepTip = todayPlan.sleepTip || '早点休息做个好梦~'
    this.setData({ todayPlan })
  },

  toggleTDEEDetails() {
    this.setData({ showTDEEDetails: !this.data.showTDEEDetails })
  },
  goProfile() {
    wx.navigateTo({ url: '/pages/profile/profile?edit=1' })
  },
  goWaterPage() {
    wx.navigateTo({ url: '/pages/water/water', success: () => console.log('跳转成功'),
    fail: (err) => console.error('跳转失败', err)})
  },
  goDiet() {
    wx.navigateTo({ url: '/pages/diet/diet' })
  },
  goExercise() {
    wx.navigateTo({ url: '/pages/exercise/exercise' })
  },
  goWomenHealth() {
    wx.navigateTo({ url: '/pages/women-health/women-health' })
  },
  goPooCalendar() {
    wx.navigateTo({ url: '/pages/poo/poo-calendar' })
  },
  onFoodBurst() {
    if (this.data.foodBursting) return;
    this.setData({ foodBursting: true });
    setTimeout(() => this.setData({ foodBursting: false }), 2000)
  },
  onSportBurst() {
    if (this.data.sportBursting) return;
    this.setData({ sportBursting: true });
    setTimeout(() => this.setData({ sportBursting: false }), 2000)
  },
  onMoodBurst() {
    if (this.data.moodBursting) return;
    this.setData({ moodBursting: true });
    setTimeout(() => this.setData({ moodBursting: false }), 2000)
  },
  onSleepBurst() {
    if (this.data.sleepBursting) return;
    this.setData({ sleepBursting: true });
    setTimeout(() => this.setData({ sleepBursting: false }), 2000)
  },

  openCCTVWeather() {
    const url = 'https://weather.cctv.com/'
    wx.navigateTo({
      url: '/pages/webview/webview?url=' + encodeURIComponent(url),
      fail: () => {
        wx.setClipboardData({ data: url })
        this.setData({
          showCutePopup: true,
          cutePopupEmoji: '🌐',
          cutePopupTitle: '链接已复制~',
          cutePopupDesc: '央视天气链接已复制到剪贴板\n请在浏览器中粘贴打开哦'
        })
      }
    })
  },
  closeCutePopup() {
    this.setData({ showCutePopup: false })
  },

  qwRequest(url, success, fail, complete) {
    wx.request({
      url,
      method: 'GET',
      timeout: 10000,
      header: QW_AUTH,
      success: (res) => {
        try {
          const d = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
          if (res.statusCode === 200 && d && d.code === '200') success(d)
          else if (fail) fail()
        } catch (e) { if (fail) fail() }
      },
      fail: () => { if (fail) fail() },
      complete: () => { if (complete) complete() }
    })
  },

  getQWeatherEmoji(icon) {
    return {
      '100': '☀️', '150': '🌙', '101': '🌤️', '151': '☁️', '102': '⛅', '152': '⛅', '103': '⛅', '153': '☁️', '104': '☁️', '154': '☁️',
      '300': '🌦️', '350': '🌧️', '301': '🌧️', '351': '🌧️', '302': '⛈️', '352': '⛈️', '303': '⛈️', '353': '⛈️', '304': '⛈️', '354': '⛈️',
      '305': '🌧️', '355': '🌧️', '306': '🌧️', '356': '🌧️', '307': '🌧️', '357': '🌧️', '308': '🌧️', '309': '🌧️', '399': '🌧️',
      '400': '❄️', '456': '❄️', '401': '❄️', '457': '❄️', '402': '❄️', '458': '❄️', '403': '❄️', '459': '❄️', '404': '❄️', '405': '❄️',
      '500': '🌫️', '501': '🌫️', '509': '🌫️', '510': '🌫️', '514': '🌫️', '515': '🌫️', '502': '😷', '511': '😷', '999': '🌤️'
    }[icon] || '🌤️'
  },

  getAnimTypeByQWeather(icon, text) {
    if (!icon && !text) return 'sunny'
    const ic = String(icon), tx = (text || '').toLowerCase()
    if (ic.startsWith('30') || tx.includes('雷')) return 'thunder'
    if (ic >= '300' && ic <= '399' || tx.includes('雨')) return 'rainy'
    if (ic >= '400' && ic <= '499' || tx.includes('雪')) return 'snowy'
    if (ic >= '500' && ic <= '515' || tx.includes('雾') || tx.includes('霾')) return 'foggy'
    if (['101', '103', '104', '151', '153', '154'].includes(ic) || tx.includes('云')) return 'cloudy'
    return 'sunny'
  },
  getOpenMeteoEmoji(code) {
    return { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️', 51: '🌧️', 61: '🌧️', 71: '❄️', 95: '⛈️' }[code] || '🌤️'
  },
  getAnimTypeByOpenMeteo(code) {
    if (code >= 95) return 'thunder'
    if (code >= 51 && code <= 67) return 'rainy'
    if (code >= 71 && code <= 77 || code >= 85) return 'snowy'
    if (code >= 45 && code <= 48) return 'foggy'
    if (code >= 1 && code <= 3) return 'cloudy'
    return 'sunny'
  },
  getOpenMeteoText(code) {
    return { 0: '晴', 1: '少云', 2: '多云', 3: '阴', 45: '雾', 48: '雾凇', 51: '小雨', 61: '小雨', 71: '雪', 95: '雷暴' }[code] || '多云'
  },
  getTimeInfo() {
    const h = new Date().getHours()
    if (h >= 5 && h < 9) return { period: 'morning', text: '早安', emoji: '🌅', desc: '新的一天元气满满' }
    if (h >= 9 && h < 12) return { period: 'morning', text: '上午好', emoji: '☀️', desc: '阳光正好，一起加油' }
    if (h >= 12 && h < 14) return { period: 'noon', text: '中午好', emoji: '🌤️', desc: '忙了一上午，该补充能量啦' }
    if (h >= 14 && h < 18) return { period: 'afternoon', text: '下午好', emoji: '⛅', desc: '午后时光，继续努力' }
    if (h >= 18 && h < 21) return { period: 'evening', text: '傍晚好', emoji: '🌇', desc: '辛苦了一天，放松一下吧' }
    return { period: 'night', text: '晚安', emoji: '🌙', desc: '月亮值班啦，早点休息哦' }
  },
  getWeatherTip(c, t) {
    if (!c) return ''
    const s = c.toLowerCase()
    if (s.includes('雨')) return '🌧️ 下雨记得带伞'
    if (s.includes('雷')) return '⛈️ 有雷暴，注意安全'
    if (s.includes('雪')) return '❄️ 下雪路滑，注意保暖'
    if (s.includes('雾') || s.includes('霾')) return '😷 空气一般，出门戴口罩'
    if (t >= 35) return '🌡️ 天气炎热，注意防暑'
    if (t >= 28) return '☀️ 注意防晒'
    if (t >= 18) return '🌿 天气舒适，适合运动'
    return '🧥 有点凉，记得添衣'
  },
  getWindDir(deg) {
    if (deg === undefined) return '--'
    return ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风'][Math.round(deg / 45) % 8]
  },
  getWeatherAdvices(temp, main, humidity, windSpeed) {
    const arr = []
    if (temp >= 33) arr.push({ icon: '👕', title: '穿衣', text: '短袖短裤，轻薄透气' })
    else if (temp >= 26) arr.push({ icon: '👗', title: '穿衣', text: '短袖T恤，舒适清爽' })
    else if (temp >= 20) arr.push({ icon: '👔', title: '穿衣', text: '薄衫或外套，舒适为主' })
    else if (temp >= 13) arr.push({ icon: '🧥', title: '穿衣', text: '卫衣+外套，注意防风' })
    else arr.push({ icon: '🧣', title: '穿衣', text: '厚外套，注意保暖' })
    return arr
  },
  getDayName(index) {
    if (index === 0) return '今天'
    if (index === 1) return '明天'
    const d = new Date()
    d.setDate(d.getDate() + index)
    return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
  },
  getMoonPhaseEmoji(name) {
    if (!name) return '🌙'
    if (name.includes('新')) return '🌑'
    if (name.includes('上弦')) return '🌓'
    if (name.includes('满')) return '🌕'
    if (name.includes('下弦')) return '🌗'
    return '🌙'
  },
  getAQIInfo(aqi) {
    aqi = parseInt(aqi) || 0
    if (aqi <= 50) return { level: '优', color: '#6BCB77', emoji: '😊' }
    if (aqi <= 100) return { level: '良', color: '#FFD700', emoji: '🙂' }
    if (aqi <= 150) return { level: '轻度污染', color: '#FF8C00', emoji: '😐' }
    if (aqi <= 200) return { level: '中度污染', color: '#FF4500', emoji: '😷' }
    return { level: '严重污染', color: '#C62828', emoji: '☠️' }
  },
  getWarningColor(level) {
    if (!level) return '#FFD700'
    const l = level.toLowerCase()
    if (l.includes('蓝')) return '#4A90D9'
    if (l.includes('黄')) return '#FFD700'
    if (l.includes('橙')) return '#FF8C00'
    if (l.includes('红')) return '#FF4500'
    return '#FFD700'
  },
  getIndicesIcon(type) {
    return { 1: '🏃', 2: '🚗', 3: '👔', 5: '🧴', 8: '😊', 9: '🤧' }[String(type)] || '📊'
  },
  preventScroll() {}
})
