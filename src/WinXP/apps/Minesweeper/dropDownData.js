export const Game = [
  {
    type: 'item',
    text: '新游戏',
    hotkey: 'F2',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '初级',
  },
  {
    type: 'item',
    text: '中级',
  },
  {
    type: 'item',
    text: '高级',
  },
  {
    type: 'item',
    text: '自定义...',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '标记 (?)',
    symbol: 'check',
  },
  {
    type: 'item',
    text: '颜色',
    symbol: 'check',
  },
  {
    type: 'item',
    text: '声音',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '扫雷英雄榜...',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '退出',
  },
];

const Help = [
  {
    type: 'item',
    text: '目录',
    hotkey: 'F1',
  },
  {
    type: 'item',
    text: '搜索帮助主题...',
  },
  {
    type: 'item',
    text: '使用帮助',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '关于扫雷',
  },
];
const dropDownData = { 游戏: Game, 帮助: Help };
export default dropDownData;
