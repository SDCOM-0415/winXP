import React, {
  useReducer,
  useRef,
  useCallback,
  useState,
  useEffect,
  useMemo,
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
  VFS_CREATE_FOLDER,
  VFS_CREATE_FILE,
  VFS_WRITE_FILE,
  VFS_DELETE,
  VFS_RENAME,
  VFS_RESET,
  SYNC_DESKTOP_ICONS,
  SET_THEME,
  SET_PREFS,
  SCREENSAVER_START,
  SCREENSAVER_STOP,
} from './constants/actions';
import {
  FOCUSING,
  POWER_STATE,
  loadPreferences,
  savePreferences,
} from './constants';
import {
  VfsProvider,
  loadVfs,
  saveVfs,
  createInitialVfs,
  getNode,
  createFolder,
  createFile,
  writeFile,
  deleteEntry,
  renameEntry,
  uniqueName,
  nameExists,
  isEditableText,
  listChildren,
  resolveIcon,
  iconForFileName,
} from './vfs';
import Screensaver from './Screensaver';
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

/** 桌面在虚拟磁盘中的位置：C:\Documents and Settings\Default User\Desktop */
const DESKTOP_PATH = {
  driveId: 'C:',
  segments: ['Documents and Settings', 'Default User', 'Desktop'],
};

/** 桌面目录里的快捷方式已由 state.icons 里的应用图标代表，不重复显示 */
function isShortcut(name) {
  return /\.lnk$/i.test(name);
}

/** 对指定磁盘的树做不可变更新，返回新的 vfs 对象 */
function vfsWithDrive(state, driveId, updater) {
  const root = state.vfs && state.vfs.drives ? state.vfs.drives[driveId] : null;
  if (!root) return state.vfs;
  return {
    ...state.vfs,
    drives: {
      ...state.vfs.drives,
      [driveId]: updater(root),
    },
  };
}

const initState = {
  apps: defaultAppState,
  nextAppID: defaultAppState.length,
  nextZIndex: defaultAppState.length,
  focusing: FOCUSING.DESKTOP,
  icons: defaultIconState,
  selecting: false,
  powerState: POWER_STATE.BOOT,
  vfs: loadVfs(),
  prefs: loadPreferences(),
  screensaverActive: false,
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
    // ---- 虚拟文件系统：所有写操作都产生新树，由 useEffect 落到 localStorage ----
    case VFS_CREATE_FOLDER: {
      const { driveId, segments, name } = action.payload;
      return {
        ...state,
        vfs: vfsWithDrive(state, driveId, root => {
          const dir = getNode(root, segments);
          const finalName = uniqueName(dir, name || '新建文件夹');
          return createFolder(root, segments, finalName);
        }),
      };
    }
    case VFS_CREATE_FILE: {
      const { driveId, segments, name, content } = action.payload;
      return {
        ...state,
        vfs: vfsWithDrive(state, driveId, root => {
          const dir = getNode(root, segments);
          const finalName = uniqueName(dir, name || '新建文本文档', '.txt');
          return createFile(root, segments, finalName, { content });
        }),
      };
    }
    case VFS_WRITE_FILE: {
      const { driveId, segments, name, content } = action.payload;
      return {
        ...state,
        vfs: vfsWithDrive(state, driveId, root =>
          writeFile(root, segments, name, content),
        ),
      };
    }
    case VFS_DELETE: {
      const { driveId, segments, name } = action.payload;
      return {
        ...state,
        vfs: vfsWithDrive(state, driveId, root =>
          deleteEntry(root, segments, name),
        ),
      };
    }
    case VFS_RENAME: {
      const { driveId, segments, name, newName } = action.payload;
      return {
        ...state,
        vfs: vfsWithDrive(state, driveId, root =>
          renameEntry(root, segments, name, newName),
        ),
      };
    }
    case VFS_RESET:
      return { ...state, vfs: createInitialVfs() };
    // 桌面图标 = 内置应用图标 + 桌面目录里的真实条目
    case SYNC_DESKTOP_ICONS: {
      const focusedIds = new Set(
        state.icons.filter(icon => icon.isFocus).map(icon => icon.id),
      );
      const appIcons = defaultIconState.map(icon => ({
        ...icon,
        isFocus: focusedIds.has(icon.id),
      }));
      const fileIcons = action.payload.map(({ name, node }) => ({
        id: `vfs:${name}`,
        icon: resolveIcon(node.icon || iconForFileName(name), node.type),
        title: name,
        vfsPath: { ...DESKTOP_PATH, name },
        isFocus: focusedIds.has(`vfs:${name}`),
      }));
      return { ...state, icons: [...appIcons, ...fileIcons] };
    }
    // ---- 主题与偏好 ----
    case SET_THEME:
      return { ...state, prefs: { ...state.prefs, theme: action.payload } };
    case SET_PREFS:
      return { ...state, prefs: { ...state.prefs, ...action.payload } };
    // ---- 屏保 ----
    case SCREENSAVER_START:
      if (state.powerState !== POWER_STATE.START) return state;
      if (!state.prefs.screensaver || state.prefs.screensaver === 'none') {
        return state;
      }
      return state.screensaverActive
        ? state
        : { ...state, screensaverActive: true };
    case SCREENSAVER_STOP:
      return state.screensaverActive
        ? { ...state, screensaverActive: false }
        : state;
    default:
      return state;
  }
};

