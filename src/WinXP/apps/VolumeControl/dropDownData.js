const Options = [
  {
    type: 'item',
    disable: true,
    text: '属性',
  },
  {
    type: 'item',
    disable: true,
    text: '高级控制',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '静音',
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
    disable: true,
    text: '帮助主题',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '关于音量控制',
  },
];

const dropDownData = {
  选项: Options,
  帮助: Help,
};

export default dropDownData;
