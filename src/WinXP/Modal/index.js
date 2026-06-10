import React from 'react';
import { createPortal } from 'react-dom';
import { POWER_STATE } from 'WinXP/constants';
import './index.css';

function Modal({ mode, onClose, onClickButton }) {
  function noop(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleClick(text) {
    onClickButton(text);
  }

  const isTurnOff = mode === POWER_STATE.TURN_OFF;
  const heading = isTurnOff ? '关闭计算机' : '注销 Windows';

  return createPortal(
    <div
      className="scene_overlay"
      onMouseMove={noop}
      onClick={noop}
      onMouseDown={noop}
      onMouseUp={noop}
    >
      <div className="actionbox">
        <div className="act_heading">{heading}</div>
        <div className="act_content">
          {isTurnOff ? (
            <>
              <div className="act_button disabled">
                <div className="softbutton yellow" />
                <span className="act_button_label">待机</span>
              </div>
              <div className="act_button" onClick={() => handleClick('关机')}>
                <div className="softbutton red" />
                <span className="act_button_label">关机</span>
              </div>
              <div
                className="act_button"
                onClick={() => handleClick('重新启动')}
              >
                <div className="softbutton green" />
                <span className="act_button_label">重新启动</span>
              </div>
            </>
          ) : (
            <>
              <div
                className="act_button"
                onClick={() => handleClick('切换用户')}
              >
                <div className="softbutton green" />
                <span className="act_button_label">切换用户</span>
              </div>
              <div className="act_button" onClick={() => handleClick('注销')}>
                <div className="softbutton yellow" />
                <span className="act_button_label">注销</span>
              </div>
            </>
          )}
        </div>
        <div className="footing">
          <button className="winbutton" onClick={onClose}>
            取消
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
