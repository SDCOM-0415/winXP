const Edit = [
  {
    type: 'item',
    text: '复制',
    hotkey: 'Ctrl+C',
  },
  {
    type: 'item',
    disable: true,
    text: '粘贴',
    hotkey: 'Ctrl+V',
  },
];

const View = [
  {
    type: 'item',
    symbol: 'circle',
    text: '标准型',
  },
  {
    type: 'item',
    disable: true,
    text: '科学型',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    disable: true,
    text: '十六进制',
  },
  {
    type: 'item',
    disable: true,
    text: '十进制',
  },
  {
    type: 'item',
    disable: true,
    text: '八进制',
  },
  {
    type: 'item',
    disable: true,
    text: '二进制',
  },
];

const Help = [
  {
    type: 'item',
    disable: true,
    text: '帮助主题',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    disable: true,
    text: '关于计算器',
  },
];

const dropDownData = {
  编辑: Edit,
  查看: View,
  帮助: Help,
};

export default dropDownData;
