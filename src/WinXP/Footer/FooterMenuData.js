import empty from 'assets/empty.png';
import backup from 'assets/windowsIcons/svg/Backup Wizard.svg';
import keyboard from 'assets/windowsIcons/svg/On-Screen Keyboard.svg';
import cmd from 'assets/windowsIcons/svg/Command Prompt.svg';
import calculator from 'assets/windowsIcons/svg/Calculator.svg';
import utility from 'assets/windowsIcons/svg/Accessibility.svg';
import volume from 'assets/windowsIcons/svg/Volume.svg';
import characterMap from 'assets/windowsIcons/svg/Charmap.svg';
import cleanDisk from 'assets/windowsIcons/svg/Disk Cleanup.svg';
import wordPad from 'assets/windowsIcons/svg/Wordpad.svg';
import winExplorer from 'assets/windowsIcons/svg/Explorer.svg';
import MSN from 'assets/windowsIcons/svg/MSN.svg';
import sync from 'assets/windowsIcons/svg/Sync.svg';
import security from 'assets/windowsIcons/svg/Security Center.svg';
import access from 'assets/windowsIcons/svg/Default Programs (SP1 Version).svg';
import wireless from 'assets/windowsIcons/svg/Wireless Network Setup.svg';
import accessibility from 'assets/windowsIcons/svg/Accessibility Wizard.svg';
import connection from 'assets/windowsIcons/svg/Network Connections.svg';
import update from 'assets/windowsIcons/svg/Windows Update.svg';
import notepad from 'assets/windowsIcons/svg/Notepad.svg';
import networkAssistance from 'assets/windowsIcons/svg/Remote Assistance.svg';
import menu from 'assets/windowsIcons/svg/Start Menu Programs.svg';
import transfer from 'assets/windowsIcons/svg/File and Settings Transfer Wizard.svg';
import defragmenter from 'assets/windowsIcons/svg/Disk Defragmenter.svg';
import catalog from 'assets/windowsIcons/svg/Windows Catalog.svg';
import networkConnection from 'assets/windowsIcons/svg/Network Connection.svg';
import info from 'assets/windowsIcons/svg/System Information.svg';
import address from 'assets/windowsIcons/svg/Address Book.svg';
import connectionWizard from 'assets/windowsIcons/svg/New Internet Connection.svg';
import networkSetup from 'assets/windowsIcons/svg/Network Setup.svg';
import hyperCmd from 'assets/windowsIcons/svg/Hyper Terminal.svg';
import painter from 'assets/windowsIcons/svg/Paint.svg';
import sound from 'assets/windowsIcons/svg/Record.svg';
import recent from 'assets/windowsIcons/svg/Scheduled Tasks.svg';
import compatibility from 'assets/windowsIcons/svg/Wizard.svg';
import magnifier from 'assets/windowsIcons/svg/Magnifier.svg';
import mediaPlayer from 'assets/windowsIcons/svg/Windows Media Player 10.svg';
import tour from 'assets/windowsIcons/svg/Tour XP.svg';
import outlook from 'assets/windowsIcons/svg/Outlook Express.svg';
import spade from 'assets/windowsIcons/svg/Internet Spades.svg';
import reversi from 'assets/windowsIcons/svg/Internet Reversi.svg';
import onlineHeart from 'assets/windowsIcons/svg/Internet Hearts.svg';
import checker from 'assets/windowsIcons/svg/Internet Checkers.svg';
import backgammon from 'assets/windowsIcons/svg/Internet Backgammon.svg';
import movieMaker from 'assets/windowsIcons/svg/Windows Movie Maker.svg';
import ie from 'assets/windowsIcons/svg/Internet Explorer 6.svg';
import messenger from 'assets/windowsIcons/svg/Windows Messenger.svg';
import spider from 'assets/windowsIcons/svg/Spider Solitaire.svg';
import freecell from 'assets/windowsIcons/svg/Freecell.svg';
import heart from 'assets/windowsIcons/svg/Hearts.svg';
import rdp from 'assets/windowsIcons/svg/Remote Desktop.svg';
import solitaire from 'assets/windowsIcons/svg/Solitaire.svg';
import narrator from 'assets/windowsIcons/svg/Narrator.svg';
import pinball from 'assets/windowsIcons/svg/Pinball.svg';
import restore from 'assets/windowsIcons/svg/System Restore.svg';
import mine from 'assets/windowsIcons/svg/Minesweeper.svg';

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
        text: 'Internet 拱猪',
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
