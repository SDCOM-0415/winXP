import React, { useState } from 'react';
import styled from 'styled-components';

import { useVfs } from '../../vfs';
import {
  THEMES,
  SCREENSAVERS,
  DEFAULT_SCREENSAVER_WAIT,
} from '../../constants';
import { SET_THEME, SET_PREFS } from '../../constants/actions';
import wallpaper from 'assets/wallpapers/wallpaper.jpg';
import screenIcon from 'assets/ui/screensave.png';
import themeIcon from 'assets/fileIcons/theme.png';

const TABS = [
  { id: 'theme', label: '主题' },
  { id: 'desktop', label: '桌面' },
  { id: 'screensaver', label: '屏幕保护程序' },
];

/**
 * 显示 属性。
 * 桌面右键 → 属性 打开；用于切换 Luna/经典主题、设置屏保与等待时间。
 */
export default function DisplayProperties({ onClose }) {
  const { prefs, dispatch } = useVfs();
  const [tab, setTab] = useState('theme');
  // 对话框内的改动先落在本地草稿，点"确定/应用"才写入全局偏好
  const [draft, setDraft] = useState({
    theme: prefs.theme,
    screensaver: prefs.screensaver,
    screensaverWait: prefs.screensaverWait,
  });

  function apply() {
    dispatch({ type: SET_THEME, payload: draft.theme });
    dispatch({
      type: SET_PREFS,
      payload: {
        screensaver: draft.screensaver,
        screensaverWait: draft.screensaverWait,
      },
    });
  }

  function onOk() {
    apply();
    onClose();
  }

  function onApply() {
    apply();
  }

  function previewScreensaver() {
    // 直接写入偏好并让空闲计时立刻触发：把等待设为 0 相当于马上演示
    dispatch({
      type: SET_PREFS,
      payload: { screensaver: draft.screensaver, screensaverWait: 0.02 },
    });
    onClose();
  }

  const selectedTheme = THEMES.find(t => t.id === draft.theme) || THEMES[0];

  return (
    <Div>
      <div className="dp__tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            className={`dp__tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="dp__body">
        <div className="dp__preview">
          <div className="dp__monitor">
            <div
              className={`dp__screen theme-${draft.theme}`}
              style={{ backgroundImage: `url(${wallpaper})` }}
            >
              <div className="dp__screen__taskbar" />
            </div>
          </div>
          <div className="dp__monitor__stand" />
        </div>

        {tab === 'theme' && (
          <div className="dp__panel">
            <p className="dp__hint">
              主题是背景加一组声音、图标及其它元素的组合，可让您个性化自己的计算机。
            </p>
            <label className="dp__field">
              <span>主题 (T):</span>
              <select
                value={draft.theme}
                onChange={e =>
                  setDraft(d => ({ ...d, theme: e.target.value }))
                }
              >
                {THEMES.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.label}（{t.desc}）
                  </option>
                ))}
              </select>
            </label>
            <div className="dp__note">
              <img src={themeIcon} alt="" />
              <span>当前样式：{selectedTheme.desc}</span>
            </div>
          </div>
        )}

        {tab === 'desktop' && (
          <div className="dp__panel">
            <p className="dp__hint">
              背景图片可在"我的电脑"中查看。要替换当前壁纸，请把图片放到{' '}
              <code>src/assets/wallpapers/</code> 并覆盖 <code>wallpaper.jpg</code>。
            </p>
            <div className="dp__note">
              <img src={wallpaper} alt="" className="dp__thumb" />
              <span>wallpaper.jpg（1920 × 1080）</span>
            </div>
          </div>
        )}

        {tab === 'screensaver' && (
          <div className="dp__panel">
            <label className="dp__field">
              <span>屏幕保护程序 (S):</span>
              <select
                value={draft.screensaver}
                onChange={e =>
                  setDraft(d => ({ ...d, screensaver: e.target.value }))
                }
              >
                {SCREENSAVERS.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="dp__field">
              <span>等待 (W):</span>
              <input
                type="number"
                min="1"
                max="120"
                step="1"
                value={draft.screensaverWait}
                onChange={e =>
                  setDraft(d => ({
                    ...d,
                    screensaverWait: Math.max(1, Number(e.target.value) || 1),
                  }))
                }
              />
              <span className="dp__unit">分钟</span>
            </label>
            <div className="dp__note">
              <img src={screenIcon} alt="" />
              <span>
                鼠标移动、点击或按键即退出屏保。默认等待{' '}
                {DEFAULT_SCREENSAVER_WAIT} 分钟。
              </span>
            </div>
            <button
              type="button"
              className="dp__preview-btn"
              disabled={draft.screensaver === 'none'}
              onClick={previewScreensaver}
            >
              预览 (P)
            </button>
          </div>
        )}
      </div>

      <div className="dp__buttons">
        <button type="button" onClick={onOk}>
          确定
        </button>
        <button type="button" onClick={onClose}>
          取消
        </button>
        <button type="button" onClick={onApply}>
          应用 (A)
        </button>
      </div>
    </Div>
  );
}

