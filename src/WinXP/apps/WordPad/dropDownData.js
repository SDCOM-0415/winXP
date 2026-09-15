const File = [
  {
    type: 'item',
    text: '新建',
  },
  {
    type: 'item',
    text: '打开...',
  },
  {
    type: 'item',
    text: '保存',
  },
  {
    type: 'item',
    text: '另存为...',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    disable: true,
    text: '页面设置...',
  },
  {
    type: 'item',
    disable: true,
    text: '打印...',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '退出',
  },
];

const Edit = [
  {
    type: 'item',
    text: '撤销',
  },
  {
    type: 'item',
    text: '重做',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '剪切',
  },
  {
    type: 'item',
    text: '复制',
  },
  {
    type: 'item',
    disable: true,
    text: '粘贴',
  },
  {
    type: 'item',
    disable: true,
    text: '清除',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '全选',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    disable: true,
    text: '查找...',
  },
];

const View = [
  {
    type: 'item',
    symbol: 'check',
    text: '工具栏',
  },
  {
    type: 'item',
    symbol: 'check',
    text: '格式栏',
  },
  {
    type: 'item',
    disable: true,
    symbol: 'check',
    text: '标尺',
  },
  {
    type: 'item',
    disable: true,
    text: '状态栏',
  },
];

const Insert = [
  {
    type: 'item',
    text: '日期和时间...',
  },
];

const Format = [
  {
    type: 'item',
    disable: true,
    text: '字体...',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '加粗',
  },
  {
    type: 'item',
    text: '斜体',
  },
  {
    type: 'item',
    text: '下划线',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '左对齐',
  },
  {
    type: 'item',
    text: '居中',
  },
  {
    type: 'item',
    text: '右对齐',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '项目符号',
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
    text: '关于写字板',
  },
];

const dropDownData = {
  文件: File,
  编辑: Edit,
  查看: View,
  插入: Insert,
  格式: Format,
  帮助: Help,
};

export default dropDownData;
