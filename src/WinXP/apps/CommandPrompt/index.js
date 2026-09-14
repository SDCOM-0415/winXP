import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

import { useVfs, getNode, listChildren } from '../../vfs';
import { VFS_CREATE_FOLDER, VFS_DELETE } from '../../constants/actions';

/** Windows XP 命令提示符的版本横幅 */
const BANNER = [
  'Microsoft Windows XP [版本 5.1.2600]',
  '(C) 版权所有 1985-2001 Microsoft Corp.',
  '',
];

const HELP = [
  '可用命令：',
  '  HELP     显示本帮助',
  '  DIR      列出当前目录的文件和子目录',
  '  CD       切换目录（CD .. 返回上级，CD \\ 回到驱动器根目录）',
  '  TREE     以树形显示目录结构',
  '  TYPE     显示文本文件的内容',
  '  MD       创建目录',
  '  RD       删除目录',
  '  DEL      删除文件',
  '  ECHO     显示消息',
  '  VER      显示 Windows 版本',
  '  DATE     显示当前日期',
  '  TIME     显示当前时间',
  '  CLS      清屏',
  '  EXIT     关闭命令提示符',
  '',
];

function CommandPrompt({ onClose }) {
  const { driveRoot, dispatch } = useVfs();

  const [cwd, setCwd] = useState({ driveId: 'C:', segments: [] });
  const [lines, setLines] = useState(BANNER);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [histIndex, setHistIndex] = useState(-1);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /** 当前目录节点 */
  const node = () => getNode(driveRoot(cwd.driveId), cwd.segments);

  /** 提示符，例如 C:\Documents and Settings> */
  const prompt = () =>
    `${cwd.driveId}\\${cwd.segments.length ? cwd.segments.join('\\') : ''}>`;

  const print = (...out) => setLines(prev => [...prev, ...out]);

  /** 把用户输入的一串路径解析成 { driveId, segments, name } */
  function resolveArg(arg) {
    const raw = String(arg).trim().replace(/\//g, '\\');
    if (!raw) return null;
    const abs = /^([A-Za-z]):\\?(.*)$/.exec(raw);
    if (abs) {
      const driveId = `${abs[1].toUpperCase()}:`;
      const parts = abs[2].split('\\').filter(Boolean);
      const name = parts.pop();
      return { driveId, segments: parts, name };
    }
    return { driveId: cwd.driveId, segments: cwd.segments, name: raw };
  }

  function run(raw) {
    const line = raw.trim();
    print(`${prompt()}${raw}`);
    if (!line) return;

    const [cmdRaw, ...args] = line.split(/\s+/);
    const cmd = cmdRaw.toUpperCase();
    const arg = args.join(' ');

    switch (cmd) {
      case 'HELP':
        print(...HELP);
        return;

      case 'CLS':
        setLines([]);
        return;

      case 'EXIT':
        onClose();
        return;

      case 'VER':
        print('', 'Microsoft Windows XP [版本 5.1.2600]', '');
        return;

      case 'DATE':
        print(
          `当前日期: ${new Date().toLocaleDateString('zh-CN', {
            timeZone: 'Asia/Shanghai',
          })}`,
        );
        print('');
        return;

      case 'TIME':
        print(
          `当前时间: ${new Date().toLocaleTimeString('zh-CN', {
            timeZone: 'Asia/Shanghai',
          })}`,
        );
        print('');
        return;

      case 'ECHO':
        print(arg || 'ECHO 处于打开状态。');
        return;

      case 'DIR': {
        const dir = node();
        if (!dir || dir.type !== 'directory') {
          print('系统找不到指定的路径。', '');
          return;
        }
        const children = listChildren(dir);
        print(` 驱动器 ${cwd.driveId} 中的卷没有标签。`);
        print(` 卷的序列号是 0000-0000`);
        print('');
        print(
          ` ${cwd.driveId}\\${
            cwd.segments.length ? cwd.segments.join('\\') : ''
          } 的目录`,
        );
        print('');
        if (!children.length) {
          print(' 这个文件夹是空的。', '');
          return;
        }
        children.forEach(({ name, node: child }) => {
          const stamp = child.modified
            ? new Date(child.modified).toLocaleString('zh-CN', {
                timeZone: 'Asia/Shanghai',
                hour12: false,
              })
            : '            ';
          const kind = child.type === 'directory' ? '<DIR>' : '     ';
          print(`${stamp}  ${kind}        ${name}`);
        });
        print('');
        const files = children.filter(c => c.node.type !== 'directory').length;
        const dirs = children.length - files;
        print(
          `              ${files} 个文件`,
          `              ${dirs} 个目录`,
          '',
        );
        return;
      }

      case 'CD': {
        if (!arg) {
          print(
            `${cwd.driveId}\\${
              cwd.segments.length ? cwd.segments.join('\\') : ''
            }`,
          );
          return;
        }
        const target = arg.trim();
        if (target === '..') {
          if (!cwd.segments.length) return;
          setCwd(c => ({ ...c, segments: c.segments.slice(0, -1) }));
          return;
        }
        if (target === '\\' || target === '/') {
          setCwd(c => ({ ...c, segments: [] }));
          return;
        }
        const resolved = resolveArg(target);
        if (!resolved) return;
        const found = getNode(driveRoot(resolved.driveId), [
          ...resolved.segments,
          resolved.name,
        ]);
        if (!found || found.type !== 'directory') {
          print('系统找不到指定的路径。', '');
          return;
        }
        setCwd({
          driveId: resolved.driveId,
          segments: [...resolved.segments, resolved.name],
        });
        return;
      }

      case 'TREE': {
        const dir = node();
        if (!dir) {
          print('系统找不到指定的路径。', '');
          return;
        }
        print(`文件夹 PATH 列表`, `卷序列号为 0000-0000`, '');
        const walk = (nd, prefix) => {
          const kids = listChildren(nd);
          kids.forEach(({ name, node: child }, i) => {
            const last = i === kids.length - 1;
            print(`${prefix}${last ? '└─' : '├─'}${name}`);
            if (child.type === 'directory') {
              walk(child, `${prefix}${last ? '  ' : '│ '}`);
            }
          });
        };
        walk(dir, '');
        print('');
        return;
      }

      case 'TYPE': {
        const resolved = resolveArg(arg);
        if (!resolved) {
          print('命令语法不正确。', '');
          return;
        }
        const dir = getNode(driveRoot(resolved.driveId), resolved.segments);
        const file = dir && dir.contents ? dir.contents[resolved.name] : null;
        if (!file) {
          print('系统找不到指定的文件。', '');
          return;
        }
        if (typeof file.contents !== 'string') {
          print('无法读取该文件的内容。', '');
          return;
        }
        print(...String(file.contents).split('\n'));
        return;
      }

      case 'MD':
      case 'MKDIR': {
        const resolved = resolveArg(arg);
        if (!resolved || !resolved.name) {
          print('命令语法不正确。', '');
          return;
        }
        dispatch({
          type: VFS_CREATE_FOLDER,
          payload: {
            driveId: resolved.driveId,
            segments: resolved.segments,
            name: resolved.name,
          },
        });
        return;
      }

      case 'RD':
      case 'RMDIR': {
        const resolved = resolveArg(arg);
        if (!resolved || !resolved.name) {
          print('命令语法不正确。', '');
          return;
        }
        const dir = getNode(driveRoot(resolved.driveId), resolved.segments);
        const target = dir && dir.contents ? dir.contents[resolved.name] : null;
        if (!target) {
          print('系统找不到指定的文件。', '');
          return;
        }
        if (target.type !== 'directory') {
          print('目录名无效。', '');
          return;
        }
        dispatch({
          type: VFS_DELETE,
          payload: {
            driveId: resolved.driveId,
            segments: resolved.segments,
            name: resolved.name,
          },
        });
        return;
      }

      case 'DEL':
      case 'ERASE': {
        const resolved = resolveArg(arg);
        if (!resolved || !resolved.name) {
          print('命令语法不正确。', '');
          return;
        }
        const dir = getNode(driveRoot(resolved.driveId), resolved.segments);
        const target = dir && dir.contents ? dir.contents[resolved.name] : null;
        if (!target) {
          print('找不到 ' + arg, '');
          return;
        }
        if (target.type === 'directory') {
          print('拒绝访问。', '');
          return;
        }
        dispatch({
          type: VFS_DELETE,
          payload: {
            driveId: resolved.driveId,
            segments: resolved.segments,
            name: resolved.name,
          },
        });
        return;
      }

      default:
        print(
          `'${cmdRaw}' 不是内部或外部命令，也不是可运行的程序或批处理文件。`,
          '',
        );
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      const value = input;
      setHistory(h => (value.trim() ? [...h, value] : h));
      setHistIndex(-1);
      setInput('');
      run(value);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      const next =
        histIndex < 0 ? history.length - 1 : Math.max(0, histIndex - 1);
      setHistIndex(next);
      setInput(history[next]);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIndex < 0) return;
      const next = histIndex + 1;
      if (next >= history.length) {
        setHistIndex(-1);
        setInput('');
      } else {
        setHistIndex(next);
        setInput(history[next]);
      }
      return;
    }
    if (e.key === 'c' && e.ctrlKey) {
      print(`${prompt()}${input}^C`);
      setInput('');
      setHistIndex(-1);
    }
  }

  return (
    <Div onClick={() => inputRef.current?.focus()}>
      <div className="cmd__screen" ref={scrollRef}>
        {lines.map((l, i) => (
          <div key={i} className="cmd__line">
            {l || '\u00a0'}
          </div>
        ))}
        <div className="cmd__line cmd__line--input">
          <span className="cmd__prompt">{prompt()}</span>
          <input
            ref={inputRef}
            className="cmd__input"
            value={input}
            spellCheck={false}
            autoComplete="off"
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>
      </div>
    </Div>
  );
}

const Div = styled.div`
  height: 100%;
  background: #000;
  color: #c0c0c0;
  font-family: 'Lucida Console', 'Courier New', monospace;
  font-size: 12px;
  line-height: 15px;
  overflow: hidden;
  .cmd__screen {
    height: 100%;
    overflow-y: auto;
    padding: 2px 4px;
    scrollbar-width: thin;
  }
  .cmd__line {
    white-space: pre-wrap;
    word-break: break-all;
  }
  .cmd__line--input {
    display: flex;
    align-items: center;
  }
  .cmd__prompt {
    white-space: pre;
  }
  .cmd__input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    color: inherit;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    padding: 0;
    caret-color: #c0c0c0;
  }
`;

export default CommandPrompt;
