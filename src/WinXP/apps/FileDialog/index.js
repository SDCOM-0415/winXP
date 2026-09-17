import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

import {
  useVfs,
  getNode,
  listChildren,
  resolveIcon,
  iconForFileName,
} from '../../vfs';

/**
 * 文件对话框（保存 / 打开）。对照参考站 wm.js 的 saveFileDialog / openFileDialog：
 * 520×360、居中、对话框式窗口、由应用发起并等一个 Promise。
 *
 * 应用侧的用法：
 *   const path = await saveFileDialog({ title, initialPath, defaultName, filters });
 *   // 用户取消时不会 resolve
 */

const EVENT = 'winxp:open-filedialog';

let pendingRequest = null;

export function saveFileDialog(options = {}) {
  return new Promise(resolve => {
    pendingRequest = { mode: 'save', options, resolve };
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { mode: 'save' } }));
  });
}

export function openFileDialog(options = {}) {
  return new Promise(resolve => {
    pendingRequest = { mode: 'open', options, resolve };
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { mode: 'open' } }));
  });
}

/** 由 WinXP 取出待处理的请求（取出后清空，避免重复弹窗） */
export function takeFileDialogRequest() {
  const req = pendingRequest;
  pendingRequest = null;
  return req;
}

/** 对话框结束时把结果交回给发起方；取消时传 null */
export function settleFileDialog(result) {
  const req = activeRequest;
  activeRequest = null;
  if (req && req.resolve) req.resolve(result);
}

let activeRequest = null;
export function setActiveRequest(req) {
  activeRequest = req;
}

const PLACES = [
  { id: 'computer', label: '我的电脑', segments: [] },
  {
    id: 'desktop',
    label: '桌面',
    segments: ['Documents and Settings', 'Default User', 'Desktop'],
  },
  {
    id: 'mydocs',
    label: '我的文档',
    segments: ['Documents and Settings', 'Default User', 'My Documents'],
  },
];

