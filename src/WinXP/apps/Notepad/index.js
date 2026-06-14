import React, { useState } from 'react';
import styled from 'styled-components';

import { WindowDropDowns } from 'components';
import dropDownData from './dropDownData';

export default function Notepad({ onClose }) {
  const [docText, setDocText] = useState('');
  const [wordWrap, setWordWrap] = useState(false);

  function onClickOptionItem(item) {
    switch (item) {
      case '退出':
        onClose();
        break;
      case '自动换行':
        setWordWrap(!wordWrap);
        break;
      case '时间/日期':
        const date = new Date();
        setDocText(
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
      setDocText(`${docText.substring(0, start)}\t${docText.substring(end)}`);

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
                setDocText(
                  t =>
                    t +
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
