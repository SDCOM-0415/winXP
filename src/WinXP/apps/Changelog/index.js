import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { marked } from 'marked';
import { WindowDropDowns } from 'components';
import dropDownData from './dropDownData';
import changelogUrl from '../../../CHANGELOG.md';

export default function Changelog({ onClose }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    fetch(`${changelogUrl}?v=${Date.now()}`)
      .then(res => res.text())
      .then(text => {
        setHtml(marked.parse(text));
      })
      .catch(err => {
        setHtml('<p>加载更新日志失败...</p>');
      });
  }, []);

  function onClickOptionItem(item) {
    switch (item) {
      case '退出':
        onClose();
        break;
      default:
    }
  }

  return (
    <Div>
      <section className="cl__toolbar">
        <WindowDropDowns items={dropDownData} onClickItem={onClickOptionItem} />
      </section>
      <Content
        className="cl__content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Div>
  );
}

const Div = styled.div`
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  .cl__toolbar {
    position: relative;
    height: 21px;
    flex-shrink: 0;
    border-bottom: 1px solid white;
    background: linear-gradient(to right, #edede5 0%, #ede8cd 100%);
  }
`;

const Content = styled.div`
  flex: auto;
  overflow: auto;
  padding: 16px 24px;
  font-family: 'Lucida Console', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #000;

  h1 {
    font-size: 18px;
    margin: 0 0 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #0058ee;
    color: #0058ee;
  }

  h2 {
    font-size: 15px;
    margin: 16px 0 8px;
    color: #003399;
  }

  h3 {
    font-size: 13px;
    margin: 10px 0 4px;
    color: #333;
  }

  ul {
    margin: 4px 0;
    padding-left: 20px;
  }

  li {
    margin: 2px 0;
  }

  code {
    background: #f0f0f0;
    padding: 1px 4px;
    border-radius: 2px;
    font-size: 12px;
    color: #c7254e;
  }

  hr {
    border: none;
    border-top: 1px solid #ccc;
    margin: 16px 0;
  }

  strong {
    color: #c00;
  }

  em {
    font-style: italic;
    color: #666;
  }
`;
