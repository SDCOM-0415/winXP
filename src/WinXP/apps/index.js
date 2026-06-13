import InternetExplorer from './InternetExplorer';
import Minesweeper from './Minesweeper';
import ErrorBox from './ErrorBox';
import MyComputer from './MyComputer';
import Notepad from './Notepad';
import Winamp from './Winamp';
import Paint from './Paint';
import Changelog from './Changelog';
import iePaper from 'assets/windowsIcons/svg/Internet Explorer 6.svg';
import ie from 'assets/windowsIcons/svg/Internet Explorer 6.svg';
import mine from 'assets/minesweeper/mine-icon.png';
import error from 'assets/windowsIcons/svg/Security Error.svg';
import computer from 'assets/windowsIcons/svg/My Computer.svg';
import computerLarge from 'assets/windowsIcons/svg/My Computer.svg';
import notepad from 'assets/windowsIcons/svg/Notepad.svg';
import notepadLarge from 'assets/windowsIcons/svg/Notepad.svg';
import winamp from 'assets/windowsIcons/winamp.png';
import paintLarge from 'assets/windowsIcons/svg/Paint.svg';
import paint from 'assets/windowsIcons/svg/Paint.svg';
import AboutWindows from 'components/AboutWindows';
import windowsLogo from 'assets/windowsIcons/WinXPlogo.svg';
import changelogIcon from 'assets/windowsIcons/svg/Tip of the day.svg';

// const gen = () => {
//   let id = -1;
//   return () => {
//     id += 1;
//     return id;
//   };
// };
// const genId = gen();
// const genIndex = gen();
export const defaultAppState = [];

export const defaultIconState = [
  {
    id: 0,
    icon: computerLarge,
    title: '我的电脑',
    component: MyComputer,
    isFocus: false,
  },
  {
    id: 1,
    icon: ie,
    title: 'Internet Explorer',
    component: InternetExplorer,
    isFocus: false,
  },
  {
    id: 2,
    icon: notepadLarge,
    title: '记事本',
    component: Notepad,
    isFocus: false,
  },
  {
    id: 3,
    icon: mine,
    title: '扫雷',
    component: Minesweeper,
    isFocus: false,
  },
  {
    id: 4,
    icon: paintLarge,
    title: '画图',
    component: Paint,
    isFocus: false,
  },
  {
    id: 5,
    icon: winamp,
    title: 'Winamp',
    component: Winamp,
    isFocus: false,
  },
  {
    id: 6,
    icon: changelogIcon,
    title: '更新日志',
    component: Changelog,
    isFocus: false,
  },
];

export const appSettings = {
  'Internet Explorer': {
    header: {
      icon: iePaper,
      title: 'Internet Explorer',
    },
    component: InternetExplorer,
    defaultSize: {
      width: 700,
      height: 500,
    },
    defaultOffset: {
      x: 140,
      y: 30,
    },
    resizable: true,
    minimized: false,
    maximized: window.innerWidth < 800,
    multiInstance: true,
  },
  Minesweeper: {
    header: {
      icon: mine,
      title: '扫雷',
    },
    component: Minesweeper,
    defaultSize: {
      width: 0,
      height: 0,
    },
    defaultOffset: {
      x: 190,
      y: 180,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  Error: {
    header: {
      icon: error,
      title: 'C:\\',
      buttons: ['close'],
      noFooterWindow: true,
    },
    component: ErrorBox,
    defaultSize: {
      width: 380,
      height: 0,
    },
    defaultOffset: {
      x: window.innerWidth / 2 - 190,
      y: window.innerHeight / 2 - 60,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'My Computer': {
    header: {
      icon: computer,
      title: '我的电脑',
    },
    component: MyComputer,
    defaultSize: {
      width: 660,
      height: 500,
    },
    defaultOffset: {
      x: 260,
      y: 50,
    },
    resizable: true,
    minimized: false,
    maximized: window.innerWidth < 800,
    multiInstance: false,
  },
  Notepad: {
    header: {
      icon: notepad,
      title: '无标题 - 记事本',
    },
    component: Notepad,
    defaultSize: {
      width: 660,
      height: 500,
    },
    defaultOffset: {
      x: 270,
      y: 60,
    },
    resizable: true,
    minimized: false,
    maximized: window.innerWidth < 800,
    multiInstance: true,
  },
  Winamp: {
    header: {
      icon: winamp,
      title: 'Winamp',
      invisible: true,
    },
    component: Winamp,
    defaultSize: {
      width: 0,
      height: 0,
    },
    defaultOffset: {
      x: 0,
      y: 0,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  Paint: {
    header: {
      icon: paint,
      title: '无标题 - 画图',
    },
    component: Paint,
    defaultSize: {
      width: 660,
      height: 500,
    },
    defaultOffset: {
      x: 280,
      y: 70,
    },
    resizable: true,
    minimized: false,
    maximized: window.innerWidth < 800,
    multiInstance: true,
  },
  AboutWindows: {
    header: {
      icon: windowsLogo,
      title: '关于 Windows',
      buttons: ['close'],
      noFooterWindow: true,
      noIcon: true,
    },
    component: AboutWindows,
    defaultSize: {
      width: 413,
      height: 0,
    },
    defaultOffset: {
      x: window.innerWidth / 2 - 206,
      y: window.innerHeight / 2 - 150,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  Changelog: {
    header: {
      icon: changelogIcon,
      title: '更新日志',
    },
    component: Changelog,
    defaultSize: {
      width: 700,
      height: 520,
    },
    defaultOffset: {
      x: 200,
      y: 40,
    },
    resizable: true,
    minimized: false,
    maximized: window.innerWidth < 800,
    multiInstance: false,
  },
};

export {
  InternetExplorer,
  Minesweeper,
  ErrorBox,
  MyComputer,
  Notepad,
  Winamp,
  AboutWindows,
  Changelog,
};
