import React, { useState } from 'react';
import './index.css';
import logonLogo from 'assets/windowsIcons/microsoft-windows-xp-seeklogo.png';
import turnOffIcon from 'assets/windowsIcons/310(32x32).png';
import userIcon from 'assets/windowsIcons/user.png';
import logonSound from 'assets/sounds/startup.wav';

function Logon({ onLogin, visible }) {
  const [isLoggingOn, setIsLoggingOn] = useState(false);

  function handleLogin() {
    if (isLoggingOn) return;
    setIsLoggingOn(true);
    try {
      const audio = new Audio(logonSound);
      audio.play().catch(() => {});
    } catch (e) {}
    setTimeout(() => {
      onLogin();
    }, 4000);
  }

  return (
    <div
      className={`scene_logon${isLoggingOn ? ' isLoggingOn' : ''}`}
      style={{ display: visible ? '' : 'none' }}
    >
      <div className="logontop" />
      <div className="logonmid">
        <div className="left">
          <div className="leftcontain">
            <img src={logonLogo} alt="" />
            <br />
            <br />
            <br />
            <br />
            <span id="tip">要开始，请点击您的用户名</span>
            <span id="welcome">欢迎</span>
          </div>
        </div>
        <div className="right">
          <div className="rightcontain">
            <div
              className={`user${isLoggingOn ? ' active' : ''}`}
              onClick={handleLogin}
            >
              <div className="usericon">
                <img src={userIcon} alt="" />
                <span className="name">Administrator</span>
                <span className="apps">正在加载您的个人设置...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="logonbtm">
        <p>
          登录后，您可以添加和更改帐户。
          <br />
          请前往“控制面板”并点击“用户帐户”。
        </p>
        <div className="btncontain shutdown-link">
          <img src={turnOffIcon} alt="" className="shutdown-icon" />
          <span>关闭计算机</span>
        </div>
      </div>
    </div>
  );
}

export default Logon;
