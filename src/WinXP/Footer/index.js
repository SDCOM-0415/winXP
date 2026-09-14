import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

import FooterMenu from './FooterMenu';
import Balloon from 'components/Balloon';
import { useVfs } from '../vfs';
import { SET_PREFS } from '../constants/actions';
import startButton from 'assets/ui/luna/blue/start.png';
import startButtonHover from 'assets/ui/luna/blue/start_hover.png';
import startButtonPress from 'assets/ui/luna/blue/start_press.png';
import traySound from 'assets/ui/tray/sndvol.png';
import trayNetwork from 'assets/ui/tray/connections.png';
import traySecurity from 'assets/ui/tray/security.png';

const pad = n => String(n).padStart(2, '0');

/** 中文 Windows 默认 24 小时制 */
const getTime = () => {
  const date = new Date();
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/** 悬停时显示的完整日期时间 */
const getFullTime = () => {
  const d = new Date();
  const week = [
    '星期日',
    '星期一',
    '星期二',
    '星期三',
    '星期四',
    '星期五',
    '星期六',
  ][d.getDay()];
  return `${d.getFullYear()}年${
    d.getMonth() + 1
  }月${d.getDate()}日 ${week} ${getTime()}`;
};

function Footer({
  onMouseDownApp,
  apps,
  focusedAppId,
  onMouseDown,
  onClickMenuItem,
}) {
  const { prefs, dispatch } = useVfs();
  const [time, setTime] = useState(getTime);
  const [menuOn, setMenuOn] = useState(false);
  const [volumeOn, setVolumeOn] = useState(false);
  const [startPressed, setStartPressed] = useState(false);
  const menu = useRef(null);
  const volumeRef = useRef(null);
  function toggleMenu() {
    setMenuOn(on => !on);
    setVolumeOn(false);
  }
  function _onMouseDown(e) {
    if (e.target.closest('.footer__window')) return;
    onMouseDown();
  }
  function _onClickMenuItem(name) {
    onClickMenuItem(name);
    setMenuOn(false);
  }
  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = getTime();
      newTime !== time && setTime(newTime);
    }, 1000);
    return () => clearInterval(timer);
  }, [time]);
  useEffect(() => {
    const target = menu.current;
    if (!target) return;
    function onMouseDown(e) {
      if (!target.contains(e.target) && menuOn) setMenuOn(false);
    }
    window.addEventListener('mousedown', onMouseDown);
    return () => window.removeEventListener('mousedown', onMouseDown);
  }, [menuOn]);
  // 点击别处收起音量面板
  useEffect(() => {
    if (!volumeOn) return undefined;
    function onDown(e) {
      if (volumeRef.current && !volumeRef.current.contains(e.target)) {
        setVolumeOn(false);
      }
    }
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [volumeOn]);

  const startImg = startPressed
    ? startButtonPress
    : menuOn
    ? startButtonHover
    : startButton;

  return (
    <Container onMouseDown={_onMouseDown}>
      <div className="footer__items left" data-contextmenu>
        <contextmenu>
          <ul>
            <li className="submenuholder disabled">
              工具栏
              <ul>
                <li className="disabled">链接</li>
                <li className="disabled">桌面</li>
                <li className="disabled">快速启动</li>
              </ul>
            </li>
            <li className="divider" />
            <li className="disabled">层叠窗口</li>
            <li className="disabled">横向平铺窗口</li>
            <li className="disabled">纵向平铺窗口</li>
            <li data-action="show-desktop">显示桌面</li>
            <li className="divider" />
            <li className="disabled">任务管理器</li>
            <li className="divider" />
            <li className="disabled">锁定任务栏</li>
            <li className="disabled">属性</li>
          </ul>
        </contextmenu>
        <div ref={menu} className="footer__start__menu">
          <FooterMenu onClick={_onClickMenuItem} visible={menuOn} />
        </div>
        <div data-contextmenu style={{ display: 'inline-flex' }}>
          <contextmenu>
            <ul>
              <li className="disabled">打开</li>
              <li className="disabled">资源管理器</li>
              <li className="disabled">搜索...</li>
              <li className="divider" />
              <li className="disabled">属性</li>
              <li className="divider" />
              <li className="disabled">打开所有用户</li>
              <li className="disabled">资源管理器（所有用户）</li>
            </ul>
          </contextmenu>
          <img
            src={startImg}
            alt="开始"
            className="footer__start"
            onMouseDown={() => {
              setStartPressed(true);
              toggleMenu();
            }}
            onMouseUp={() => setStartPressed(false)}
            onMouseLeave={() => setStartPressed(false)}
          />
        </div>
        {[...apps].map(
          app =>
            !app.header.noFooterWindow && (
              <FooterWindowWithMenu
                key={app.id}
                id={app.id}
                icon={app.header.icon}
                title={app.header.title}
                onMouseDown={onMouseDownApp}
                isFocus={focusedAppId === app.id}
                minimized={app.minimized}
                maximized={app.maximized}
              />
            ),
        )}
      </div>

      <div className="footer__items right" data-contextmenu>
        <contextmenu>
          <ul>
            <li className="submenuholder disabled">
              工具栏
              <ul>
                <li className="disabled">链接</li>
                <li className="disabled">桌面</li>
                <li className="disabled">快速启动</li>
              </ul>
            </li>
            <li className="divider" />
            <li className="disabled">层叠窗口</li>
            <li className="disabled">横向平铺窗口</li>
            <li className="disabled">纵向平铺窗口</li>
            <li className="disabled">显示桌面</li>
            <li className="divider" />
            <li className="disabled">任务管理器</li>
            <li className="divider" />
            <li className="disabled">锁定任务栏</li>
            <li className="disabled">属性</li>
          </ul>
        </contextmenu>
        <div className="footer__tray">
          <div
            className="footer__tray-btn"
            ref={volumeRef}
            onClick={() => setVolumeOn(v => !v)}
            title="音量"
          >
            <img className="footer__icon" src={traySound} alt="音量" />
            {volumeOn && (
              <div className="footer__volume">
                <div className="footer__volume__label">
                  {prefs.muted ? '已静音' : `音量 ${prefs.volume}%`}
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={prefs.muted ? 0 : prefs.volume}
                  onChange={e =>
                    dispatch({
                      type: SET_PREFS,
                      payload: {
                        volume: Number(e.target.value),
                        muted: false,
                      },
                    })
                  }
                />
                <button
                  type="button"
                  className="footer__volume__mute"
                  onClick={() =>
                    dispatch({
                      type: SET_PREFS,
                      payload: { muted: !prefs.muted },
                    })
                  }
                >
                  {prefs.muted ? '取消静音' : '静音'}
                </button>
              </div>
            )}
          </div>
          <img
            className="footer__icon"
            src={trayNetwork}
            alt="本地连接"
            title="本地连接：已连接上"
          />
          <img
            className="footer__icon"
            src={traySecurity}
            alt="安全中心"
            title="Windows 安全中心"
          />
        </div>
        <div style={{ position: 'relative', width: 0, height: 0 }}>
          <Balloon />
        </div>
        <div className="footer__time" title={getFullTime()}>
          {time}
        </div>
      </div>
    </Container>
  );
}