const Div = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ece9d8;
  font-size: 11px;
  color: #000;

  .dp__tabs {
    display: flex;
    padding: 6px 8px 0 8px;
    gap: 2px;
    background: #ece9d8;
  }
  .dp__tab {
    font-family: inherit;
    font-size: 11px;
    padding: 3px 12px;
    border: 1px solid #aca899;
    border-bottom: none;
    border-radius: 3px 3px 0 0;
    background: #f1efe2;
    cursor: pointer;
    margin-bottom: -1px;
  }
  .dp__tab.active {
    background: #fff;
    padding-bottom: 4px;
    font-weight: 600;
  }

  .dp__body {
    flex: 1;
    margin: 0 8px;
    border: 1px solid #aca899;
    border-top-color: #fff;
    background: #fff;
    padding: 10px 12px;
    overflow: auto;
  }

  .dp__preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 12px;
  }
  .dp__monitor {
    width: 200px;
    height: 150px;
    border: 1px solid #7f7f7f;
    border-radius: 6px;
    padding: 8px;
    background: #d4d0c8;
    box-shadow: inset 0 0 0 1px #fff;
  }
  .dp__screen {
    width: 100%;
    height: 100%;
    border: 1px solid #000;
    background-size: cover;
    background-position: center;
    position: relative;
    overflow: hidden;
  }
  .dp__screen__taskbar {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 9px;
  }
  .dp__screen.theme-luna .dp__screen__taskbar {
    background: linear-gradient(to bottom, #3165c4 0, #1f2f86 100%);
  }
  .dp__screen.theme-classic .dp__screen__taskbar {
    background: #c0c0c0;
  }
  .dp__monitor__stand {
    width: 60px;
    height: 8px;
    background: #a0a0a0;
    border-radius: 0 0 4px 4px;
  }

  .dp__panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .dp__hint {
    margin: 0;
    line-height: 1.6;
    color: #333;
  }
  .dp__field {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .dp__field > span:first-child {
    width: 96px;
    text-align: right;
  }
  .dp__field select {
    flex: 1;
    font-family: inherit;
    font-size: 11px;
    height: 20px;
  }
  .dp__field input[type='number'] {
    width: 56px;
    font-family: inherit;
    font-size: 11px;
    height: 18px;
  }
  .dp__unit {
    width: auto !important;
    text-align: left !important;
  }
  .dp__note {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px;
    border: 1px solid #e0dfd6;
    background: #faf9f3;
    color: #333;
  }
  .dp__note img {
    width: 32px;
    height: 32px;
    object-fit: contain;
    flex-shrink: 0;
  }
  .dp__note .dp__thumb {
    width: 64px;
    height: 40px;
  }
  .dp__note code {
    font-family: 'Lucida Console', monospace;
    background: #eee;
    padding: 0 2px;
  }
  .dp__preview-btn {
    align-self: flex-start;
    font-family: inherit;
    font-size: 11px;
    min-width: 72px;
    height: 22px;
  }
  .dp__preview-btn:disabled {
    color: #999;
  }

  .dp__buttons {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
    padding: 8px 10px;
  }
  .dp__buttons button {
    font-family: inherit;
    font-size: 11px;
    min-width: 72px;
    height: 22px;
  }
`;
