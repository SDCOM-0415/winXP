import React, { useState, useMemo } from 'react';
import styled from 'styled-components';

/**
 * 字符映射表。所有字符都直接由 Unicode 码位生成，不预置任何图片或数据表。
 * 码位区间取自 Unicode 标准的分区定义。
 */
const BLOCKS = [
  { label: '基本拉丁语', start: 0x0020, end: 0x007e },
  { label: 'Latin-1 补充', start: 0x00a0, end: 0x00ff },
  { label: '希腊语', start: 0x0391, end: 0x03c9 },
  { label: '西里尔语', start: 0x0410, end: 0x044f },
  { label: '标点符号', start: 0x2000, end: 0x206f },
  { label: '箭头', start: 0x2190, end: 0x21ff },
  { label: '数学运算符', start: 0x2200, end: 0x22ff },
  { label: '制表符', start: 0x2500, end: 0x257f },
  { label: '几何图形', start: 0x25a0, end: 0x25ff },
  { label: '杂项符号', start: 0x2600, end: 0x26ff },
  { label: '中日韩符号和标点', start: 0x3000, end: 0x303f },
  {
    label: '中日韩统一表意文字（0x4E00 起 512 字）',
    start: 0x4e00,
    end: 0x4fff,
  },
  { label: '半角及全角形式', start: 0xff01, end: 0xff5e },
];

const FONTS = [
  '宋体',
  '黑体',
  '楷体',
  'Arial',
  'Courier New',
  'Tahoma',
  'Times New Roman',
  'Verdana',
];

function toHex(code) {
  return `U+${code.toString(16).toUpperCase().padStart(4, '0')}`;
}

export default function CharacterMap({ onClose }) {
  const [blockIndex, setBlockIndex] = useState(10);
  const [font, setFont] = useState('宋体');
  const [selected, setSelected] = useState('　');
  const [copied, setCopied] = useState(false);

  const cells = useMemo(() => {
    const { start, end } = BLOCKS[blockIndex];
    const list = [];
    for (let code = start; code <= end; code += 1) {
      list.push({ code, char: String.fromCodePoint(code) });
    }
    return list;
  }, [blockIndex]);

  const selectedCode = selected ? selected.codePointAt(0) : null;

  function copy() {
    if (!selected) return;
    try {
      navigator.clipboard?.writeText(selected);
    } catch (e) {
      // 剪贴板不可用时静默忽略
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <Div>
      <div className="cm__bar">
        <label className="cm__field">
          <span>字体</span>
          <select value={font} onChange={e => setFont(e.target.value)}>
            {FONTS.map(f => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <label className="cm__field">
          <span>字符集</span>
          <select
            value={blockIndex}
            onChange={e => setBlockIndex(Number(e.target.value))}
          >
            {BLOCKS.map((b, i) => (
              <option key={b.label} value={i}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="cm__grid" style={{ fontFamily: font }}>
        {cells.map(({ code, char }) => (
          <button
            type="button"
            key={code}
            className={`cm__cell${selected === char ? ' cm__cell--on' : ''}`}
            title={toHex(code)}
            onClick={() => setSelected(char)}
            onDoubleClick={copy}
          >
            {char}
          </button>
        ))}
      </div>

      <div className="cm__foot">
        <label className="cm__pick">
          <span>复制字符</span>
          <input
            type="text"
            value={selected}
            onChange={e => setSelected(e.target.value)}
            spellCheck={false}
          />
        </label>
        <div className="cm__actions">
          <button type="button" className="cm__btn" onClick={copy}>
            复制
          </button>
          <button type="button" className="cm__btn" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>

      <div className="cm__status">
        <span>
          {selectedCode === null
            ? '请选择一个字符'
            : `字符代码: ${toHex(selectedCode)}`}
        </span>
        <span>{copied ? '已复制到剪贴板' : ''}</span>
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

  .cm__bar {
    display: flex;
    gap: 10px;
    padding: 4px 6px;
    flex-shrink: 0;
    border-bottom: 1px solid #aca899;
    box-shadow: inset 0 1px 0 #fff;
  }
  .cm__field {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .cm__field select {
    font-family: inherit;
    font-size: 11px;
    height: 20px;
    border: 1px solid #7f9db9;
    background-color: #fff;
  }
  .cm__grid {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    margin: 3px 6px;
    padding: 3px;
    background-color: #fff;
    border: 1px solid;
    border-color: #7f9db9 #fff #fff #7f9db9;
    display: grid;
    grid-template-columns: repeat(16, 1fr);
    align-content: start;
  }
  .cm__cell {
    height: 22px;
    font-family: inherit;
    font-size: 14px;
    line-height: 20px;
    border: 1px solid transparent;
    border-radius: 2px;
    background: transparent;
    padding: 0;
    cursor: url(../../assets/cursors/default.cur), default;
    &:hover {
      border-color: #7f9db9;
      background: #e8f0fb;
    }
  }
  .cm__cell--on {
    border-color: #316ac5;
    background: #cfe0f7;
  }
  .cm__foot {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 6px 4px;
    flex-shrink: 0;
  }
  .cm__pick {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }
  .cm__pick input {
    flex: 1;
    min-width: 0;
    font-family: inherit;
    font-size: 14px;
    height: 22px;
    padding: 0 4px;
    border: 1px solid;
    border-color: #7f9db9 #fff #fff #7f9db9;
    background-color: #fff;
  }
  .cm__actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }
  .cm__btn {
    font-family: inherit;
    font-size: 11px;
    height: 22px;
    min-width: 68px;
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
  .cm__status {
    display: flex;
    justify-content: space-between;
    padding: 2px 6px;
    flex-shrink: 0;
    border-top: 1px solid #aca899;
    box-shadow: inset 0 1px 0 #fff;
    color: #404040;
  }
`;
