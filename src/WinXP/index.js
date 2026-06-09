import React, {
  useReducer,
  useRef,
  useCallback,
  useState,
  useEffect,
} from 'react';
import styled, { keyframes } from 'styled-components';
import useMouse from 'react-use/lib/useMouse';

import ContextMenu from 'components/ContextMenu';

import {
  ADD_APP,
  DEL_APP,
  FOCUS_APP,
  MINIMIZE_APP,
  TOGGLE_MAXIMIZE_APP,
  FOCUS_ICON,
  SELECT_ICONS,
  FOCUS_DESKTOP,
  START_SELECT,
  END_SELECT,
  POWER_OFF,
  CANCEL_POWER_OFF,
  RESET_SYSTEM,
} from './constants/actions';
import { FOCUSING, POWER_STATE } from './constants';
import { defaultIconState, defaultAppState, appSettings } from './apps';
import Modal from './Modal';
import Footer from './Footer';
import Windows from './Windows';
import Icons from './Icons';
import { DashedBox } from 'components';
import windowsLogo from 'assets/windowsIcons/WinXPlogo.svg';
import windowsOffLogo from 'assets/windowsIcons/windows-off.png';
import bootGif from 'assets/windowsIcons/boot.gif';
import userIcon from 'assets/windowsIcons/user.png';

const BOOT_MS = 3200;
const LOADING_MS = 1300;
const LOGGING_OFF_MS = 1300;
const SHUTTING_DOWN_MS = 1800;
const LOGON_WELCOME_MS = 1000;
const DEFAULT_LOGON_ACCOUNT = 'Administrator';
const LOGON_SOUND_URL =
  'https://cdn.glitch.com/01d2e04f-e49d-4304-aa9e-55b9849b4cce%2FWindows%20XP%20Logon%20Sound.wav?1522620571979';

const initState = {
  apps: defaultAppState,
  nextAppID: defaultAppState.length,
  nextZIndex: defaultAppState.length,
  focusing: FOCUSING.DESKTOP,
  icons: defaultIconState,
  selecting: false,
  powerState: POWER_STATE.BOOT,
};
const reducer = (state, action = { type: '' }) => {
  switch (action.type) {
    case ADD_APP: {
      const app = state.apps.find(
        _app => _app.component === action.payload.component,
      );
      if (action.payload.multiInstance || !app) {
        return {
          ...state,
          apps: [
            ...state.apps,
            {
              ...action.payload,
              id: state.nextAppID,
              zIndex: state.nextZIndex,
            },
          ],
          nextAppID: state.nextAppID + 1,
          nextZIndex: state.nextZIndex + 1,
          focusing: FOCUSING.WINDOW,
        };
      }
      const apps = state.apps.map(appItem =>
        appItem.component === action.payload.component
          ? { ...appItem, zIndex: state.nextZIndex, minimized: false }
          : appItem,
      );
      return {
        ...state,
        apps,
        nextZIndex: state.nextZIndex + 1,
        focusing: FOCUSING.WINDOW,
      };
    }
    case DEL_APP:
      if (state.focusing !== FOCUSING.WINDOW) return state;
      return {
        ...state,
        apps: state.apps.filter(app => app.id !== action.payload),
        focusing:
          state.apps.length > 1
            ? FOCUSING.WINDOW
            : state.icons.find(icon => icon.isFocus)
            ? FOCUSING.ICON
            : FOCUSING.DESKTOP,
      };
    case FOCUS_APP: {
      const apps = state.apps.map(app =>
        app.id === action.payload
          ? { ...app, zIndex: state.nextZIndex, minimized: false }
          : app,
      );
      return {
        ...state,
        apps,
        nextZIndex: state.nextZIndex + 1,
        focusing: FOCUSING.WINDOW,
      };
    }
    case MINIMIZE_APP: {
      if (state.focusing !== FOCUSING.WINDOW) return state;
      const apps = state.apps.map(app =>
        app.id === action.payload ? { ...app, minimized: true } : app,
      );
      return {
        ...state,
        apps,
        focusing: FOCUSING.WINDOW,
      };
    }
    case TOGGLE_MAXIMIZE_APP: {
      if (state.focusing !== FOCUSING.WINDOW) return state;
      const apps = state.apps.map(app =>
        app.id === action.payload ? { ...app, maximized: !app.maximized } : app,
      );
      return {
        ...state,
        apps,
        focusing: FOCUSING.WINDOW,
      };
    }
    case FOCUS_ICON: {
      const icons = state.icons.map(icon => ({
        ...icon,
        isFocus: icon.id === action.payload,
      }));
      return {
        ...state,
        focusing: FOCUSING.ICON,
        icons,
      };
    }
    case SELECT_ICONS: {
      const icons = state.icons.map(icon => ({
        ...icon,
        isFocus: action.payload.includes(icon.id),
      }));
      return {
        ...state,
        icons,
        focusing: FOCUSING.ICON,
      };
    }
    case FOCUS_DESKTOP:
      return {
        ...state,
        focusing: FOCUSING.DESKTOP,
        icons: state.icons.map(icon => ({
          ...icon,
          isFocus: false,
        })),
      };
    case START_SELECT:
      return {
        ...state,
        focusing: FOCUSING.DESKTOP,
        icons: state.icons.map(icon => ({
          ...icon,
          isFocus: false,
        })),
        selecting: action.payload,
      };
    case END_SELECT:
      return {
        ...state,
        selecting: null,
      };
    case POWER_OFF:
      return {
        ...state,
        powerState: action.payload,
      };
    case CANCEL_POWER_OFF:
      return {
        ...state,
        powerState: POWER_STATE.START,
      };
    case RESET_SYSTEM:
      return {
        ...initState,
        powerState: POWER_STATE.BOOT,
      };
    default:
      return state;
  }
};

