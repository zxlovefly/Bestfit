var app = getApp()
var { CATEGORIES, getFoodsByCategory, searchFoods, addCustomFood } = require('../../utils/food-db')
var { getTodayIntake } = require('../../utils/diet-targets')
var FOOD_DB = require('../../utils/food-db').FOOD_DB

var MEAL_NAME = {breakfast:'早餐',lunch:'午餐',dinner:'晚餐',snack_morning:'早加餐',snack_afternoon:'午加餐',snack_evening:'晚加餐'}

Page({
  data:{
    meal:'',mealName:'',dateStr:'',
    categories:CATEGORIES,activeCat:'common',
    foodList:[],keyword:'',isSearch:false,
    showSheet:false,curFood:null,grams:100,pvCal:0,pvC:0,pvP:0,pvF:0,
    multiMode:false,selectedIds:{},selectedCount:0,
    showBatch:false,batchItems:[],batchTotalCal:0,
    showForm:false,cfName:'',cfCal:'',cfC:'',cfP:'',cfF:''
  },
  _rawList:[],

  onLoad:function(opts){
    this.setData({meal:opts.meal||'breakfast',mealName:MEAL_NAME[opts.meal]||'早餐',dateStr:opts.date||this._today()})
    this._loadCat('common')
  },
  _today:function(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()},

  _loadCat:function(key){
    this._rawList=getFoodsByCategory(key)
    this._refreshList()
    this.setData({activeCat:key,isSearch:false,keyword:''})
  },
  _refreshList:function(){
    var ids=this.data.selectedIds
    var list=this._rawList.map(function(f){return Object.assign({},f,{selected:!!ids[f.id]})})
    this.setData({foodList:list})
  },

  onCatTap:function(e){this._loadCat(e.currentTarget.dataset.key)},
  onSearch:function(e){
    var kw=e.detail.value
    if(!kw.trim()){this._loadCat(this.data.activeCat);return}
    this._rawList=searchFoods(kw);this._refreshList();this.setData({keyword:kw,isSearch:true})
  },
  onClearSearch:function(){this.setData({keyword:''});this._loadCat(this.data.activeCat)},

  toggleMultiMode:function(){
    if(this.data.multiMode){this.setData({multiMode:false,selectedIds:{},selectedCount:0});this._refreshList()}
    else{this.setData({multiMode:true})}
  },
  toggleSelect:function(e){
    var id=e.currentTarget.dataset.id
    var ids=Object.assign({},this.data.selectedIds)
    if(ids[id])delete ids[id];else ids[id]=true
    this.setData({selectedIds:ids,selectedCount:Object.keys(ids).length})
    this._refreshList()
  },

  onFoodTap:function(e){
    if(this.data.multiMode){this.toggleSelect(e);return}
    var id=e.currentTarget.dataset.id
    var isCust=e.currentTarget.dataset.cust==='1'
    var food=isCust?(wx.getStorageSync('customFoods')||[]).find(function(f){return f.id===id}):FOOD_DB.find(function(f){return f.id===id})
    if(!food)return
    this.setData({showSheet:true,curFood:food,grams:100});this._calcPv(100)
  },

  onSheetMask:function(){this.setData({showSheet:false})},
  onFormMask:function(){this.setData({showForm:false})},
  onBatchMask:function(){this.setData({showBatch:false})},
  preventBubble:function(){},

  onGramInput:function(e){var v=parseInt(e.detail.value)||0;if(v>9999)v=9999;this.setData({grams:v});this._calcPv(v)},
  onStep:function(e){var g=this.data.grams+(parseInt(e.currentTarget.dataset.d)||0);if(g<10)g=10;if(g>9999)g=9999;this.setData({grams:g});this._calcPv(g)},
  onQuick:function(e){var g=parseInt(e.currentTarget.dataset.g)||100;this.setData({grams:g});this._calcPv(g)},
  _calcPv:function(g){var f=this.data.curFood;if(!f||g<=0){this.setData({pvCal:0,pvC:0,pvP:0,pvF:0});return}var r=g/100;this.setData({pvCal:Math.round(f.cal*r),pvC:+(f.c*r).toFixed(1),pvP:+(f.p*r).toFixed(1),pvF:+(f.f*r).toFixed(1)})},

  onConfirm:function(){
    var d=this.data;if(!d.curFood||d.grams<=0){wx.showToast({title:'请输入克数',icon:'none'});return}
    this._saveRecords([this._buildRecord(d.curFood,d.grams)])
    this._syncGlobal()
    wx.showToast({title:'已添加',icon:'success',duration:1000});this.setData({showSheet:false})
  },

  openBatchSheet:function(){
    var ids=this.data.selectedIds
    var list=this._rawList.filter(function(f){return !!ids[f.id]})
    var items=list.map(function(food){return{food:food,grams:100,cal:food.cal}})
    var total=items.reduce(function(s,i){return s+i.cal},0)
    this.setData({showBatch:true,batchItems:items,batchTotalCal:total})
  },
  onBatchStep:function(e){
    var idx=parseInt(e.currentTarget.dataset.idx),d=parseInt(e.currentTarget.dataset.d)
    var items=this.data.batchItems,g=items[idx].grams+d
    if(g<10)g=10;if(g>9999)g=9999
    items[idx].grams=g;items[idx].cal=Math.round(items[idx].food.cal*g/100)
    this.setData({batchItems:items,batchTotalCal:items.reduce(function(s,i){return s+i.cal},0)})
  },
  onBatchInput:function(e){
    var idx=parseInt(e.currentTarget.dataset.idx),v=parseInt(e.detail.value)||0
    if(v>9999)v=9999;var items=this.data.batchItems
    items[idx].grams=v;items[idx].cal=Math.round(items[idx].food.cal*v/100)
    this.setData({batchItems:items,batchTotalCal:items.reduce(function(s,i){return s+i.cal},0)})
  },
  onBatchConfirm:function(){
    var that=this,items=this.data.batchItems
    var records=items.map(function(item){return that._buildRecord(item.food,item.grams)})
    this._saveRecords(records)
    this._syncGlobal()
    wx.vibrateShort&&wx.vibrateShort({type:'medium'})
    wx.showToast({title:'已添加'+records.length+'项',icon:'success'})
    this.setData({showBatch:false,multiMode:false,selectedIds:{},selectedCount:0})
    this._refreshList()
  },

  _buildRecord:function(food,grams){
    return{uid:Date.now()+'_'+Math.random().toString(36).substr(2,6),id:food.id,name:food.name,emoji:food.icon,weight:grams,cal:Math.round(food.cal*grams/100),carbs:+(food.c*grams/100).toFixed(1),protein:+(food.p*grams/100).toFixed(1),fat:+(food.f*grams/100).toFixed(1),baseCal:food.cal,baseC:food.c,baseP:food.p,baseF:food.f}
  },
  _saveRecords:function(records){
    var meal=this.data.meal,ds=this.data.dateStr
    var all={};try{all=wx.getStorageSync('foodRecords')||{}}catch(e){}
    if(!all[ds])all[ds]={};if(!all[ds][meal])all[ds][meal]=[]
    all[ds][meal].push.apply(all[ds][meal],records)
    wx.setStorageSync('foodRecords',all)
  },

  _syncGlobal:function(){
    try{
      var today=getTodayIntake()
      app.globalData.calorieIntake=today.cal
    }catch(e){}
  },

  onAddCustom:function(){this.setData({showForm:true,cfName:'',cfCal:'',cfC:'',cfP:'',cfF:''})},
  onCfInput:function(e){this.setData({[e.currentTarget.dataset.f]:e.detail.value})},
  onSaveCustom:function(){
    if(!this.data.cfName.trim()){wx.showToast({title:'请输入食物名称',icon:'none'});return}
    addCustomFood({name:this.data.cfName.trim(),cal:parseFloat(this.data.cfCal)||0,c:parseFloat(this.data.cfC)||0,p:parseFloat(this.data.cfP)||0,f:parseFloat(this.data.cfF)||0,icon:'🍽️'})
    wx.showToast({title:'已添加',icon:'success'});this.setData({showForm:false})
    if(this.data.activeCat==='custom')this._loadCat('custom')
  },

  onBack:function(){wx.navigateBack()}
})
