import React, { useState } from 'react';
import styled from 'styled-components';

import { WindowDropDowns } from 'components';
import ContextMenu from 'components/ContextMenu';
import dropDownData from './dropDownData';
import go from 'assets/windowsIcons/290.png';
import search from 'assets/windowsIcons/299(32x32).png';
import computer from 'assets/windowsIcons/676(16x16).png';
import back from 'assets/windowsIcons/back.png';
import forward from 'assets/windowsIcons/forward.png';
import up from 'assets/windowsIcons/up.png';
import viewInfo from 'assets/windowsIcons/view-info.ico';
import remove from 'assets/windowsIcons/302(16x16).png';
import control from 'assets/windowsIcons/300(16x16).png';
import network from 'assets/windowsIcons/693(16x16).png';
import document from 'assets/windowsIcons/308(16x16).png';
import folderSmall from 'assets/windowsIcons/318(16x16).png';
import menu from 'assets/windowsIcons/358(32x32).png';
import folder from 'assets/windowsIcons/318(48x48).png';
import folderOpen from 'assets/windowsIcons/337(32x32).png';
import disk from 'assets/windowsIcons/svg/Local Disk.svg';
import cd from 'assets/windowsIcons/111(48x48).png';
import dropdown from 'assets/windowsIcons/dropdown.png';
import pullup from 'assets/windowsIcons/pullup.png';
import logo from 'assets/github-logo.png';
import mine from 'assets/minesweeper/mine-icon.png';
import windows from 'assets/windowsIcons/windows.png';

const EMPTY_AREA_MENU = [
  { type: 'item', text: '查看' },
  { type: 'item', text: '排列图标' },
  { type: 'item', text: '刷新' },
  { type: 'separator' },
  { type: 'item', text: '粘贴', disabled: true },
  { type: 'item', text: '粘贴快捷方式', disabled: true },
  { type: 'separator' },
  { type: 'item', text: '属性' },
];

const FOLDER_MENU = [
  { type: 'item', text: '打开' },
  { type: 'item', text: '资源管理器' },
  { type: 'item', text: '搜索...' },
  { type: 'separator' },
  { type: 'item', text: '剪切' },
  { type: 'item', text: '复制' },
  { type: 'separator' },
  { type: 'item', text: '创建快捷方式' },
  { type: 'item', text: '删除' },
  { type: 'item', text: '重命名' },
  { type: 'separator' },
  { type: 'item', text: '属性' },
];

const DRIVE_MENU = [
  { type: 'item', text: '打开' },
  { type: 'item', text: '资源管理器' },
  { type: 'item', text: '搜索...' },
  { type: 'separator' },
  { type: 'item', text: '共享和安全...' },
  { type: 'separator' },
  { type: 'item', text: '格式化...', disabled: true },
  { type: 'item', text: '复制' },
  { type: 'item', text: '创建快捷方式' },
  { type: 'separator' },
  { type: 'item', text: '重命名' },
  { type: 'separator' },
  { type: 'item', text: '属性' },
];

const CD_MENU = [
  { type: 'item', text: '打开' },
  { type: 'item', text: '资源管理器' },
  { type: 'separator' },
  { type: 'item', text: '自动播放' },
  { type: 'item', text: '弹出' },
  { type: 'separator' },
  { type: 'item', text: '创建快捷方式' },
  { type: 'item', text: '属性' },
];

const ABOUT_MENU = [
  { type: 'item', text: '打开' },
  { type: 'item', text: '在新窗口中打开' },
  { type: 'separator' },
  { type: 'item', text: '复制快捷方式' },
  { type: 'separator' },
  { type: 'item', text: '属性' },
];

