/**
 * 《独处能力》字幕定稿（守灯人篇）— the single source of truth for words and timing.
 *
 * Every time is a beat label "SECTION:bar.beat" resolved against src/data/beats.ts, so:
 *  - edit words / colours / timing here only;
 *  - replace the BGM -> `npm run analyze` -> everything re-syncs (labels map to the new beats; if a section
 *    has a different bar count, bars are remapped proportionally using REF_SECTION_BARS).
 * Accents: gold 金缮金 / blue 青花蓝 / red 胭脂红 / green 釉绿, applied to 【】 words in order.
 */
import type {Screen} from './types';

/** bar counts of each section in the BGM this script was written against (for proportional remapping). */
export const REF_SECTION_BARS = {INTRO: 8, B1: 16, D: 8, A2: 8, B2: 8, C: 8, B3: 6, OUT: 2} as const;

export const THEME = '独处能力';
export const WATERMARK = '爱好者';

export const SCREENS: Screen[] = [
  // ───────────────────────── S0 钩子 · 前奏 INTRO ─────────────────────────
  {
    id: '1', section: 'S0', scene: 'sea.wide', start: 'START', end: 'INTRO:1.4', display: 'bottom',
    text: '有船，要靠岸了。', bg: '#0E1A33',
    cast: [{who: 'friend', at: 'START', expression: 'happy', outfit: 'friend', note: '远景船上撑红伞挥手'}],
    actions: [
      {id: 'boatEnter', at: 'START', note: '挂暖灯的纸船从右侧驶入'},
      {id: 'camDescend', at: 'INTRO:1.1', note: '开场转场·升降镜头：从月亮降到海面（首拍起）'},
    ],
    sfx: [
      {at: 'START', sfx: 'waves_bed', gain: 0.32, until: 'INTRO:5.1', loop: true, fade: 10},
      {at: 'INTRO:1.3', sfx: 'ship_bell', gain: 0.45},
    ],
  },
  {
    id: '2', section: 'S0', scene: 'balcony.close', start: 'INTRO:1.4', end: 'INTRO:3.1', display: 'bottom',
    text: '他做的第一件事——|【关灯】。', accents: ['blue'], revealAt: 'INTRO:2.3', bg: '#121F3D',
    cast: [
      {who: 'hero', at: 'INTRO:1.4', expression: 'alert', outfit: 'raincoat', note: '眉一挑、瞳孔缩小、汗滴'},
      {who: 'hero', at: 'INTRO:2.1', expression: 'determined'},
    ],
    actions: [
      {id: 'pushBalcony', at: 'INTRO:1.4', note: '镜头顺光束推到阳台'},
      {id: 'leverGrab', at: 'INTRO:2.1', note: '手抓拉杆（预备挤压）'},
      {id: 'leverDown', at: 'INTRO:2.3', note: '拉杆落下，光束收回，海面暗一档【卡前奏重音】'},
    ],
    sfx: [{at: 'INTRO:2.3', sfx: 'lever_off', gain: 0.9}],
  },
  {
    id: '3', section: 'S0', scene: 'balcony.close', start: 'INTRO:3.1', end: 'INTRO:4.1', display: 'bottom',
    text: '不是讨厌谁。', bg: '#16244A',
    cast: [
      {who: 'hero', at: 'INTRO:3.1', expression: 'relief', note: '长出一口气'},
      {who: 'hero', at: 'INTRO:3.3', expression: 'smug'},
      {who: 'friend', at: 'INTRO:3.1', expression: 'sad', note: '放下手，红伞垂下'},
    ],
    actions: [{id: 'boatTurn', at: 'INTRO:3.3', note: '纸船犹豫、掉头远去'}],
    sfx: [{at: 'INTRO:3.1', sfx: 'oar', gain: 0.4}, {at: 'INTRO:3.3', sfx: 'oar', gain: 0.35}],
  },
  {
    id: '4', section: 'S0', scene: 'balcony.lantern', start: 'INTRO:4.1', end: 'INTRO:5.1', display: 'bottom',
    text: '他一个人，过得【太顺】了。', accents: ['blue'], bg: '#121F3D',
    cast: [{who: 'hero', at: 'INTRO:4.1', expression: 'hum'}],
    actions: [
      {id: 'takeLantern', at: 'INTRO:4.1', note: '摘下瓷座提灯'},
      {id: 'strikeMatch', at: 'INTRO:4.2', note: '划火柴点亮：只照亮他自己'},
      {id: 'pushLantern', at: 'INTRO:4.3', note: '镜头推近提灯直到火光填满画面'},
    ],
    sfx: [{at: 'INTRO:4.2', sfx: 'match', gain: 0.6}],
  },
  {
    id: '5', section: 'S0', scene: 'interior.montage', start: 'INTRO:5.1', end: 'INTRO:6.1', display: 'bottom',
    text: '几点睡，吃什么，去哪儿，', bg: '#1A1F45',
    cast: [{who: 'hero', at: 'INTRO:5.1', expression: 'busy', outfit: 'raincoat'}],
    actions: [
      {id: 'whipDown', at: 'INTRO:5.1', note: '转场·快速竖摇：从阳台竖摇进塔内，落定在小节头'},
      {id: 'clockSpin', at: 'INTRO:5.1', note: '挂钟飞转（时间快进）'},
      {id: 'bowlLand', at: 'INTRO:5.3', note: '一人份面碗落桌【卡前奏重音】'},
    ],
    sfx: [
      {at: 'INTRO:4.4', sfx: 'whoosh_down', gain: 0.7},
      {at: 'INTRO:5.1', sfx: 'storm_bed', gain: 0.22, until: 'INTRO:8.3', loop: true, fade: 20},
      {at: 'INTRO:5.2', sfx: 'whoosh_up', gain: 0.3},
      {at: 'INTRO:5.3', sfx: 'bowl_thud', gain: 0.6},
    ],
  },
  {
    id: '6', section: 'S0', scene: 'interior.montage', start: 'INTRO:6.1', end: 'INTRO:7.1', display: 'bottom',
    text: '全都【只听自己的】。', accents: ['blue'], bg: '#1A1F45',
    cast: [{who: 'hero', at: 'INTRO:6.1', expression: 'proud'}],
    actions: [
      {id: 'shutterSlam', at: 'INTRO:6.2', note: '单手合上窗板'},
      {id: 'climb', at: 'INTRO:6.3', note: '爬梯换灯泡'},
      {id: 'jumpDown', at: 'INTRO:6.4', note: '跳下落地，屈膝缓冲'},
    ],
    sfx: [
      {at: 'INTRO:6.1', sfx: 'wind_gust', gain: 0.35},
      {at: 'INTRO:6.2', sfx: 'shutter_slam', gain: 0.7},
      {at: 'INTRO:6.4', sfx: 'book_thud', gain: 0.45},
    ],
  },
  {
    id: '7', section: 'S0', scene: 'interior.bubble', start: 'INTRO:7.1', end: 'INTRO:8.1', display: 'bottom',
    text: '多一个人？那叫【麻烦】。', accents: ['red'], bg: '#1A1F45',
    cast: [{who: 'hero', at: 'INTRO:7.1', expression: 'wrinkle'}],
    actions: [
      {id: 'bubbleShow', at: 'INTRO:7.1', note: '左侧想象气泡：第二个小人缠满毛线'},
      {id: 'bubblePop', at: 'INTRO:7.3', note: '手指戳破气泡'},
    ],
    sfx: [{at: 'INTRO:7.1', sfx: 'soft_tap', gain: 0.4}, {at: 'INTRO:7.3', sfx: 'bubble_pop', gain: 0.7}],
  },
  {
    id: '8', section: 'S0', scene: 'interior.wide', start: 'INTRO:8.1', end: 'INTRO:8.4', display: 'bottom',
    text: '这么能一个人过——', bg: '#10142E',
    cast: [
      {who: 'hero', at: 'INTRO:8.1', expression: 'hollow', note: '坐在唯一的椅子上望黑窗'},
      {who: 'hero', at: 'INTRO:8.3', expression: 'puzzled', note: '头顶冒问号'},
    ],
    actions: [
      {id: 'clockStop', at: 'INTRO:8.1', note: '挂钟骤停，快进结束'},
      {id: 'pullOut', at: 'INTRO:8.1', note: '镜头缓慢拉远，穿出窗外'},
      {id: 'flameShrink', at: 'INTRO:8.3', note: '提灯火苗缩成一粒（音乐渐弱）'},
    ],
    sfx: [{at: 'INTRO:8.3', sfx: 'clock_tick', gain: 0.5}, {at: 'INTRO:8.4', sfx: 'clock_tick', gain: 0.45}],
  },
  {
    id: '8b', section: 'S0', scene: 'interior.wide', start: 'INTRO:8.4', end: 'B1:1.1', display: 'blank',
    text: '', bg: '#10142E',
    actions: [{id: 'silenceHold', at: 'INTRO:8.4', note: '音乐近乎静音：画面放慢、留白'}],
  },
  {
    id: '9', section: 'S0', scene: 'island.slam', start: 'B1:1.1', end: 'B1:2.1', display: 'slam',
    text: '是【强】，还是【躲】', accents: ['gold', 'blue'], bg: '#0E1A33',
    slam: [{text: '是【强】', at: 'B1:1.1'}, {text: '，还是', at: 'B1:1.2'}, {text: '【躲】', at: 'B1:1.3'}],
    actions: [
      {id: 'slam1', at: 'B1:1.1', note: '砸屏落地【爆点】，剪纸浪整体涌起，镜头震'},
    ],
    sfx: [
      {at: 'B1:1.1', sfx: 'impact', gain: 1.0},
      {at: 'B1:1.1', sfx: 'paper_slap', gain: 0.55},
      {at: 'B1:1.2', sfx: 'paper_slap', gain: 0.5},
      {at: 'B1:1.3', sfx: 'paper_slap', gain: 0.6},
    ],
  },

  // ───────────────────────── S1a 关系＝麻烦 · 副歌1 前半 ─────────────────────────
  {
    id: '10', section: 'S1a', scene: 'room.wide', start: 'B1:2.1', end: 'B1:2.4', display: 'bottom',
    text: '做个小实验。', bg: '#2E1A10',
    cast: [
      {who: 'hero', at: 'B1:2.1', expression: 'surprised', outfit: 'raincoat'},
      {who: 'hero', at: 'B1:2.2', outfit: 'vest', note: '一阵风吹掉雨衣，换成针织背心+袖套'},
      {who: 'hero', at: 'B1:2.3', expression: 'tidy'},
    ],
    actions: [
      {id: 'diveLayers', at: 'B1:2.1', note: '转场·剪纸层层钻入：穿过窗框、窗帘、纱帘进屋'},
      {id: 'gust', at: 'B1:2.2', note: '风灌进窗，吹飞雨衣'},
    ],
    sfx: [{at: 'B1:1.4', sfx: 'paper_layers', gain: 0.65}, {at: 'B1:2.2', sfx: 'wind_gust', gain: 0.45}],
  },
  {
    id: '11', section: 'S1a', scene: 'room.door', start: 'B1:2.4', end: 'B1:4.1', display: 'bottom',
    text: '往他屋里，【加一个人】。', accents: ['red'], bg: '#2E1A10',
    cast: [
      {who: 'friend', at: 'B1:3.1', expression: 'happy', note: '收伞进门，挥手'},
      {who: 'hero', at: 'B1:3.1', expression: 'stiffSmile', note: '笑容僵住、眉毛挑高'},
    ],
    actions: [
      {id: 'panDoor', at: 'B1:2.4', note: '镜头左移到门口'},
      {id: 'bellRing', at: 'B1:2.4', note: '左侧门铃图标摇响'},
      {id: 'doorOpen', at: 'B1:3.1', note: '门开，朋友进门'},
      {id: 'yarnRoll', at: 'B1:3.3', note: '线团精骨碌碌滚进来'},
    ],
    sfx: [{at: 'B1:2.4', sfx: 'doorbell', gain: 0.55}, {at: 'B1:3.1', sfx: 'door_creak', gain: 0.4}],
  },
  {
    id: '12', section: 'S1a', scene: 'room.scale', start: 'B1:4.1', end: 'B1:5.1', display: 'bottom',
    text: '麻烦，排着队进了门。', bg: '#3A2214',
    cast: [{who: 'hero', at: 'B1:4.1', expression: 'awkward', note: '后退半步'}],
    actions: [
      {id: 'scaleRise', at: 'B1:4.1', note: '左侧铜天平升起，左盘纸风筝=自由'},
      {id: 'sprite1', at: 'B1:4.1', note: '线团精·对话气泡'},
      {id: 'sprite2', at: 'B1:4.2', note: '线团精·沙漏'},
      {id: 'sprite3', at: 'B1:4.3', note: '线团精·弯腰小人'},
      {id: 'sprite4', at: 'B1:4.4', note: '线团精·小乌云'},
    ],
    sfx: [
      {at: 'B1:4.1', sfx: 'boing_1', gain: 0.35}, {at: 'B1:4.2', sfx: 'boing_2', gain: 0.35},
      {at: 'B1:4.3', sfx: 'boing_3', gain: 0.35}, {at: 'B1:4.4', sfx: 'boing_4', gain: 0.35},
    ],
  },
  {
    id: '13', section: 'S1a', scene: 'room.scaleClose', start: 'B1:5.1', end: 'B1:6.1', display: 'bottom',
    text: '要解释，要等待，要【迁就】，', accents: ['red'], bg: '#3A2214',
    cast: [{who: 'hero', at: 'B1:5.1', expression: 'wince', note: '托盘每沉一下眉头抽一下'}],
    actions: [
      {id: 'pushScale', at: 'B1:5.1', note: '推近天平'},
      {id: 'jump1', at: 'B1:5.1', note: '对话气泡跳上右盘'},
      {id: 'jump2', at: 'B1:5.3', note: '沙漏跳上右盘'},
      {id: 'jump3', at: 'B1:5.4', note: '弯腰小人跳上右盘'},
    ],
    sfx: [
      {at: 'B1:5.1', sfx: 'wood_click', gain: 0.5}, {at: 'B1:5.3', sfx: 'wood_click', gain: 0.5},
      {at: 'B1:5.4', sfx: 'wood_click', gain: 0.55},
    ],
  },
  {
    id: '14', section: 'S1a', scene: 'room.scaleTable', start: 'B1:6.1', end: 'B1:7.2', display: 'bottom',
    text: '还要接住另一个人的【情绪】。', accents: ['red'], bg: '#3A2214',
    cast: [
      {who: 'hero', at: 'B1:6.1', expression: 'wince'},
      {who: 'hero', at: 'B1:7.1', expression: 'shockO', note: '扑去抓风筝扑空'},
    ],
    actions: [
      {id: 'jump4', at: 'B1:6.1', note: '小乌云跳上右盘'},
      {id: 'jump5', at: 'B1:6.3', note: '节拍器跳上右盘'},
      {id: 'scaleSlam', at: 'B1:7.1', note: '天平砸到底，风筝弹出窗外【卡变稀小节头】'},
      {id: 'lanternCold', at: 'B1:7.1', note: '桌上提灯火苗缩小变冷蓝'},
    ],
    sfx: [
      {at: 'B1:6.1', sfx: 'boing_5', gain: 0.35}, {at: 'B1:6.3', sfx: 'boing_3', gain: 0.35},
      {at: 'B1:7.1', sfx: 'metal_clang', gain: 0.7}, {at: 'B1:7.1', sfx: 'kite_whoosh', gain: 0.45},
    ],
  },
  {
    id: '15', section: 'S1a', scene: 'room.wide', start: 'B1:7.2', end: 'B1:8.1', display: 'bottom',
    text: '一个人住久了，', bg: '#2E1A10',
    cast: [
      {who: 'friend', at: 'B1:7.2', expression: 'awkward', note: '找不到地方坐'},
      {who: 'hero', at: 'B1:7.2', expression: 'awkward', note: '挠头'},
    ],
    actions: [{id: 'pullBackRoom', at: 'B1:7.2', note: '镜头拉远：每样东西都只有一份'}],
    sfx: [{at: 'B1:7.3', sfx: 'awkward', gain: 0.35}],
  },
  {
    id: '16', section: 'S1a', scene: 'room.squeeze', start: 'B1:8.1', end: 'B1:9.1', display: 'bottom',
    text: '多一个人，就得【腾位置】。', accents: ['red'], bg: '#2E1A10',
    cast: [{who: 'hero', at: 'B1:8.1', expression: 'strain', note: '后背顶书架、脸憋红、汗珠'}],
    actions: [
      {id: 'squeeze', at: 'B1:8.1', note: '推床顶书架挪桌子，家具挤压变形（加花段）'},
      {id: 'book1', at: 'B1:8.2', note: '书落'},
      {id: 'book2', at: 'B1:8.3', note: '书落'},
      {id: 'book3', at: 'B1:8.4', note: '书落'},
    ],
    sfx: [
      {at: 'B1:8.1', sfx: 'scrape', gain: 0.5},
      {at: 'B1:8.2', sfx: 'book_thud', gain: 0.45}, {at: 'B1:8.3', sfx: 'book_thud', gain: 0.45},
      {at: 'B1:8.4', sfx: 'book_thud', gain: 0.5},
    ],
  },

  // ───────────────────────── S1b 受不了不自由 · 副歌1 后半 ─────────────────────────
  {id: '17', section: 'S1b', scene: 'split.universes', start: 'B1:9.1', end: 'B1:10.1', display: 'bottom', text: '再看两个平行宇宙。', bg: '#3B2414',
    actions: [{id: 'pushSplit', at: 'B1:9.1', note: '转场·横推：两个宇宙从右推入'}], sfx: [{at: 'B1:9.1', sfx: 'whoosh_up', gain: 0.5}]},
  {id: '18', section: 'S1b', scene: 'split.top', start: 'B1:10.1', end: 'B1:11.1', display: 'bottom', text: '上面的他，一切刚刚好。', bg: '#3B2414',
    cast: [{who: 'hero', at: 'B1:10.1', expression: 'happy'}],
    actions: [{id: 'topRoutine', at: 'B1:10.1', note: '起床/泡茶/坐椅/翻书各卡一拍'}], sfx: [{at: 'B1:10.1', sfx: 'xylo_up', gain: 0.35}]},
  {id: '19', section: 'S1b', scene: 'split.bottom', start: 'B1:11.1', end: 'B1:12.1', display: 'bottom', text: '下面的他，处处【对不上】。', accents: ['red'], bg: '#6B3519',
    cast: [{who: 'hero', at: 'B1:11.1', expression: 'stiffSmile'}, {who: 'friend', at: 'B1:11.1', expression: 'neutral'}],
    actions: [{id: 'chairBump', at: 'B1:11.3', note: '两人同时坐同一把椅子撞在一起'}], sfx: [{at: 'B1:11.3', sfx: 'book_thud', gain: 0.5}]},
  {id: '20', section: 'S1b', scene: 'split.zip', start: 'B1:12.1', end: 'B1:13.1', display: 'bottom', text: '久了，他只想待在上面。', bg: '#3B2414',
    cast: [{who: 'hero', at: 'B1:12.1', expression: 'relief'}],
    actions: [{id: 'zipClose', at: 'B1:12.3', note: '把分割线像拉链一样拉合'}], sfx: [{at: 'B1:12.3', sfx: 'whoosh_up', gain: 0.35}]},
  {id: '21', section: 'S1b', scene: 'table.close', start: 'B1:13.1', end: 'B1:14.1', display: 'bottom', text: '直到有人，真的想靠近。', bg: '#5A2618',
    actions: [{id: 'archMask', at: 'B1:13.1', note: '转场·拱形遮罩'}, {id: 'crabPeek', at: 'B1:13.3', note: '茶杯里探出寄居蟹壳壳'}],
    sfx: [{at: 'B1:13.3', sfx: 'bubble_pop', gain: 0.5}]},
  {id: '22', section: 'S1b', scene: 'table.close', start: 'B1:14.1', end: 'B1:15.1', display: 'bottom', text: '他心里那只寄居蟹，缩了。', bg: '#5A2618',
    cast: [{who: 'crab', at: 'B1:14.1', expression: 'scared'}],
    actions: [{id: 'crabHide', at: 'B1:14.1', note: '壳壳缩回'}, {id: 'shellGrow1', at: 'B1:14.3', note: '瓷壳胀大一圈'}],
    sfx: [{at: 'B1:14.1', sfx: 'whoosh_down', gain: 0.4}, {at: 'B1:14.3', sfx: 'glass_ting', gain: 0.5}]},
  {id: '23', section: 'S1b', scene: 'hero.face', start: 'B1:15.1', end: 'B1:15.4', display: 'bottom', text: '他不是不想亲近，', bg: '#7A3E1C',
    cast: [{who: 'hero', at: 'B1:15.1', expression: 'longing'}]},
  {id: '24', section: 'S1b', scene: 'room.mid', start: 'B1:15.4', end: 'D:1.1', display: 'bottom', text: '是受不了亲近的【不自由】。', accents: ['red'], bg: '#7A3E1C',
    cast: [{who: 'hero', at: 'B1:16.1', expression: 'annoyed'}],
    actions: [{id: 'threadSnap', at: 'B1:16.3', note: '缠腕的毛线绷断'}], sfx: [{at: 'B1:16.3', sfx: 'wood_click', gain: 0.5}]},

  // ───────────────────────── S2 有人在，才敢一个人 · 桥段 D ─────────────────────────
  {id: '25', section: 'S2', scene: 'lantern.inside', start: 'D:1.2', end: 'D:2.1', display: 'bottom', text: '钻进这盏灯里看看。', bg: '#3A1A28',
    actions: [{id: 'irisLantern', at: 'D:1.1', note: '转场·钻进灯罩（虹膜开）【骤降】'}], sfx: [{at: 'D:1.1', sfx: 'glass_ting', gain: 0.5}]},
  {id: '26', section: 'S2', scene: 'memory.card', start: 'D:2.1', end: 'D:3.1', display: 'bottom', text: '精神分析学家温尼科特', bg: '#3A1A28',
    actions: [{id: 'cardSlide', at: 'D:2.1', note: '左侧旧纸名片（圆眼镜+领结剪影）'}]},
  {id: '27', section: 'S2', scene: 'memory.room', start: 'D:3.1', end: 'D:4.1', display: 'bottom', text: '提过一个词：【独处能力】。', accents: ['green'], bg: '#3A1A28',
    cast: [{who: 'kid', at: 'D:3.1', expression: 'curious', outfit: 'pajama'}],
    actions: [{id: 'roomAssemble', at: 'D:3.1', note: '碎纸拼成房间，各卡一拍'}]},
  {id: '28', section: 'S2', scene: 'memory.room', start: 'D:4.1', end: 'D:5.1', display: 'bottom', text: '在他看来，它来自一种经历：', bg: '#3A1A28',
    cast: [{who: 'kid', at: 'D:4.1', expression: 'happy'}]},
  {id: '29', section: 'S2', scene: 'memory.mom', start: 'D:5.1', end: 'D:6.1', display: 'bottom', text: '【有人在身边】时，一个人待着。', accents: ['gold'], bg: '#4A2A1E',
    cast: [{who: 'mom', at: 'D:5.1', outfit: 'mom', note: '几步外扶手椅里看书（背影）'}],
    actions: [{id: 'doorWipe', at: 'D:5.1', note: '转场·门板擦屏'}]},
  {id: '30', section: 'S2', scene: 'memory.room', start: 'D:6.1', end: 'D:7.1', display: 'bottom', text: '窗外，突然一阵大风——', bg: '#2A1A2E',
    cast: [{who: 'kid', at: 'D:6.3', expression: 'scared'}],
    actions: [{id: 'windowBurst', at: 'D:6.3', note: '窗被吹开'}, {id: 'boatTip', at: 'D:6.4', note: '纸船被吹翻，空拍处定格'}],
    sfx: [{at: 'D:6.3', sfx: 'wind_gust', gain: 0.5}]},
  {id: '31', section: 'S2', scene: 'memory.kid', start: 'D:7.1', end: 'D:8.1', display: 'bottom', text: '他回头：光还在。', bg: '#3A1A28',
    cast: [{who: 'kid', at: 'D:7.1', expression: 'relief'}],
    actions: [{id: 'kidLookBack', at: 'D:7.1', note: '回头看灯光'}, {id: 'momPage', at: 'D:7.3', note: '妈妈翻书'}]},
  {id: '32', section: 'S2', scene: 'memory.chest', start: 'D:8.1', end: 'A2:1.1', display: 'bottom', text: '那道光，一点点流进了心里。', bg: '#5A2A3A',
    actions: [{id: 'lightFlow', at: 'D:8.1', note: '光流进胸口，断奏处分三步亮起成心灯'}], sfx: [{at: 'D:8.1', sfx: 'xylo_up', gain: 0.3}]},

  // ───────────────────────── S3 心灯 · 主歌2 A2 ─────────────────────────
  {id: '33', section: 'S3', scene: 'balcony.dusk', start: 'A2:1.1', end: 'A2:2.1', display: 'bottom', text: '她没有一直陪他玩，', bg: '#0F2A24',
    cast: [{who: 'hero', at: 'A2:1.1', expression: 'calm', outfit: 'cardigan'}],
    actions: [{id: 'goldTrace1', at: 'A2:1.1', note: '转场·形状匹配+金线描景（金线①）'}]},
  {id: '34', section: 'S3', scene: 'balcony.dusk', start: 'A2:2.1', end: 'A2:3.1', display: 'bottom', text: '但她一直【都在】。', accents: ['gold'], bg: '#0F2A24',
    actions: [{id: 'emberPulse', at: 'A2:2.3', note: '心灯跳动【重音】'}]},
  {id: '35', section: 'S3', scene: 'island.track1', start: 'A2:3.1', end: 'A2:4.1', display: 'bottom', text: '这份确信，【装进了心里】。', accents: ['green'], bg: '#0E3B3F',
    actions: [{id: 'pageTurn', at: 'A2:3.3', note: '礁石看书翻页'}]},
  {id: '36', section: 'S3', scene: 'island.track2', start: 'A2:4.1', end: 'A2:5.1', display: 'bottom', text: '没人在身边，也不怕被丢下。', bg: '#0E3B3F',
    actions: [{id: 'floatBob', at: 'A2:4.3', note: '码头钓鱼浮漂一沉'}]},
  {id: '37', section: 'S3', scene: 'island.track3', start: 'A2:5.1', end: 'A2:6.1', display: 'bottom', text: '孤独来了，不必马上找人填。', bg: '#12302A',
    actions: [{id: 'patCloud', at: 'A2:5.3', note: '拍拍孤独小乌云；玻璃水杯一直满'}]},
  {id: '38', section: 'S3', scene: 'island.track4', start: 'A2:6.1', end: 'A2:7.1', display: 'bottom', text: '不用等谁回复，才觉得踏实。', bg: '#12302A',
    actions: [{id: 'waterPlant', at: 'A2:6.1', note: '浇花，手机屏幕朝下'}]},
  {id: '39', section: 'S3', scene: 'island.wide', start: 'A2:7.1', end: 'A2:8.1', display: 'bottom', text: '这就是他说的【独处能力】。', accents: ['green'], bg: '#0F2A24'},
  {id: '40', section: 'S3', scene: 'hero.chest', start: 'A2:8.1', end: 'B2:1.1', display: 'bottom', text: '可是，特别能一个人待着——', bg: '#1B2A28',
    cast: [{who: 'hero', at: 'A2:8.1', expression: 'puzzled'}],
    actions: [{id: 'freezeShell', at: 'A2:8.3', note: '静音定格，心灯外浮出瓷壳轮廓'}]},

  // ───────────────────────── S4 那层壳 · 副歌2 B2 ─────────────────────────
  {id: '41', section: 'S4', scene: 'fog.mirror', start: 'B2:1.1', end: 'B2:2.1', display: 'slam', text: '也可能是【壳】', accents: ['blue'], bg: '#1E1530',
    slam: [{text: '也可能', at: 'B2:1.1'}, {text: '是', at: 'B2:1.2'}, {text: '【壳】', at: 'B2:1.3'}],
    actions: [{id: 'mirrorFlip', at: 'B2:1.1', note: '转场·镜面翻转【爆点】'}],
    sfx: [{at: 'B2:1.1', sfx: 'impact', gain: 1.0}, {at: 'B2:1.3', sfx: 'glass_ting', gain: 0.6}]},
  {id: '42', section: 'S4', scene: 'fog.split', start: 'B2:2.1', end: 'B2:3.1', display: 'bottom', text: '当然，爱安静本身没有问题。', bg: '#2E2842',
    cast: [{who: 'hero', at: 'B2:2.1', outfit: 'coat', expression: 'cold'}, {who: 'stranger', at: 'B2:2.1', expression: 'calm'}]},
  {id: '43', section: 'S4', scene: 'fog.sea', start: 'B2:3.1', end: 'B2:4.1', display: 'bottom', text: '但如果，有人一靠近就想逃——', bg: '#3A3350',
    actions: [{id: 'thermoShow', at: 'B2:3.1', note: '左侧距离—烦躁温度计出现'}]},
  {id: '44', section: 'S4', scene: 'dock.fog', start: 'B2:4.1', end: 'B2:5.1', display: 'bottom', text: '关心嫌【打扰】，依赖嫌【麻烦】，', accents: ['red', 'red'], bg: '#3A3350',
    cast: [{who: 'hero', at: 'B2:4.1', expression: 'annoyed'}],
    actions: [{id: 'soupOffer', at: 'B2:4.1', note: '递汤，红柱窜一格，壳胀'}, {id: 'ropeToss', at: 'B2:4.3', note: '抛缆绳，再窜一格'}]},
  {id: '45', section: 'S4', scene: 'dock.pov', start: 'B2:5.1', end: 'B2:6.1', display: 'bottom', text: '谁都不需要，就不会【失望】；', accents: ['red'], bg: '#3A3350',
    actions: [{id: 'whipPan', at: 'B2:5.1', note: '转场·甩镜'}]},
  {id: '46', section: 'S4', scene: 'dome.wide', start: 'B2:6.1', end: 'B2:7.1', display: 'bottom', text: '不让人进，就不会【被离开】。', accents: ['red'], bg: '#160F24'},
  {id: '47', section: 'S4', scene: 'dome.outside', start: 'B2:7.1', end: 'B2:8.1', display: 'bottom', text: '可壳挡住了失望，', bg: '#160F24'},
  {id: '48', section: 'S4', scene: 'dome.inside', start: 'B2:8.1', end: 'C:1.1', display: 'bottom', text: '也挡住了【暖光】。', accents: ['gold'], bg: '#120C1C',
    cast: [{who: 'hero', at: 'B2:8.1', expression: 'sad'}, {who: 'hero', at: 'B2:8.4', expression: 'resolute'}],
    actions: [{id: 'lanternCrack', at: 'B2:8.2', note: '提灯裂开'}], sfx: [{at: 'B2:8.2', sfx: 'glass_ting', gain: 0.5}]},

  // ───────────────────────── S5 把灯打开 · 高潮 C ─────────────────────────
  {id: '49', section: 'S5', scene: 'dome.tear', start: 'C:1.1', end: 'C:2.1', display: 'slam', text: '把灯【打开】', accents: ['gold'], bg: '#2A1C3A',
    slam: [{text: '把灯', at: 'C:1.1'}, {text: '【打开】', at: 'C:1.2'}],
    actions: [{id: 'paperTear', at: 'C:1.1', note: '转场·纸张撕裂+金缮（金线②）【最强爆点】'}, {id: 'leverUp', at: 'C:1.3', note: '灯塔复明'}],
    sfx: [{at: 'C:1.1', sfx: 'impact', gain: 1.0}, {at: 'C:1.3', sfx: 'metal_clang', gain: 0.5}]},
  {id: '50', section: 'S5', scene: 'lighthouse.wide', start: 'C:2.1', end: 'C:3.1', display: 'bottom', text: '【灯开着】，船来不来都行。', accents: ['gold'], bg: '#6E3A1E',
    cast: [{who: 'hero', at: 'C:2.1', outfit: 'linen', expression: 'awe'}],
    actions: [{id: 'fleetLights', at: 'C:2.1', note: '渔火一批批亮起'}], sfx: [{at: 'C:2.1', sfx: 'xylo_up', gain: 0.4}]},
  {id: '51', section: 'S5', scene: 'dock.split', start: 'C:3.1', end: 'C:4.1', display: 'bottom', text: '能一个人过，也不拒绝陪伴；', bg: '#7A4A2A',
    actions: [{id: 'splitClose', at: 'C:4.1', note: '转场·上下分屏合拢'}]},
  {id: '52', section: 'S5', scene: 'lighthouse.base', start: 'C:4.1', end: 'C:5.1', display: 'bottom', text: '能自己扛，累了也肯靠一靠。', bg: '#7A4A2A',
    cast: [{who: 'hero', at: 'C:4.1', expression: 'shy'}]},
  {id: '53', section: 'S5', scene: 'dock.wide', start: 'C:5.1', end: 'C:6.1', display: 'bottom', text: '有自己的世界，', bg: '#9A6A34',
    actions: [{id: 'flashCut', at: 'C:5.1', note: '转场·光点闪光'}]},
  {id: '54', section: 'S5', scene: 'dock.mid', start: 'C:6.1', end: 'C:7.1', display: 'bottom', text: '也愿意，【留一把椅子】。', accents: ['gold'], bg: '#9A6A34',
    actions: [{id: 'chairDown', at: 'C:6.3', note: '第二把椅子落地，金线③描边'}], sfx: [{at: 'C:6.3', sfx: 'wood_click', gain: 0.7}]},
  {id: '55', section: 'S5', scene: 'dock.two', start: 'C:7.1', end: 'C:8.1', display: 'bottom', text: '关系带来的，不只是被理解，', bg: '#9A6A34'},
  {id: '56', section: 'S5', scene: 'eye.reflection', start: 'C:8.1', end: 'B3:1.1', display: 'bottom', text: '在别人眼里，认出新的自己。', bg: '#8A5A2A',
    cast: [{who: 'hero', at: 'C:8.1', expression: 'laugh'}]},

  // ───────────────────────── S6 不空，不丢 · 副歌再现 + 尾奏 ─────────────────────────
  {id: '57', section: 'S6', scene: 'dock.night', start: 'B3:1.1', end: 'B3:2.1', display: 'slam', text: '【不空，也不丢】', accents: ['gold'], bg: '#120F12',
    slam: [{text: '【不空】', at: 'B3:1.1'}, {text: '【，也不丢】', at: 'B3:1.3'}],
    actions: [{id: 'lightCut', at: 'B3:1.1', note: '转场·斜向光切【爆点】'}], sfx: [{at: 'B3:1.1', sfx: 'impact', gain: 0.9}]},
  {id: '58', section: 'S6', scene: 'dock.night', start: 'B3:2.1', end: 'B3:3.1', display: 'bottom', text: '所以，真正的独处能力，', bg: '#120F12'},
  {id: '59', section: 'S6', scene: 'dock.close', start: 'B3:3.1', end: 'B3:4.1', display: 'bottom', text: '是一个人的时候，【不空】；', accents: ['gold'], bg: '#120F12'},
  {id: '60', section: 'S6', scene: 'sea.reflection', start: 'B3:4.1', end: 'B3:5.1', display: 'bottom', text: '两个人的时候，也【不丢】。', accents: ['gold'], bg: '#120F12'},
  {id: '61', section: 'S6', scene: 'dock.end', start: 'B3:5.1', end: 'B3:6.1', display: 'bottom', text: '能回到自己的世界，', bg: '#120F12'},
  {id: '62', section: 'S6', scene: 'sea.wide', start: 'B3:6.1', end: 'OUT:1.1', display: 'bottom', text: '也愿意，让人走进来。', bg: '#101A30',
    sfx: [{at: 'B3:6.2', sfx: 'ship_bell', gain: 0.4}]},
  {id: '63', section: 'S6', scene: 'sea.goldPoint', start: 'OUT:1.1', end: 'END', display: 'bottom', text: '灯一直【亮着】，为自己，也为来的人。', accents: ['gold'], bg: '#101A30',
    actions: [{id: 'goldIris', at: 'OUT:1.1', note: '结尾转场·金光虹膜收'}, {id: 'finalGlint', at: 'OUT:2.4', note: '最后金点闪光=结束音'}],
    sfx: [{at: 'OUT:2.4', sfx: 'chime_end', gain: 0.45}]},
];
