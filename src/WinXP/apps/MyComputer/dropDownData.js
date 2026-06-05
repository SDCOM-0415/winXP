export const File = [
  {
    type: 'item',
    text: '创建快捷方式',
    disable: true,
  },
  {
    type: 'item',
    text: '删除',
    disable: true,
  },
  {
    type: 'item',
    text: '重命名',
    disable: true,
  },
  {
    type: 'item',
    disable: true,
    text: '属性',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '关闭',
  },
];
const Edit = [
  {
    type: 'item',
    disable: true,
    text: '撤销',
    hotkey: 'Ctrl+Z',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    disable: true,
    text: '剪切',
    hotkey: 'Ctrl+X',
  },
  {
    type: 'item',
    disable: true,
    text: '复制',
    hotkey: 'Ctrl+C',
  },
  {
    type: 'item',
    disable: true,
    text: '粘贴',
    hotkey: 'Ctrl+V',
  },
  {
    type: 'item',
    disable: true,
    text: '粘贴快捷方式',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '复制到文件夹...',
    disable: true,
  },
  {
    type: 'item',
    text: '移动到文件夹...',
    disable: true,
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '全选',
    hotkey: 'Ctrl+A',
  },
  {
    type: 'item',
    text: '反向选择',
  },
];

const View = [
  {
    type: 'menu',
    position: {
      left: 'calc(100% - 4px)',
      top: '-3px',
    },
    text: '工具栏',
    items: [
      {
        type: 'item',
        symbol: 'check',
        text: '标准按钮',
      },
      {
        type: 'item',
        symbol: 'check',
        text: '地址栏',
      },
      {
        type: 'item',
        symbol: 'check',
        text: '链接',
      },
      {
        type: 'separator',
      },
      {
        type: 'item',
        symbol: 'check',
        text: '锁定工具栏',
      },
      {
        type: 'item',
        text: '自定义...',
      },
    ],
  },
  {
    type: 'item',
    symbol: 'check',
    text: '状态栏',
  },
  {
    type: 'menu',
    position: {
      left: 'calc(100% - 4px)',
      top: '-3px',
    },
    text: '浏览器栏',
    items: [
      {
        type: 'item',
        text: '搜索',
        hotkey: 'Ctrl+E',
      },
      {
        type: 'item',
        text: '收藏夹',
        hotkey: 'Ctrl+I',
      },
      {
        type: 'item',
        text: '历史记录',
        hotkey: 'Ctrl+H',
      },
      {
        type: 'item',
        text: '文件夹',
      },
      {
        type: 'separator',
      },
      {
        type: 'item',
        text: '每日提示',
      },
    ],
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '缩略图',
  },
  {
    type: 'item',
    text: '平铺',
    symbol: 'circle',
  },
  {
    type: 'item',
    text: '图标',
  },
  {
    type: 'item',
    text: '列表',
  },
  {
    type: 'item',
    text: '详细信息',
  },
  {
    type: 'separator',
  },
  {
    type: 'menu',
    position: {
      left: 'calc(100% - 4px)',
      top: '-3px',
    },
    text: '排列图标',
    items: [
      {
        type: 'item',
        text: '名称',
      },
      {
        type: 'item',
        text: '类型',
        symbol: 'circle',
      },
      {
        type: 'item',
        text: '总大小',
      },
      {
        type: 'item',
        text: '可用空间',
      },
      {
        type: 'item',
        text: '备注',
      },
      {
        type: 'separator',
      },
      {
        type: 'item',
        text: '按组排列',
        symbol: 'check',
      },
      {
        type: 'item',
        text: '自动排列',
      },
      {
        type: 'item',
        text: '对齐到网格',
      },
    ],
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '选择详细信息...',
  },
  {
    type: 'menu',
    position: {
      left: 'calc(100% - 4px)',
      top: '-3px',
    },
    text: '转到',
    items: [
      {
        type: 'item',
        disable: true,
        text: '后退',
        hotkey: 'Alt+Left Arrow',
      },
      {
        type: 'item',
        disable: true,
        text: '前进',
        hotkey: 'Alt+Right Arrow',
      },
      {
        type: 'item',
        text: '向上一级',
      },
      {
        type: 'separator',
      },
      {
        type: 'item',
        text: '主页',
        hotkey: 'Alt+Home',
      },
      {
        type: 'separator',
      },
      {
        type: 'item',
        text: '我的电脑',
        symbol: 'check',
      },
    ],
  },
  {
    type: 'item',
    text: '刷新',
  },
];
const Favorites = [
  {
    type: 'item',
    text: '添加到收藏夹...',
  },
  {
    type: 'item',
    text: '整理收藏夹...',
  },
  {
    type: 'separator',
  },
  {
    type: 'menu',
    symbol: 'folder',
    position: {
      left: 'calc(100% - 4px)',
      top: '-3px',
    },
    text: '链接',
    items: [
      {
        type: 'item',
        text: '自定义链接',
        symbol: 'ie-paper',
      },
      {
        type: 'item',
        text: '免费 Hotmail',
        symbol: 'ie-paper',
      },
      {
        type: 'item',
        text: 'Windows',
        symbol: 'ie-paper',
      },
      {
        type: 'item',
        text: 'Windows Marketplace',
        symbol: 'ie-book',
      },
      {
        type: 'item',
        text: 'Windows Media',
        symbol: 'ie-paper',
      },
    ],
  },
  {
    type: 'item',
    text: 'MSN.com',
    symbol: 'ie-paper',
  },
  {
    type: 'item',
    text: '电台指南',
    symbol: 'ie-paper',
  },
];
const Tools = [
  {
    type: 'item',
    text: '映射网络驱动器...',
  },
  {
    type: 'item',
    text: '断开网络驱动器...',
  },
  {
    type: 'item',
    text: '同步...',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '文件夹选项...',
  },
];
const Help = [
  {
    type: 'item',
    text: '帮助和支持中心',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '此 Windows 副本是否合法？',
  },
  {
    type: 'item',
    text: '关于 Windows',
  },
];
export default { '文件': File, '编辑': Edit, '查看': View, '收藏': Favorites, '工具': Tools, '帮助': Help };
