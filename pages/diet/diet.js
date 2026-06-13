var app = getApp()
var { fmtDate, getTargetsForDate, getIntakeForDate, getTodayIntake } = require('../../utils/diet-targets')

var AI_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
var AI_KEY = 'c62d241acd944273adf6e18730c60e54.vT0N7RDsYVsMmY3P'
var AI_MODEL_TEXT = 'glm-4-flash'
var AI_MODEL_VISION = 'glm-4.6v'

var MEAL_ORDER = [
  {key:'breakfast',name:'早餐',emoji:'🍳'},
  {key:'snack_morning',name:'早加餐',emoji:'🍪'},
  {key:'lunch',name:'午餐',emoji:'🍔'},
  {key:'snack_afternoon',name:'午加餐',emoji:'🧁'},
  {key:'dinner',name:'晚餐',emoji:'🍲'},
  {key:'snack_evening',name:'晚加餐',emoji:'🍎'}
]

var MEAL_RATIO = {
  breakfast:0.25,snack_morning:0.05,lunch:0.30,
  snack_afternoon:0.10,dinner:0.25,snack_evening:0.05
}

Page({
  data:{
    dateStr:'',monthDay:'',weekDay:'',isToday:true,
    targets:null,mealSections:[],hasAnyRecord:false,
    intakeCal:0,intakeC:0,intakeP:0,intakeF:0,
    calPct:0,cPct:0,pPct:0,fPct:0,messages:[],
    showCalendar:false,calYear:0,calMonth:0,calCells:[],calMonthLabel:'',calSelectedDate:'',
    showSnackPicker:false,
    showEdit:false,editMeal:'',editUid:'',editName:'',editEmoji:'',
    editGrams:0,editCal:0,editC:0,editP:0,editF:0,
    aiExpanded:false,showAiPanel:false,aiMaskClosing:false,
    aiMode:'text',aiInputText:'',aiImagePreview:'',aiLoading:false,
    aiFoods:[],aiTotalCal:0,aiMeal:'',aiError:'',
    showDelModal:false
  },
  _currentDate:null,_recordDates:{},_bc:0,_bp:0,_bt:0,_bf:0,_aiTask:null,

  onLoad:function(){
    this._currentDate=new Date()
    this.setData({dateStr:fmtDate(new Date()),calSelectedDate:fmtDate(new Date()),aiMeal:this._defaultMeal()})
  },
  onShow:function(){this._loadDay()},
  onUnload:function(){if(this._aiTask){try{this._aiTask.abort()}catch(e){}}},

  _defaultMeal:function(){
    var h=new Date().getHours()
    if(h<10)return'breakfast';if(h<14)return'lunch'
    if(h<17)return'snack_afternoon';if(h<21)return'dinner';return'snack_evening'
  },

  _loadDay:function(){
    var ds=this.data.dateStr
    var all={};try{all=wx.getStorageSync('foodRecords')||{}}catch(e){}
    var rec=all[ds]||{}
    var targets=getTargetsForDate(ds)
    var sections=[],tc=0,tC=0,tP=0,tF=0
    var dailyCal=targets.cal||1800

    MEAL_ORDER.forEach(function(cfg){
      var list=rec[cfg.key]||[]
      if(!list.length)return
      var mc=0,mcb=0,mp=0,mf=0
      list.forEach(function(r){mc+=r.cal;mcb+=r.carbs||0;mp+=r.protein||0;mf+=r.fat||0})
      var recCal=Math.round(dailyCal*(MEAL_RATIO[cfg.key]||0.15))
      var actColor='normal'
      if(recCal>0&&mc>recCal*1.1)actColor='over'
      else if(recCal>0&&mc>=recCal*0.85)actColor='good'
      tc+=mc;tC+=mcb;tP+=mp;tF+=mf
      sections.push({
        key:cfg.key,name:cfg.name,emoji:cfg.emoji,
        list:list,totalCal:Math.round(mc),
        recommendCal:recCal,actColor:actColor,isLast:false
      })
    })

    if(sections.length>0)sections[sections.length-1].isLast=true

    var calPct=targets.cal>0?Math.min(Math.round(tc/targets.cal*100),150):0
    var cPct=targets.carbs>0?Math.min(Math.round(tC/targets.carbs*100),150):0
    var pPct=targets.protein>0?Math.min(Math.round(tP/targets.protein*100),150):0
    var fPct=targets.fat>0?Math.min(Math.round(tF/targets.fat*100),150):0
    var now=new Date(),isToday=fmtDate(now)===ds
    var parts=ds.split('-'),dObj=new Date(parseInt(parts[0]),parseInt(parts[1])-1,parseInt(parts[2]))
    var wk=['日','一','二','三','四','五','六']
    this.setData({
      isToday:isToday,monthDay:parseInt(parts[1])+'月'+parseInt(parts[2])+'日',
      weekDay:'周'+wk[dObj.getDay()],targets:targets,mealSections:sections,
      hasAnyRecord:sections.length>0,
      intakeCal:Math.round(tc),intakeC:+tC.toFixed(1),intakeP:+tP.toFixed(1),intakeF:+tF.toFixed(1),
      calPct:calPct,cPct:cPct,pPct:pPct,fPct:fPct,
      messages:this._buildMsg(tc,tC,tP,tF,targets)
    })
    var todayStr=fmtDate(new Date())
    if(ds===todayStr){try{var ti=getTodayIntake();app.globalData.calorieIntake=ti.cal}catch(e){}}
  },

  _buildMsg:function(cal,c,p,f,t){
    var m=[]
    if(cal===0)return m
    var r=cal/t.cal
    if(r>=0.95&&r<=1.05)m.push({type:'success',text:'太棒了！热量摄入完美达标 ✨'})
    else if(r>1.15)m.push({type:'warn',text:'热量超标'+Math.round((r-1)*100)+'%，注意控制哦'})
    else if(r>1.05)m.push({type:'warn',text:'热量略超标，下一餐可以清淡一些'})
    else if(r<0.7)m.push({type:'info',text:'热量缺口较大，记得按时补充营养哦'})
    else if(r<0.95)m.push({type:'info',text:'还可以再吃一些，加油完成目标~'})
    if(t.protein>0&&p/t.protein<0.7)m.push({type:'info',text:'🥩 蛋白质偏低，建议补充鸡胸肉、鸡蛋或牛奶'})
    if(t.carbs>0&&c/t.carbs<0.6)m.push({type:'info',text:'🍚 碳水偏低，可以适当补充主食或水果'})
    if(t.fat>0&&f/t.fat>1.3)m.push({type:'warn',text:'🫒 脂肪摄入偏高，减少油炸和坚果类食物'})
    return m
  },

  onPrevDay:function(){var d=new Date(this._currentDate);d.setDate(d.getDate()-1);this._currentDate=d;this.setData({dateStr:fmtDate(d)});this._loadDay()},
  onNextDay:function(){var d=new Date(this._currentDate);d.setDate(d.getDate()+1);var now=new Date();now.setHours(0,0,0,0);if(d>now)return;this._currentDate=d;this.setData({dateStr:fmtDate(d)});this._loadDay()},
  onGoToday:function(){this._currentDate=new Date();this.setData({dateStr:fmtDate(new Date())});this._loadDay()},

  openCalendar:function(){
    var d=this._currentDate||new Date(),allRec={};try{allRec=wx.getStorageSync('foodRecords')||{}}catch(e){}
    this._recordDates={}
    Object.keys(allRec).forEach(function(k){var r=allRec[k];if(Object.keys(r).some(function(mk){return r[mk]&&r[mk].length}))this._recordDates[k]=true}.bind(this))
    this.setData({showCalendar:true,calYear:d.getFullYear(),calMonth:d.getMonth(),calSelectedDate:this.data.dateStr})
    this._buildCalCells()
  },
  _buildCalCells:function(){
    var y=this.data.calYear,m=this.data.calMonth,fDow=new Date(y,m,1).getDay(),lastD=new Date(y,m+1,0).getDate()
    var todayStr=fmtDate(new Date()),selStr=this.data.calSelectedDate,rd=this._recordDates
    var now=new Date();now.setHours(0,0,0,0);var cells=[]
    for(var i=0;i<fDow;i++)cells.push({empty:true,key:'e'+i})
    for(var d=1;d<=lastD;d++){var ds=y+'-'+(m+1)+'-'+d;var dt=new Date(y,m,1);dt.setDate(d);dt.setHours(0,0,0,0);cells.push({empty:false,key:ds,day:d,dateStr:ds,isToday:ds===todayStr,isSelected:ds===selStr,hasRecord:!!rd[ds],isFuture:dt>now})}
    while(cells.length%7!==0)cells.push({empty:true,key:'t'+cells.length})
    while(cells.length<35)cells.push({empty:true,key:'p'+cells.length})
    this.setData({calCells:cells,calMonthLabel:y+'年'+(m+1)+'月'})
  },
  onCalPrev:function(){var m=this.data.calMonth-1,y=this.data.calYear;if(m<0){m=11;y--}this.setData({calYear:y,calMonth:m});this._buildCalCells()},
  onCalNext:function(){var m=this.data.calMonth+1,y=this.data.calYear;if(m>11){m=0;y++};var now=new Date();if(y>now.getFullYear()||(y===now.getFullYear()&&m>now.getMonth()))return;this.setData({calYear:y,calMonth:m});this._buildCalCells()},
  onCalDayTap:function(e){var ds=e.currentTarget.dataset.date;if(!ds)return;var cells=this.data.calCells,cell=null;for(var i=0;i<cells.length;i++){if(cells[i].dateStr===ds){cell=cells[i];break}};if(!cell||cell.empty||cell.isFuture)return;this.setData({calSelectedDate:ds});this._buildCalCells()},
  onCalGoToday:function(){var now=new Date();this.setData({calYear:now.getFullYear(),calMonth:now.getMonth(),calSelectedDate:fmtDate(now)});this._buildCalCells()},
  onCalConfirm:function(){var ds=this.data.calSelectedDate;if(!ds)return;var p=ds.split('-');this._currentDate=new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]));this.setData({showCalendar:false,dateStr:ds});this._loadDay()},
  onCalClose:function(){this.setData({showCalendar:false})},

  onNavTap:function(e){
    var type=e.currentTarget.dataset.type
    if(type==='snack'){this.setData({showSnackPicker:!this.data.showSnackPicker});return}
    this.setData({showSnackPicker:false})
    wx.navigateTo({url:'/pages/diet/add-food?meal='+type+'&date='+this.data.dateStr})
  },
  onSnackPick:function(e){this.setData({showSnackPicker:false});wx.navigateTo({url:'/pages/diet/add-food?meal='+e.currentTarget.dataset.key+'&date='+this.data.dateStr})},
  onSnackClose:function(){this.setData({showSnackPicker:false})},
  preventBubble:function(){},

  onFoodTap:function(e){
    var meal=e.currentTarget.dataset.meal,uid=e.currentTarget.dataset.uid,sec=null
    for(var i=0;i<this.data.mealSections.length;i++){if(this.data.mealSections[i].key===meal){sec=this.data.mealSections[i];break}}
    if(!sec)return;var r=null;for(var j=0;j<sec.list.length;j++){if(sec.list[j].uid===uid){r=sec.list[j];break}}
    if(!r)return
    this._bc=r.baseCal||(r.weight>0?Math.round(r.cal*100/r.weight):0)
    this._bp=r.baseC||(r.weight>0?+(r.carbs*100/r.weight).toFixed(1):0)
    this._bt=r.baseP||(r.weight>0?+(r.protein*100/r.weight).toFixed(1):0)
    this._bf=r.baseF||(r.weight>0?+(r.fat*100/r.weight).toFixed(1):0)
    this.setData({showEdit:true,editMeal:meal,editUid:uid,editName:r.name,editEmoji:r.emoji,editGrams:r.weight,editCal:r.cal,editC:r.carbs,editP:r.protein,editF:r.fat})
  },
  onEditOverlay:function(){this.setData({showEdit:false})},
  onEditInput:function(e){var v=parseInt(e.detail.value)||0;if(v>9999)v=9999;this.setData({editGrams:v});this._editCalc(v)},
  onEditStep:function(e){var g=this.data.editGrams+(parseInt(e.currentTarget.dataset.d)||0);if(g<10)g=10;if(g>9999)g=9999;this.setData({editGrams:g});this._editCalc(g)},
  onEditQuick:function(e){var g=parseInt(e.currentTarget.dataset.g)||100;this.setData({editGrams:g});this._editCalc(g)},
  _editCalc:function(g){var r=g/100;this.setData({editCal:Math.round(this._bc*r),editC:+(this._bp*r).toFixed(1),editP:+(this._bt*r).toFixed(1),editF:+(this._bf*r).toFixed(1)})},
  onEditSave:function(){
    var d=this.data;if(d.editGrams<=0){wx.showToast({title:'请输入克数',icon:'none'});return}
    var all={};try{all=wx.getStorageSync('foodRecords')||{}}catch(e){}
    var rec=all[d.dateStr];if(rec&&rec[d.editMeal]){var item=null;for(var i=0;i<rec[d.editMeal].length;i++){if(rec[d.editMeal][i].uid===d.editUid){item=rec[d.editMeal][i];break}}if(item){item.weight=d.editGrams;item.cal=d.editCal;item.carbs=d.editC;item.protein=d.editP;item.fat=d.editF;wx.setStorageSync('foodRecords',all)}}
    this.setData({showEdit:false});this._loadDay();wx.showToast({title:'已更新',icon:'success'})
  },
  onEditDelete:function(){this.setData({showDelModal:true})},
  onDelCancel:function(){this.setData({showDelModal:false})},
  onDelConfirm:function(){
    var that=this;var all={};try{all=wx.getStorageSync('foodRecords')||{}}catch(e){}
    var rec=all[that.data.dateStr]
    if(rec&&rec[that.data.editMeal]){rec[that.data.editMeal]=rec[that.data.editMeal].filter(function(r){return r.uid!==that.data.editUid});wx.setStorageSync('foodRecords',all)}
    that.setData({showDelModal:false,showEdit:false});that._loadDay();wx.showToast({title:'已删除',icon:'success'})
  },

  onAiMorphTap:function(){if(!this.data.aiExpanded)this.setData({showAiPanel:true,aiExpanded:true})},
  onAiCollapse:function(){
    this.setData({aiExpanded:false,aiMaskClosing:true})
    var that=this
    setTimeout(function(){that.setData({showAiPanel:false,aiMaskClosing:false});if(that._aiTask){try{that._aiTask.abort()}catch(e){}}},350)
  },
  onAiMode:function(e){
    var m=e.currentTarget.dataset.m
    this.setData({aiMode:m,aiFoods:[],aiTotalCal:0,aiError:'',aiInputText:''})
    if(m==='photo'){this.setData({aiImagePreview:''});this.onAiPhoto()}
  },
  onAiInput:function(e){this.setData({aiInputText:e.detail.value})},
  onAiSend:function(){var t=this.data.aiInputText.trim();if(!t||this.data.aiLoading)return;this.setData({aiLoading:true,aiFoods:[],aiError:''});this._aiCall([{role:'user',content:t}],false)},
  onAiPhoto:function(){
    var that=this
    wx.chooseMedia({count:1,mediaType:['image'],sourceType:['album','camera'],sizeType:['compressed'],
      success:function(r){var p=r.tempFiles[0].tempFilePath;wx.compressImage({src:p,quality:30,success:function(c){that._aiImg(c.tempFilePath)},fail:function(){that._aiImg(p)}})},
      fail:function(){if(!that.data.aiImagePreview)that.setData({aiMode:'text'})}
    })
  },
  onAiRemoveImg:function(){this.setData({aiImagePreview:'',aiLoading:false})},
  _aiImg:function(path){
    try{
      var b64=wx.getFileSystemManager().readFileSync(path,'base64')
      if(b64.length>500000){wx.showToast({title:'图片太大',icon:'none'});return}
      this.setData({aiImagePreview:path,aiLoading:true,aiFoods:[],aiError:''})
      this._aiCall([{role:'user',content:[{type:'text',text:'请识别图片中的所有食物并估算营养成分'},{type:'image_url',image_url:{url:'data:image/jpeg;base64,'+b64}}]}],true)
    }catch(e){wx.showToast({title:'图片处理失败',icon:'none'});this.setData({aiLoading:false})}
  },
  _aiCall:function(msgs,isImg){
    var that=this
    var sys='你是专业营养师。用户会描述一种或多种食物，或发食物照片，请估算每种食物每100克的营养成分。\n严格只回复JSON，不要其他文字：\n{"foods":[{"name":"食物名","emoji":"🍗","cal":165,"c":0,"p":31,"f":3.6,"serving":"去皮鸡胸肉"}]}\ncal是每100克热量(千卡)，c/p/f是每100克碳水/蛋白质/脂肪(克)\n多种食物全部列出，serving填写份量说明，emoji选对应食物表情'
    this._aiTask=wx.request({
      url:AI_URL,method:'POST',
      header:{'Content-Type':'application/json','Authorization':'Bearer '+AI_KEY},
      data:{model:isImg?AI_MODEL_VISION:AI_MODEL_TEXT,messages:[{role:'system',content:sys}].concat(msgs),max_tokens:1024,temperature:0.3},
      timeout:60000,
      success:function(res){
        that._aiTask=null
        if(res.statusCode===200&&res.data&&res.data.choices&&res.data.choices[0]){
          var c=res.data.choices[0].message&&res.data.choices[0].message.content
          if(c){that._aiParse(c);return}
        }
        that.setData({aiLoading:false,aiError:'识别失败，请重试~'})
      },
      fail:function(){that._aiTask=null;that.setData({aiLoading:false,aiError:'网络错误，请重试~'})}
    })
  },
  _aiParse:function(raw){
    try{
      var m=raw.trim().match(/\{[\s\S]*\}/)
      if(!m){this.setData({aiLoading:false,aiError:'识别失败，请换个方式描述'});return}
      var o=JSON.parse(m[0])
      var list=[]
      if(o.foods&&Array.isArray(o.foods))list=o.foods
      else if(o.name&&typeof o.cal==='number')list=[o]
      if(!list.length){this.setData({aiLoading:false,aiError:'识别失败，请重试'});return}
      var foods=list.map(function(f,i){
        var cal=Math.round(f.cal||0),c=+(f.c||0).toFixed(1),p=+(f.p||0).toFixed(1),fat=+(f.f||0).toFixed(1)
        return{idx:i,name:f.name||'未知食物',emoji:f.emoji||'🍽️',cal:cal,c:c,p:p,f:fat,serving:f.serving||'',grams:100,curCal:cal,curC:c,curP:p,curF:fat}
      })
      var total=0;foods.forEach(function(f){total+=f.curCal})
      this.setData({aiLoading:false,aiFoods:foods,aiTotalCal:total,aiError:''})
    }catch(e){this.setData({aiLoading:false,aiError:'识别失败，请换个方式描述'})}
  },
  onAiGramStep:function(e){
    var idx=parseInt(e.currentTarget.dataset.idx),d=parseInt(e.currentTarget.dataset.d)
    var g=this.data.aiFoods[idx].grams+d;if(g<10)g=10;if(g>9999)g=9999
    var u={};u['aiFoods['+idx+'].grams']=g;this.setData(u);this._recalcItem(idx)
  },
  onAiGramInput:function(e){
    var idx=parseInt(e.currentTarget.dataset.idx),v=parseInt(e.detail.value)||0;if(v>9999)v=9999
    var u={};u['aiFoods['+idx+'].grams']=v;this.setData(u);this._recalcItem(idx)
  },
  onAiGramQuick:function(e){
    var idx=parseInt(e.currentTarget.dataset.idx),g=parseInt(e.currentTarget.dataset.g)||100
    var u={};u['aiFoods['+idx+'].grams']=g;this.setData(u);this._recalcItem(idx)
  },
  _recalcItem:function(idx){
    var f=this.data.aiFoods[idx],r=f.grams/100
    var u={}
    u['aiFoods['+idx+'].curCal']=Math.round(f.cal*r)
    u['aiFoods['+idx+'].curC']=+(f.c*r).toFixed(1)
    u['aiFoods['+idx+'].curP']=+(f.p*r).toFixed(1)
    u['aiFoods['+idx+'].curF']=+(f.f*r).toFixed(1)
    this.setData(u);this._calcTotal()
  },
  _calcTotal:function(){var t=0;this.data.aiFoods.forEach(function(f){t+=f.curCal});this.setData({aiTotalCal:t})},
  onAiMealPick:function(e){this.setData({aiMeal:e.currentTarget.dataset.meal})},
  onAiRetry:function(){this.setData({aiFoods:[],aiTotalCal:0,aiError:'',aiImagePreview:'',aiInputText:''})},
  onAiConfirm:function(){
    var d=this.data;if(!d.aiFoods.length){wx.showToast({title:'请先识别食物',icon:'none'});return}
    var all={};try{all=wx.getStorageSync('foodRecords')||{}}catch(e){}
    var ds=d.dateStr,meal=d.aiMeal;if(!all[ds])all[ds]={};if(!all[ds][meal])all[ds][meal]=[]
    var count=d.aiFoods.length
    d.aiFoods.forEach(function(f){
      all[ds][meal].push({uid:Date.now()+'_'+Math.random().toString(36).substr(2,6),id:'ai_'+Date.now()+'_'+f.idx,name:f.name,emoji:f.emoji,weight:f.grams,cal:f.curCal,carbs:f.curC,protein:f.curP,fat:f.curF,baseCal:f.cal,baseC:f.c,baseP:f.p,baseF:f.f})
    })
    wx.setStorageSync('foodRecords',all)
    try{var ti=getTodayIntake();app.globalData.calorieIntake=ti.cal}catch(e){}
    var mn='餐次';for(var i=0;i<MEAL_ORDER.length;i++){if(MEAL_ORDER[i].key===meal){mn=MEAL_ORDER[i].name;break}}
    this.setData({aiExpanded:false,aiMaskClosing:true,aiFoods:[],aiTotalCal:0,aiInputText:'',aiImagePreview:''})
    var that=this;setTimeout(function(){that.setData({showAiPanel:false,aiMaskClosing:false})},350)
    this._loadDay();wx.showToast({title:'已添加'+count+'项到'+mn,icon:'success'})
  }
})
