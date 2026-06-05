export const File = [
  {
    type: 'menu',
    text: '新建',
    position: {
      left: 'calc(100% - 4px)',
      top: '-3px',
    },
    items: [
      {
        type: 'item',
        text: '窗口',
        hotkey: 'Ctrl+N',
      },
      { type: 'separator' },
      {
        type: 'item',
        text: '邮件',
      },
      {
        type: 'item',
        text: '帖子',
      },
      {
        type: 'item',
        text: '联系人',
      },
      {
        type: 'item',
        text: 'Internet 呼叫',
      },
    ],
  },
  {
    type: 'item',
    text: '打开...',
    hotkey: 'Ctrl+O',
  },
  {
    type: 'item',
    text: '编辑',
    disable: true,
  },
  {
    type: 'item',
    disable: true,
    text: '保存',
    hotkey: 'Ctrl+S',
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
    text: '页面设置...',
  },
  {
    type: 'item',
    text: '打印...',
    hotkey: 'Ctrl+P',
  },
  {
    type: 'item',
    text: '打印预览...',
  },
  {
    type: 'separator',
  },
  {
    type: 'menu',
    text: '发送',
    position: {
      left: 'calc(100% - 4px)',
      top: '-3px',
    },
    items: [
      {
        type: 'item',
        text: '电子邮件页面...',
      },
      {
        type: 'item',
        text: '电子邮件链接...',
      },
      {
        type: 'item',
        text: '桌面快捷方式',
      },
    ],
  },
  {
    type: 'item',
    text: '导入和导出...',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '属性',
  },
  {
    type: 'item',
    text: '脱机工作',
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
    type: 'separator',
  },
  {
    type: 'item',
    text: '全选',
    hotkey: 'Ctrl+A',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '在当前页查找...',
    hotkey: 'Ctrl+F',
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
        text: '无法找到服务器',
        symbol: 'check',
      },
    ],
  },
  {
    type: 'item',
    text: '停止',
    hotkey: 'Esc',
  },
  {
    type: 'item',
    text: '刷新',
    hotkey: 'F5',
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
    text: '文字大小',
    items: [
      {
        type: 'item',
        text: '最大',
      },
      {
        type: 'item',
        text: '较大',
      },
      {
        type: 'item',
        text: '中',
        symbol: 'circle',
      },
      {
        type: 'item',
        text: '较小',
      },
      {
        type: 'item',
        text: '最小',
      },
    ],
  },
  {
    type: 'menu',
    position: {
      left: 'calc(100% - 4px)',
      top: '-3px',
    },
    text: '编码',
    items: [
      {
        type: 'item',
        text: '自动选择',
      },
      {
        type: 'separator',
      },
      {
        type: 'item',
        text: '西欧 (Windows)',
        symbol: 'circle',
      },
      {
        type: 'menu',
        position: {
          left: 'calc(100% - 4px)',
          top: '-3px',
        },
        text: '更多',
        items: [
          {
            type: 'item',
            text: '阿拉伯语 (ASMO 708)',
          },
          {
            type: 'separator',
          },
          {
            type: 'item',
            text: '繁体中文',
          },
        ],
      },
    ],
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '源文件',
  },
  {
    type: 'item',
    disable: true,
    text: '隐私报告...',
  },
  {
    type: 'item',
    text: '全屏',
    hotkey: 'F11',
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
    type: 'menu',
    position: {
      left: 'calc(100% - 4px)',
      top: '-3px',
    },
    text: '邮件和新闻',
    items: [
      {
        type: 'item',
        text: '阅读邮件',
      },

      {
        type: 'item',
        text: '新建邮件...',
      },
      {
        type: 'item',
        text: '发送链接...',
      },
      {
        type: 'item',
        text: '发送页面...',
      },
      {
        type: 'separator',
      },
      {
        type: 'item',
        text: '阅读新闻',
      },
    ],
  },
  {
    type: 'menu',
    position: {
      left: 'calc(100% - 4px)',
      top: '-3px',
    },
    text: '弹出窗口阻止程序',
    items: [
      {
        type: 'item',
        text: '关闭弹出窗口阻止程序',
      },

      {
        type: 'item',
        text: '弹出窗口阻止程序设置...',
      },
    ],
  },
  {
    type: 'item',
    text: '管理加载项...',
  },
  {
    type: 'item',
    text: '同步...',
  },
  {
    type: 'item',
    text: 'Windows Update',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: 'Windows Messenger',
  },
  {
    type: 'item',
    text: '诊断连接问题...',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: 'Internet 选项...',
  },
];
const Help = [
  {
    type: 'item',
    text: '目录和索引',
  },
  {
    type: 'item',
    text: '每日提示',
  },
  {
    type: 'item',
    text: 'Netscape 用户',
  },
  {
    type: 'item',
    text: '联机支持',
  },
  {
    type: 'item',
    text: '发送反馈意见',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '关于 Internet Explorer',
  },
];
export default { '文件': File, '编辑': Edit, '查看': View, '收藏': Favorites, '工具': Tools, '帮助': Help };