function WinXP() {
  const [state, dispatch] = useReducer(reducer, initState);
  const ref = useRef(null);
  const mouse = useMouse(ref);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });
  const focusedAppId = getFocusedAppId();

  const onFocusApp = useCallback(id => {
    dispatch({ type: FOCUS_APP, payload: id });
  }, []);

  const onMaximizeWindow = useCallback(
    id => {
      if (focusedAppId === id) {
        dispatch({ type: TOGGLE_MAXIMIZE_APP, payload: id });
      }
    },
    [focusedAppId],
  );

  const onMinimizeWindow = useCallback(
    id => {
      if (focusedAppId === id) {
        dispatch({ type: MINIMIZE_APP, payload: id });
      }
    },
    [focusedAppId],
  );

  const onCloseApp = useCallback(
    id => {
      if (focusedAppId === id) {
        dispatch({ type: DEL_APP, payload: id });
      }
    },
    [focusedAppId],
  );

  function onMouseDownFooterApp(id) {
    if (focusedAppId === id) {
      dispatch({ type: MINIMIZE_APP, payload: id });
    } else {
      dispatch({ type: FOCUS_APP, payload: id });
    }
  }

  function onMouseDownIcon(id) {
    dispatch({ type: FOCUS_ICON, payload: id });
  }

  function onDoubleClickIcon(component) {
    const appSetting = Object.values(appSettings).find(
      setting => setting.component === component,
    );
    dispatch({ type: ADD_APP, payload: appSetting });
  }

  function getFocusedAppId() {
    if (state.focusing !== FOCUSING.WINDOW) return -1;
    const focusedApp = [...state.apps]
      .sort((a, b) => b.zIndex - a.zIndex)
      .find(app => !app.minimized);
    return focusedApp ? focusedApp.id : -1;
  }

  function onMouseDownFooter() {
    dispatch({ type: FOCUS_DESKTOP });
  }

  useEffect(() => {
    if (state.powerState !== POWER_STATE.BOOT) return undefined;
    const timer = window.setTimeout(() => {
      dispatch({ type: POWER_OFF, payload: POWER_STATE.LOGON });
    }, BOOT_MS);
    return () => window.clearTimeout(timer);
  }, [state.powerState]);

  useEffect(() => {
    if (state.powerState !== POWER_STATE.LOADING) return undefined;
    const timer = window.setTimeout(() => {
      dispatch({ type: POWER_OFF, payload: POWER_STATE.START });
    }, LOADING_MS);
    return () => window.clearTimeout(timer);
  }, [state.powerState]);

  useEffect(() => {
    if (state.powerState !== POWER_STATE.LOGGING_OFF) return undefined;
    const timer = window.setTimeout(() => {
      dispatch({ type: RESET_SYSTEM });
    }, LOGGING_OFF_MS);
    return () => window.clearTimeout(timer);
  }, [state.powerState]);

  useEffect(() => {
    if (state.powerState !== POWER_STATE.SHUTTING_DOWN) return undefined;
    const timer = window.setTimeout(() => {
      dispatch({ type: RESET_SYSTEM });
    }, SHUTTING_DOWN_MS);
    return () => window.clearTimeout(timer);
  }, [state.powerState]);

  useEffect(() => {
    function handleMessage(e) {
      if (e.data && e.data.type === 'ie-open-window') {
        const ieSetting = appSettings['Internet Explorer'];
        dispatch({
          type: ADD_APP,
          payload: {
            ...ieSetting,
            injectProps: {
              ...(ieSetting.injectProps || {}),
              openUrl: e.data.url,
            },
          },
        });
      } else if (e.data && e.data.type === 'open-app') {
        const appSetting = appSettings[e.data.app];
        if (appSetting) {
          dispatch({
            type: ADD_APP,
            payload: appSetting,
          });
        }
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'F8') {
        dispatch({ type: POWER_OFF, payload: POWER_STATE.BSOD });
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const desktopMenuItems = [
    {
      type: 'submenu',
      text: '排列图标',
      items: [
        { type: 'item', text: '名称' },
        { type: 'item', text: '大小' },
        { type: 'item', text: '类型' },
        { type: 'item', text: '修改时间' },
        { type: 'separator' },
        { type: 'item', text: '自动排列' },
        { type: 'item', text: '按组排列' },
        { type: 'item', text: '对齐到网格' },
      ],
    },
    { type: 'item', text: '对齐到网格' },
    { type: 'separator' },
    { type: 'item', text: '粘贴', disabled: true },
    { type: 'item', text: '粘贴快捷方式', disabled: true },
    { type: 'separator' },
    {
      type: 'submenu',
      text: '新建',
      items: [
        { type: 'item', text: '文件夹' },
        { type: 'item', text: '快捷方式' },
        { type: 'separator' },
        { type: 'item', text: '文本文档' },
      ],
    },
    { type: 'separator' },
    { type: 'item', text: '属性' },
  ];

  function onContextMenuDesktop(e) {
    if (state.powerState !== POWER_STATE.START) return;
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: FOCUS_DESKTOP });
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 300);
    setContextMenu({ visible: true, x, y });
  }

  function onCloseContextMenu() {
    setContextMenu({ visible: false, x: 0, y: 0 });
  }

  function onClickContextMenuItem(text) {
    if (text === '属性') {
      dispatch({ type: ADD_APP, payload: appSettings.Error });
    }
  }

  function onClickMenuItem(o) {
    if (o === 'Internet') {
      dispatch({ type: ADD_APP, payload: appSettings['Internet Explorer'] });
    } else if (o === '扫雷') {
      dispatch({ type: ADD_APP, payload: appSettings.Minesweeper });
    } else if (o === '我的电脑') {
      dispatch({ type: ADD_APP, payload: appSettings['My Computer'] });
    } else if (o === '记事本') {
      dispatch({ type: ADD_APP, payload: appSettings.Notepad });
    } else if (o === 'Winamp') {
      dispatch({ type: ADD_APP, payload: appSettings.Winamp });
    } else if (o === '画图') {
      dispatch({ type: ADD_APP, payload: appSettings.Paint });
    } else if (o === '注销') {
      dispatch({ type: POWER_OFF, payload: POWER_STATE.LOG_OFF });
    } else if (o === '关闭计算机') {
      dispatch({ type: POWER_OFF, payload: POWER_STATE.TURN_OFF });
    } else {
      dispatch({
        type: ADD_APP,
        payload: {
          ...appSettings.Error,
          injectProps: { message: 'C:\\n找不到应用程序' },
        },
      });
    }
  }

  function onMouseDownDesktop(e) {
    onCloseContextMenu();
    if (state.powerState !== POWER_STATE.START) return;
    if (e.target === e.currentTarget) {
      dispatch({
        type: START_SELECT,
        payload: { x: mouse.docX, y: mouse.docY },
      });
    }
  }

  function onMouseUpDesktop() {
    dispatch({ type: END_SELECT });
  }

  const onIconsSelected = useCallback(iconIds => {
    dispatch({ type: SELECT_ICONS, payload: iconIds });
  }, []);

  function onClickModalButton(text) {
    if (text === '注销') {
      dispatch({ type: POWER_OFF, payload: POWER_STATE.LOGGING_OFF });
      return;
    }
    if (text === '切换用户') {
      dispatch({ type: POWER_OFF, payload: POWER_STATE.LOGON });
      return;
    }
    if (text === '重新启动') {
      dispatch({ type: RESET_SYSTEM });
      return;
    }
    if (text === '关机') {
      dispatch({ type: POWER_OFF, payload: POWER_STATE.SHUTTING_DOWN });
      return;
    }
    dispatch({ type: CANCEL_POWER_OFF });
  }

  function onModalClose() {
    dispatch({ type: CANCEL_POWER_OFF });
  }

  function onLogon() {
    dispatch({ type: POWER_OFF, payload: POWER_STATE.LOADING });
  }

  function onRestartFromBsod() {
    dispatch({ type: RESET_SYSTEM });
  }

  return (
    <Container
      ref={ref}
      onMouseUp={onMouseUpDesktop}
      onMouseDown={onMouseDownDesktop}
      onContextMenu={onContextMenuDesktop}
      state={state.powerState}
    >
      {state.powerState === POWER_STATE.BOOT && <BootScreen />}
      {state.powerState === POWER_STATE.LOGON && (
        <LogonScreen onLogon={onLogon} />
      )}
      {state.powerState === POWER_STATE.LOADING && (
        <TransitionScreen text="欢迎使用" subText="正在加载您的个人设置..." />
      )}
      {state.powerState === POWER_STATE.START && (
        <>
          <Icons
            icons={state.icons}
            onMouseDown={onMouseDownIcon}
            onDoubleClick={onDoubleClickIcon}
            displayFocus={state.focusing === FOCUSING.ICON}
            appSettings={appSettings}
            mouse={mouse}
            selecting={state.selecting}
            setSelectedIcons={onIconsSelected}
          />
          <DashedBox startPos={state.selecting} mouse={mouse} />
          <Windows
            apps={state.apps}
            onMouseDown={onFocusApp}
            onClose={onCloseApp}
            onMinimize={onMinimizeWindow}
            onMaximize={onMaximizeWindow}
            focusedAppId={focusedAppId}
          />
          <Footer
            apps={state.apps}
            onMouseDownApp={onMouseDownFooterApp}
            focusedAppId={focusedAppId}
            onMouseDown={onMouseDownFooter}
            onClickMenuItem={onClickMenuItem}
          />
          {contextMenu.visible && (
            <ContextMenu
              items={desktopMenuItems}
              position={{ x: contextMenu.x, y: contextMenu.y }}
              onClose={onCloseContextMenu}
              onClickItem={onClickContextMenuItem}
            />
          )}
        </>
      )}
      {(state.powerState === POWER_STATE.TURN_OFF ||
        state.powerState === POWER_STATE.LOG_OFF) && (
        <Modal
          onClose={onModalClose}
          onClickButton={onClickModalButton}
          mode={state.powerState}
        />
      )}
      {state.powerState === POWER_STATE.LOGGING_OFF && (
        <TransitionScreen text="正在注销" subText="请稍候..." />
      )}
      {state.powerState === POWER_STATE.SHUTTING_DOWN && <ShutdownScreen />}
      {state.powerState === POWER_STATE.BSOD && (
        <BsodScreen onRestart={onRestartFromBsod} />
      )}
    </Container>
  );
}

