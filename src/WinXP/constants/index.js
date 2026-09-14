export const FOCUSING = {
  WINDOW: 'WINDOW',
  ICON: 'ICON',
  DESKTOP: 'DESKTOP',
};
export const POWER_STATE = {
  BOOT: 'BOOT',
  LOGON: 'LOGON',
  LOADING: 'LOADING',
  START: 'START',
  LOGGING_OFF: 'LOGGING_OFF',
  SHUTTING_DOWN: 'SHUTTING_DOWN',
  RESTARTING: 'RESTARTING',
  SAFE_SHUTDOWN: 'SAFE_SHUTDOWN',
  LOG_OFF: 'LOG_OFF',
  TURN_OFF: 'TURN_OFF',
  BSOD: 'BSOD',
};

/** 可选主题。Luna 为 XP 默认蓝色，经典为 Windows 2000 风格 */
export const THEMES = [
  { id: 'luna', label: 'Windows XP 样式', desc: 'Luna 蓝色' },
  { id: 'classic', label: 'Windows 经典样式', desc: 'Windows 2000' },
];

export const DEFAULT_THEME = 'luna';

/** 屏保可选项 */
export const SCREENSAVERS = [
  { id: 'none', label: '(无)' },
  { id: 'starfield', label: '三维星空' },
  { id: 'bubbles', label: '气泡' },
  { id: 'marquee', label: '字幕' },
];

export const DEFAULT_SCREENSAVER = 'starfield';

/** 屏保默认等待时间（分钟），与 XP 默认一致 */
export const DEFAULT_SCREENSAVER_WAIT = 10;

export const PREFERENCES_STORAGE_KEY = 'winxp.preferences';
export const PREFERENCES_VERSION = 1;

export function createDefaultPreferences() {
  return {
    version: PREFERENCES_VERSION,
    theme: DEFAULT_THEME,
    screensaver: DEFAULT_SCREENSAVER,
    screensaverWait: DEFAULT_SCREENSAVER_WAIT,
    volume: 70,
    muted: false,
  };
}

export function loadPreferences() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return createDefaultPreferences();
  }
  try {
    const raw = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return createDefaultPreferences();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== PREFERENCES_VERSION) {
      return createDefaultPreferences();
    }
    return { ...createDefaultPreferences(), ...parsed };
  } catch (e) {
    return createDefaultPreferences();
  }
}

export function savePreferences(prefs) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify(prefs),
    );
  } catch (e) {
    /* 配额溢出等异常静默失败 */
  }
}

