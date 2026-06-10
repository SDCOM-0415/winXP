import React, { useState } from 'react';
import './index.css';
import logonLogo from 'assets/windowsIcons/microsoft-windows-xp-seeklogo.png';
import turnOffIcon from 'assets/windowsIcons/310(32x32).png';
import userIcon from 'assets/windowsIcons/user.png';

const LOGON_SOUND_URL =
  'https://cdn.glitch.com/01d2e04f-e49d-4304-aa9e-55b9849b4cce%2FWindows%20XP%20Logon%20Sound.wav?1522620571979';

function Logon({ onLogin }) {
  const [isLoggingOn, setIsLoggingOn] = useState(false);

  function handleLogin() {
    if (isLoggingOn) return;
    setIsLoggingOn(true);
    try {
      const audio = new Audio(LOGON_SOUND_URL);
      audio.play().catch(() => {});
    } catch (e) {}
    setTimeout(() => {
      onLogin();
    }, 4000);
  }

  return (
    <div className={`scene_logon${isLoggingOn ? ' isLoggingOn' : ''}`}>
      <div className="logontop" />
      <div className="logonmid">
        <div className="left">
          <div className="leftcontain">
            <img src={logonLogo} alt="" />
            <br />
            <br />
            <br />
            <br />
            <span id="tip">To begin, click your user name</span>
            <span id="welcome">welcome</span>
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
                {isLoggingOn && (
                  <span className="apps">
                    Loading your personal settings...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="logonbtm">
        <p>
          After you log on, you can add and change accounts.
          <br />
          Just go to Control Panel and click User Accounts.
        </p>
        <div className="btncontain shutdown-link">
          <img src={turnOffIcon} alt="" className="shutdown-icon" />
          <span>Turn off computer</span>
        </div>
      </div>
    </div>
  );
}

export default Logon;
