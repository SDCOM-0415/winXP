import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';

import { WindowDropDowns } from 'components';
import dropDownData from './dropDownData';
import { useVfs, getNode, isEditableText } from '../../vfs';
import { VFS_WRITE_FILE } from '../../constants/actions';

const FONTS = [
  '宋体',
  '黑体',
  '楷体',
  '仿宋',
  'Arial',
  'Courier New',
  'Tahoma',
  'Times New Roman',
  'Verdana',
];

const SIZES = [
  '8',
  '9',
  '10',
  '11',
  '12',
  '14',
  '16',
  '18',
  '20',
  '24',
  '28',
  '36',
  '48',
  '72',
];

/** 把路径串解析成 VFS 定位信息，与记事本保持一致的输入习惯 */
function resolveUserPath(input) {
  const s = String(input).trim().replace(/\//g, '\\');
  if (!s) return null;
  const m = /^([A-Za-z]):\\?(.*)$/.exec(s);
  const driveId = `${(m ? m[1] : 'C').toUpperCase()}:`;
  const rest = (m ? m[2] : s).split('\\').filter(Boolean);
  if (!rest.length) return null;
  const name = rest.pop();
  return { driveId, segments: rest, name };
}

export default function WordPad({ onClose, injectProps }) {
  const { vfs, dispatch } = useVfs();
  const initialPath =
    injectProps && injectProps.filePath ? injectProps.filePath : null;

  const editorRef = useRef(null);
  const initializedRef = useRef(false);
  const [filePath, setFilePath] = useState(initialPath);
  const [dirty, setDirty] = useState(false);

  const readFile = useCallback(
    path => {
      if (!path) return '';
      const dir = getNode(vfs.drives[path.driveId], path.segments);
      const node = dir && dir.contents ? dir.contents[path.name] : null;
      return isEditableText(node) ? node.contents : '';
    },
    [vfs],
  );

  // 只在挂载时按初始文件填一次内容。用 ref 守卫而不是空依赖数组，
  // 这样依赖列表是完整的（不会触发 exhaustive-deps 告警），
  // 同时 vfs 变化时也不会把用户正在编辑的内容冲掉
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const el = editorRef.current;
    if (el) el.innerHTML = readFile(initialPath);
  }, [readFile, initialPath]);

  function focusEditor() {
    editorRef.current?.focus();
  }

  /** 执行富文本命令，需要编辑器处于焦点状态 */
  function exec(command, value) {
    focusEditor();
    try {
      document.execCommand(command, false, value);
    } catch (e) {
      // 浏览器不支持该命令时静默忽略
    }
    setDirty(true);
  }

  function currentHtml() {
    return editorRef.current ? editorRef.current.innerHTML : '';
  }

  function save() {
    if (!filePath) {
      saveAs();
      return;
    }
    dispatch({
      type: VFS_WRITE_FILE,
      payload: { ...filePath, content: currentHtml() },
    });
    setDirty(false);
  }

  function saveAs() {
    const suggestion = filePath ? filePath.name : '新建文档.rtf';
    const name = window.prompt('另存为（输入文件名）', suggestion);
    if (!name) return;
    const target = filePath
      ? { driveId: filePath.driveId, segments: filePath.segments }
      : { driveId: 'C:', segments: [] };
    dispatch({
      type: VFS_WRITE_FILE,
      payload: { ...target, name, content: currentHtml() },
    });
    setFilePath({ ...target, name });
    setDirty(false);
  }

  function openFile() {
    const current = filePath
      ? `${filePath.driveId}\\${[...filePath.segments, filePath.name].join(
          '\\',
        )}`
      : 'C:\\Documents and Settings\\Default User\\My Documents\\文档.rtf';
    const input = window.prompt('打开（输入完整路径）', current);
    if (!input) return;
    const parsed = resolveUserPath(input);
    if (!parsed) return;
    const dir = getNode(vfs.drives[parsed.driveId], parsed.segments);
    const node = dir && dir.contents ? dir.contents[parsed.name] : null;
    if (!node) {
      window.alert(`找不到文件：\n${input}`);
      return;
    }
    if (!isEditableText(node)) {
      window.alert('该文件不是可编辑的文本文档。');
      return;
    }
    if (editorRef.current) editorRef.current.innerHTML = node.contents;
    setFilePath(parsed);
    setDirty(false);
  }

  function newFile() {
    if (dirty && window.confirm('是否保存对当前文档的更改？')) save();
    if (editorRef.current) editorRef.current.innerHTML = '';
    setFilePath(null);
    setDirty(false);
  }

  function insertDateTime() {
    const d = new Date();
    exec(
      'insertText',
      `${d.toLocaleTimeString('zh-CN')} ${d.toLocaleDateString('zh-CN')}`,
    );
  }

  function selectAll() {
    focusEditor();
    document.execCommand('selectAll');
  }

  function onClickOptionItem(item) {
    // 注意：菜单项回传的是原文，带省略号的要按原文匹配
    switch (item) {
      case '新建':
        newFile();
        break;
      case '打开...':
        openFile();
        break;
      case '保存':
        save();
        break;
      case '另存为...':
        saveAs();
        break;
      case '退出':
        if (dirty && !window.confirm('是否放弃未保存的更改？')) return;
        onClose();
        break;
      case '剪切':
        exec('cut');
        break;
      case '复制':
        exec('copy');
        break;
      case '撤销':
        exec('undo');
        break;
      case '重做':
        exec('redo');
        break;
      case '全选':
        selectAll();
        break;
      case '日期和时间...':
        insertDateTime();
        break;
      case '加粗':
        exec('bold');
        break;
      case '斜体':
        exec('italic');
        break;
      case '下划线':
        exec('underline');
        break;
      case '项目符号':
        exec('insertUnorderedList');
        break;
      case '左对齐':
        exec('justifyLeft');
        break;
      case '居中':
        exec('justifyCenter');
        break;
      case '右对齐':
        exec('justifyRight');
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
      <div className="wp__bar">
        <button type="button" className="wp__tb" onClick={newFile}>
          新建
        </button>
        <button type="button" className="wp__tb" onClick={openFile}>
          打开
        </button>
        <button type="button" className="wp__tb" onClick={save}>
          保存
        </button>
        <span className="wp__sep" />
        <button type="button" className="wp__tb" onClick={() => exec('cut')}>
          剪切
        </button>
        <button type="button" className="wp__tb" onClick={() => exec('copy')}>
          复制
        </button>
        <button type="button" className="wp__tb" onClick={() => exec('undo')}>
          撤销
        </button>
        <button type="button" className="wp__tb" onClick={() => exec('redo')}>
          重做
        </button>
        <span className="wp__sep" />
        <button type="button" className="wp__tb" onClick={insertDateTime}>
          日期和时间
        </button>
      </div>
      <div className="wp__bar wp__bar--format">
        <select
          className="wp__font"
          defaultValue="宋体"
          onChange={e => exec('fontName', e.target.value)}
        >
          {FONTS.map(f => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <select
          className="wp__size"
          defaultValue="12"
          onChange={e => {
            // execCommand 的 fontSize 只接受 1-7 档，这里按字号映射
            const pt = Number(e.target.value);
            const step =
              pt <= 10 ? 2 : pt <= 14 ? 3 : pt <= 20 ? 4 : pt <= 28 ? 5 : 6;
            exec('fontSize', String(step));
          }}
        >
          {SIZES.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="wp__sep" />
        <button
          type="button"
          className="wp__tb wp__tb--bold"
          onClick={() => exec('bold')}
        >
          B
        </button>
        <button
          type="button"
          className="wp__tb wp__tb--italic"
          onClick={() => exec('italic')}
        >
          I
        </button>
        <button
          type="button"
          className="wp__tb wp__tb--underline"
          onClick={() => exec('underline')}
        >
          U
        </button>
        <span className="wp__sep" />
        <button
          type="button"
          className="wp__tb"
          onClick={() => exec('justifyLeft')}
        >
          左对齐
        </button>
        <button
          type="button"
          className="wp__tb"
          onClick={() => exec('justifyCenter')}
        >
          居中
        </button>
        <button
          type="button"
          className="wp__tb"
          onClick={() => exec('justifyRight')}
        >
          右对齐
        </button>
        <button
          type="button"
          className="wp__tb"
          onClick={() => exec('insertUnorderedList')}
        >
          项目符号
        </button>
      </div>
      <div className="wp__page">
        <div
          className="wp__editor"
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          onInput={() => setDirty(true)}
        />
      </div>
    </Div>
  );
}

const Div = styled.div`
  height: 100%;
  background-color: #ece9d8;
  display: flex;
  flex-direction: column;
  font-size: 11px;
  color: #000;
  overflow: hidden;

  .wp__bar {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 2px 4px;
    flex-shrink: 0;
    background-color: #ece9d8;
    border-bottom: 1px solid #aca899;
    box-shadow: inset 0 1px 0 #fff;
  }
  .wp__sep {
    width: 1px;
    height: 18px;
    margin: 0 4px;
    background-color: #aca899;
    box-shadow: 1px 0 0 #fff;
  }
  .wp__tb {
    font-family: inherit;
    font-size: 11px;
    height: 20px;
    min-width: 22px;
    padding: 0 5px;
    border: 1px solid transparent;
    border-radius: 2px;
    background: transparent;
    cursor: url(../../assets/cursors/default.cur), default;
    &:hover {
      border-color: #aca899;
      background: linear-gradient(to bottom, #fdfdfd, #e3e3dc);
    }
    &:active {
      background: linear-gradient(to bottom, #dcdcd4, #e8e8e2);
    }
  }
  .wp__tb--bold {
    font-weight: 700;
  }
  .wp__tb--italic {
    font-style: italic;
  }
  .wp__tb--underline {
    text-decoration: underline;
  }
  .wp__font {
    width: 130px;
  }
  .wp__size {
    width: 54px;
  }
  .wp__font,
  .wp__size {
    font-family: inherit;
    font-size: 11px;
    height: 20px;
    border: 1px solid #7f9db9;
    background-color: #fff;
  }
  .wp__page {
    flex: 1;
    min-height: 0;
    margin: 3px;
    background-color: #fff;
    border: 1px solid;
    border-color: #7f9db9 #fff #fff #7f9db9;
    overflow: auto;
  }
  .wp__editor {
    min-height: 100%;
    padding: 4px 6px;
    outline: none;
    font-size: 12px;
    line-height: 1.5;
    word-break: break-word;
    cursor: text;
  }
`;