function BootScreen() {
  return (
    <BootOverlay>
      <img src={bootGif} alt="Windows XP Boot" className="boot-gif" />
    </BootOverlay>
  );
}

function LogonScreen({ onLogon }) {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);

  function handleSelectAccount(name) {
    setSelectedAccount(name);
  }

  function handleLogon() {
    if (!selectedAccount) return;
    setShowWelcome(true);
  }

  useEffect(() => {
    if (!showWelcome) return undefined;
    try {
      const audio = new Audio(LOGON_SOUND_URL);
      audio.play().catch(() => {});
    } catch (e) {
      /* ignore audio errors */
    }
    const timer = window.setTimeout(() => {
      onLogon();
    }, LOGON_WELCOME_MS);
    return () => window.clearTimeout(timer);
  }, [onLogon, showWelcome]);

  return (
    <LogonOverlay>
      <div className="logon-window">
        <div className="logon-titlebar">
          <div className="titleBar_left" />
          <div className="titleBar_middle">
            <span className="windowTitle">Welcome to RebornXP</span>
          </div>
          <div className="titleBar_right" />
        </div>
        <div className="logon-body">
          {!showWelcome ? (
            <div style={{ marginLeft: 32 }}>
              <h1 style={{ fontWeight: 'normal' }}>Welcome to RebornXP!</h1>
              <h2 style={{ fontWeight: 'normal' }}>
                Choose a user account to log in
              </h2>
              <br />
              <br />
              <center
                style={{
                  width: 'calc(100% - 32px)',
                  overflowX: 'auto',
                }}
              >
                <table style={{ fontSize: 11, color: '#000' }}>
                  <tbody>
                    <tr className="accounts">
                      <td>
                        <img
                          className={`userimgopt${
                            selectedAccount === DEFAULT_LOGON_ACCOUNT
                              ? ' selected'
                              : ''
                          }`}
                          alt={DEFAULT_LOGON_ACCOUNT}
                          src={userIcon}
                          onClick={() =>
                            handleSelectAccount(DEFAULT_LOGON_ACCOUNT)
                          }
                        />
                        <div style={{ textAlign: 'center' }}>
                          {DEFAULT_LOGON_ACCOUNT}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </center>
              <div
                style={{
                  position: 'absolute',
                  right: 8,
                  bottom: 8,
                }}
              >
                <button
                  className="next"
                  disabled={!selectedAccount}
                  onClick={handleLogon}
                >
                  Log in
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginLeft: 32 }}>
              <h1 style={{ fontWeight: 'normal' }}>Welcome</h1>
            </div>
          )}
        </div>
      </div>
    </LogonOverlay>
  );
}