function MyComputer({ onClose }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    items: [],
  });

  function closeContextMenu() {
    setContextMenu({ visible: false, x: 0, y: 0, items: [] });
  }

  function openContextMenu(e, items, item) {
    e.preventDefault();
    e.stopPropagation();
    if (item) {
      setSelectedItem(item);
    } else {
      setSelectedItem(null);
    }
    setContextMenu({
      visible: true,
      x: Math.min(e.clientX, window.innerWidth - 220),
      y: Math.min(e.clientY, window.innerHeight - 280),
      items,
    });
  }

  function selectItem(item) {
    closeContextMenu();
    setSelectedItem(item);
  }

  function onClickContextMenuItem() {}

  function onClickOptionItem(item) {
    switch (item) {
      case '关闭':
        onClose();
        break;
      default:
    }
  }
  return (
    <Div>
      <section className="com__toolbar">
        <div className="com__options">
          <WindowDropDowns
            items={dropDownData}
            onClickItem={onClickOptionItem}
          />
        </div>
        <img className="com__windows-logo" src={windows} alt="windows" />
      </section>
      <section className="com__function_bar">
        <div className="com__function_bar__button--disable">
          <img className="com__function_bar__icon" src={back} alt="" />
          <span className="com__function_bar__text">后退</span>
          <div className="com__function_bar__arrow" />
        </div>
        <div className="com__function_bar__button--disable">
          <img className="com__function_bar__icon" src={forward} alt="" />
          <div className="com__function_bar__arrow" />
        </div>
        <div className="com__function_bar__button">
          <img className="com__function_bar__icon--normalize" src={up} alt="" />
        </div>
        <div className="com__function_bar__separate" />
        <div className="com__function_bar__button">
          <img
            className="com__function_bar__icon--normalize "
            src={search}
            alt=""
          />
          <span className="com__function_bar__text">搜索</span>
        </div>
        <div className="com__function_bar__button">
          <img
            className="com__function_bar__icon--normalize"
            src={folderOpen}
            alt=""
          />
          <span className="com__function_bar__text">文件夹</span>
        </div>
        <div className="com__function_bar__separate" />
        <div className="com__function_bar__button">
          <img
            className="com__function_bar__icon--margin12"
            src={menu}
            alt=""
          />
          <div className="com__function_bar__arrow" />
        </div>
      </section>
      <section className="com__address_bar">
        <div className="com__address_bar__title">地址</div>
        <div className="com__address_bar__content">
          <img
            src={computer}
            alt="ie"
            className="com__address_bar__content__img"
          />
          <div className="com__address_bar__content__text">我的电脑</div>
          <img
            src={dropdown}
            alt="dropdown"
            className="com__address_bar__content__img"
          />
        </div>
        <div className="com__address_bar__go">
          <img className="com__address_bar__go__img" src={go} alt="go" />
          <span className="com__address_bar__go__text">转到</span>
        </div>
      </section>
      <div className="com__content">
        <div className="com__content__inner">
          <div className="com__content__left">
            <div className="com__content__left__card">
              <div className="com__content__left__card__header">
                <div className="com__content__left__card__header__text">
                  系统任务
                </div>
                <img
                  src={pullup}
                  alt=""
                  className="com__content__left__card__header__img"
                />
              </div>
              <div className="com__content__left__card__content">
                <div className="com__content__left__card__row">
                  <img
                    className="com__content__left__card__img"
                    src={viewInfo}
                    alt="view"
                  />
                  <div className="com__content__left__card__text link">
                    查看系统信息
                  </div>
                </div>
                <div className="com__content__left__card__row">
                  <img
                    className="com__content__left__card__img"
                    src={remove}
                    alt="remove"
                  />
                  <div className="com__content__left__card__text link">
                    添加或删除程序
                  </div>
                </div>
                <div className="com__content__left__card__row">
                  <img
                    className="com__content__left__card__img"
                    src={control}
                    alt="control"
                  />
                  <div className="com__content__left__card__text link">
                    更改设置
                  </div>
                </div>
              </div>
            </div>
            <div className="com__content__left__card">
              <div className="com__content__left__card__header">
                <div className="com__content__left__card__header__text">
                  其它位置
                </div>
                <img
                  src={pullup}
                  alt=""
                  className="com__content__left__card__header__img"
                />
              </div>
              <div className="com__content__left__card__content">
                <div className="com__content__left__card__row">
                  <img
                    className="com__content__left__card__img"
                    src={network}
                    alt="network"
                  />
                  <div className="com__content__left__card__text link">
                    网上邻居
                  </div>
                </div>
                <div className="com__content__left__card__row">
                  <img
                    className="com__content__left__card__img"
                    src={document}
                    alt="document"
                  />
                  <div className="com__content__left__card__text link">
                    我的文档
                  </div>
                </div>
                <div className="com__content__left__card__row">
                  <img
                    className="com__content__left__card__img"
                    src={folderSmall}
                    alt="folder"
                  />
                  <div className="com__content__left__card__text link">
                    共享文档
                  </div>
                </div>
                <div className="com__content__left__card__row">
                  <img
                    className="com__content__left__card__img"
                    src={control}
                    alt="control"
                  />
                  <div className="com__content__left__card__text link">
                    控制面板
                  </div>
                </div>
              </div>
            </div>
            <div className="com__content__left__card">
              <div className="com__content__left__card__header">
                <div className="com__content__left__card__header__text">
                  详细信息
                </div>
                <img
                  src={pullup}
                  alt=""
                  className="com__content__left__card__header__img"
                />
              </div>
              <div className="com__content__left__card__content">
                <div className="com__content__left__card__row">
                  <iframe
                    title="ghbtn"
                    style={{ margin: '0 0 3px -1px', height: '30px' }}
                    src="https://ghbtns.com/github-btn.html?user=SDCOM-0415&repo=winXP&type=star&count=true&size=large"
                    frameBorder="0"
                    scrolling="0"
                    width="170px"
                    height="20px"
                  />
                </div>
                <div className="com__content__left__card__row">
                  <img
                    className="com__content__left__card__img"
                    src="https://cdn.iconscout.com/icon/free/png-256/medium-1425876-1205067.png"
                    alt="control"
                  />
                  <a
                    href="https://github.com/SDCOM-0415"
                    target="_blank"
                    rel="noreferrer"
                    className="com__content__left__card__text link"
                  >
                    Medium
                  </a>
                </div>
                <div className="com__content__left__card__row">
                  <img
                    className="com__content__left__card__img"
                    src={mine}
                    alt="control"
                  />
                  <a
                    href="https://github.com/SDCOM-0415/winXP"
                    target="_blank"
                    rel="noreferrer"
                    className="com__content__left__card__text link"
                  >
                    扫雷
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div
            className="com__content__right"
            onMouseDown={() => selectItem(null)}
            onContextMenu={e => openContextMenu(e, EMPTY_AREA_MENU)}
          >
            <div className="com__content__right__card">
              <div className="com__content__right__card__header">
                在这台计算机上存储的文件
              </div>
              <div className="com__content__right__card__content">
                <button
                  type="button"
                  className={`com__content__right__card__item${
                    selectedItem === 'shared-documents' ? ' selected' : ''
                  }`}
                  onMouseDown={e => {
                    e.stopPropagation();
                    selectItem('shared-documents');
                  }}
                  onContextMenu={e =>
                    openContextMenu(e, FOLDER_MENU, 'shared-documents')
                  }
                >
                  <img
                    src={folder}
                    alt=""
                    className="com__content__right__card__img"
                  />
                  <span className="com__content__right__card__text">
                    共享文档
                  </span>
                </button>
                <button
                  type="button"
                  className={`com__content__right__card__item${
                    selectedItem === 'user-documents' ? ' selected' : ''
                  }`}
                  onMouseDown={e => {
                    e.stopPropagation();
                    selectItem('user-documents');
                  }}
                  onContextMenu={e =>
                    openContextMenu(e, FOLDER_MENU, 'user-documents')
                  }
                >
                  <img
                    src={folder}
                    alt=""
                    className="com__content__right__card__img"
                  />
                  <span className="com__content__right__card__text">
                    用户文档
                  </span>
                </button>
              </div>
            </div>
            <div className="com__content__right__card">
              <div className="com__content__right__card__header">
                硬盘驱动器
              </div>
              <div className="com__content__right__card__content">
                <button
                  type="button"
                  className={`com__content__right__card__item${
                    selectedItem === 'local-disk-c' ? ' selected' : ''
                  }`}
                  onMouseDown={e => {
                    e.stopPropagation();
                    selectItem('local-disk-c');
                  }}
                  onContextMenu={e =>
                    openContextMenu(e, DRIVE_MENU, 'local-disk-c')
                  }
                >
                  <img
                    src={disk}
                    alt=""
                    className="com__content__right__card__img"
                  />
                  <span className="com__content__right__card__text">
                    本地磁盘 (C:)
                  </span>
                </button>
              </div>
            </div>
            <div className="com__content__right__card">
              <div className="com__content__right__card__header">
                可移动存储设备
              </div>
              <div className="com__content__right__card__content">
                <button
                  type="button"
                  className={`com__content__right__card__item${
                    selectedItem === 'cd-drive-d' ? ' selected' : ''
                  }`}
                  onMouseDown={e => {
                    e.stopPropagation();
                    selectItem('cd-drive-d');
                  }}
                  onContextMenu={e => openContextMenu(e, CD_MENU, 'cd-drive-d')}
                >
                  <img
                    src={cd}
                    alt=""
                    className="com__content__right__card__img"
                  />
                  <span className="com__content__right__card__text">
                    CD 驱动器 (D:)
                  </span>
                </button>
              </div>
            </div>
            <div className="com__content__right__card com__content__right__card--me">
              <div className="com__content__right__card__header">关于我</div>
              <div className="com__content__right__card__content">
                <a
                  href="https://github.com/SDCOM-0415"
                  target="_blank"
                  rel="noreferrer"
                  className={`com__content__right__card__item${
                    selectedItem === 'about-github' ? ' selected' : ''
                  }`}
                  onMouseDown={e => {
                    e.stopPropagation();
                    selectItem('about-github');
                  }}
                  onContextMenu={e =>
                    openContextMenu(e, ABOUT_MENU, 'about-github')
                  }
                >
                  <img
                    className="com__content__right__card__img"
                    src={logo}
                    alt=""
                  />
                  <span className="com__content__right__card__text">
                    Github
                  </span>
                </a>
                <a
                  href="https://www.sdcom.top"
                  target="_blank"
                  rel="noreferrer"
                  className={`com__content__right__card__item${
                    selectedItem === 'about-website' ? ' selected' : ''
                  }`}
                  onMouseDown={e => {
                    e.stopPropagation();
                    selectItem('about-website');
                  }}
                  onContextMenu={e =>
                    openContextMenu(e, ABOUT_MENU, 'about-website')
                  }
                >
                  <img
                    className="com__content__right__card__img"
                    src="https://a.ppy.sh/2926513_1448497605.png"
                    alt=""
                  />
                  <span className="com__content__right__card__text">
                    我的网站
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {contextMenu.visible && (
        <ContextMenu
          items={contextMenu.items}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={closeContextMenu}
          onClickItem={onClickContextMenuItem}
        />
      )}
    </Div>
  );
}

