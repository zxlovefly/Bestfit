const FOOD_DB = [
  {id:1,name:'白米饭',cal:116,c:25.6,p:2.6,f:0.3,cat:'主食',icon:'🍚'},
  {id:2,name:'全麦面包',cal:246,c:41.3,p:12.3,f:3.4,cat:'主食',icon:'🍞'},
  {id:3,name:'燕麦片',cal:377,c:67.7,p:12.6,f:6.7,cat:'主食',icon:'🥣'},
  {id:4,name:'蒸红薯',cal:86,c:20.1,p:1.6,f:0.1,cat:'主食',icon:'🍠'},
  {id:5,name:'蒸紫薯',cal:106,c:24.2,p:1.6,f:0.2,cat:'主食',icon:'🍠'},
  {id:6,name:'煮玉米',cal:112,c:22.8,p:4.0,f:1.2,cat:'主食',icon:'🌽'},
  {id:7,name:'面条(熟)',cal:110,c:22.4,p:4.0,f:0.5,cat:'主食',icon:'🍜'},
  {id:8,name:'白馒头',cal:221,c:47.0,p:7.0,f:1.1,cat:'主食',icon:'🍞'},
  {id:9,name:'蒸土豆',cal:77,c:17.5,p:2.0,f:0.1,cat:'主食',icon:'🥔'},
  {id:10,name:'糙米饭',cal:111,c:23.0,p:2.6,f:0.9,cat:'主食',icon:'🍚'},
  {id:11,name:'意面(熟)',cal:131,c:25.4,p:5.0,f:1.1,cat:'主食',icon:'🍝'},
  {id:12,name:'小米粥',cal:46,c:9.8,p:1.4,f:0.2,cat:'主食',icon:'🥣'},
  {id:13,name:'荞麦面',cal:304,c:66.5,p:11.3,f:2.3,cat:'主食',icon:'🍜'},
  {id:14,name:'猪肉饺子',cal:240,c:26.0,p:9.0,f:11.0,cat:'主食',icon:'🥟'},
  {id:15,name:'韭菜鸡蛋饺',cal:198,c:28.0,p:6.0,f:7.0,cat:'主食',icon:'🥟'},
  {id:16,name:'包子(猪肉)',cal:227,c:32.0,p:7.0,f:8.0,cat:'主食',icon:'🥟'},
  {id:17,name:'烧麦',cal:220,c:35.0,p:6.0,f:7.0,cat:'主食',icon:'🥟'},
  {id:18,name:'油条',cal:386,c:51.0,p:6.9,f:17.6,cat:'主食',icon:'🥖'},
  {id:19,name:'糯米饭',cal:116,c:25.6,p:2.6,f:0.3,cat:'主食',icon:'🍚'},
  {id:20,name:'玉米碴粥',cal:47,c:10.0,p:1.1,f:0.1,cat:'主食',icon:'🥣'},
  {id:21,name:'全麦馒头',cal:208,c:44.0,p:7.5,f:1.0,cat:'主食',icon:'🍞'},
  {id:22,name:'花卷',cal:211,c:45.6,p:6.4,f:1.0,cat:'主食',icon:'🍞'},
  {id:23,name:'烙饼',cal:255,c:52.9,p:7.5,f:2.3,cat:'主食',icon:'🥞'},
  {id:24,name:'手抓饼',cal:306,c:40.0,p:7.0,f:13.0,cat:'主食',icon:'🥞'},
  {id:25,name:'挂面',cal:346,c:75.6,p:10.1,f:0.7,cat:'主食',icon:'🍜'},
  {id:26,name:'米粉',cal:346,c:81.0,p:7.3,f:0.3,cat:'主食',icon:'🍜'},
  {id:27,name:'米线',cal:92,c:21.0,p:2.0,f:0.3,cat:'主食',icon:'🍜'},
  {id:28,name:'土豆粉',cal:337,c:81.0,p:2.0,f:0.1,cat:'主食',icon:'🍜'},
  {id:29,name:'红薯粉',cal:337,c:84.2,p:0.3,f:0.1,cat:'主食',icon:'🍜'},
  {id:30,name:'馄饨',cal:180,c:22.0,p:8.0,f:7.0,cat:'主食',icon:'🥟'},

  {id:31,name:'鸡胸肉',cal:133,c:2.5,p:31.0,f:1.2,cat:'肉蛋奶',icon:'🍗'},
  {id:32,name:'煮鸡蛋',cal:143,c:0.8,p:12.7,f:9.0,cat:'肉蛋奶',icon:'🥚'},
  {id:33,name:'煎鸡蛋',cal:209,c:1.5,p:13.0,f:16.0,cat:'肉蛋奶',icon:'🍳'},
  {id:34,name:'鸡蛋清',cal:60,c:3.1,p:11.6,f:0.1,cat:'肉蛋奶',icon:'🥚'},
  {id:35,name:'瘦牛肉',cal:106,c:0,p:20.2,f:2.3,cat:'肉蛋奶',icon:'🥩'},
  {id:36,name:'三文鱼',cal:208,c:0,p:20.4,f:13.4,cat:'肉蛋奶',icon:'🐟'},
  {id:37,name:'虾仁',cal:87,c:0,p:18.6,f:0.7,cat:'肉蛋奶',icon:'🦐'},
  {id:38,name:'瘦猪里脊',cal:143,c:1.5,p:20.3,f:6.2,cat:'肉蛋奶',icon:'🥩'},
  {id:39,name:'鳕鱼',cal:82,c:0,p:17.8,f:0.7,cat:'肉蛋奶',icon:'🐟'},
  {id:40,name:'去皮鸡腿肉',cal:177,c:0,p:19.6,f:10.9,cat:'肉蛋奶',icon:'🍗'},
  {id:41,name:'全脂牛奶',cal:54,c:3.4,p:3.0,f:3.2,cat:'肉蛋奶',icon:'🥛'},
  {id:42,name:'原味酸奶',cal:72,c:9.3,p:3.6,f:2.5,cat:'肉蛋奶',icon:'🥛'},
  {id:43,name:'脱脂牛奶',cal:33,c:4.8,p:3.0,f:0.1,cat:'肉蛋奶',icon:'🥛'},
  {id:44,name:'低脂酸奶',cal:57,c:10.0,p:4.0,f:0.5,cat:'肉蛋奶',icon:'🥛'},
  {id:45,name:'鸭蛋',cal:180,c:3.1,p:12.6,f:13.0,cat:'肉蛋奶',icon:'🥚'},
  {id:46,name:'鹌鹑蛋',cal:160,c:2.1,p:12.8,f:11.1,cat:'肉蛋奶',icon:'🥚'},
  {id:47,name:'奶酪',cal:328,c:3.5,p:25.7,f:23.5,cat:'肉蛋奶',icon:'🧀'},
  {id:48,name:'黄油',cal:717,c:0,p:0.5,f:81.0,cat:'肉蛋奶',icon:'🧈'},
  {id:49,name:'五花肉',cal:395,c:2.4,p:13.2,f:37.0,cat:'肉蛋奶',icon:'🥓'},
  {id:50,name:'猪排骨',cal:264,c:0,p:16.7,f:23.1,cat:'肉蛋奶',icon:'🍖'},
  {id:51,name:'肥牛肉',cal:250,c:0,p:15.0,f:20.0,cat:'肉蛋奶',icon:'🥩'},
  {id:52,name:'瘦羊肉',cal:118,c:0,p:20.5,f:3.9,cat:'肉蛋奶',icon:'🥩'},
  {id:53,name:'鸭肉',cal:240,c:0,p:15.5,f:19.7,cat:'肉蛋奶',icon:'🦆'},
  {id:54,name:'鲈鱼',cal:105,c:0,p:18.6,f:3.4,cat:'肉蛋奶',icon:'🐟'},
  {id:55,name:'鲫鱼',cal:108,c:0,p:17.1,f:2.7,cat:'肉蛋奶',icon:'🐟'},
  {id:56,name:'带鱼',cal:127,c:0,p:17.7,f:4.9,cat:'肉蛋奶',icon:'🐟'},
  {id:57,name:'黄花鱼',cal:97,c:0,p:17.9,f:2.5,cat:'肉蛋奶',icon:'🐟'},
  {id:58,name:'大闸蟹',cal:103,c:2.3,p:17.5,f:2.6,cat:'肉蛋奶',icon:'🦀'},
  {id:59,name:'扇贝',cal:60,c:2.6,p:11.1,f:0.6,cat:'肉蛋奶',icon:'🦪'},
  {id:60,name:'生蚝',cal:57,c:3.9,p:10.9,f:1.5,cat:'肉蛋奶',icon:'🦪'},
  {id:61,name:'蛋白粉',cal:375,c:7.0,p:75.0,f:5.0,cat:'肉蛋奶',icon:'💪'},
  {id:62,name:'鸡蛋羹',cal:48,c:2.0,p:4.0,f:2.5,cat:'肉蛋奶',icon:'🍳'},
  {id:63,name:'茶叶蛋',cal:140,c:1.0,p:12.0,f:9.0,cat:'肉蛋奶',icon:'🥚'},
  {id:64,name:'卤鸡腿',cal:212,c:2.0,p:20.0,f:13.0,cat:'肉蛋奶',icon:'🍗'},
  {id:65,name:'酱牛肉',cal:246,c:3.2,p:31.4,f:11.9,cat:'肉蛋奶',icon:'🥩'},

  {id:66,name:'西兰花',cal:36,c:5.2,p:4.1,f:0.6,cat:'蔬果',icon:'🥦'},
  {id:67,name:'菠菜',cal:23,c:3.6,p:2.9,f:0.4,cat:'蔬果',icon:'🥬'},
  {id:68,name:'番茄',cal:18,c:3.9,p:0.9,f:0.2,cat:'蔬果',icon:'🍅'},
  {id:69,name:'黄瓜',cal:15,c:2.9,p:0.7,f:0.1,cat:'蔬果',icon:'🥒'},
  {id:70,name:'生菜',cal:13,c:2.0,p:1.3,f:0.3,cat:'蔬果',icon:'🥬'},
  {id:71,name:'胡萝卜',cal:37,c:8.8,p:1.0,f:0.2,cat:'蔬果',icon:'🥕'},
  {id:72,name:'白蘑菇',cal:22,c:3.3,p:3.1,f:0.3,cat:'蔬果',icon:'🍄'},
  {id:73,name:'苹果',cal:52,c:14.0,p:0.3,f:0.2,cat:'蔬果',icon:'🍎'},
  {id:74,name:'香蕉',cal:89,c:23.0,p:1.1,f:0.3,cat:'蔬果',icon:'🍌'},
  {id:75,name:'橙子',cal:47,c:12.0,p:0.9,f:0.1,cat:'蔬果',icon:'🍊'},
  {id:76,name:'蓝莓',cal:57,c:14.5,p:0.7,f:0.3,cat:'蔬果',icon:'🫐'},
  {id:77,name:'葡萄',cal:69,c:18.1,p:0.7,f:0.2,cat:'蔬果',icon:'🍇'},
  {id:78,name:'牛油果',cal:160,c:8.5,p:2.0,f:14.7,cat:'蔬果',icon:'🥑'},
  {id:79,name:'大白菜',cal:17,c:3.2,p:1.5,f:0.1,cat:'蔬果',icon:'🥬'},
  {id:80,name:'油麦菜',cal:15,c:2.1,p:1.4,f:0.4,cat:'蔬果',icon:'🥬'},
  {id:81,name:'芹菜',cal:14,c:3.0,p:0.8,f:0.1,cat:'蔬果',icon:'🥬'},
  {id:82,name:'韭菜',cal:25,c:4.5,p:2.4,f:0.4,cat:'蔬果',icon:'🥬'},
  {id:83,name:'洋葱',cal:39,c:9.0,p:1.1,f:0.1,cat:'蔬果',icon:'🧅'},
  {id:84,name:'青椒',cal:22,c:5.4,p:1.4,f:0.2,cat:'蔬果',icon:'🫑'},
  {id:85,name:'茄子',cal:23,c:5.3,p:1.1,f:0.2,cat:'蔬果',icon:'🍆'},
  {id:86,name:'冬瓜',cal:12,c:2.6,p:0.4,f:0.2,cat:'蔬果',icon:'🥒'},
  {id:87,name:'南瓜',cal:23,c:5.3,p:0.7,f:0.1,cat:'蔬果',icon:'🎃'},
  {id:88,name:'金针菇',cal:32,c:6.0,p:2.4,f:0.4,cat:'蔬果',icon:'🍄'},
  {id:89,name:'香菇',cal:26,c:5.2,p:2.2,f:0.3,cat:'蔬果',icon:'🍄'},
  {id:90,name:'海带',cal:12,c:2.1,p:1.2,f:0.1,cat:'蔬果',icon:'🥬'},
  {id:91,name:'草莓',cal:32,c:7.1,p:0.7,f:0.2,cat:'蔬果',icon:'🍓'},
  {id:92,name:'芒果',cal:60,c:14.0,p:0.6,f:0.2,cat:'蔬果',icon:'🥭'},
  {id:93,name:'猕猴桃',cal:61,c:14.5,p:0.8,f:0.6,cat:'蔬果',icon:'🥝'},
  {id:94,name:'西瓜',cal:25,c:5.8,p:0.6,f:0.1,cat:'蔬果',icon:'🍉'},
  {id:95,name:'柚子',cal:38,c:9.5,p:0.7,f:0.1,cat:'蔬果',icon:'🍊'},

  {id:96,name:'豆腐',cal:73,c:1.9,p:8.1,f:3.7,cat:'豆类坚果',icon:'🧈'},
  {id:97,name:'无糖豆浆',cal:33,c:1.8,p:2.9,f:1.6,cat:'豆类坚果',icon:'🥛'},
  {id:98,name:'杏仁',cal:575,c:22.0,p:21.0,f:50.0,cat:'豆类坚果',icon:'🥜'},
  {id:99,name:'核桃',cal:650,c:14.0,p:15.0,f:65.0,cat:'豆类坚果',icon:'🥜'},
  {id:100,name:'花生',cal:570,c:16.0,p:26.0,f:49.0,cat:'豆类坚果',icon:'🥜'},
  {id:101,name:'黄豆',cal:359,c:34.2,p:35.0,f:16.0,cat:'豆类坚果',icon:'🫘'},
  {id:102,name:'绿豆',cal:329,c:62.0,p:21.6,f:0.8,cat:'豆类坚果',icon:'🫘'},
  {id:103,name:'红豆',cal:324,c:63.4,p:20.2,f:0.6,cat:'豆类坚果',icon:'🫘'},
  {id:104,name:'豆腐干',cal:140,c:10.7,p:16.2,f:3.6,cat:'豆类坚果',icon:'🧈'},
  {id:105,name:'腐竹',cal:459,c:22.3,p:50.5,f:21.7,cat:'豆类坚果',icon:'🧈'},
  {id:106,name:'千张',cal:262,c:5.5,p:24.5,f:16.0,cat:'豆类坚果',icon:'🧈'},
  {id:107,name:'腰果',cal:552,c:41.6,p:17.3,f:36.7,cat:'豆类坚果',icon:'🥜'},
  {id:108,name:'开心果',cal:614,c:28.0,p:20.0,f:53.0,cat:'豆类坚果',icon:'🥜'},
  {id:109,name:'南瓜子',cal:566,c:10.7,p:33.2,f:46.1,cat:'豆类坚果',icon:'🥜'},
  {id:110,name:'鹰嘴豆',cal:364,c:60.7,p:19.3,f:6.0,cat:'豆类坚果',icon:'🫘'},

  {id:111,name:'黑咖啡',cal:5,c:0,p:0.3,f:0,cat:'零食饮料',icon:'☕'},
  {id:112,name:'薯片',cal:536,c:49.0,p:7.0,f:37.0,cat:'零食饮料',icon:'🍟'},
  {id:113,name:'牛奶饼干',cal:433,c:71.7,p:8.0,f:13.0,cat:'零食饮料',icon:'🍪'},
  {id:114,name:'黑巧克力',cal:544,c:30.0,p:6.0,f:43.0,cat:'零食饮料',icon:'🍫'},
  {id:115,name:'冰淇淋',cal:127,c:24.0,p:3.5,f:2.5,cat:'零食饮料',icon:'🍦'},
  {id:116,name:'奶油蛋糕',cal:347,c:52.0,p:6.0,f:13.0,cat:'零食饮料',icon:'🎂'},
  {id:117,name:'方便面',cal:473,c:61.6,p:9.5,f:21.1,cat:'零食饮料',icon:'🍜'},
  {id:118,name:'火腿肠',cal:212,c:15.6,p:14.0,f:10.4,cat:'零食饮料',icon:'🌭'},
  {id:119,name:'可乐',cal:42,c:10.6,p:0,f:0,cat:'零食饮料',icon:'🥤'},
  {id:120,name:'奶茶',cal:43,c:10.0,p:0.5,f:0.2,cat:'零食饮料',icon:'🧋'},
  {id:121,name:'爆米花',cal:387,c:77.8,p:12.9,f:4.5,cat:'零食饮料',icon:'🍿'},
  {id:122,name:'辣条',cal:340,c:45.0,p:10.0,f:15.0,cat:'零食饮料',icon:'🌶️'},
  {id:123,name:'蜂蜜',cal:321,c:82.4,p:0.4,f:0,cat:'零食饮料',icon:'🍯'},
  {id:124,name:'果汁',cal:46,c:11.5,p:0.1,f:0,cat:'零食饮料',icon:'🧃'},
  {id:125,name:'啤酒',cal:32,c:0.3,p:0.4,f:0,cat:'零食饮料',icon:'🍺'}
]

