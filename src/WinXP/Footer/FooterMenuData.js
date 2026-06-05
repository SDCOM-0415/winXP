import empty from 'assets/empty.png';
import backup from 'assets/windowsIcons/23(16x16).png';
import keyboard from 'assets/windowsIcons/58(16x16).png';
import cmd from 'assets/windowsIcons/56(16x16).png';
import calculator from 'assets/windowsIcons/74(16x16).png';
import utility from 'assets/windowsIcons/119(16x16).png';
import volume from 'assets/windowsIcons/120(16x16).png';
import characterMap from 'assets/windowsIcons/127(16x16).png';
import cleanDisk from 'assets/windowsIcons/128(16x16).png';
import wordPad from 'assets/windowsIcons/153(16x16).png';
import winExplorer from 'assets/windowsIcons/156(16x16).png';
import MSN from 'assets/windowsIcons/159(16x16).png';
import sync from 'assets/windowsIcons/182(16x16).png';
import security from 'assets/windowsIcons/214(16x16).png';
import access from 'assets/windowsIcons/227(16x16).png';
import wireless from 'assets/windowsIcons/234(16x16).png';
import accessibility from 'assets/windowsIcons/238(16x16).png';
import connection from 'assets/windowsIcons/309(16x16).png';
import update from 'assets/windowsIcons/322(16x16).png';
import notepad from 'assets/windowsIcons/327(16x16).png';
import networkAssistance from 'assets/windowsIcons/357(16x16).png';
import menu from 'assets/windowsIcons/358(16x16).png';
import transfer from 'assets/windowsIcons/367(16x16).png';
import defragmenter from 'assets/windowsIcons/374(16x16).png';
import catalog from 'assets/windowsIcons/392(16x16).png';
import networkConnection from 'assets/windowsIcons/404(16x16).png';
import info from 'assets/windowsIcons/505(16x16).png';
import address from 'assets/windowsIcons/554(16x16).png';
import connectionWizard from 'assets/windowsIcons/663(16x16).png';
import networkSetup from 'assets/windowsIcons/664(16x16).png';
import hyperCmd from 'assets/windowsIcons/669(16x16).png';
import painter from 'assets/windowsIcons/680(16x16).png';
import sound from 'assets/windowsIcons/690(16x16).png';
import recent from 'assets/windowsIcons/716(16x16).png';
import compatibility from 'assets/windowsIcons/747(16x16).png';
import magnifier from 'assets/windowsIcons/817(16x16).png';
import mediaPlayer from 'assets/windowsIcons/846(16x16).png';
import tour from 'assets/windowsIcons/853(32x32).png';
import outlook from 'assets/windowsIcons/887(16x16).png';
import spade from 'assets/windowsIcons/888(16x16).png';
import reversi from 'assets/windowsIcons/889(16x16).png';
import onlineHeart from 'assets/windowsIcons/890(16x16).png';
import checker from 'assets/windowsIcons/891(16x16).png';
import backgammon from 'assets/windowsIcons/892(16x16).png';
import movieMaker from 'assets/windowsIcons/894(16x16).png';
import ie from 'assets/windowsIcons/896(16x16).png';
import messenger from 'assets/windowsIcons/msn.png';
import spider from 'assets/windowsIcons/spider.png';
import freecell from 'assets/windowsIcons/freecell.png';
import heart from 'assets/windowsIcons/heart.png';
import rdp from 'assets/windowsIcons/rdp.png';
import solitaire from 'assets/windowsIcons/solitaire.png';
import narrator from 'assets/windowsIcons/narrator.ico';
import pinball from 'assets/windowsIcons/pinball.png';
import restore from 'assets/windowsIcons/restore.ico';
import mine from 'assets/minesweeper/mine-icon.png';

