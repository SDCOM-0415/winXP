import React from 'react';
import styled from 'styled-components';

import { WindowDropDowns } from 'components';
import dropDownData from './dropDownData';
import { useVfs } from '../../vfs';
import { SET_PREFS } from '../../constants/actions';

/**
 * 混音通道。主音量（音量控制）与托盘共用 prefs.volume / prefs.muted，
 * 其余通道存在 prefs.audioLevels 里。
 */
const CHANNELS = [
  { key: 'master', label: '音量控制' },
  { key: 'wave', label: '波形' },
  { key: 'synth', label: '软件合成器' },
  { key: 'cd', label: 'CD 唱机' },
  { key: 'line', label: '线路输入' },
];

const DEFAULT_LEVELS = { wave: 80, synth: 80, cd: 80, line: 80 };
const DEFAULT_MUTED = { wave: false, synth: false, cd: false, line: false };

export default function VolumeControl({ onClose }) {
  const { prefs, dispatch } = useVfs();

  const levels = {
    master: prefs.volume,
    ...DEFAULT_LEVELS,
    ...prefs.audioLevels,
  };
  const muted = { master: prefs.muted, ...DEFAULT_MUTED, ...prefs.audioMuted };

  function setLevel(key, value) {
    if (key === 'master') {
      dispatch({
        type: SET_PREFS,
        payload: { volume: value, muted: false },
      });
      return;
    }
    dispatch({
      type: SET_PREFS,
      payload: {
        audioLevels: { ...DEFAULT_LEVELS, ...prefs.audioLevels, [key]: value },
      },
    });
  }

  function toggleMute(key) {
    if (key === 'master') {
      dispatch({ type: SET_PREFS, payload: { muted: !prefs.muted } });
      return;
    }
    dispatch({
      type: SET_PREFS,
      payload: {
        audioMuted: {
          ...DEFAULT_MUTED,
          ...prefs.audioMuted,
          [key]: !muted[key],
        },
      },
    });
  }

  function onClickOptionItem(item) {
    switch (item) {
      case '退出':
        onClose();
        break;
      case '静音':
        toggleMute('master');
        break;
      case '关于音量控制':
        window.postMessage({ type: 'open-app', app: 'AboutWindows' }, '*');
        break;
      default:
    }
  }

  return (
    <Div>
      <WindowDropDowns
        items={dropDownData}
        onClickItem={onClickOptionItem}
        height={20}
      />
      <div className="vc__body">
        {CHANNELS.map(channel => (
          <div className="vc__channel" key={channel.key}>
            <div className="vc__caption">{channel.label}</div>
            <label className="vc__mute">
              <input
                type="checkbox"
                checked={muted[channel.key]}
                onChange={() => toggleMute(channel.key)}
              />
              静音
            </label>
            <div className="vc__sliderwrap">
              <input
                className="vc__slider"
                type="range"
                min="0"
                max="100"
                value={muted[channel.key] ? 0 : levels[channel.key]}
                onChange={e => setLevel(channel.key, Number(e.target.value))}
              />
            </div>
          </div>
        ))}
      </div>
    </Div>
  );
}

const Div = styled.div`
  height: 100%;
  background-color: #ece9d8;
  display: flex;
  flex-direction: column;
  font-size: 11px;
  color: #000;

  .vc__body {
    flex: 1;
    min-height: 0;
    display: flex;
    justify-content: space-around;
    align-items: flex-start;
    padding: 8px 6px 6px;
    background-color: #f1efe2;
    border: 1px solid;
    border-color: #fff #aca899 #aca899 #fff;
    margin: 3px;
    overflow: hidden;
  }
  .vc__channel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    height: 100%;
  }
  .vc__caption {
    white-space: nowrap;
  }
  .vc__mute {
    display: flex;
    align-items: center;
    gap: 3px;
    white-space: nowrap;
    cursor: url(../../assets/cursors/default.cur), default;
  }
  /* XP 的音量推子是纵向「分段式」滑杆：
     凹槽两侧有边栏、槽内有刻度线，滑块是带绿色 3D 高光的方形推子。
     之前用原生 range 旋转 90 度 + accent-color，完全不像 XP。 */
  .vc__sliderwrap {
    flex: 1;
    min-height: 0;
    display: flex;
    justify-content: center;
    padding: 6px 0 10px;
  }
  .vc__slider {
    appearance: none;
    -webkit-appearance: none;
    writing-mode: vertical-lr;
    direction: rtl;
    width: 30px;
    height: 100%;
    margin: 0;
    background: transparent;
    cursor: url(../../assets/cursors/default.cur), default;
  }
  /* 凹槽：左右边栏（中间留出 22px 的槽）+ 每 11px 一道的刻度线 */
  .vc__slider::-webkit-slider-runnable-track {
    width: 30px;
    height: 100%;
    border: none;
    background-image: repeating-linear-gradient(
        to right,
        transparent 0,
        transparent 3px,
        #ece9d8 4px,
        #ece9d8 26px,
        transparent 27px,
        transparent 30px
      ),
      repeating-linear-gradient(#a1a192 0, transparent 1px, transparent 11px);
  }
  /* 推子本体：白/灰底 + 内侧立体高光，左右两条绿色边是该控件的标志 */
  .vc__slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 30px;
    height: 11px;
    border-radius: 1px;
    background: linear-gradient(to bottom, #f6f4ed, #dcd8ca);
    box-shadow: inset 1px 1px 1px rgba(255, 255, 255, 0.53),
      inset -1px -1px 1px rgba(0, 0, 0, 0.27), inset 2px 0 0 #48cb46,
      inset -2px 0 0 #1fae1d;
  }
  .vc__slider:hover::-webkit-slider-thumb {
    box-shadow: inset 1px 1px 1px rgba(255, 255, 255, 0.53),
      inset -1px -1px 1px rgba(0, 0, 0, 0.27), inset 2px 0 0 #fac158,
      inset -2px 0 0 #e2a330;
  }
  .vc__slider:active::-webkit-slider-thumb {
    box-shadow: inset 1px 1px 1px rgba(255, 255, 255, 0.53),
      inset -1px -1px 1px rgba(0, 0, 0, 0.27), inset 2px 0 0 #48a73b,
      inset -2px 0 0 #1f8710;
  }
`;
