import React from 'react';
import { createPortal } from 'react-dom';
import { POWER_STATE } from 'WinXP/constants';
import standbyIcon from 'assets/windowsIcons/symbols-standby.png';
import shutdownIcon from 'assets/windowsIcons/symbols-shutdown.png';
import restartIcon from 'assets/windowsIcons/symbols-restart.png';
import logoffIcon from 'assets/windowsIcons/symbols-logoff.png';
import './index.css';

function Modal({ mode, onClose, onClickButton, visible }) {
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
      style={{ display: visible ? '' : 'none' }}
    >
      <div className="actionbox">
        <div className="act_heading">
          <span>{heading}</span>
        </div>
        <div className="act_content">
          {isTurnOff ? (
            <>
              <div className="act_button disabled">
                <div className="softbutton yellow">
                  <img src={standbyIcon} alt="待机" />
                </div>
                <span className="act_button_label">待机</span>
              </div>
              <div className="act_button" onClick={() => handleClick('关机')}>
                <div className="softbutton red">
                  <img src={shutdownIcon} alt="关闭" />
                </div>
                <span className="act_button_label">关闭</span>
              </div>
              <div
                className="act_button"
                onClick={() => handleClick('重新启动')}
              >
                <div className="softbutton green">
                  <img src={restartIcon} alt="重新启动" />
                </div>
                <span className="act_button_label">重新启动</span>
              </div>
            </>
          ) : (
            <>
              <div
                className="act_button"
                onClick={() => handleClick('切换用户')}
              >
                <div className="softbutton green">
                  <img src={restartIcon} alt="切换用户" />
                </div>
                <span className="act_button_label">切换用户</span>
              </div>
              <div className="act_button" onClick={() => handleClick('注销')}>
                <div className="softbutton yellow">
                  <img src={logoffIcon} alt="注销" />
                </div>
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