function FooterWindowWithMenu({
  id,
  icon,
  title,
  onMouseDown,
  isFocus,
  minimized,
  maximized,
}) {
  function _onMouseDown() {
    onMouseDown(id);
  }
  const restored = !minimized && !maximized;
  return (
    <div data-contextmenu data-win-id={id}>
      <contextmenu>
        <ul>
          <li
            className={restored ? 'disabled' : ''}
            data-action="restore"
            data-win-id={id}
          >
            还原
          </li>
          <li className="disabled">移动</li>
          <li className="disabled">大小</li>
          <li
            className={minimized ? 'disabled' : ''}
            data-action="minimize"
            data-win-id={id}
          >
            最小化
          </li>
          <li
            className={maximized ? 'disabled' : ''}
            data-action="maximize"
            data-win-id={id}
          >
            最大化
          </li>
          <li className="divider" />
          <li data-action="close" data-win-id={id}>
            关闭
          </li>
        </ul>
      </contextmenu>
      <div
        onMouseDown={_onMouseDown}
        className={`footer__window ${isFocus ? 'focus' : 'cover'}`}
      >
        <img className="footer__icon" src={icon} alt={title} />
        <div className="footer__text">{title}</div>
      </div>
    </div>
  );
}

const Container = styled.footer`
  height: 30px;
  background: var(--taskbar-bg);
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  .footer__items.left {
    height: 100%;
    flex: 1;
    overflow: hidden;
  }
  .footer__items.right {
    flex-shrink: 0;
    background: var(--tray-bg);
    border-left: var(--tray-border-left);
    box-shadow: var(--tray-shadow);
    padding: 0 10px;
    margin-left: 10px;
  }
  .footer__items {
    display: flex;
    align-items: center;
  }
  .footer__tray {
    display: flex;
    align-items: center;
    height: 100%;
    gap: 4px;
  }
  .footer__tray-btn {
    position: relative;
    display: flex;
    align-items: center;
    height: 100%;
  }
  .footer__volume {
    position: absolute;
    right: -4px;
    bottom: 100%;
    margin-bottom: 4px;
    width: 130px;
    padding: 8px;
    background: #ece9d8;
    border: 1px solid #aca899;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.35);
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 11px;
    color: #000;
    z-index: 20;
    cursor: default;
  }
  .footer__volume__label {
    text-align: center;
    white-space: nowrap;
  }
  .footer__volume input[type='range'] {
    width: 100%;
  }
  .footer__volume__mute {
    font-family: inherit;
    font-size: 11px;
    height: 20px;
  }
  .footer__start {
    height: 100%;
    margin-right: 10px;
    position: relative;
    &:hover {
      filter: brightness(105%);
    }
    &:active {
      filter: brightness(85%);
    }
  }
  .footer__start__menu {
    position: absolute;
    left: 0;
    bottom: 100%;
  }
  .footer__window {
    width: 146px;
    flex-shrink: 0;
    color: var(--taskbar-text);
    border-radius: 2px;
    margin-top: 2px;
    padding: 0 8px;
    height: 22px;
    font-size: 11px;
    background-color: var(--taskbar-btn-bg);
    box-shadow: var(--taskbar-btn-shadow);
    position: relative;
    display: flex;
    align-items: center;
  }
  .footer__icon {
    height: 15px;
    width: 15px;
    flex-shrink: 0;
    margin-right: 4px;
    image-rendering: -webkit-optimize-contrast;
  }
  .footer__text {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .footer__window.cover:hover {
    background-color: var(--taskbar-btn-bg-hover);
    box-shadow: var(--taskbar-btn-shadow);
  }
  .footer__window.cover:before {
    display: block;
    content: '';
    position: absolute;
    left: -2px;
    top: -2px;
    width: 10px;
    height: 1px;
    border-bottom-right-radius: 50%;
    box-shadow: 2px 2px 3px rgba(255, 255, 255, 0.5);
  }
  .footer__window.cover:hover:active {
    background-color: var(--taskbar-btn-bg-active);
    box-shadow: var(--taskbar-btn-shadow-active);
  }
  .footer__window.focus:hover {
    background-color: var(--taskbar-btn-bg-focus-hover);
  }
  .footer__window.focus:hover:active {
    background-color: var(--taskbar-btn-bg-active);
  }
  .footer__window.focus {
    background-color: var(--taskbar-btn-bg-focus);
    box-shadow: var(--taskbar-btn-shadow-active);
  }
  .footer__time {
    margin: 0 5px;
    color: var(--taskbar-text);
    font-size: 11px;
    font-weight: lighter;
    text-shadow: none;
    white-space: nowrap;
  }
`;

export default Footer;
