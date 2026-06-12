import React, { useState } from 'react';
import styled from 'styled-components';

import SubMenu from 'components/SubMenu';
import ie from 'assets/windowsIcons/svg/Internet Explorer 6.svg';
import mine from 'assets/windowsIcons/svg/Minesweeper.svg';
import setAccess from 'assets/windowsIcons/svg/Accessibility.svg';
import outlook from 'assets/windowsIcons/svg/Outlook Express.svg';
import mediaPlayer from 'assets/windowsIcons/svg/Windows Media Player 10.svg';
import messenger from 'assets/windowsIcons/svg/MSN Messenger.svg';
import documents from 'assets/windowsIcons/svg/My Documents.svg';
import recentDocuments from 'assets/windowsIcons/svg/Recent Documents.svg';
import pictures from 'assets/windowsIcons/svg/My Pictures.svg';
import music from 'assets/windowsIcons/svg/My Music.svg';
import computer from 'assets/windowsIcons/svg/My Computer.svg';
import controlPanel from 'assets/windowsIcons/svg/Control Panel.svg';
import connect from 'assets/windowsIcons/svg/Network Connection.svg';
import printer from 'assets/windowsIcons/svg/Printer.svg';
import paint from 'assets/windowsIcons/svg/Paint.svg';
import help from 'assets/windowsIcons/svg/Help and Support.svg';
import search from 'assets/windowsIcons/svg/Search.svg';
import run from 'assets/windowsIcons/svg/Run.svg';
import symbolLogoff from 'assets/windowsIcons/symbols-logoff.png';
import symbolShutdown from 'assets/windowsIcons/symbols-shutdown.png';
import userAvatar from 'assets/windowsIcons/chess.bmp';
import allProgramsIcon from 'assets/windowsIcons/startarrow.png';
import winamp from 'assets/windowsIcons/winamp.png';
import notepad from 'assets/windowsIcons/svg/Notepad.svg';

import { AllPrograms, ConnectTo, MyRecentDocuments } from './FooterMenuData';