const COMMON_IDS = [1,7,8,31,32,33,35,37,41,42,66,68,69,73,74,96,97,111]

const CATEGORIES = [
  { key: 'common',     name: '常用',   icon: '⭐' },
  { key: '主食',       name: '主食',   icon: '🍚' },
  { key: '肉蛋奶',     name: '肉蛋奶', icon: '🍗' },
  { key: '蔬果',       name: '蔬果',   icon: '🥦' },
  { key: '豆类坚果',   name: '豆坚果', icon: '🥜' },
  { key: '零食饮料',   name: '零食',   icon: '🍪' },
  { key: 'custom',     name: '自定义', icon: '➕' }
]

function getFoodsByCategory(key) {
  if (key === 'common') return COMMON_IDS.map(id => FOOD_DB.find(f => f.id === id)).filter(Boolean)
  if (key === 'custom') return wx.getStorageSync('customFoods') || []
  return FOOD_DB.filter(f => f.cat === key)
}

function searchFoods(kw) {
  if (!kw || !kw.trim()) return []
  const all = FOOD_DB.concat(wx.getStorageSync('customFoods') || [])
  return all.filter(f => f.name.indexOf(kw.trim()) !== -1)
}

function addCustomFood(food) {
  const foods = wx.getStorageSync('customFoods') || []
  food.id = 'c' + Date.now()
  food.cat = '自定义'
  foods.push(food)
  wx.setStorageSync('customFoods', foods)
  return food
}

module.exports = { FOOD_DB, COMMON_IDS, CATEGORIES, getFoodsByCategory, searchFoods, addCustomFood }
