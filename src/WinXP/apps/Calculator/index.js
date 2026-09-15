import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

import { WindowDropDowns } from 'components';
import dropDownData from './dropDownData';

const DIVIDE_BY_ZERO = '除数不能为零。';

/** 按 15 位有效数字格式化，超出则用科学计数法 */
function format(value) {
  if (!isFinite(value)) return DIVIDE_BY_ZERO;
  const rounded = Number(value.toPrecision(15));
  const text = String(rounded);
  if (
    text.length > 16 ||
    (text.indexOf('e') === -1 && Math.abs(rounded) >= 1e16)
  ) {
    return rounded.toExponential(9);
  }
  return text;
}

function compute(a, b, op) {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return b === 0 ? NaN : a / b;
    default:
      return b;
  }
}

export default function Calculator({ onClose }) {
  const [display, setDisplay] = useState('0');
  const [acc, setAcc] = useState(null);
  const [op, setOp] = useState(null);
  const [fresh, setFresh] = useState(true);
  const [memory, setMemory] = useState(0);
  const [error, setError] = useState(false);

  const current = () => (error ? 0 : Number(display));

  function reset() {
    setDisplay('0');
    setAcc(null);
    setOp(null);
    setFresh(true);
    setError(false);
  }

  function inputDigit(d) {
    if (error) {
      reset();
      setDisplay(d);
      setFresh(false);
      return;
    }
    if (fresh) {
      setDisplay(d);
      setFresh(false);
      return;
    }
    setDisplay(prev =>
      prev.replace(/[-.]/g, '').length >= 15 ? prev : prev + d,
    );
  }

  function inputDot() {
    if (error) {
      reset();
      setDisplay('0.');
      setFresh(false);
      return;
    }
    if (fresh) {
      setDisplay('0.');
      setFresh(false);
      return;
    }
    if (!display.includes('.')) setDisplay(prev => `${prev}.`);
  }

  function clearEntry() {
    if (error) {
      reset();
      return;
    }
    setDisplay('0');
    setFresh(true);
  }

  function backspace() {
    if (error || fresh) {
      if (error) reset();
      return;
    }
    setDisplay(prev => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
  }

  function negate() {
    if (error) return;
    if (display === '0') return;
    setDisplay(prev => (prev.startsWith('-') ? prev.slice(1) : `-${prev}`));
  }

  function setOperator(next) {
    if (error) reset();
    const value = current();
    if (acc !== null && op && !fresh) {
      const result = compute(acc, value, op);
      if (isNaN(result)) {
        setDisplay(DIVIDE_BY_ZERO);
        setAcc(null);
        setOp(null);
        setFresh(true);
        setError(true);
        return;
      }
      setAcc(result);
      setDisplay(format(result));
    } else {
      setAcc(value);
    }
    setOp(next);
    setFresh(true);
  }

  const equals = useCallback(() => {
    if (error) return;
    if (acc === null || !op) return;
    const result = compute(acc, Number(display), op);
    if (isNaN(result)) {
      setDisplay(DIVIDE_BY_ZERO);
      setAcc(null);
      setOp(null);
      setFresh(true);
      setError(true);
      return;
    }
    setDisplay(format(result));
    setAcc(null);
    setOp(null);
    setFresh(true);
  }, [acc, display, op, error]);

  /** 一元运算：sqrt / 1/x / % */
  function unary(kind) {
    if (error) return;
    const value = Number(display);
    let result;
    if (kind === 'sqrt') result = value < 0 ? NaN : Math.sqrt(value);
    else if (kind === 'inv') result = value === 0 ? NaN : 1 / value;
    else result = value / 100;
    if (isNaN(result)) {
      setDisplay(DIVIDE_BY_ZERO);
      setError(true);
      setFresh(true);
      return;
    }
    setDisplay(format(result));
    setFresh(true);
  }

  /** 记忆键：MC / MR / MS / M+ */
  function memoryKey(kind) {
    if (kind === 'MC') {
      setMemory(0);
      return;
    }
    if (kind === 'MR') {
      setDisplay(format(memory));
      setFresh(true);
      return;
    }
    const value = current();
    if (kind === 'MS') setMemory(value);
    else setMemory(prev => prev + value);
    setFresh(true);
  }

  function onClickOptionItem(item) {
    switch (item) {
      case '退出':
        onClose();
        break;
      case '复制': {
        const text = display;
        try {
          navigator.clipboard?.writeText(text);
        } catch (e) {
          // 剪贴板不可用时静默忽略
        }
        break;
      }
      default:
    }
  }

  // 键盘支持：数字、运算符、回车求值、Esc 清零、Backspace 退格
  useEffect(() => {
    function onKeyDown(e) {
      const k = e.key;
      if (/^[0-9]$/.test(k)) inputDigit(k);
      else if (k === '.' || k === ',') inputDot();
      else if (k === '+' || k === '-' || k === '*' || k === '/') setOperator(k);
      else if (k === 'Enter' || k === '=') equals();
      else if (k === 'Escape') reset();
      else if (k === 'Backspace') backspace();
      else if (k === 'Delete') clearEntry();
      else return;
      e.preventDefault();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const safe =
    (fn, ...args) =>
    () =>
      fn(...args);

  return (
    <Div>
      <WindowDropDowns
        items={dropDownData}
        onClickItem={onClickOptionItem}
        height={20}
      />
      <div className="calc__display">
        <span className="calc__memory">{memory === 0 ? '' : 'M'}</span>
        <span className="calc__value">{display}</span>
      </div>
      <div className="calc__pad">
        <div className="calc__padrow">
          <button
            type="button"
            className="calc__btn calc__btn--fn"
            onClick={backspace}
          >
            Backspace
          </button>
          <button
            type="button"
            className="calc__btn calc__btn--fn"
            onClick={clearEntry}
          >
            CE
          </button>
          <button
            type="button"
            className="calc__btn calc__btn--fn"
            onClick={reset}
          >
            C
          </button>
        </div>
        <div className="calc__padgrid">
          <button
            type="button"
            className="calc__btn calc__btn--mem"
            onClick={safe(memoryKey, 'MC')}
          >
            MC
          </button>
          <button
            type="button"
            className="calc__btn calc__btn--num"
            onClick={safe(inputDigit, '7')}
          >
            7
          </button>
          <button
            type="button"
            className="calc__btn calc__btn--num"
            onClick={safe(inputDigit, '8')}
          >
            8
          </button>
          <button
            type="button"
            className="calc__btn calc__btn--num"
            onClick={safe(inputDigit, '9')}
          >
            9
          </button>
          <button
            type="button"
            className="calc__btn calc__btn--op"
            onClick={safe(setOperator, '/')}
          >
            /
          </button>
          <button
            type="button"
            className="calc__btn calc__btn--num"
            onClick={safe(unary, 'sqrt')}
          >
            sqrt
          </button>

          <button
            type="button"
            className="calc__btn calc__btn--mem"
            onClick={safe(memoryKey, 'MR')}
          >
            MR
          </button>
          <button
            type="button"
            className="calc__btn calc__btn--num"
            onClick={safe(inputDigit, '4')}
          >
            4
          </button>
          <button
            type="button"
            className="calc__btn calc__btn--num"
            onClick={safe(inputDigit, '5')}
          >
            5
          </button>
          <button
            type="button"
            className="calc__btn calc__btn--num"
            onClick={safe(inputDigit, '6')}
          >
            6
          </button>
          <button
            type="button"
            className="calc__btn calc__btn--op"
            onClick={safe(setOperator, '*')}
          >
            *
          </button>
          <button
            type="button"
            className="calc__btn calc__btn--num"
            onClick={safe(unary, 'pct')}
          >
            %
          </button>

          <button
            type="button"
            className="calc__btn calc__btn--mem"
            onClick={safe(memoryKey, 'MS')}
          >
            MS
          </button>
          <button
            type="button"
            className="calc__btn calc__btn--num"
            onClick={safe(inputDigit, '1')}
          >
            1
          </button>
          <button
            type="button"
            className="calc__btn calc__btn--num"
            onClick={safe(inputDigit, '2')}
          >
            2
          </button>
          <button
            type="button"
            className="calc__btn calc__btn--num"
            onClick={safe(inputDigit, '3')}
          >
            3
          </button>
          <button
            type="button"
            className="calc__btn calc__btn--op"
            onClick={safe(setOperator, '-')}
          >
            -
          </button>
          <button
            type="button"
            className="calc__btn calc__btn--num"
            onClick={safe(unary, 'inv')}
          >
            1/x
          </button>

          <button
            type="button"
            className="calc__btn calc__btn--mem"
            onClick={safe(memoryKey, 'M+')}
          >
            M+
          </button>
          <button
            type="button"
            className="calc__btn calc__btn--num"
            onClick={safe(inputDigit, '0')}
          >
            0
          </button>
          <button
            type="button"
            className="calc__btn calc__btn--num"
            onClick={negate}
          >
            +/-
          </button>
          <button
            type="button"
            className="calc__btn calc__btn--num"
            onClick={inputDot}
          >
            .
          </button>
          <button
            type="button"
            className="calc__btn calc__btn--op"
            onClick={safe(setOperator, '+')}
          >
            +
          </button>
          <button
            type="button"
            className="calc__btn calc__btn--op"
            onClick={equals}
          >
            =
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
  font-size: 11px;
  color: #000;

  .calc__display {
    display: flex;
    align-items: center;
    margin: 0 5px 6px;
    padding: 2px 6px;
    height: 22px;
    background-color: #fff;
    border: 1px solid;
    border-color: #7f9db9 #fff #fff #7f9db9;
  }
  .calc__memory {
    width: 14px;
    color: #808080;
    font-weight: 700;
  }
  .calc__value {
    flex: 1;
    text-align: right;
    font-size: 12px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: clip;
  }
  .calc__pad {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0 5px 6px;
  }
  /* 顶行 Backspace/CE/C 跨度与下面 6 列网格对齐：Backspace 占两列宽 */
  .calc__padrow {
    display: flex;
    gap: 4px;
    height: 24px;
    flex-shrink: 0;
  }
  .calc__padrow .calc__btn--fn {
    flex: 1;
  }
  .calc__padrow .calc__btn--fn:first-child {
    flex: 2.4;
  }
  .calc__padgrid {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 40px repeat(3, 34px) 34px 46px;
    grid-auto-rows: 1fr;
    gap: 4px;
  }
  .calc__btn {
    font-family: inherit;
    font-size: 11px;
    border: 1px solid #7f9db9;
    border-radius: 2px;
    background: linear-gradient(
      to bottom,
      #fdfdfd 0%,
      #f0f0ea 45%,
      #e3e3dc 100%
    );
    padding: 0;
    cursor: url(../../assets/cursors/default.cur), default;
    &:active {
      background: linear-gradient(to bottom, #dcdcd4 0%, #e8e8e2 100%);
    }
  }
  /* 基准的算珠按钮用色：数字蓝、记忆键与清除键红、运算符红、sqrt/%/1x 用数字色 */
  .calc__btn--num {
    color: #0a246a;
    font-weight: 700;
    font-size: 12px;
  }
  .calc__btn--mem {
    color: #a00000;
  }
  .calc__btn--fn {
    color: #a00000;
  }
  .calc__btn--op {
    color: #a00000;
    font-size: 13px;
    font-weight: 700;
  }
`;