export const MyRecentDocuments = [
  {
    type: 'item',
    icon: empty,
    text: '(空)',
  },
];
export const ConnectTo = [
  {
    type: 'item',
    icon: MSN,
    text: 'MSN',
  },
  {
    type: 'item',
    icon: connection,
    text: '显示所有连接',
  },
];
export const AllPrograms = [
  {
    type: 'item',
    icon: access,
    text: '设定程序访问和默认值',
  },
  {
    type: 'item',
    icon: catalog,
    text: 'Windows 目录',
  },
  {
    type: 'item',
    icon: update,
    text: 'Windows Update',
  },
  {
    type: 'separator',
  },
  {
    type: 'menu',
    icon: menu,
    text: '附件',
    items: [
      {
        type: 'menu',
        icon: menu,
        text: '辅助功能',
        bottom: 'initial',
        items: [
          {
            type: 'item',
            icon: accessibility,
            text: '辅助功能向导',
          },
          {
            type: 'item',
            icon: magnifier,
            text: '放大镜',
          },
          {
            type: 'item',
            icon: narrator,
            text: '讲述人',
          },
          {
            type: 'item',
            icon: keyboard,
            text: '屏幕键盘',
          },
          {
            type: 'item',
            icon: utility,
            text: '辅助工具管理器',
          },
        ],
      },
      {
        type: 'menu',
        icon: menu,
        text: '通讯',
        bottom: 'initial',
        items: [
          {
            type: 'item',
            icon: hyperCmd,
            text: '超级终端',
          },
          {
            type: 'item',
            icon: networkConnection,
            text: '网络连接',
          },
          {
            type: 'item',
            icon: networkSetup,
            text: '网络安装向导',
          },
          {
            type: 'item',
            icon: connectionWizard,
            text: '新建连接向导',
          },
          {
            type: 'item',
            icon: wireless,
            text: '无线网络安装向导',
          },
        ],
      },
      {
        type: 'menu',
        icon: menu,
        text: '娱乐',
        bottom: 'initial',
        items: [
          {
            type: 'item',
            icon: sound,
            text: '录音机',
          },
          {
            type: 'item',
            icon: volume,
            text: '音量控制',
          },
          {
            type: 'item',
            icon: mediaPlayer,
            text: 'Windows Media Player',
          },
        ],
      },
      {
        type: 'menu',
        icon: menu,
        text: '系统工具',
        bottom: 'initial',
        items: [
          {
            type: 'item',
            icon: backup,
            text: '备份',
          },
          {
            type: 'item',
            icon: characterMap,
            text: '字符映射表',
          },
          {
            type: 'item',
            icon: cleanDisk,
            text: '磁盘清理',
          },
          {
            type: 'item',
            icon: defragmenter,
            text: '磁盘碎片整理程序',
          },
          {
            type: 'item',
            icon: transfer,
            text: '文件和设置转移向导',
          },
          {
            type: 'item',
            icon: recent,
            text: '计划任务',
          },
          {
            type: 'item',
            icon: security,
            text: '安全中心',
          },
          {
            type: 'item',
            icon: info,
            text: '系统信息',
          },
          {
            type: 'item',
            icon: restore,
            text: '系统还原',
          },
        ],
      },
      {
        type: 'item',
        icon: address,
        text: '通讯簿',
      },
      {
        type: 'item',
        icon: cmd,
        text: '命令提示符',
      },
      {
        type: 'item',
        icon: notepad,
        text: '记事本',
      },
      {
        type: 'item',
        icon: painter,
        text: '画图',
      },
      {
        type: 'item',
        icon: calculator,
        text: '计算器',
      },
      {
        type: 'item',
        icon: compatibility,
        text: '程序兼容性向导',
      },
      {
        type: 'item',
        icon: rdp,
        text: '远程桌面连接',
      },
      {
        type: 'item',
        icon: sync,
        text: '同步',
      },
      {
        type: 'item',
        icon: tour,
        text: '漫游 Windows XP',
      },
      {
        type: 'item',
        icon: winExplorer,
        text: 'Windows 资源管理器',
      },
      {
        type: 'item',
        icon: wordPad,
        text: '写字板',
      },
    ],
  },
  {
    type: 'menu',
    icon: menu,
    text: '游戏',
    items: [
      {
        type: 'item',
        icon: freecell,
        text: '空当接龙',
      },
      {
        type: 'item',
        icon: heart,
        text: '红心大战',
      },
      {
        type: 'item',
        icon: backgammon,
        text: 'Internet 双陆棋',
      },
      {
        type: 'item',
        icon: checker,
        text: 'Internet 跳棋',
      },
      {
        type: 'item',
        icon: onlineHeart,
        text: 'Internet 红心大战',
      },
      {
        type: 'item',
        icon: reversi,
        text: 'Internet 黑白棋',
      },
      {
        type: 'item',
        icon: spade,
        text: 'Internet 纸牌',
      },
      {
        type: 'item',
        icon: mine,
        text: '扫雷',
      },
      {
        type: 'item',
        icon: pinball,
        text: '三维弹球',
      },
      {
        type: 'item',
        icon: solitaire,
        text: '纸牌',
      },
      {
        type: 'item',
        icon: spider,
        text: '蜘蛛纸牌',
      },
    ],
  },
  {
    type: 'menu',
    icon: menu,
    text: '启动',
    items: [
      {
        type: 'item',
        icon: empty,
        text: '(空)',
      },
    ],
  },
  {
    type: 'item',
    icon: ie,
    text: 'Internet Explorer',
  },
  {
    type: 'item',
    icon: outlook,
    text: 'Outlook Express',
  },
  {
    type: 'item',
    icon: networkAssistance,
    text: '远程协助',
  },
  {
    type: 'item',
    icon: mediaPlayer,
    text: 'Windows Media Player',
  },
  {
    type: 'item',
    icon: messenger,
    text: 'Windows Messenger',
  },
  {
    type: 'item',
    icon: movieMaker,
    text: 'Windows Movie Maker',
  },
];
