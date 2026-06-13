import React, { useState } from 'react';
import styled from 'styled-components';

import { WindowDropDowns } from 'components';
import ContextMenu from 'components/ContextMenu';
import dropDownData from './dropDownData';
import { getNodeByPath, listChildren, resolveIcon } from './vfs';
import startupSound from 'assets/sounds/start.wav';
import go from 'assets/windowsIcons/svg/Go.svg';
import search from 'assets/windowsIcons/svg/Search.svg';
import computer from 'assets/windowsIcons/svg/My Computer.svg';
import back from 'assets/windowsIcons/back.png';
import forward from 'assets/windowsIcons/forward.png';
import up from 'assets/windowsIcons/svg/Up.svg';
import newFolder from 'assets/windowsIcons/svg/New Folder.svg';
import renameIcon from 'assets/windowsIcons/svg/Rename.svg';
import deleteIcon from 'assets/windowsIcons/svg/Delete.svg';
import desktopIcon from 'assets/windowsIcons/svg/Desktop.svg';
import document from 'assets/windowsIcons/svg/My Documents.svg';
import viewsIcon from 'assets/windowsIcons/svg/Tile View.svg';
import folder from 'assets/windowsIcons/svg/Folder Closed.svg';
import folderOpen from 'assets/windowsIcons/svg/Folder Opened.svg';
import disk from 'assets/windowsIcons/svg/Local Disk.svg';
import cd from 'assets/windowsIcons/svg/DVD alt.svg';
import dropdown from 'assets/windowsIcons/dropdown.png';
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

