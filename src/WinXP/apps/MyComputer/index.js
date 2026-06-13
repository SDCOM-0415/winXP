import React, { useState } from 'react';
import styled from 'styled-components';

import { WindowDropDowns } from 'components';
import ContextMenu from 'components/ContextMenu';
import dropDownData from './dropDownData';
import { getNodeByPath, listChildren, resolveIcon } from './vfs';
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
import myDocs from 'assets/windowsIcons/svg/My Documents.svg';
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

const VIEW_MODES = [
  { id: 'thumbview', label: 'Thumbnails' },
  { id: 'tileview', label: 'Tiles' },
  { id: 'iconview', label: 'Icons' },
  { id: 'listview', label: 'List' },
];

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

  function navigateTo(next) {
    setHistory(prev => [...prev, location]);
    setFuture([]);
    setLocation(next);
    setSelectedItem(null);
  }

  function goBack() {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setFuture(f => [location, ...f]);
    setLocation(prev);
    setSelectedItem(null);
  }

  function goForward() {
    if (!future.length) return;
    const next = future[0];
    setFuture(future.slice(1));
    setHistory(h => [...h, location]);
    setLocation(next);
    setSelectedItem(null);
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

  const addressText = location
    ? [location.driveId, ...location.segments].join('\\')
    : 'My Computer';

  const selectedName =
    selectedItem === 'shared-documents'
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
      : location
      ? selectedItem || ''
      : '我的电脑';

  const selectedType =
    selectedItem === 'shared-documents' || selectedItem === 'user-documents'
      ? '文件夹'
      : selectedItem === 'local-disk-c'
      ? '本地磁盘'
      : selectedItem === 'cd-drive-d'
      ? 'CD 驱动器'
      : selectedItem === 'about-github' || selectedItem === 'about-website'
      ? '快捷方式'
      : selectedItem
      ? '系统文件夹'
      : '';

  return (
    <Div>
      <div className="com__toolbar">
        <div className="com__options">
          <WindowDropDowns
            items={dropDownData}
            onClickItem={onClickOptionItem}
          />
        </div>
        <img className="com__windows-logo" src={windows} alt="windows" />
      </div>

      <div className="com__navbuttons">
        <div
          className={`navbtn${history.length ? '' : ' disabled'}`}
          onClick={goBack}
        >
          <img src={back} alt="" />
          <span>Back</span>
          <span className="arrow">▼</span>
        </div>
        <div
          className={`navbtn${future.length ? '' : ' disabled'}`}
          onClick={goForward}
        >
          <img src={forward} alt="" />
          <span className="arrow">▼</span>
        </div>
        <div className={`navbtn${location ? '' : ' disabled'}`} onClick={goUp}>
          <img src={up} alt="" className="icon-svg" />
        </div>
        <div className="navbtn-sep" />
        <div className="navbtn disabled">
          <img src={search} alt="" className="icon-svg" />
          <span>Search</span>
        </div>
        <div className="navbtn disabled">
          <img src={folderOpen} alt="" className="icon-svg" />
          <span>Folders</span>
        </div>
        <div className="navbtn-sep" />
        <div
          className="navbtn viewsmenu"
          onClick={e => {
            e.stopPropagation();
            setViewPickerOpen(v => !v);
          }}
        >
          <img src={folderOpen} alt="" className="icon-svg" />
          <span className="arrow">▼</span>
          {viewPickerOpen && (
            <div className="viewpicker">
              <ul>
                {VIEW_MODES.map(({ id, label }) => (
                  <li
                    key={id}
                    className={viewMode === id ? 'activeView' : ''}
                    onClick={e => {
                      e.stopPropagation();
                      setViewMode(id);
                      setViewPickerOpen(false);
                    }}
                  >
                    <span>•</span>
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="com__addressbar">
        <span className="addr-label">Address</span>
        <div className="addr-combo">
          <img src={computer} alt="" />
          <span>{addressText}</span>
          <img src={dropdown} alt="" className="addr-dropdown" />
        </div>
        <div className="addr-go">
          <img src={go} alt="" />
          <span>Go</span>
        </div>
      </div>

      <div className="com__body">
        <div className="sidebar">
          <div className={`sidebargroup${collapsed.tasks ? ' collapsed' : ''}`}>
            <div className="groupheader">
              <span>File and Folder Tasks</span>
              <div
                className="collapser"
                onClick={() => setCollapsed(c => ({ ...c, tasks: !c.tasks }))}
              >
                <span>»</span>
              </div>
            </div>
            <ul>
              <li>
                <img src={newFolder} alt="" />
                Make a new folder
              </li>
              <li className={selectedItem ? '' : 'disabled'}>
                <img src={renameIcon} alt="" />
                Rename this selection
              </li>
              <li className={selectedItem ? '' : 'disabled'}>
                <img src={deleteIcon} alt="" />
                Delete this selection
              </li>
            </ul>
          </div>

          <div
            className={`sidebargroup${collapsed.places ? ' collapsed' : ''}`}
          >
            <div className="groupheader">
              <span>Other Places</span>
              <div
                className="collapser"
                onClick={() => setCollapsed(c => ({ ...c, places: !c.places }))}
              >
                <span>»</span>
              </div>
            </div>
            <ul>
              <li className="link" onClick={() => navigateTo(null)}>
                <img src={desktopIcon} alt="" />
                Desktop
              </li>
              <li className="link" onClick={() => openDrive('C:')}>
                <img src={myDocs} alt="" />
                My Documents
              </li>
              <li className="link" onClick={() => navigateTo(null)}>
                <img src={computer} alt="" />
                My Computer
              </li>
              {location && (
                <li className="link" onClick={goUp}>
                  <img src={folder} alt="" />
                  <span className="parent-path">
                    {location.segments.length > 0
                      ? location.segments[location.segments.length - 2] ||
                        location.driveId
                      : location.driveId}
                  </span>
                </li>
              )}
            </ul>
          </div>

          <div
            className={`sidebargroup details${
              collapsed.details ? ' collapsed' : ''
            }`}
          >
            <div className="groupheader">
              <span>Details</span>
              <div
                className="collapser"
                onClick={() =>
                  setCollapsed(c => ({ ...c, details: !c.details }))
                }
              >
                <span>»</span>
              </div>
            </div>
            <ul>
              <li className="name">{selectedName}</li>
              <li className="type">{selectedType}</li>
              {selectedItem && (
                <li className="modified">Modified: {buildDate}</li>
              )}
              {selectedItem === 'local-disk-c' && (
                <>
                  <li>File system: NTFS</li>
                  <li>Free space: 10.5 GB</li>
                  <li>Total size: 40.0 GB</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div
          className={`fscontents ${viewMode}`}
          onMouseDown={() => selectItem(null)}
          onContextMenu={e => openContextMenu(e, EMPTY_AREA_MENU)}
        >
          {location ? (
            <div className="items">
              {listChildren(getNodeByPath(location.driveId, location.segments))
                .length === 0 && (
                <div className="empty-msg">This folder is empty.</div>
              )}
              {listChildren(
                getNodeByPath(location.driveId, location.segments),
              ).map(({ name, node }) => (
                <div
                  key={name}
                  className={`fsicon${
                    selectedItem === name ? ' selected' : ''
                  }`}
                  onMouseDown={e => {
                    e.stopPropagation();
                    selectItem(name);
                  }}
                  onDoubleClick={() => openEntry(name, node)}
                >
                  <img src={resolveIcon(node.icon, node.type)} alt="" />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="items">
              <div className="card">
                <div className="card-header">Files Stored on This Computer</div>
                <div className="card-content">
                  {[
                    {
                      id: 'shared-documents',
                      label: 'Shared Documents',
                      icon: folder,
                      menu: FOLDER_MENU,
                    },
                    {
                      id: 'user-documents',
                      label: "User's Documents",
                      icon: folder,
                      menu: FOLDER_MENU,
                    },
                  ].map(({ id, label, icon, menu }) => (
                    <div
                      key={id}
                      className={`fsicon${
                        selectedItem === id ? ' selected' : ''
                      }`}
                      onMouseDown={e => {
                        e.stopPropagation();
                        selectItem(id);
                      }}
                      onContextMenu={e => openContextMenu(e, menu, id)}
                    >
                      <img src={icon} alt="" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-header">Hard Disk Drives</div>
                <div className="card-content">
                  <div
                    className={`fsicon${
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
                    <img src={disk} alt="" />
                    <span>Local Disk (C:)</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  Devices with Removable Storage
                </div>
                <div className="card-content">
                  <div
                    className={`fsicon${
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
                    <img src={cd} alt="" />
                    <span>CD Drive (D:)</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">About Me</div>
                <div className="card-content">
                  <div
                    className={`fsicon${
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
                      src="https://blog.sdcom.top/upload/cnb-favicon.svg"
                      alt=""
                    />
                    <span>CNB</span>
                  </div>
                  <div
                    className={`fsicon${
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
                      src="https://blog.sdcom.top/upload/tubiao.jpeg"
                      alt=""
                    />
                    <span>我的网站</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ContextMenu
        items={contextMenu.items}
        position={{ x: contextMenu.x, y: contextMenu.y }}
        onClose={closeContextMenu}
        onClickItem={() => {}}
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
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(to right, #edede5 0%, #ede8cd 100%);
  font-size: 11px;
  font-family: Tahoma, sans-serif;

  .com__toolbar {
    position: relative;
    display: flex;
    align-items: center;
    height: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.7);
    flex-shrink: 0;
  }
  .com__options {
    height: 23px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    border-right: 1px solid rgba(0, 0, 0, 0.1);
    padding: 1px 0 1px 2px;
    flex: 1;
  }
  .com__windows-logo {
    height: 100%;
    border-left: 1px solid white;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .com__navbuttons {
    display: flex;
    align-items: center;
    height: 36px;
    padding: 1px 3px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
    gap: 1px;
  }
  .navbtn {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 2px;
    border: 1px solid transparent;
    border-radius: 3px;
    cursor: default;
    position: relative;
    gap: 2px;
    &:hover:not(.disabled) {
      border-color: rgba(0, 0, 0, 0.1);
      box-shadow: inset 0 -1px 1px rgba(0, 0, 0, 0.1);
    }
    &:active:not(.disabled) {
      border-color: rgb(185, 185, 185);
      background-color: #dedede;
      box-shadow: inset 0 -1px 1px rgba(255, 255, 255, 0.7);
    }
    &.disabled {
      filter: grayscale(1);
      opacity: 0.6;
    }
    img {
      height: 22px;
      width: 22px;
      object-fit: contain;
      &.icon-svg {
        height: 20px;
        width: 20px;
        margin: 0 2px;
      }
    }
    span:not(.arrow) {
      margin-right: 2px;
    }
    .arrow {
      font-size: 7px;
      margin: 0 2px;
    }
  }
  .navbtn-sep {
    height: 90%;
    width: 1px;
    background: rgba(0, 0, 0, 0.2);
    margin: 0 2px;
  }
  .viewsmenu {
    cursor: default;
  }
  .viewpicker {
    position: absolute;
    top: 100%;
    right: 0;
    background: #fff;
    border: 1px solid #000;
    z-index: 9999;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    ul {
      list-style: none;
      margin: 0;
      padding: 2px 0;
    }
    li {
      padding: 3px 24px 3px 6px;
      white-space: nowrap;
      cursor: default;
      &:hover {
        background: #316ac5;
        color: #fff;
      }
      &.activeView > span {
        font-weight: bold;
      }
      span {
        margin-right: 4px;
      }
    }
  }

  .com__addressbar {
    display: flex;
    align-items: center;
    height: 22px;
    padding: 0 2px;
    border-top: 1px solid rgba(255, 255, 255, 0.7);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: inset 0 -2px 3px -1px #b0b0b0;
    flex-shrink: 0;
    .addr-label {
      color: rgba(0, 0, 0, 0.5);
      padding: 0 5px;
    }
    .addr-combo {
      flex: 1;
      display: flex;
      align-items: center;
      height: 100%;
      border: 1px solid rgba(122, 122, 255, 0.6);
      background: white;
      position: relative;
      overflow: hidden;
      img:first-child {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
      }
      span {
        flex: 1;
        padding: 0 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .addr-dropdown {
        width: 15px;
        height: 15px;
        flex-shrink: 0;
      }
    }
    .addr-go {
      display: flex;
      align-items: center;
      padding: 0 6px;
      height: 100%;
      gap: 3px;
      img {
        height: 16px;
        width: 16px;
      }
    }
  }

  .com__body {
    flex: 1;
    display: flex;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.4);
    border-top: none;
    background: #f1f1f1;
  }

  .sidebar {
    width: 200px;
    flex-shrink: 0;
    background: linear-gradient(to bottom, #7ba2e7, #6375d6);
    color: #fff;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 10px 10px 0;
  }
  .sidebargroup {
    background: linear-gradient(to right, #fff, #c6d3f7);
    color: #215dc6;
    border-radius: 3px 3px 0 0;
    margin-bottom: 14px;
    overflow: hidden;
    max-height: 300px;
    transition: max-height 0.4s ease-out;
    &.collapsed {
      max-height: 26px;
      ul {
        opacity: 0;
        pointer-events: none;
      }
    }
  }
  .groupheader {
    display: flex;
    align-items: center;
    padding: 5px 0 4px 12px;
    font-weight: 700;
    font-size: 11px;
    > span:first-child {
      flex: 1;
    }
  }
  .collapser {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fcffff;
    border: 1px solid #b3b8cf;
    box-shadow: 1px 1px 2px #b5c1e6;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 6px;
    cursor: pointer;
    span {
      transform: rotate(-90deg) scaleX(0.5) translate(-2px, -1px);
      display: block;
      font-weight: 700;
      font-size: 11px;
      letter-spacing: -3px;
      color: #215dc6;
    }
  }
  .sidebargroup ul {
    list-style: none;
    margin: 0;
    padding: 8px 14px;
    background: #d6dff7;
    border: 1px solid #fff;
    border-top: none;
    transition: opacity 0.3s;
    li {
      padding: 2px 0;
      display: flex;
      align-items: center;
      img {
        width: 16px;
        height: 16px;
        margin-right: 7px;
        object-fit: contain;
      }
      &.link:hover {
        text-decoration: underline;
        cursor: pointer;
      }
      &.disabled {
        opacity: 0.5;
      }
      &.name {
        font-weight: 700;
      }
    }
  }
  .sidebargroup.details ul li.name {
    font-weight: 600;
  }
  .parent-path {
    max-width: 130px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .fscontents {
    flex: 1;
    background: #fff;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .items {
    padding: 0 0 20px;
    min-height: 100%;
  }
  .empty-msg {
    padding: 12px;
    color: #333;
  }

  .card {
    margin: 0;
  }
  .card-header {
    font-weight: 700;
    padding: 4px 0 3px 12px;
    position: relative;
    &:after {
      content: '';
      display: block;
      background: linear-gradient(to right, #70bfff 0, #fff 100%);
      position: absolute;
      bottom: 0;
      left: 0;
      height: 1px;
      width: 100%;
    }
  }
  .card-content {
    display: flex;
    flex-wrap: wrap;
    padding: 8px;
  }

  .fsicon {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    cursor: default;
    img {
      object-fit: contain;
      flex-shrink: 0;
      image-rendering: -webkit-optimize-contrast;
    }
    span {
      overflow: hidden;
      text-overflow: ellipsis;
    }
    &.selected img {
      opacity: 0.5;
    }
    &.selected span {
      background: #316ac5;
      color: #fff;
      outline: 1px dotted #000;
    }
  }

  .tileview .fsicon {
    display: grid;
    grid-template-columns: 48px 1fr;
    align-items: center;
    width: 204px;
    height: 48px;
    margin: 4px;
    text-align: left;
    img {
      width: 48px;
      height: 48px;
    }
    span {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      line-height: 14px;
      padding: 1px 3px;
      word-break: break-word;
      align-self: center;
    }
  }

  .thumbview .fsicon {
    width: 96px;
    height: 115px;
    margin: 5px 15px 19px;
    text-align: center;
    line-height: 12px;
    position: relative;
    &:before {
      content: '';
      display: block;
      width: 94px;
      height: 94px;
      border: 1px solid #e0dfe3;
      position: absolute;
      top: 0;
      left: 0;
    }
    &.selected:before {
      outline: 2px solid #316ac5;
      border-color: #316ac5;
    }
    img {
      width: 48px;
      height: 48px;
      margin: 23px auto 0;
      display: block;
    }
    span {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      padding: 2px;
      margin-top: 4px;
      word-break: break-word;
      max-width: 100%;
    }
  }

  .iconview .fsicon {
    width: 74px;
    height: 60px;
    margin: 4px 1px;
    padding: 5px 0 1px;
    text-align: center;
    line-height: 13px;
    img {
      width: 32px;
      height: 32px;
      margin: 0 auto;
      display: block;
    }
    span {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      padding: 2px 4px;
      max-width: 100%;
      word-break: break-word;
    }
  }

  .listview .items {
    padding: 4px 0 4px 4px;
  }
  .listview .card-content {
    flex-direction: column;
    flex-wrap: wrap;
    align-content: flex-start;
    max-height: 200px;
  }
  .listview .fsicon {
    flex-direction: row;
    width: 210px;
    height: 18px;
    margin: 1px 0 0;
    align-items: center;
    img {
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }
    span {
      padding: 1px 2px;
      max-width: 186px;
      white-space: nowrap;
      line-height: 16px;
    }
  }
`;

export default MyComputer;