function parsePath(input) {
  const s = String(input || '')
    .trim()
    .replace(/\//g, '\\');
  const m = /^([A-Za-z]):\\?(.*)$/.exec(s);
  const driveId = `${(m ? m[1] : 'C').toUpperCase()}:`;
  const segments = (m ? m[2] : s).split('\\').filter(Boolean);
  return { driveId, segments };
}

function joinPath({ driveId, segments }) {
  return `${driveId}\\${segments.join('\\')}`.replace(/\\+$/, '');
}

export default function FileDialog({ onClose, injectProps }) {
  const { vfs } = useVfs();
  const request = injectProps && injectProps.request ? injectProps.request : {};
  const mode = request.mode || 'save';
  const options = request.options || {};
  const fs = options.filters || [];
  const defaultExt = fs[0] && fs[0].extensions ? fs[0].extensions[0] : '*.*';

  const [location, setLocation] = useState(() => {
    if (options.initialPath) return parsePath(options.initialPath);
    return parsePath('C:\\Documents and Settings\\Default User\\My Documents');
  });
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState(options.defaultName || '');
  const [filterIndex, setFilterIndex] = useState(0);

  // 请求只在挂载时绑定一次。用 ref 守卫而不是空依赖 + eslint-disable，
  // 后者在规则未触发时会被判为"未使用的 disable 指令"，CI 下同样是错误
  const boundRef = useRef(false);
  useEffect(() => {
    if (boundRef.current) return;
    boundRef.current = true;
    setActiveRequest(request);
  }, [request]);

  const dir = getNode(vfs.drives[location.driveId], location.segments);
  const entries = listChildren(dir);

  function finish(result) {
    settleFileDialog(result);
    onClose();
  }

  function goUp() {
    if (!location.segments.length) return;
    setLocation({
      driveId: location.driveId,
      segments: location.segments.slice(0, -1),
    });
    setSelected(null);
  }

  function confirm() {
    if (mode === 'open') {
      if (!selected) return;
      const node = dir && dir.contents ? dir.contents[selected] : null;
      if (node && node.type === 'directory') {
        setLocation({
          driveId: location.driveId,
          segments: [...location.segments, selected],
        });
        setSelected(null);
        return;
      }
      finish(
        joinPath({ ...location, segments: [...location.segments] }) +
          '\\' +
          selected,
      );
      return;
    }
    let fileName = name.trim();
    if (!fileName) return;
    if (defaultExt && defaultExt !== '*.*' && fileName.indexOf('.') < 0) {
      fileName = `${fileName}.${defaultExt}`;
    }
    finish(`${joinPath(location)}\\${fileName}`);
  }

  return (
    <Div>
      <div className="fd__lookin">
        <span className="fd__label">保存在:</span>
        <span className="fd__path">
          <span className="fd__path__text">{joinPath(location)}</span>
        </span>
        <button
          type="button"
          className="fd__up"
          onClick={goUp}
          title="向上一级"
        >
          ↑
        </button>
      </div>
      <div className="fd__main">
        <div className="fd__places">
          {PLACES.map(p => (
            <div
              key={p.id}
              className={`fd__place${
                JSON.stringify(p.segments) === JSON.stringify(location.segments)
                  ? ' fd__place--on'
                  : ''
              }`}
              onClick={() => {
                setLocation({ driveId: 'C:', segments: p.segments });
                setSelected(null);
              }}
            >
              {p.label}
            </div>
          ))}
        </div>
        <div className="fd__list">
          {entries.length === 0 && (
            <div className="fd__empty">这个文件夹是空的。</div>
          )}
          {entries.map(({ name: entryName, node }) => (
            <button
              type="button"
              key={entryName}
              className={`fd__item${
                selected === entryName ? ' fd__item--on' : ''
              }`}
              onClick={() => {
                setSelected(entryName);
                if (mode === 'save' && node.type === 'file') setName(entryName);
              }}
              onDoubleClick={() => {
                if (node.type === 'directory') {
                  setLocation({
                    driveId: location.driveId,
                    segments: [...location.segments, entryName],
                  });
                  setSelected(null);
                } else if (mode === 'open') {
                  finish(`${joinPath(location)}\\${entryName}`);
                }
              }}
            >
              <img
                src={resolveIcon(
                  node.icon || iconForFileName(entryName),
                  node.type,
                )}
                alt=""
              />
              <span>{entryName}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="fd__foot">
        <label className="fd__field">
          <span>文件名:</span>
          <input
            type="text"
            value={name}
            spellCheck={false}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                confirm();
              }
            }}
          />
        </label>
        <label className="fd__field fd__field--type">
          <span>保存类型:</span>
          <select
            value={filterIndex}
            onChange={e => setFilterIndex(Number(e.target.value))}
          >
            {fs.length === 0 && <option value={0}>所有文件 (*.*)</option>}
            {fs.map((f, i) => (
              <option key={f.name} value={i}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        <div className="fd__buttons">
          <button type="button" className="fd__btn" onClick={confirm}>
            {mode === 'open' ? '打开' : '保存'}
          </button>
          <button
            type="button"
            className="fd__btn"
            onClick={() => finish(null)}
          >
            取消
          </button>
        </div>
      </div>
    </Div>
  );
}

const Div = styled.div`
  height: 100%;
  background-color: #ece9d8;
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: #000;
  box-sizing: border-box;
  padding: 8px;

  .fd__lookin {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    margin-bottom: 6px;
  }
  .fd__label {
    white-space: nowrap;
  }
  .fd__path {
    flex: 1;
    min-width: 0;
    height: 21px;
    display: flex;
    align-items: center;
    padding: 0 4px;
    background-color: #fff;
    border: 1px solid;
    border-color: #7f9db9 #fff #fff #7f9db9;
  }
  .fd__path__text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .fd__up {
    width: 24px;
    height: 21px;
    font-family: inherit;
    border: 1px solid #7f9db9;
    border-radius: 2px;
    background: linear-gradient(to bottom, #fdfdfd, #e3e3dc);
    cursor: url(../../assets/cursors/default.cur), default;
  }
  .fd__main {
    flex: 1;
    min-height: 0;
    display: flex;
    gap: 6px;
  }
  /* 左侧“位置”栏，对应基准的 file-dialog-places-bar */
  .fd__places {
    width: 110px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .fd__place {
    padding: 3px 4px;
    cursor: url(../../assets/cursors/default.cur), default;
    &:hover {
      background-color: #e8f0fb;
    }
  }
  .fd__place--on {
    background-color: #316ac5;
    color: #fff;
  }
  .fd__list {
    flex: 1;
    min-width: 0;
    overflow: auto;
    background-color: #fff;
    border: 1px solid;
    border-color: #7f9db9 #fff #fff #7f9db9;
    padding: 2px;
  }
  .fd__empty {
    padding: 6px;
    color: #606060;
  }
  .fd__item {
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;
    padding: 2px 4px;
    font-family: inherit;
    font-size: 12px;
    text-align: left;
    border: none;
    background: transparent;
    cursor: url(../../assets/cursors/default.cur), default;
    & img {
      width: 16px;
      height: 16px;
      pointer-events: none;
    }
    &:hover {
      background-color: #e8f0fb;
    }
  }
  .fd__item--on {
    background-color: #316ac5 !important;
    color: #fff;
  }
  .fd__foot {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    flex-wrap: wrap;
  }
  .fd__field {
    display: flex;
    align-items: center;
    gap: 4px;
    &:first-child {
      flex: 1;
      min-width: 160px;
    }
  }
  .fd__field input {
    flex: 1;
    min-width: 0;
    height: 21px;
    padding: 0 4px;
    font-family: inherit;
    font-size: 12px;
    border: 1px solid;
    border-color: #7f9db9 #fff #fff #7f9db9;
  }
  .fd__field--type select {
    height: 21px;
    font-family: inherit;
    font-size: 12px;
    border: 1px solid #7f9db9;
    background-color: #fff;
  }
  .fd__buttons {
    display: flex;
    gap: 6px;
    margin-left: auto;
  }
  .fd__btn {
    min-width: 72px;
    height: 23px;
    font-family: inherit;
    font-size: 12px;
    border: 1px solid #7f9db9;
    border-radius: 2px;
    background: linear-gradient(
      to bottom,
      #fdfdfd 0%,
      #f0f0ea 45%,
      #e3e3dc 100%
    );
    cursor: url(../../assets/cursors/default.cur), default;
    &:active {
      background: linear-gradient(to bottom, #dcdcd4, #e8e8e2);
    }
  }
`;
