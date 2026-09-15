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
  /* 基准的混音面板是纵向推子，这里把横向 range 旋转 90 度实现 */
  .vc__sliderwrap {
    flex: 1;
    min-height: 0;
    width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .vc__slider {
    width: 130px;
    height: 20px;
    transform: rotate(-90deg);
    accent-color: #1d6fd0;
    cursor: url(../../assets/cursors/default.cur), default;
  }
`;
