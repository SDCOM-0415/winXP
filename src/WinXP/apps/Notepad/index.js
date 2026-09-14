import React, { useState } from 'react';
import styled from 'styled-components';

import { WindowDropDowns } from 'components';
import dropDownData from './dropDownData';
import { useVfs, getNode, isEditableText } from '../../vfs';
import { VFS_WRITE_FILE } from '../../constants/actions';

/** 把用户在"打开"里输入的路径解析成 VFS 定位信息 */
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

export default function Notepad({ onClose, injectProps }) {
  const { vfs, dispatch } = useVfs();
  const initialPath =
    injectProps && injectProps.filePath ? injectProps.filePath : null;

  const [filePath, setFilePath] = useState(initialPath);
  const [docText, setDocText] = useState(() => {
    if (!initialPath) return '';
    const root = vfs.drives[initialPath.driveId];
    const dir = getNode(root, initialPath.segments);
    const node = dir && dir.contents ? dir.contents[initialPath.name] : null;
    return isEditableText(node) ? node.contents : '';
  });
  const [dirty, setDirty] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);

  function updateText(value) {
    setDocText(value);
    setDirty(true);
  }

  function save() {
    if (!filePath) {
      saveAs();
      return;
    }
    dispatch({
      type: VFS_WRITE_FILE,
      payload: { ...filePath, content: docText },
    });
    setDirty(false);
  }

  function saveAs() {
    const suggestion = filePath ? filePath.name : '新建文本文档.txt';
    const name = window.prompt('另存为（输入文件名）', suggestion);
    if (!name) return;
    const target = filePath
      ? { driveId: filePath.driveId, segments: filePath.segments }
      : { driveId: 'C:', segments: [] };
    dispatch({
      type: VFS_WRITE_FILE,
      payload: { ...target, name, content: docText },
    });
    setFilePath({ ...target, name });
    setDirty(false);
  }

  function openFile() {
    const current = filePath
      ? `${filePath.driveId}\\${[...filePath.segments, filePath.name].join(
          '\\',
        )}`
      : 'C:\\WINDOWS\\NOTEPAD.TXT';
    const input = window.prompt('打开（输入完整路径）', current);
    if (!input) return;
    const parsed = resolveUserPath(input);
    if (!parsed) return;
    const root = vfs.drives[parsed.driveId];
    const dir = getNode(root, parsed.segments);
    const node = dir && dir.contents ? dir.contents[parsed.name] : null;
    if (!node) {
      window.alert(`找不到文件：\n${input}`);
      return;
    }
    if (!isEditableText(node)) {
      window.alert('该文件不是可编辑的文本文档。');
      return;
    }
    setFilePath(parsed);
    setDocText(node.contents);
    setDirty(false);
  }

  function newFile() {
    if (dirty && window.confirm('是否保存对当前文档的更改？')) {
      save();
    }
    setFilePath(null);
    setDocText('');
    setDirty(false);
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
      case '自动换行':
        setWordWrap(!wordWrap);
        break;
      case '时间/日期':
        const date = new Date();
        updateText(
          `${docText}${date.toLocaleTimeString()} ${date.toLocaleDateString()}`,
        );
        break;
      default:
    }
  }
  function onTextAreaKeyDown(e) {
    // handle tabs in text area
    if (e.which === 9) {
      e.preventDefault();
      e.persist();
      var start = e.target.selectionStart;
      var end = e.target.selectionEnd;
      updateText(`${docText.substring(0, start)}\t${docText.substring(end)}`);

      // asynchronously update textarea selection to include tab
      // workaround due to https://github.com/facebook/react/issues/14174
      requestAnimationFrame(() => {
        e.target.selectionStart = start + 1;
        e.target.selectionEnd = start + 1;
      });
    }
  }

  return (
    <Div>
      <section className="np__toolbar">
        <WindowDropDowns items={dropDownData} onClickItem={onClickOptionItem} />
      </section>
      <div
        data-contextmenu
        style={{ flex: 'auto', display: 'flex', flexDirection: 'column' }}
      >
        <contextmenu>
          <ul>
            <li className="disabled">撤销</li>
            <li className="divider" />
            <li onClick={() => document.execCommand('cut')}>剪切</li>
            <li onClick={() => document.execCommand('copy')}>复制</li>
            <li onClick={() => document.execCommand('paste')}>粘贴</li>
            <li onClick={() => document.execCommand('delete')}>删除</li>
            <li className="divider" />
            <li
              onClick={() => {
                const ta = document.activeElement;
                if (ta) {
                  ta.select && ta.select();
                }
              }}
            >
              全选
            </li>
            <li className="divider" />
            <li
              onClick={() => {
                const date = new Date();
                updateText(
                  docText +
                    date.toLocaleTimeString() +
                    ' ' +
                    date.toLocaleDateString(),
                );
              }}
            >
              时间/日期
            </li>
          </ul>
        </contextmenu>
        <StyledTextarea
          wordWrap={wordWrap}
          value={docText}
          onChange={e => setDocText(e.target.value)}
          onKeyDown={onTextAreaKeyDown}
          spellCheck={false}
        />
      </div>
    </Div>
  );
}

const Div = styled.div`
  height: 100%;
  background: linear-gradient(to right, #edede5 0%, #ede8cd 100%);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  .np__toolbar {
    position: relative;
    height: 21px;
    flex-shrink: 0;
    border-bottom: 1px solid white;
  }
`;

const StyledTextarea = styled.textarea`
  flex: auto;
  outline: none;
  font-family: 'Lucida Console', monospace;
  font-size: 13px;
  line-height: 14px;
  resize: none;
  padding: 2px;
  ${props => (props.wordWrap ? '' : 'white-space: nowrap; overflow-x: scroll;')}
  overflow-y: scroll;
  border: 1px solid #96abff;
`;
