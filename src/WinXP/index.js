import React, {
  useReducer,
  useRef,
  useCallback,
  useState,
  useEffect,
} from 'react';
import styled from 'styled-components';
import useMouse from 'react-use/lib/useMouse';

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
  RESET_TO_LOGON,
} from './constants/actions';
import { FOCUSING, POWER_STATE } from './constants';
import { defaultIconState, defaultAppState, appSettings } from './apps';
import Modal from './Modal';
import Footer from './Footer';
import Windows from './Windows';
import Icons from './Icons';
import { DashedBox } from 'components';
import windowsLogo from 'assets/windowsIcons/microsoft-windows-xp-seeklogo.png';
import bootGif from 'assets/windowsIcons/boot.gif';
import startupSound from 'assets/sounds/startup.wav';
import startSound from 'assets/sounds/start.wav';
import logoffSound from 'assets/sounds/logoff.wav';
import shutdownSound from 'assets/sounds/shutdown.wav';
import Logon from './Logon';
import './index.css';

const BOOT_MS = 4000;
const BOOT_FADE_MS = 500;
const LOGGING_OFF_MS = 3000;
const SHUTTING_DOWN_MS = 3000;

const soundCache = {};

function preloadSound(src) {
  if (!src || soundCache[src]) return soundCache[src];
  const audio = new Audio(src);
  audio.preload = 'auto';
  audio.load();
  soundCache[src] = audio;
  return audio;
}

[startupSound, startSound, logoffSound, shutdownSound].forEach(preloadSound);

function playSystemSound(src) {
  if (!src) return;
  try {
    const audio = preloadSound(src);
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (e) {}
}

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
    case RESET_TO_LOGON:
      return {
        ...initState,
        powerState: POWER_STATE.LOGON,
      };
    default:
      return state;
  }
};