const buildDate =
  process.env.REACT_APP_BUILD_DATE ||
  new Date()
    .toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    .replace(/\//g, '/');

function MyComputer({ onClose }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [location, setLocation] = useState(null);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [collapsed, setCollapsed] = useState({
    tasks: false,
    places: false,
    details: true,
  });
  const [viewMode, setViewMode] = useState('tileview');
  const [viewPickerOpen, setViewPickerOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    items: [],
  });

  function playNav() {
    try {
      const a = new Audio(startupSound);
      a.play().catch(() => {});
    } catch (e) {}
  }

  function navigateTo(next) {
    setHistory(prev => [...prev, location]);
    setFuture([]);
    setLocation(next);
    setSelectedItem(null);
    playNav();
  }

  function goBack() {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setFuture(f => [location, ...f]);
    setLocation(prev);
    setSelectedItem(null);
    playNav();
  }

  function goForward() {
    if (!future.length) return;
    const next = future[0];
    setFuture(future.slice(1));
    setHistory(h => [...h, location]);
    setLocation(next);
    setSelectedItem(null);
    playNav();
  }

  function goUp() {
    if (!location) return;
    if (location.segments.length === 0) {
      navigateTo(null);
    } else {
      navigateTo({
        driveId: location.driveId,
        segments: location.segments.slice(0, -1),
      });
    }
  }

  function openDrive(driveId) {
    navigateTo({ driveId, segments: [] });
  }

  function openEntry(name, node) {
    if (node.type === 'directory') {
      navigateTo({
        driveId: location.driveId,
        segments: [...location.segments, name],
      });
    }
  }

  function closeContextMenu() {
    setContextMenu({ visible: false, x: 0, y: 0, items: [] });
    setViewPickerOpen(false);
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
      case '关于 Windows':
        window.postMessage({ type: 'open-app', app: 'AboutWindows' }, '*');
        break;
      default:
    }
  }
  return (
    <Div onClick={() => setViewPickerOpen(false)}>
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
        <div
          className={`com__function_bar__button${
            history.length ? '' : '--disable'
          }`}
          onClick={goBack}
        >
          <img className="com__function_bar__icon" src={back} alt="" />
          <span className="com__function_bar__text">后退</span>
          <div className="com__function_bar__arrow" />
        </div>
        <div
          className={`com__function_bar__button${
            future.length ? '' : '--disable'
          }`}
          onClick={goForward}
        >
          <img className="com__function_bar__icon" src={forward} alt="" />
          <div className="com__function_bar__arrow" />
        </div>
        <div
          className={`com__function_bar__button${location ? '' : '--disable'}`}
          onClick={goUp}
        >
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
        <div
          className="com__function_bar__button com__views_btn"
          onClick={e => {
            e.stopPropagation();
            setViewPickerOpen(v => !v);
          }}
        >
          <img
            className="com__function_bar__icon--normalize"
            src={viewsIcon}
            alt="视图"
          />
          <div className="com__function_bar__arrow" />
          {viewPickerOpen && (
            <div className="com__views_picker">
              {[
                { mode: 'thumbview', label: '缩略图' },
                { mode: 'tileview', label: '平铺' },
                { mode: 'iconview', label: '图标' },
                { mode: 'listview', label: '列表' },
              ].map(({ mode, label }) => (
                <div
                  key={mode}
                  className={`com__views_picker__item${
                    viewMode === mode ? ' active' : ''
                  }`}
                  onClick={e => {
                    e.stopPropagation();
                    setViewMode(mode);
                    setViewPickerOpen(false);
                  }}
                >
                  <span>•</span>
                  {label}
                </div>
              ))}
            </div>
          )}
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
          <div className="com__address_bar__content__text">
            {location
              ? [location.driveId, ...location.segments].join('\\')
              : '我的电脑'}
          </div>
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
            <div
              className={`com__sidebar__group${
                collapsed.tasks ? ' collapsed' : ''
              }`}
            >
              <div className="com__sidebar__group__header">
                <span>文件和文件夹任务</span>
                <div
                  className="com__sidebar__collapser"
                  onClick={() => setCollapsed(c => ({ ...c, tasks: !c.tasks }))}
                >
                  <span>»</span>
                </div>
              </div>
              <ul>
                <li className="link">
                  <img src={newFolder} alt="" />
                  创建一个新文件夹
                </li>
                <li className={`link${selectedItem ? '' : ' disabled'}`}>
                  <img src={renameIcon} alt="" />
                  重命名所选项目
                </li>
                <li className={`link${selectedItem ? '' : ' disabled'}`}>
                  <img src={deleteIcon} alt="" />
                  删除所选项目
                </li>
              </ul>
            </div>
            <div
              className={`com__sidebar__group${
                collapsed.places ? ' collapsed' : ''
              }`}
            >
              <div className="com__sidebar__group__header">
                <span>其它位置</span>
                <div
                  className="com__sidebar__collapser"
                  onClick={() =>
                    setCollapsed(c => ({ ...c, places: !c.places }))
                  }
                >
                  <span>»</span>
                </div>
              </div>
              <ul>
                <li className="link" onClick={() => navigateTo(null)}>
                  <img src={desktopIcon} alt="" />
                  桌面
                </li>
                <li className="link" onClick={() => openDrive('C:')}>
                  <img src={document} alt="" />
                  我的文档
                </li>
                <li className="link" onClick={() => navigateTo(null)}>
                  <img src={computer} alt="" />
                  我的电脑
                </li>
              </ul>
            </div>
            <div
              className={`com__sidebar__group details${
                collapsed.details ? ' collapsed' : ''
              }`}
            >
              <div className="com__sidebar__group__header">
                <span>详细信息</span>
                <div
                  className="com__sidebar__collapser"
                  onClick={() =>
                    setCollapsed(c => ({ ...c, details: !c.details }))
                  }
                >
                  <span>»</span>
                </div>
              </div>
              <ul>
                <li className="name">
                  {selectedItem === 'shared-documents'
                    ? '共享文档'
                    : selectedItem === 'user-documents'
                    ? '用户文档'
                    : selectedItem === 'local-disk-c'
                    ? '本地磁盘 (C:)'
                    : selectedItem === 'cd-drive-d'
                    ? 'CD 驱动器 (D:)'
                    : selectedItem === 'about-github'
                    ? 'CNB'
                    : selectedItem === 'about-website'
                    ? '我的网站'
                    : '我的电脑'}
                </li>
                <li className="type">
                  {selectedItem === 'shared-documents' ||
                  selectedItem === 'user-documents'
                    ? '文件夹'
                    : selectedItem === 'local-disk-c'
                    ? '本地磁盘'
                    : selectedItem === 'cd-drive-d'
                    ? 'CD 驱动器'
                    : selectedItem === 'about-github' ||
                      selectedItem === 'about-website'
                    ? '快捷方式'
                    : '系统文件夹'}
                </li>
                {selectedItem && (
                  <li className="modified">修改日期: {buildDate}</li>
                )}
                {selectedItem === 'local-disk-c' && (
                  <>
                    <li>文件系统: NTFS</li>
                    <li>可用空间: 10.5 GB</li>
                    <li>总大小: 40.0 GB</li>
                  </>
                )}
              </ul>
            </div>
          </div>
          <div
            className={`com__content__right ${viewMode}`}
            onMouseDown={() => selectItem(null)}
            onContextMenu={e => openContextMenu(e, EMPTY_AREA_MENU)}
          >
            {location ? (
              <div className="com__content__browse">
                {listChildren(
                  getNodeByPath(location.driveId, location.segments),
                ).length === 0 && (
                  <div className="com__content__browse__empty">
                    这个文件夹是空的。
                  </div>
                )}
                {listChildren(
                  getNodeByPath(location.driveId, location.segments),
                ).map(({ name, node }) => (
                  <button
                    type="button"
                    key={name}
                    className={`com__content__browse__item${
                      selectedItem === name ? ' selected' : ''
                    }`}
                    onMouseDown={e => {
                      e.stopPropagation();
                      selectItem(name);
                    }}
                    onDoubleClick={() => openEntry(name, node)}
                  >
                    <img
                      src={resolveIcon(node.icon, node.type)}
                      alt=""
                      className="com__content__browse__img"
                    />
                    <span className="com__content__browse__text">{name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="com__content__browse">
                <div className="com__content__browse__card">
                  <div className="com__content__browse__card__header">
                    在这台计算机上存储的文件
                  </div>
                  <div className="com__content__browse__card__content">
                    <button
                      type="button"
                      className={`com__content__browse__item${
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
                        className="com__content__browse__img"
                      />
                      <span className="com__content__browse__text">
                        共享文档
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`com__content__browse__item${
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
                        className="com__content__browse__img"
                      />
                      <span className="com__content__browse__text">
                        用户文档
                      </span>
                    </button>
                  </div>
                </div>
                <div className="com__content__browse__card">
                  <div className="com__content__browse__card__header">
                    硬盘驱动器
                  </div>
                  <div className="com__content__browse__card__content">
                    <button
                      type="button"
                      className={`com__content__browse__item${
                        selectedItem === 'local-disk-c' ? ' selected' : ''
                      }`}
                      onMouseDown={e => {
                        e.stopPropagation();
                        selectItem('local-disk-c');
                      }}
                      onDoubleClick={() => openDrive('C:')}
                      onContextMenu={e =>
                        openContextMenu(e, DRIVE_MENU, 'local-disk-c')
                      }
                    >
                      <img
                        src={disk}
                        alt=""
                        className="com__content__browse__img"
                      />
                      <span className="com__content__browse__text">
                        本地磁盘 (C:)
                      </span>
                    </button>
                  </div>
                </div>
                <div className="com__content__browse__card">
                  <div className="com__content__browse__card__header">
                    可移动存储设备
                  </div>
                  <div className="com__content__browse__card__content">
                    <button
                      type="button"
                      className={`com__content__browse__item${
                        selectedItem === 'cd-drive-d' ? ' selected' : ''
                      }`}
                      onMouseDown={e => {
                        e.stopPropagation();
                        selectItem('cd-drive-d');
                      }}
                      onContextMenu={e =>
                        openContextMenu(e, CD_MENU, 'cd-drive-d')
                      }
                    >
                      <img
                        src={cd}
                        alt=""
                        className="com__content__browse__img"
                      />
                      <span className="com__content__browse__text">
                        CD 驱动器 (D:)
                      </span>
                    </button>
                  </div>
                </div>
                <div className="com__content__browse__card com__content__browse__card--me">
                  <div className="com__content__browse__card__header">
                    关于我
                  </div>
                  <div className="com__content__browse__card__content">
                    <button
                      type="button"
                      className={`com__content__browse__item${
                        selectedItem === 'about-github' ? ' selected' : ''
                      }`}
                      onMouseDown={e => {
                        e.stopPropagation();
                        selectItem('about-github');
                      }}
                      onDoubleClick={() =>
                        window.open(
                          'https://cnb.cool/SDCOM/winXP',
                          '_blank',
                          'noreferrer',
                        )
                      }
                      onContextMenu={e =>
                        openContextMenu(e, ABOUT_MENU, 'about-github')
                      }
                    >
                      <img
                        className="com__content__browse__img"
                        src="https://blog.sdcom.top/upload/cnb-favicon.svg"
                        alt=""
                      />
                      <span className="com__content__browse__text">CNB</span>
                    </button>
                    <button
                      type="button"
                      className={`com__content__browse__item${
                        selectedItem === 'about-website' ? ' selected' : ''
                      }`}
                      onMouseDown={e => {
                        e.stopPropagation();
                        selectItem('about-website');
                      }}
                      onDoubleClick={() =>
                        window.open(
                          'https://www.sdcom.top',
                          '_blank',
                          'noreferrer',
                        )
                      }
                      onContextMenu={e =>
                        openContextMenu(e, ABOUT_MENU, 'about-website')
                      }
                    >
                      <img
                        className="com__content__browse__img"
                        src="https://blog.sdcom.top/upload/tubiao.jpeg"
                        alt=""
                      />
                      <span className="com__content__browse__text">
                        我的网站
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ContextMenu
        items={contextMenu.items}
        position={{ x: contextMenu.x, y: contextMenu.y }}
        onClose={closeContextMenu}
        onClickItem={onClickContextMenuItem}
        visible={contextMenu.visible}
      />
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
    overflow: hidden;
    font-size: 11px;
    position: relative;
  }
  .com__content__inner {
    display: flex;
    height: 100%;
    overflow: hidden;
  }
  .com__content__left {
    width: 210px;
    height: 100%;
    color: #fff;
    background: linear-gradient(to bottom, #7ba2e7, #6375d6);
    overflow-y: auto;
    overflow-x: hidden;
    padding: 12px 12px 0;
  }
  .com__sidebar__group {
    width: 100%;
    display: block;
    background: linear-gradient(to right, #fff, #c6d3f7);
    color: #215dc6;
    border-radius: 3px 3px 0 0;
    margin-bottom: 15px;
    max-height: 300px;
    overflow: hidden;
    transition: max-height 0.5s ease-out;
  }
  .com__sidebar__group.collapsed {
    max-height: 25px;
    overflow: hidden;
    z-index: 1;
    transition: max-height 0.5s ease-out;
  }
  .com__sidebar__group.collapsed ul {
    opacity: 0;
    transform: translateY(-100%);
    overflow: hidden;
    padding: 0;
    border: none;
    pointer-events: none;
    z-index: 0;
  }
  .com__sidebar__group__header {
    display: flex;
    align-items: center;
    padding: 5px 0 4px 13px;
    font-weight: 600;
  }
  .com__sidebar__group__header span:first-child {
    flex: 1;
  }
  .com__sidebar__collapser {
    float: right;
    margin-top: 3px;
    margin-right: 6px;
    width: 15px;
    height: 15px;
    border-radius: 100%;
    background-color: #fcffff;
    border: 1px solid #b3b8cf;
    box-shadow: 2px 2px 2px #b5c1e6;
    text-shadow: 0 0 2px #e3ffff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .com__sidebar__collapser span {
    padding: 0;
    font-weight: 700;
    transform: rotate(-90deg) scaleX(0.5) translate(-2px, -1px);
    display: block;
    letter-spacing: -3px;
    font-family: Tahoma, sans-serif;
    font-size: 11px;
    color: #215dc6;
  }
  .com__sidebar__group ul {
    display: block;
    background-color: #d6dff7;
    padding: 9px 15px;
    margin: 0;
    border-width: 0 1px 1px 1px;
    border-style: solid;
    border-color: #fff;
    transition: opacity 0.3s, transform 0.3s;
    list-style-type: none;
  }
  .com__sidebar__group ul li {
    padding: 2px 0;
    font-size: 11px;
  }
  .com__sidebar__group ul li img {
    vertical-align: middle;
    margin-right: 7px;
    width: 16px;
    height: 16px;
  }
  .com__sidebar__group:not(.details) ul li.link:hover {
    text-decoration: underline;
    cursor: pointer;
  }
  .com__sidebar__group ul li.disabled {
    opacity: 0.5;
    cursor: default;
  }
  .com__sidebar__group.details ul li.name {
    font-weight: 600;
  }
  .com__content__right {
    height: 100%;
    overflow: hidden;
    background-color: #fff;
    flex: 1;
  }
  .com__content__browse {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0 0 20px 0;
  }
  .com__content__browse__empty {
    padding: 12px;
    font-size: 11px;
    color: #333;
  }
  .com__content__browse__card {
    margin: 0;
  }
  .com__content__browse__card__header {
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
  .com__content__browse__card__content {
    display: flex;
    flex-wrap: wrap;
    padding: 8px;
  }
  .com__views_btn {
    position: relative;
  }
  .com__views_picker {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 10;
    width: 100px;
    border: 1px solid #9d9da1;
    background: #fff;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    padding: 2px 0 1px 0;
  }
  .com__views_picker__item {
    display: block;
    height: 18px;
    line-height: 18px;
    padding: 0 0 0 10px;
    font-size: 11px;
    cursor: default;
    white-space: nowrap;
    & > span {
      display: inline-block;
      padding-right: 6px;
      opacity: 0;
      font-size: 14px;
      line-height: 12px;
      vertical-align: middle;
    }
    &.active > span {
      opacity: 1;
    }
    &:hover {
      background: #316ac5;
      color: #fff;
    }
  }

  .com__content__browse__item {
    appearance: none;
    border: none;
    background: transparent;
    color: #000;
    font-family: inherit;
    font-size: 11px;
    text-decoration: none;
    cursor: default;
    outline: none;
  }
  .com__content__browse__img {
    object-fit: contain;
    flex-shrink: 0;
    image-rendering: -webkit-optimize-contrast;
  }
  .com__content__browse__text {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .com__content__browse__item.selected .com__content__browse__img {
    opacity: 0.5;
  }
  .com__content__browse__item.selected .com__content__browse__text {
    background-color: #316ac5;
    color: #ffffff;
    outline: 1px dotted #000000;
  }

  .tileview .com__content__browse__item {
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: 48px auto;
    width: 204px;
    height: 48px;
    margin: 4px;
    text-align: left;
  }
  .tileview .com__content__browse__img {
    width: 48px;
    height: 48px;
    margin: 0;
    grid-row: 1;
    grid-column: 1;
  }
  .tileview .com__content__browse__text {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-height: 12pt;
    margin-left: 4px;
    width: fit-content;
    height: fit-content;
    align-self: center;
    grid-row: 1;
    grid-column: 2;
    padding: 1px 3px;
    word-break: break-word;
  }
  .tileview .com__content__browse__card__content {
    flex-wrap: wrap;
  }

  .thumbview .com__content__browse__item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    width: 96px;
    height: 115px;
    margin: 5px 15px 19px 15px;
    text-align: center;
    line-height: 12px;
    vertical-align: top;
  }
  .thumbview .com__content__browse__img {
    width: 48px;
    height: 48px;
    margin: 23px auto;
    display: block;
  }
  .thumbview .com__content__browse__item::before {
    content: '';
    display: block;
    width: 94px;
    height: 94px;
    border: 1px solid #e0dfe3;
    margin: 0 auto;
    order: -1;
    background: transparent;
  }
  .thumbview .com__content__browse__text {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    padding: 2px 2px 4px;
    margin: 4px auto 0;
    max-width: 100%;
    max-height: 22px;
    line-height: 12px;
    word-break: break-word;
  }
  .thumbview .com__content__browse__item.selected::before {
    outline: 2px solid #316ac5;
    border: 1px solid #316ac5;
  }
  .thumbview .com__content__browse__card__content {
    flex-wrap: wrap;
  }

  .iconview .com__content__browse__item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    width: 74px;
    height: 60px;
    margin: 4px 1px 2px 1px;
    padding: 5px 0 1px 0;
    text-align: center;
    line-height: 13px;
    vertical-align: top;
  }
  .iconview .com__content__browse__img {
    width: 32px;
    height: 32px;
    margin: 0 auto;
    display: block;
  }
  .iconview .com__content__browse__text {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    padding: 2px 4px 4px;
    margin: 0 auto;
    max-width: 100%;
    max-height: 22px;
    word-break: break-word;
  }
  .iconview .com__content__browse__card__content {
    flex-wrap: wrap;
  }

  .listview .com__content__browse {
    padding: 0 0 4px 4px;
  }
  .listview .com__content__browse__card__content {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-content: flex-start;
    max-height: 200px;
  }
  .listview .com__content__browse__item {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    width: 210px;
    height: 16px;
    margin: 1px 0 0;
    text-align: left;
  }
  .listview .com__content__browse__img {
    width: 16px;
    height: 16px;
    margin: 0;
    vertical-align: middle;
  }
  .listview .com__content__browse__text {
    padding: 2px 4px;
    display: inline-block;
    max-width: 186px;
    line-height: 16px;
    height: 16px;
    white-space: nowrap;
    vertical-align: middle;
  }
  .com__content__browse__card--me {
  }
`;

export default MyComputer;