const Div = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  background: linear-gradient(to right, #edede5 0%, #ede8cd 100%);
  .com__toolbar {
    position: relative;
    display: flex;
    align-items: center;
    line-height: 100%;
    height: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.7);
    flex-shrink: 0;
  }
  .com__options {
    height: 23px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    border-right: 1px solid rgba(0, 0, 0, 0.1);
    padding: 1px 0 1px 2px;
    border-left: 0;
    flex: 1;
  }
  .com__windows-logo {
    height: 100%;
    border-left: 1px solid white;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  .com__function_bar {
    height: 36px;
    display: flex;
    align-items: center;
    font-size: 11px;
    padding: 1px 3px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
  }
  .com__function_bar__button {
    display: flex;
    height: 100%;
    align-items: center;
    border: 1px solid rgba(0, 0, 0, 0);
    border-radius: 3px;
    &:hover {
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: inset 0 -1px 1px rgba(0, 0, 0, 0.1);
    }
    &:hover:active {
      border: 1px solid rgb(185, 185, 185);
      background-color: #dedede;
      box-shadow: inset 0 -1px 1px rgba(255, 255, 255, 0.7);
      color: rgba(255, 255, 255, 0.7);
      & > * {
        transform: translate(1px, 1px);
      }
    }
  }
  .com__function_bar__button--disable {
    filter: grayscale(1);
    opacity: 0.7;
    display: flex;
    height: 100%;
    align-items: center;
    border: 1px solid rgba(0, 0, 0, 0);
  }
  .com__function_bar__text {
    margin-right: 4px;
  }
  .com__function_bar__icon {
    height: 30px;
    width: 30px;
    &--normalize {
      height: 22px;
      width: 22px;
      margin: 0 4px 0 1px;
    }
    &--margin12 {
      height: 22px;
      width: 22px;
      margin: 0 1px 0 2px;
    }
    &--margin-1 {
      margin: 0 -1px;
      height: 30px;
      width: 30px;
    }
  }
  .com__function_bar__separate {
    height: 90%;
    width: 1px;
    background-color: rgba(0, 0, 0, 0.2);
    margin: 0 2px;
  }
  .com__function_bar__arrow {
    height: 100%;
    display: flex;
    align-items: center;
    margin: 0 4px;
    &:before {
      content: '';
      display: block;
      border-width: 3px 3px 0;
      border-color: #000 transparent;
      border-style: solid;
    }
  }
  .com__function_bar__arrow--margin-11 {
    height: 100%;
    display: flex;
    align-items: center;
    margin: 0 1px 0 -1px;
    &:before {
      content: '';
      display: block;
      border-width: 3px 3px 0;
      border-color: #000 transparent;
      border-style: solid;
    }
  }
  .com__address_bar {
    flex-shrink: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.7);
    height: 20px;
    font-size: 11px;
    display: flex;
    align-items: center;
    padding: 0 2px;
    box-shadow: inset 0 -2px 3px -1px #b0b0b0;
  }
  .com__address_bar__title {
    line-height: 100%;
    color: rgba(0, 0, 0, 0.5);
    padding: 5px;
  }
  .com__address_bar__content {
    border: rgba(122, 122, 255, 0.6) 1px solid;
    height: 100%;
    display: flex;
    flex: 1;
    align-items: center;
    background-color: white;
    position: relative;
    &__img {
      width: 14px;
      height: 14px;
    }
    &__img:last-child {
      width: 15px;
      height: 15px;
      right: 1px;
      position: absolute;
    }
    &__img:last-child:hover {
      filter: brightness(1.1);
    }
    &__text {
      white-space: nowrap;
      position: absolute;
      white-space: nowrap;
      left: 16px;
      right: 17px;
    }
  }

  .com__address_bar__go {
    display: flex;
    align-items: center;
    padding: 0 18px 0 5px;
    height: 100%;
    position: relative;
    &__img {
      height: 95%;
      border: 1px solid rgba(255, 255, 255, 0.2);
      margin-right: 3px;
    }
  }
  .com__address_bar__links {
    display: flex;
    align-items: center;
    padding: 0 18px 0 5px;
    height: 100%;
    position: relative;
    &__img {
      position: absolute;
      right: 2px;
      top: 3px;
      height: 5px;
      width: 8px;
    }
    &__text {
      color: rgba(0, 0, 0, 0.5);
    }
  }
  .com__address_bar__separate {
    height: 100%;
    width: 1px;
    background-color: rgba(0, 0, 0, 0.1);
    box-shadow: 1px 0 rgba(255, 255, 255, 0.7);
  }
  .com__content {
    flex: 1;
    border: 1px solid rgba(0, 0, 0, 0.4);
    border-top-width: 0;
    background-color: #f1f1f1;
    overflow: auto;
    font-size: 11px;
    position: relative;
  }
  .com__content__inner {
    display: flex;
    height: 100%;
    overflow: auto;
  }
  .com__content__left {
    width: 180px;
    height: 100%;
    background: linear-gradient(to bottom, #748aff 0%, #4057d3 100%);
    overflow: auto;
    padding: 10px;
  }

  .com__content__left__card {
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    width: 100%;
    overflow: hidden;
  }
  .com__content__left__card:not(:last-child) {
    margin-bottom: 12px;
  }
  .com__content__left__card__header {
    display: flex;
    align-items: center;
    height: 23px;
    padding-left: 11px;
    padding-right: 2px;
    cursor: pointer;
    background: linear-gradient(
      to right,
      rgb(240, 240, 255) 0,
      rgb(240, 240, 255) 30%,
      rgb(168, 188, 255) 100%
    );
  }
  .com__content__left__card__header:hover {
    & .com__content__left__card__header__text {
      color: #1c68ff;
    }
  }
  .com__content__left__card__header__text {
    font-weight: 700;
    color: #0c327d;
    flex: 1;
  }
  .com__content__left__card__header__img {
    width: 18px;
    height: 18px;
    filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.3));
  }
  .com__content__left__card__content {
    padding: 5px 10px;
    background: linear-gradient(
      to right,
      rgb(180, 200, 251) 0%,
      rgb(164, 185, 251) 50%,
      rgb(180, 200, 251) 100%
    );
    background-color: rgba(198, 211, 255, 0.87);
  }
  .com__content__left__card__row {
    display: flex;
    margin-bottom: 2px;
  }

  .com__content__left__card__img {
    width: 14px;
    height: 14px;
    margin-right: 5px;
  }
  .com__content__left__card__text {
    font-size: 10px;
    line-height: 14px;
    color: #0c327d;
    &.black {
      color: #000;
    }
    &.bold {
      font-weight: bold;
    }

    &.link:hover {
      cursor: pointer;
      color: #2b72ff;
      text-decoration: underline;
    }
  }
  .com__content__right {
    height: 100%;
    overflow: auto;
    background-color: #fff;
    flex: 1;
  }
  .com__content__right__card__header {
    width: 300px;
    font-weight: 700;
    padding: 2px 0 3px 12px;
    position: relative;
    &:after {
      content: '';
      display: block;
      background: linear-gradient(to right, #70bfff 0, #fff 100%);
      position: absolute;
      bottom: 0;
      left: -12px;
      height: 1px;
      width: 100%;
    }
  }
  .com__content__right__card__content {
    display: flex;
    align-items: center;
    padding-right: 0;
    flex-wrap: wrap;
    padding: 15px 15px 0;
  }
  .com__content__right__card__item {
    appearance: none;
    border: none;
    background: transparent;
    color: #000;
    display: inline-flex;
    align-items: center;
    width: 200px;
    margin: 0 0 15px;
    padding: 2px 4px;
    height: 50px;
    font-family: inherit;
    font-size: 11px;
    text-align: left;
    text-decoration: none;
    cursor: default;
    outline: none;
  }
  .com__content__right__card__item.selected .com__content__right__card__img {
    background-color: #316ac5;
    border-radius: 3px;
    outline: 1px dotted #ffffff;
    outline-offset: -1px;
  }
  .com__content__right__card__item.selected .com__content__right__card__text {
    background-color: #316ac5;
    color: #ffffff;
  }
  .com__content__right__card__img {
    width: 45px;
    height: 45px;
    margin-right: 5px;
    flex-shrink: 0;
  }
  .com__content__right__card__text {
    white-space: nowrap;
    line-height: 16px;
    padding: 1px 3px;
  }
  .com__content__right__card--me {
  }
`;

export default MyComputer;