function WinXP() {
  const [state, dispatch] = useReducer(reducer, initState);
  const ref = useRef(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const mouse = useMouse(ref);
  const [bootFading, setBootFading] = useState(false);
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
    playSystemSound(startSound);
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
    startupSoundPlayed.current = false;
    const fadeTimer = window.setTimeout(() => {
      setBootFading(true);
    }, BOOT_MS);
    const transitionTimer = window.setTimeout(() => {
      setBootFading(false);
      dispatch({ type: POWER_OFF, payload: POWER_STATE.LOGON });
    }, BOOT_MS + BOOT_FADE_MS + 500);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(transitionTimer);
    };
  }, [state.powerState]);

  const startupSoundPlayed = useRef(false);

  useEffect(() => {
    if (state.powerState !== POWER_STATE.START) return undefined;
    if (!startupSoundPlayed.current) {
      playSystemSound(startupSound);
      startupSoundPlayed.current = true;
    }
  }, [state.powerState]);

  useEffect(() => {
    if (
      state.powerState === POWER_STATE.BOOT ||
      state.powerState === POWER_STATE.LOGON
    ) {
      startupSoundPlayed.current = false;
    }
  }, [state.powerState]);

  useEffect(() => {
    if (state.powerState !== POWER_STATE.LOGGING_OFF) return undefined;
    playSystemSound(logoffSound);
    const timer = window.setTimeout(() => {
      dispatch({ type: RESET_TO_LOGON });
    }, LOGGING_OFF_MS);
    return () => window.clearTimeout(timer);
  }, [state.powerState]);

  useEffect(() => {
    if (state.powerState !== POWER_STATE.SHUTTING_DOWN) return undefined;
    playSystemSound(shutdownSound);
    const timer = window.setTimeout(() => {
      dispatch({ type: POWER_OFF, payload: POWER_STATE.SAFE_SHUTDOWN });
    }, SHUTTING_DOWN_MS);
    return () => window.clearTimeout(timer);
  }, [state.powerState]);

  useEffect(() => {
    if (state.powerState !== POWER_STATE.RESTARTING) return undefined;
    playSystemSound(shutdownSound);
    const timer = window.setTimeout(() => {
      window.location.reload();
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

  useEffect(() => {
    function handler(e) {
      document.querySelector('contextmenu.visible')?.remove();
      const ctxEl = e.target.closest('[data-contextmenu]');
      const template = ctxEl
        ? ctxEl.querySelector('contextmenu')
        : e.target.closest('[data-desktop-menu]')
        ? ref.current?.querySelector('[data-desktop-menu]')
        : null;
      if (!template) return;
      e.preventDefault();
      e.stopPropagation();
      const menu = template.cloneNode(true);
      menu.classList.add('visible');
      menu.style.left = `${e.clientX}px`;
      menu.style.top = `${e.clientY}px`;
      ref.current.appendChild(menu);
      const mw = menu.offsetWidth;
      const mh = menu.offsetHeight;
      const x = Math.min(e.clientX, window.innerWidth - mw - 2);
      const y =
        e.clientY + mh > window.innerHeight ? e.clientY - mh : e.clientY;
      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
      menu.querySelectorAll('[data-action]').forEach(li => {
        if (li.classList.contains('disabled')) return;
        li.addEventListener('click', () => {
          const action = li.dataset.action;
          const winId = li.dataset.winId ? Number(li.dataset.winId) : null;
          menu.remove();
          if (action === 'show-desktop') {
            stateRef.current.apps.forEach(app => {
              if (!app.minimized) {
                dispatch({ type: FOCUS_APP, payload: app.id });
                dispatch({ type: MINIMIZE_APP, payload: app.id });
              }
            });
          } else if (winId != null) {
            const app = stateRef.current.apps.find(a => a.id === winId);
            dispatch({ type: FOCUS_APP, payload: winId });
            if (action === 'close') dispatch({ type: DEL_APP, payload: winId });
            else if (action === 'minimize')
              dispatch({ type: MINIMIZE_APP, payload: winId });
            else if (action === 'maximize')
              dispatch({ type: TOGGLE_MAXIMIZE_APP, payload: winId });
            else if (action === 'restore' && app?.maximized)
              dispatch({ type: TOGGLE_MAXIMIZE_APP, payload: winId });
          }
        });
      });
      const dismiss = ev => {
        if (!menu.contains(ev.target)) {
          menu.remove();
          document.removeEventListener('mousedown', dismiss, true);
        }
      };
      setTimeout(
        () => document.addEventListener('mousedown', dismiss, true),
        0,
      );
    }
    document.addEventListener('contextmenu', handler, true);
    return () => document.removeEventListener('contextmenu', handler, true);
  }, []);

  function onClickMenuItem(o) {
    playSystemSound(startSound);
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
          injectProps: { message: 'C:\\\\\n找不到应用程序' },
        },
      });
    }
  }

  function onMouseDownDesktop(e) {
    document.querySelector('contextmenu.visible')?.remove();
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
      dispatch({ type: POWER_OFF, payload: POWER_STATE.RESTARTING });
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
    dispatch({ type: POWER_OFF, payload: POWER_STATE.START });
  }

  function onRestartFromBsod() {
    dispatch({ type: RESET_SYSTEM });
  }

  const isFadeToGray =
    state.powerState === POWER_STATE.LOG_OFF ||
    state.powerState === POWER_STATE.TURN_OFF;

  return (
    <Container
      ref={ref}
      onMouseUp={onMouseUpDesktop}
      onMouseDown={onMouseDownDesktop}
      onContextMenu={e => {
        if (state.powerState !== POWER_STATE.START) {
          e.preventDefault();
          return;
        }
      }}
      className={`winxp-container${isFadeToGray ? ' fadetogray' : ''}`}
      data-desktop-menu
    >
      {state.powerState === POWER_STATE.BOOT && (
        <div className={`scene_bootscreen${bootFading ? ' fading' : ''}`}>
          <img src={bootGif} alt="" />
        </div>
      )}
      <Logon
        onLogin={onLogon}
        onShutdown={() =>
          dispatch({ type: POWER_OFF, payload: POWER_STATE.SHUTTING_DOWN })
        }
        visible={state.powerState === POWER_STATE.LOGON}
      />
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
          <contextmenu data-desktop-menu>
            <ul>
              <li className="submenuholder disabled">
                排列图标
                <ul>
                  <li className="disabled">名称</li>
                  <li className="disabled">大小</li>
                  <li className="disabled">类型</li>
                  <li className="disabled">修改时间</li>
                  <li className="divider" />
                  <li className="disabled">自动排列</li>
                  <li className="disabled">按组排列</li>
                  <li className="disabled">对齐到网格</li>
                </ul>
              </li>
              <li className="divider" />
              <li onClick={() => dispatch({ type: FOCUS_DESKTOP })}>刷新</li>
              <li className="divider" />
              <li className="disabled">粘贴快捷方式</li>
              <li className="divider" />
              <li className="submenuholder">
                新建
                <ul>
                  <li className="disabled">文件夹</li>
                  <li className="disabled">快捷方式</li>
                  <li className="divider" />
                  <li className="disabled">文本文档</li>
                </ul>
              </li>
              <li className="divider" />
              <li
                onClick={() => {
                  dispatch({ type: ADD_APP, payload: appSettings.Error });
                }}
              >
                属性
              </li>
            </ul>
          </contextmenu>
        </>
      )}
      <Modal
        onClose={onModalClose}
        onClickButton={onClickModalButton}
        mode={state.powerState}
        visible={
          state.powerState === POWER_STATE.TURN_OFF ||
          state.powerState === POWER_STATE.LOG_OFF
        }
      />
      {state.powerState === POWER_STATE.LOGGING_OFF && (
        <div className="scene_logoff">
          <div className="scene_logoff__top" />
          <div className="scene_logoff__mid">
            <img src={windowsLogo} alt="" className="scene_logoff__logo" />
            <div className="scene_logoff__status">正在注销...</div>
          </div>
          <div className="scene_logoff__btm" />
        </div>
      )}
      {state.powerState === POWER_STATE.SHUTTING_DOWN && (
        <div className="scene_shutdownscreen">
          <div className="scene_shutdownscreen__top" />
          <div className="scene_shutdownscreen__mid">
            <img src={windowsLogo} alt="" className="shutdown-logo" />
            <div className="shutdown-text">正在关闭计算机...</div>
          </div>
          <div className="scene_shutdownscreen__btm" />
        </div>
      )}
      {state.powerState === POWER_STATE.RESTARTING && (
        <div className="scene_shutdownscreen">
          <div className="scene_shutdownscreen__top" />
          <div className="scene_shutdownscreen__mid">
            <img src={windowsLogo} alt="" className="shutdown-logo" />
            <div className="shutdown-text">正在重启计算机...</div>
          </div>
          <div className="scene_shutdownscreen__btm" />
        </div>
      )}
      {state.powerState === POWER_STATE.SAFE_SHUTDOWN && (
        <div className="scene_shutdownscreen safe">
          <div className="scene_shutdownscreen__mid">
            <div className="shutdown-text">你现在可以安全的关闭电源了...</div>
          </div>
        </div>
      )}
      {state.powerState === POWER_STATE.BSOD && (
        <div className="scene_bsod" onDoubleClick={onRestartFromBsod}>
          <pre>{`A problem has been detected and Windows has been shut down to prevent damage
to your computer.

The problem seems to be caused by the following file: UXTHEME.DLL
ILLEGAL_UXSTYLE_INPUT_VALUE

If this is the first time you've seen this Stop error screen,
restart your computer. If this screen appears again, follow
these steps:

Check to make sure any new hardware or software is properly installed.
If this is a new installation, ask your hardware or software manufacturer
for any Windows updates you might need.

If problems continue, disable or remove any newly installed hardware
or software. Disable BIOS memory options such as caching or shadowing.
If you need to use Safe Mode to remove or disable components, restart
your computer, press F8 to select Advanced Startup Options, and then
select Safe Mode.

Technical information:
*** STOP: 0x00000069 (0xFD3094C2,0x00000001,0xFBFE7617,0x00000000)
*** UXTHEME.DLL - Address FDF23422 base at FDF24000, DateStamp 3d6dd67c

Double-click this screen to restart.`}</pre>
        </div>
      )}
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  overflow: hidden;
  position: relative;
`;

export default WinXP;