function TransitionScreen({ text, subText }) {
  return (
    <TransitionOverlay>
      <img src={windowsLogo} alt="Windows XP" className="transition-logo" />
      <div className="transition-text">{text}</div>
      <div className="transition-subtext">{subText}</div>
    </TransitionOverlay>
  );
}

function ShutdownScreen() {
  return (
    <ShutdownOverlay>
      <img src={windowsOffLogo} alt="Windows XP" className="shutdown-logo" />
      <div className="shutdown-text">Windows 正在关闭...</div>
    </ShutdownOverlay>
  );
}

function BsodScreen({ onRestart }) {
  return (
    <BsodOverlay onDoubleClick={onRestart}>
      <pre>{`已检测到问题，Windows 已经关闭以防止损坏您的计算机。

问题似乎由以下文件引起: UXTHEME.DLL
ILLEGAL_UXSTYLE_INPUT_VALUE

如果这是您第一次看到这个停止错误屏幕，
请重新启动您的计算机。如果此屏幕再次出现，请按照
以下步骤操作:

检查以确保任何新硬件或软件都已正确安装。
如果这是一次新安装，请向您的硬件或软件制造商咨询
所需的任何 Windows 更新。

如果问题仍然存在，请禁用或删除任何新安装的硬件
或软件。禁用 BIOS 内存选项，例如缓存或阴影。
如果您需要使用安全模式来删除或禁用组件，
请重新启动计算机，按 F8 选择高级启动选项，
然后选择“安全模式”。

技术信息:
*** STOP: 0x00000069 (0xFD3094C2,0x00000001,0xFBFE7617,0x00000000)
*** UXTHEME.DLL - Address FDF23422 base at FDF24000, DateStamp 3d6dd67c

双击此屏幕以重新启动。`}</pre>
    </BsodOverlay>
  );
}