function WinXP() {
  const [state, dispatch] = useReducer(reducer, initState);
  const ref = useRef(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const onDoubleClickIconRef = useRef(null);
  const iconsRef = useRef(null);
  const flashIconsRef = useRef(null);
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

  function onDoubleClickIcon(icon) {
    if (!icon) return;
    playSystemSound(startSound);

    // 桌面目录里的真实条目：文件夹用"我的电脑"打开，文本文件用记事本打开
    if (icon.vfsPath) {
      const { driveId, segments, name } = icon.vfsPath;
      const node = getNode(stateRef.current.vfs.drives[driveId], [
        ...segments,
        name,
      ]);
      if (!node) return;
      if (node.type === 'directory') {
        dispatch({
          type: ADD_APP,
          payload: {
            ...appSettings['My Computer'],
            injectProps: {
              startPath: { driveId, segments: [...segments, name] },
            },
          },
        });
      } else if (isEditableText(node)) {
        dispatch({
          type: ADD_APP,
          payload: {
            ...appSettings.Notepad,
            injectProps: { filePath: { driveId, segments, name } },
          },
        });
      }
      return;
    }

    const appSetting = Object.values(appSettings).find(
      setting => setting.component === icon.component,
    );
    if (!appSetting) return;
    dispatch({ type: ADD_APP, payload: appSetting });
  }
  onDoubleClickIconRef.current = onDoubleClickIcon;

  // 排列/刷新后让图标闪一下。右键菜单是克隆出来的节点，只能通过 ref 复用这段动画
  flashIconsRef.current = () => {
    ref.current?.querySelectorAll('[data-contextmenu] img').forEach(img => {
      img.style.animation = 'none';
      void img.offsetHeight;
      img.style.animation = 'iconRefresh 0.5s ease';
      setTimeout(() => (img.style.animation = ''), 500);
    });
  };

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
            payload: e.data.props
              ? {
                  ...appSetting,
                  injectProps: {
                    ...(appSetting.injectProps || {}),
                    ...e.data.props,
                  },
                }
              : appSetting,
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

  // VFS 每次变更后落盘（新建/写入/删除/重命名都会走到这里）
  useEffect(() => {
    saveVfs(state.vfs);
  }, [state.vfs]);

  // 桌面目录的内容签名：只有它变了才需要重建图标，避免无谓重渲染
  const desktopSignature = useMemo(() => {
    const node = getNode(state.vfs.drives['C:'], DESKTOP_PATH.segments);
    return listChildren(node)
      .filter(({ name }) => !isShortcut(name))
      .map(
        ({ name, node: child }) =>
          `${name}|${child.type}|${child.icon || ''}|${child.modified || ''}`,
      )
      .join('\n');
  }, [state.vfs]);

  // 把桌面目录里的条目同步成桌面图标，"新建文件夹/文本文档"后立刻能看到
  useEffect(() => {
    const node = getNode(
      stateRef.current.vfs.drives['C:'],
      DESKTOP_PATH.segments,
    );
    const entries = listChildren(node).filter(({ name }) => !isShortcut(name));
    dispatch({ type: SYNC_DESKTOP_ICONS, payload: entries });
  }, [desktopSignature]);

  // 主题、屏保、音量等偏好落盘
  useEffect(() => {
    savePreferences(state.prefs);
  }, [state.prefs]);

  // 屏保：按配置的空闲时间触发；鼠标/键盘/滚轮/触摸都算"有活动"
  useEffect(() => {
    if (state.powerState !== POWER_STATE.START) return undefined;
    if (!state.prefs.screensaver || state.prefs.screensaver === 'none') {
      return undefined;
    }
    if (state.screensaverActive) return undefined;
    const waitMs =
      Math.max(1, Number(state.prefs.screensaverWait) || 1) * 60 * 1000;
    let timer = window.setTimeout(() => {
      dispatch({ type: SCREENSAVER_START });
    }, waitMs);
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        dispatch({ type: SCREENSAVER_START });
      }, waitMs);
    };
    const events = ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart'];
    events.forEach(ev => window.addEventListener(ev, reset, true));
    return () => {
      window.clearTimeout(timer);
      events.forEach(ev => window.removeEventListener(ev, reset, true));
    };
  }, [
    state.powerState,
    state.prefs.screensaver,
    state.prefs.screensaverWait,
    state.screensaverActive,
  ]);

  // 提供给所有应用的系统上下文：VFS 读写入口 + 主题/屏保偏好 + dispatch
  const vfsValue = useMemo(
    () => ({
      vfs: state.vfs,
      prefs: state.prefs,
      driveRoot: id => (state.vfs.drives || {})[id] || null,
      dispatch,
    }),
    [state.vfs, state.prefs],
  );

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
      menu
        .querySelectorAll('[data-action], [data-vfs], [data-app]')
        .forEach(li => {
          if (li.classList.contains('disabled')) return;
          li.addEventListener('click', () => {
            const action = li.dataset.action;
            const vfsOp = li.dataset.vfs;
            const appName = li.dataset.app;
            const winId = li.dataset.winId ? Number(li.dataset.winId) : null;
            menu.remove();

            // 打开应用（右键菜单里的"打开"等）
            if (appName) {
              const setting = appSettings[appName];
              if (setting) dispatch({ type: ADD_APP, payload: setting });
              return;
            }

            // 虚拟文件系统操作：菜单项自带 drive / path / name
            if (vfsOp) {
              const driveId = li.dataset.drive;
              const segments = li.dataset.path
                ? JSON.parse(li.dataset.path)
                : [];
              const name = li.dataset.name;
              const root = stateRef.current.vfs.drives[driveId];
              const dir = getNode(root, segments);
              if (!dir) return;

              if (vfsOp === 'new-folder') {
                dispatch({
                  type: VFS_CREATE_FOLDER,
                  payload: { driveId, segments },
                });
              } else if (vfsOp === 'new-file') {
                dispatch({
                  type: VFS_CREATE_FILE,
                  payload: { driveId, segments, content: '' },
                });
              } else if (vfsOp === 'delete') {
                dispatch({
                  type: VFS_DELETE,
                  payload: { driveId, segments, name },
                });
              } else if (vfsOp === 'rename') {
                const newName = window.prompt('重命名为', name);
                if (!newName || newName === name) return;
                if (nameExists(dir, newName)) {
                  window.alert('已存在同名的文件或文件夹，请换一个名称。');
                  return;
                }
                dispatch({
                  type: VFS_RENAME,
                  payload: { driveId, segments, name, newName },
                });
              } else if (vfsOp === 'open') {
                const node = dir.contents ? dir.contents[name] : null;
                if (!node) return;
                if (node.type === 'directory') {
                  window.postMessage(
                    {
                      type: 'browse-to',
                      driveId,
                      segments: [...segments, name],
                    },
                    '*',
                  );
                } else if (isEditableText(node)) {
                  dispatch({
                    type: ADD_APP,
                    payload: {
                      ...appSettings.Notepad,
                      injectProps: { filePath: { driveId, segments, name } },
                    },
                  });
                }
              }
              return;
            }

            if (action === 'show-desktop') {
              stateRef.current.apps.forEach(app => {
                if (!app.minimized) {
                  dispatch({ type: FOCUS_APP, payload: app.id });
                  dispatch({ type: MINIMIZE_APP, payload: app.id });
                }
              });
            } else if (action === 'open') {
              // 图标 id 可能是数字（内置应用）或字符串（桌面上的 vfs:xxx），统一按字符串比对
              const iconId = li.dataset.iconId;
              const icon = stateRef.current.icons.find(
                ic => String(ic.id) === String(iconId),
              );
              if (icon) onDoubleClickIconRef.current(icon);
            } else if (action === 'refresh') {
              dispatch({ type: FOCUS_DESKTOP });
              iconsRef.current?.resetPositions();
              flashIconsRef.current();
            } else if (action === 'arrange-name' || action === 'auto-arrange') {
              dispatch({ type: FOCUS_DESKTOP });
              if (action === 'arrange-name') iconsRef.current?.arrangeByName();
              else iconsRef.current?.autoArrange();
              flashIconsRef.current();
            } else if (winId != null) {
              const app = stateRef.current.apps.find(a => a.id === winId);
              dispatch({ type: FOCUS_APP, payload: winId });
              if (action === 'close')
                dispatch({ type: DEL_APP, payload: winId });
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
    } else if (o === '命令提示符') {
      dispatch({ type: ADD_APP, payload: appSettings.CommandPrompt });
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
    <VfsProvider value={vfsValue}>
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
        className={`winxp-container theme-${state.prefs.theme}${
          isFadeToGray ? ' fadetogray' : ''
        }`}
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
              ref={iconsRef}
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
                <li className="submenuholder">
                  排列图标
                  <ul>
                    <li data-action="arrange-name">名称</li>
                    <li className="disabled">大小</li>
                    <li className="disabled">类型</li>
                    <li className="disabled">修改时间</li>
                    <li className="divider" />
                    <li data-action="auto-arrange">自动排列</li>
                    <li className="disabled">按组排列</li>
                    <li data-action="auto-arrange">对齐到网格</li>
                  </ul>
                </li>
                <li className="divider" />
                <li data-action="refresh">刷新</li>
                <li className="divider" />
                <li className="disabled">粘贴快捷方式</li>
                <li className="divider" />
                <li className="submenuholder">
                  新建
                  <ul>
                    <li
                      data-vfs="new-folder"
                      data-drive={DESKTOP_PATH.driveId}
                      data-path={JSON.stringify(DESKTOP_PATH.segments)}
                    >
                      文件夹
                    </li>
                    <li className="disabled">快捷方式</li>
                    <li className="divider" />
                    <li
                      data-vfs="new-file"
                      data-drive={DESKTOP_PATH.driveId}
                      data-path={JSON.stringify(DESKTOP_PATH.segments)}
                    >
                      文本文档
                    </li>
                  </ul>
                </li>
                <li className="divider" />
                <li
                  onClick={() => {
                    dispatch({
                      type: ADD_APP,
                      payload: appSettings.DisplayProperties,
                    });
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
        {state.screensaverActive && (
          <Screensaver
            type={state.prefs.screensaver}
            onDismiss={() => dispatch({ type: SCREENSAVER_STOP })}
          />
        )}
      </Container>
    </VfsProvider>
  );
}

const Container = styled.div`
  height: 100%;
  overflow: hidden;
  position: relative;
`;

export default WinXP;