function FooterMenu({ className, onClick }) {
  const [hovering, setHovering] = useState('');
  function onMouseOver(e) {
    const item = e.target.closest('.menu__item');
    if (!item) return;
    const textEl = item.querySelector('.menu__item__text');
    if (textEl) setHovering(textEl.textContent);
  }
  return (
    <div className={className}>
      <div className="sm-userbar">
        <img className="sm-userbar__img" src={userAvatar} alt="" />
        <span className="sm-userbar__name">Administrator</span>
      </div>
      <div className="sm-links" onMouseOver={onMouseOver}>
        <div className="sm-applinks">
          <ul className="sm-pinnedapps">
            <li className="menu__item" onClick={() => onClick('Internet')}>
              <img src={ie} alt="" />
              <div className="sm-pinned-text">
                <span className="sm-pinned-title">Internet</span>
                <span className="sm-pinned-name">Internet Explorer</span>
              </div>
            </li>
            <li className="menu__item" onClick={() => onClick('E-mail')}>
              <img src={outlook} alt="" />
              <div className="sm-pinned-text">
                <span className="sm-pinned-title">电子邮件</span>
                <span className="sm-pinned-name">Outlook Express</span>
              </div>
            </li>
          </ul>
          <ul className="sm-userapps">
            <li className="menu__item" onClick={() => onClick('扫雷')}>
              <img src={mine} alt="" />
              <span className="menu__item__text">扫雷</span>
            </li>
            <li className="menu__item" onClick={() => onClick('记事本')}>
              <img src={notepad} alt="" />
              <span className="menu__item__text">记事本</span>
            </li>
            <li className="menu__item" onClick={() => onClick('Winamp')}>
              <img src={winamp} alt="" />
              <span className="menu__item__text">Winamp</span>
            </li>
            <li className="menu__item" onClick={() => onClick('画图')}>
              <img src={paint} alt="" />
              <span className="menu__item__text">画图</span>
            </li>
            <li
              className="menu__item"
              onClick={() => onClick('Windows Media Player')}
            >
              <img src={mediaPlayer} alt="" />
              <span className="menu__item__text">Windows Media Player</span>
            </li>
            <li
              className="menu__item"
              onClick={() => onClick('Windows Messenger')}
            >
              <img src={messenger} alt="" />
              <span className="menu__item__text">Windows Messenger</span>
            </li>
          </ul>
          <ul className="sm-allapps">
            <li
              className={`menu__item sm-allapps-item ${
                hovering === '所有程序' ? 'expanded' : ''
              }`}
              onMouseEnter={() => setHovering('所有程序')}
            >
              <span className="menu__item__text">所有程序</span>
              <span className="sm-allapps-arrow" />
              {hovering === '所有程序' && (
                <SubMenu
                  style={{ bottom: '36px', left: '145px' }}
                  data={AllPrograms}
                  onClick={onClick}
                />
              )}
            </li>
          </ul>
        </div>
        <div className="sm-syslinks">
          <ul className="sm-syslocations">
            <li className="menu__item" onClick={() => onClick('我的文档')}>
              <img src={documents} alt="" />
              <span className="menu__item__text">我的文档</span>
            </li>
            <li
              className={`menu__item sm-submenu-holder ${
                hovering === '我最近的文档' ? 'expanded' : ''
              }`}
              onMouseEnter={() => setHovering('我最近的文档')}
            >
              <img src={recentDocuments} alt="" />
              <span className="menu__item__text">我最近的文档</span>
              {hovering === '我最近的文档' && (
                <SubMenu data={MyRecentDocuments} onClick={onClick} />
              )}
            </li>
            <li className="menu__item" onClick={() => onClick('图片收藏')}>
              <img src={pictures} alt="" />
              <span className="menu__item__text">图片收藏</span>
            </li>
            <li className="menu__item" onClick={() => onClick('我的音乐')}>
              <img src={music} alt="" />
              <span className="menu__item__text">我的音乐</span>
            </li>
            <li className="menu__item" onClick={() => onClick('我的电脑')}>
              <img src={computer} alt="" />
              <span className="menu__item__text">我的电脑</span>
            </li>
          </ul>
          <ul className="sm-settings">
            <li className="menu__item" onClick={() => onClick('控制面板')}>
              <img src={controlPanel} alt="" />
              <span className="menu__item__text">控制面板</span>
            </li>
            <li
              className="menu__item"
              onClick={() => onClick('设定程序访问和默认值')}
            >
              <img src={setAccess} alt="" />
              <span className="menu__item__text">设定程序访问和默认值</span>
            </li>
            <li
              className={`menu__item sm-submenu-holder ${
                hovering === '连接到' ? 'expanded' : ''
              }`}
              onMouseEnter={() => setHovering('连接到')}
            >
              <img src={connect} alt="" />
              <span className="menu__item__text">连接到</span>
              {hovering === '连接到' && (
                <SubMenu data={ConnectTo} onClick={onClick} />
              )}
            </li>
            <li className="menu__item" onClick={() => onClick('打印机和传真')}>
              <img src={printer} alt="" />
              <span className="menu__item__text">打印机和传真</span>
            </li>
          </ul>
          <ul className="sm-support">
            <li className="menu__item" onClick={() => onClick('帮助和支持')}>
              <img src={help} alt="" />
              <span className="menu__item__text">帮助和支持</span>
            </li>
            <li className="menu__item" onClick={() => onClick('搜索')}>
              <img src={search} alt="" />
              <span className="menu__item__text">搜索</span>
            </li>
            <li className="menu__item" onClick={() => onClick('运行')}>
              <img src={run} alt="" />
              <span className="menu__item__text">运行...</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="sm-poweropt">
        <div className="sm-poweropt__contain">
          <div className="sm-poweropt__btn" onClick={() => onClick('注销')}>
            <div className="sm-softbutton yellow">
              <img src={symbolLogoff} alt="" />
            </div>
            <span>注销</span>
          </div>
          <div
            className="sm-poweropt__btn"
            onClick={() => onClick('关闭计算机')}
          >
            <div className="sm-softbutton red">
              <img src={symbolShutdown} alt="" />
            </div>
            <span>关闭计算机</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default styled(FooterMenu)`
  position: absolute;
  bottom: 0;
  left: 0;
  display: grid;
  grid-template-rows: 64px auto 40px;
  grid-template-columns: 378px;
  width: 378px;
  height: auto;
  border-radius: 5px 5px 0 0;
  border: 1px solid #1e59c4;
  border-bottom: none;
  background-color: #2b6dd1;
  filter: drop-shadow(2px 2px 2px #00000088);
  z-index: 999999;
  font-family: Tahoma, sans-serif;
  font-size: 11px;

  .sm-userbar {
    grid-column: 1;
    grid-row: 1;
    display: flex;
    align-items: center;
    padding: 6px 5px;
    background: radial-gradient(
        circle at 100% 0,
        #0849a977 0,
        #0849a900 6%,
        #0849a900 100%
      ),
      linear-gradient(
        to bottom,
        #66a2e7 0%,
        #74abe8 1.5%,
        #0c5fcb 5%,
        #1061cc 10%,
        #4792ec 100%
      );
    box-shadow: inset -2px 0 3px #1455b7, inset 2px 0 3px #7190d9;
    border-radius: 5px 5px 0 0;
    border-bottom: 1px solid #1b6bd1;
  }
  .sm-userbar__img {
    width: 48px;
    height: 48px;
    border-radius: 3px;
    border: 2px solid #b9cfe7;
    box-shadow: 1px 1px 3px #00000066;
  }
  .sm-userbar__name {
    display: inline-block;
    color: #fff;
    margin-left: 12px;
    font-weight: 700;
    font-size: 14px;
    text-shadow: 2px 2px 3px #000000dd;
  }

  .sm-links {
    display: grid;
    grid-column: 1;
    grid-row: 2;
    margin-left: 1px;
    grid-template-columns: 188px 189px;
    grid-template-rows: auto;
    border-top: 2px solid;
    border-image-slice: 1;
    border-image-source: linear-gradient(
      to right,
      #91a4da 0%,
      #91a4da 0.4%,
      #ffffff 0.5%,
      #ff8e24,
      #d3e5fa 99.5%,
      #2b6dd1 99.6%,
      #2b6dd1 100%
    );
  }

  .sm-applinks {
    display: flex;
    flex-direction: column;
    grid-column: 1;
    grid-row: 1;
    background-color: #fff;
    border-left: 1px solid #91a4da;
    color: #373738;
    padding-top: 2px;
  }
  .sm-applinks ul {
    list-style: none;
    padding: 0 5px;
    margin: 0;
  }
  .sm-applinks .menu__item {
    display: flex;
    align-items: center;
    height: 32px;
    padding: 2px;
    margin: 2px 0;
    cursor: pointer;
  }
  .sm-applinks .menu__item:hover {
    background-color: #316ac5;
    color: #fff;
  }
  .sm-applinks .menu__item > img {
    height: 32px;
    width: 32px;
    margin-right: 4px;
  }

  .sm-pinnedapps {
    padding-bottom: 4px !important;
    border-bottom: 1px solid;
    border-image-slice: 1;
    border-image-source: linear-gradient(
      to right,
      #fff 0%,
      #fff 8.5%,
      #d3d3c8 24%,
      #d3d3c8 76%,
      #fff 93%,
      #fff 100%
    );
  }
  .sm-pinned-text {
    display: flex;
    flex-direction: column;
  }
  .sm-pinned-title {
    font-weight: 700;
    font-size: 11px;
    line-height: 14px;
  }
  .sm-pinned-name {
    font-size: 11px;
    color: grey;
    line-height: 14px;
  }
  .sm-applinks .menu__item:hover .sm-pinned-name {
    color: #fff;
  }

  .sm-userapps {
    padding-top: 2px !important;
    flex: 1;
  }

  .sm-allapps {
    text-align: center;
    font-weight: 700;
    padding: 0 5px !important;
    border-top: 1px solid;
    border-image-slice: 1;
    border-image-source: linear-gradient(
      to right,
      #fff 0%,
      #fff 8.5%,
      #d3d3c8 24%,
      #d3d3c8 76%,
      #fff 93%,
      #fff 100%
    );
  }
  .sm-allapps-item {
    justify-content: center;
    height: 24px !important;
    margin: 3px 0 !important;
    position: relative;
  }
  .sm-allapps-arrow {
    width: 16px;
    height: 16px;
    display: inline-block;
    margin-left: 8px;
    background: url(${allProgramsIcon}) no-repeat center;
    background-size: contain;
    vertical-align: middle;
  }

  .sm-syslinks {
    display: flex;
    flex-direction: column;
    grid-column: 2;
    grid-row: 1;
    padding-top: 2px;
    background-color: #d3e5fa;
    box-shadow: inset -1px 0 2px #a6c2e6;
    border-left: 1px solid #95bdee;
    border-right: 1px solid #2b6dd1;
    color: #0a246a;
  }
  .sm-syslinks ul {
    list-style: none;
    padding: 0 7px;
    margin: 0;
  }
  .sm-syslinks .menu__item {
    display: flex;
    align-items: center;
    line-height: 24px;
    padding: 1px 3px;
    margin: 1px 0;
    cursor: pointer;
    position: relative;
  }
  .sm-syslinks .menu__item:hover {
    background-color: #316ac5;
    color: #fff;
  }
  .sm-syslinks .menu__item > img {
    height: 24px;
    width: 24px;
    margin-right: 4px;
    filter: drop-shadow(0.5px 0.5px 0.5px #00000088);
  }

  .sm-syslocations {
    font-weight: 700;
    padding-top: 5px !important;
  }
  .sm-syslocations::after {
    content: '';
    height: 1px;
    width: 75%;
    background: linear-gradient(to right, #b9d6fc 0, #81b6ff 50%, #b9d6fc 100%);
    display: block;
    margin: 4px 0 0 20px;
  }

  .sm-settings::before {
    content: '';
    height: 1px;
    width: 75%;
    background: linear-gradient(to right, #dbe7f6 0, #ededed 50%, #dbe7f6 100%);
    display: block;
    margin: 0 0 4px 20px;
  }
  .sm-settings::after {
    content: '';
    height: 1px;
    width: 75%;
    background: linear-gradient(to right, #b9d6fc 0, #81b6ff 50%, #b9d6fc 100%);
    display: block;
    margin: 4px 0 0 20px;
  }

  .sm-support::before {
    content: '';
    height: 1px;
    width: 75%;
    background: linear-gradient(to right, #dbe7f6 0, #ededed 50%, #dbe7f6 100%);
    display: block;
    margin: 0 0 4px 20px;
  }

  .sm-poweropt {
    grid-column: 1;
    grid-row: 3;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background: radial-gradient(
        circle at 0 100%,
        #0846b8aa 0,
        #0846b800 13%,
        #0846b800 100%
      ),
      radial-gradient(
        circle at 100% 100%,
        #0c50b188 0,
        #0c50b100 13%,
        #0c50b100 100%
      ),
      linear-gradient(to bottom, #438be3 0%, #1164d1 95%, #0c56c0 100%);
    box-shadow: inset 3px 0 2px #376cd4;
    border-top: 1px solid #3277de;
    padding-right: 6px;
  }
  .sm-poweropt__contain {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    align-items: center;
  }
  .sm-poweropt__btn {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 2px 4px;
  }
  .sm-poweropt__btn span {
    display: inline;
    color: #fff;
    line-height: 24px;
    margin-left: 4px;
    margin-right: 8px;
    font-size: 11px;
  }

  .sm-softbutton {
    display: inline-block;
    width: 22px;
    height: 22px;
    border-radius: 3px;
    position: relative;
    flex-shrink: 0;
    background: radial-gradient(
        at 10% 10%,
        #ffffff4a 0,
        #ffffff4a 10%,
        #ffffff00 60%
      ),
      radial-gradient(at 85% 85%, #ffffff33 0, #ffffff19 30%, #ffffff00 50%);
  }
  .sm-softbutton::before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    border-radius: 3px;
    box-shadow: inset -1.5px -1.5px 4.5px #00000088, inset 1px 1px 1px #00000029;
    background: radial-gradient(at 100% 100%, #00000022 0, #00000000 40%);
    border: 1px solid #fff;
    box-sizing: border-box;
    z-index: 2;
  }
  .sm-softbutton img {
    height: 22px;
    width: 22px;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
  }
  .sm-softbutton.yellow {
    background-color: #d7942d;
  }
  .sm-softbutton.yellow::before {
    box-shadow: inset -1px -1px 0 #9c5d02, inset -1.5px -1.5px 3px #9c5d02,
      inset 1px 1px 1px #d68f24;
  }
  .sm-poweropt__btn:hover .sm-softbutton.yellow {
    background-color: #fdaf31;
  }
  .sm-poweropt__btn:active .sm-softbutton.yellow {
    background-color: #ca7502;
  }
  .sm-softbutton.red {
    background-color: #e2512c;
  }
  .sm-softbutton.red::before {
    box-shadow: inset -1px -1px 0 #9d2607, inset -1.5px -1.5px 3px #9d2607,
      inset 1px 1px 1px #e2512c;
  }
  .sm-poweropt__btn:hover .sm-softbutton.red {
    background-color: #f9523d;
  }
  .sm-poweropt__btn:active .sm-softbutton.red {
    background-color: #a43418;
  }
`;
