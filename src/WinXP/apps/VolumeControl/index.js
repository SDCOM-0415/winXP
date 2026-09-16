import React from 'react';
import styled from 'styled-components';

import { WindowDropDowns } from 'components';
import dropDownData from './dropDownData';
import { useVfs } from '../../vfs';
import { SET_PREFS } from '../../constants/actions';

/**
 * 音量控制。结构对照参考站的实现：只有一列「系统」主音量，
 * 纵向细轨道 + 小圆角推子，下面是「静音」复选框，
 * 底部一条分隔线加设备名（参考站显示的是声卡型号）。
 */
export default function VolumeControl({ onClose }) {
  const { prefs, dispatch } = useVfs();
  const level = prefs.muted ? 0 : prefs.volume;

  function setLevel(value) {
    dispatch({
      type: SET_PREFS,
      payload: { volume: value, muted: false },
    });
  }

  function toggleMute() {
    dispatch({ type: SET_PREFS, payload: { muted: !prefs.muted } });
  }

  function onClickOptionItem(item) {
    switch (item) {
      case '退出':
        onClose();
        break;
      case '静音':
        toggleMute();
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
        <form className="vc__form" onSubmit={e => e.preventDefault()}>
          <span className="vc__name">系统</span>
          <span className="vc__label">音量:</span>
          <div className="vc__slot">
            <input
              className="vc__slider"
              type="range"
              min="0"
              max="100"
              value={level}
              onChange={e => setLevel(Number(e.target.value))}
            />
          </div>
          <span className="vc__mute">
            <label>
              <input
                type="checkbox"
                checked={prefs.muted}
                onChange={toggleMute}
              />
              <span className="vc__checkbox" />
              静音
            </label>
          </span>
        </form>
      </div>
      <div className="vc__device">Creative SoundBlaster PCI</div>
    </Div>
  );
}

const cursorLink = `url(../../assets/cursors/link.cur), pointer`;
const cursorDefault = `url(../../assets/cursors/default.cur), default`;

const Div = styled.div`
  height: 100%;
  background-color: #ece9d8;
  display: flex;
  flex-direction: column;
  /* 字号与行高取自参考站实测值（13px，不是我先前估的 11px） */
  font-size: 13px;
  color: #000;
  overflow: hidden;

  .vc__body {
    flex: 1;
    min-height: 0;
    padding: 0 6px;
  }
  .vc__form {
    display: grid;
    grid-template-columns: auto;
    /* 实测：名称行 30 / 音量标签行 24 / 推子 135 / 静音行 20 */
    grid-template-rows: 30px 24px 135px 20px;
    width: 105px;
    margin: 0;
  }
  /* 通道名居中，下面一条分隔线（线下方还有一道白色高光） */
  .vc__name {
    grid-row: 1;
    display: block;
    text-align: center;
    line-height: 13px;
    padding: 6px 0;
    margin: 0 6px;
    border-bottom: 1px solid #aca899;
    box-shadow: 0 1px #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .vc__label {
    grid-row: 2;
    padding-top: 3px;
  }
  /* 推子所在的行：让推子在本行内居中 */
  .vc__slot {
    grid-row: 3;
    min-height: 0;
    display: flex;
    justify-content: center;
    padding: 2px 0;
  }

  /* ---- 纵向推子 ----
     参考站的做法：输入框本身 scaleY(-1)（让 100% 在顶端）、
     外观全部去掉，轨道只剩一根细竖线，推子是小圆角方块、
     上下缘各一条绿色高光（这是该控件的标志） */
  .vc__slider {
    -webkit-appearance: none;
    appearance: none;
    /* 实测参考站推子为 24 × 135 */
    width: 24px;
    height: 135px;
    /* 轨道用输入框自身的背景画一条居中的 2px 竖线。
       注意：Chrome 不支持在 ::-webkit-slider-runnable-track 上再用 ::before，
       所以不能像参考站 CSS 那样把凹槽画在轨道的伪元素里 */
    background-image: linear-gradient(
      to right,
      transparent 0,
      transparent 10px,
      #c8c8c0 10px,
      #c8c8c0 12px,
      #fff 12px,
      #fff 13px,
      transparent 13px,
      transparent 24px
    );
    writing-mode: vertical-lr;
    transform: scaleY(-1);
    cursor: ${cursorLink};
    margin: 0 auto;
  }
  .vc__slider::-webkit-slider-runnable-track {
    width: 24px;
    height: 100%;
    background: transparent;
    border: none;
    cursor: ${cursorLink};
  }
  .vc__slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    box-sizing: border-box;
    width: 24px;
    height: 11px;
    margin-top: -6px;
    border: 1px solid;
    border-color: #b0b0b0 #808080 #808080 #b0b0b0;
    border-radius: 5px;
    background: linear-gradient(to right, #f4f3ee 0, #fff 50%, #eceae2 100%);
    /* 上下缘各一条绿边，是该控件的标志 */
    box-shadow: inset 0 2px 0 #48cb46, inset 0 -2px 0 #1fae1d;
    cursor: ${cursorLink};
  }

  /* ---- 静音：原生复选框隐藏，外观纯 CSS 画 ---- */
  .vc__mute {
    grid-row: 4;
    position: relative;
    display: block;
    padding: 6px 0 6px 18px;
    cursor: ${cursorDefault};
  }
  .vc__mute label {
    cursor: ${cursorDefault};
  }
  .vc__mute input[type='checkbox'] {
    visibility: hidden;
    width: 0;
    height: 0;
    margin: 0;
    position: absolute;
  }
  .vc__checkbox {
    box-sizing: border-box;
    position: absolute;
    top: 8px;
    left: 0;
    width: 11px;
    height: 11px;
    display: inline-block;
    outline: 1px solid #1c5180;
    border: 2px solid transparent;
    background: linear-gradient(135deg, #dcdcd7, #fff);
    border-image: linear-gradient(135deg, #dcdcd7, #ffffff);
    border-image-slice: 1;
    &:after,
    &:before {
      display: none;
      content: '';
      position: absolute;
      background-color: #21a121;
    }
    &:after {
      transform: rotate(-45deg);
      width: 2px;
      height: 4px;
      top: 2px;
      left: 1px;
    }
    &:before {
      transform: rotate(45deg);
      width: 2px;
      height: 6px;
      top: 0;
      right: 1px;
    }
  }
  .vc__mute:hover .vc__checkbox {
    border-image: linear-gradient(135deg, #fff0cf, #f8b330);
    border-image-slice: 1;
  }
  .vc__mute:active .vc__checkbox {
    border-image: linear-gradient(135deg, #b0b0a7, #f1efdf);
    border-image-slice: 1;
    background: linear-gradient(135deg, #b0b0a7, #f1efdf);
  }
  .vc__mute input:checked ~ .vc__checkbox:after,
  .vc__mute input:checked ~ .vc__checkbox:before {
    display: block;
  }

  /* 底部分隔线 + 设备名 */
  .vc__device {
    flex-shrink: 0;
    padding: 4px 10px 5px;
    border-top: 1px solid #aca899;
    box-shadow: inset 0 1px #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