const powerOffAnimation = keyframes`
  0% {
    filter: brightness(1) grayscale(0);
  }
  30% {
    filter: brightness(1) grayscale(0);
  }
  100% {
    filter: brightness(0.6) grayscale(1);
  }
`;

const animation = {
  [POWER_STATE.BOOT]: '',
  [POWER_STATE.LOGON]: '',
  [POWER_STATE.LOADING]: '',
  [POWER_STATE.START]: '',
  [POWER_STATE.LOG_OFF]: powerOffAnimation,
  [POWER_STATE.TURN_OFF]: powerOffAnimation,
  [POWER_STATE.LOGGING_OFF]: '',
  [POWER_STATE.SHUTTING_DOWN]: '',
  [POWER_STATE.BSOD]: '',
};

const Container = styled.div`
  @import url('https://fonts.googleapis.com/css?family=Noto+Sans');
  font-family: Tahoma, 'Noto Sans', sans-serif;
  height: 100%;
  overflow: hidden;
  position: relative;
  background: url(https://blog.sdcom.top/upload/Zk6TR5k.jpg) no-repeat center
    center fixed;
  background-size: cover;
  animation: ${({ state }) => animation[state]} 5s forwards;
  *:not(input):not(textarea) {
    user-select: none;
  }
`;

const ScreenFill = styled.div`
  position: absolute;
  inset: 0;
  z-index: 9999;
`;

const BootOverlay = styled(ScreenFill)`
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  .boot-gif {
    display: block;
    max-width: min(90vw, 720px);
    max-height: min(90vh, 540px);
    width: auto;
    height: auto;
    object-fit: contain;
  }
`;

const LogonOverlay = styled(ScreenFill)`
  background: rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  .logon-window {
    width: 594px;
    height: 300px;
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .logon-titlebar {
    display: flex;
    height: 30px;
    flex-shrink: 0;
  }
  .titleBar_left {
    width: 6px;
    height: 30px;
    background: linear-gradient(
      to bottom,
      #0058ee 0%,
      #3593ff 4%,
      #288eff 6%,
      #127dff 8%,
      #036ffc 10%,
      #0262ee 14%,
      #0057e5 20%,
      #0054e3 24%,
      #0055eb 56%,
      #005bf5 66%,
      #026afe 76%,
      #0062ef 86%,
      #0052d6 92%,
      #0040ab 94%,
      #003092 100%
    );
    border-top-left-radius: 8px;
    flex-shrink: 0;
  }
  .titleBar_middle {
    flex: 1;
    height: 30px;
    background: linear-gradient(
      to bottom,
      #0058ee 0%,
      #3593ff 4%,
      #288eff 6%,
      #127dff 8%,
      #036ffc 10%,
      #0262ee 14%,
      #0057e5 20%,
      #0054e3 24%,
      #0055eb 56%,
      #005bf5 66%,
      #026afe 76%,
      #0062ef 86%,
      #0052d6 92%,
      #0040ab 94%,
      #003092 100%
    );
    display: flex;
    align-items: center;
    padding: 0 2px;
  }
  .titleBar_right {
    width: 6px;
    height: 30px;
    background: linear-gradient(
      to bottom,
      #0058ee 0%,
      #3593ff 4%,
      #288eff 6%,
      #127dff 8%,
      #036ffc 10%,
      #0262ee 14%,
      #0057e5 20%,
      #0054e3 24%,
      #0055eb 56%,
      #005bf5 66%,
      #026afe 76%,
      #0062ef 86%,
      #0052d6 92%,
      #0040ab 94%,
      #003092 100%
    );
    border-top-right-radius: 8px;
    flex-shrink: 0;
  }
  .windowTitle {
    color: #fff;
    font-family: 'Trebuchet MS', 'Noto Sans', sans-serif;
    font-weight: bold;
    font-size: 13px;
    text-shadow: 1px 1px rgba(0, 0, 0, 0.5);
    padding-left: 4px;
    white-space: nowrap;
  }
  .logon-body {
    flex: 1;
    background-color: #ece9d8;
    border-left: 3px solid #0831d9;
    border-right: 3px solid #0831d9;
    border-bottom: 3px solid #0831d9;
    position: relative;
    overflow: hidden;
    color: #000;
  }
  .logon-body h1 {
    margin: 4px 0 0;
    font-size: 2em;
  }
  .logon-body h2 {
    margin: 0;
    font-size: 1.5em;
  }
  .userimgopt {
    border: 1px solid transparent;
    width: 48px;
    height: 48px;
    padding: 4px;
    border-radius: 5px;
    cursor: pointer;
    display: block;
    margin: 0 auto;
  }
  .userimgopt.selected {
    border: 1px solid #68b3db;
    background-color: #e1f2fb;
  }
  .next {
    min-width: 72px;
    height: 23px;
    font-size: 11px;
    cursor: pointer;
  }
  .next:disabled {
    color: #808080;
    cursor: default;
  }
`;

const TransitionOverlay = styled(ScreenFill)`
  background: linear-gradient(to bottom, #1147a8 0%, #08307f 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  .transition-logo {
    width: 220px;
    margin-bottom: 26px;
  }
  .transition-text {
    font-size: 30px;
    font-weight: bold;
    margin-bottom: 8px;
  }
  .transition-subtext {
    font-size: 14px;
    opacity: 0.92;
  }
`;

const ShutdownOverlay = styled(ScreenFill)`
  background: #000;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .shutdown-logo {
    width: 220px;
    margin-bottom: 20px;
    opacity: 0.95;
  }
  .shutdown-text {
    font-size: 28px;
    font-weight: bold;
    letter-spacing: 0.3px;
  }
`;

const BsodOverlay = styled(ScreenFill)`
  background: #0000aa;
  color: #fff;
  padding: 36px 28px;
  font-family: 'Lucida Console', Monaco, monospace;
  line-height: 1.45;
  pre {
    margin: 0;
    font-size: 20px;
    white-space: pre-wrap;
  }
`;

export default WinXP;
