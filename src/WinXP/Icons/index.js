import React, {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import styled from 'styled-components';

/** 初始布局用网格：一列放满（按视口高度）就换下一列，
    否则图标多了会一路排到屏幕外，看起来像"新建没有效果" */
function getInitialPositions(icons) {
  const rows = Math.max(1, Math.floor((window.innerHeight - 40) / 75));
  const positions = {};
  icons.forEach((icon, index) => {
    const col = Math.floor(index / rows);
    const row = index % rows;
    positions[icon.id] = { x: col * 80, y: row * 75 };
  });
  return positions;
}

const Icons = forwardRef(function Icons(
  {
    icons,
    onMouseDown,
    onDoubleClick,
    displayFocus,
    mouse,
    selecting,
    setSelectedIcons,
    onRename,
  },
  ref,
) {
  const [iconsRect, setIconsRect] = useState([]);
  const [iconPositions, setIconPositions] = useState(() =>
    getInitialPositions(icons),
  );
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [renamingId, setRenamingId] = useState(null);

  // 右键「重命名」时全局处理器广播 winxp:begin-rename，
  // 由持有该项的组件就地渲染输入框（XP 的做法），不再弹浏览器提示框
  useEffect(() => {
    function onBeginRename(e) {
      const target = e.detail || {};
      // 只按名字匹配：桌面条目名唯一，避免 driveId/segments 写法的细微差异导致匹配失败
      const hit = icons.find(
        ic => ic.vfsPath && ic.vfsPath.name === target.name,
      );
      if (hit) setRenamingId(hit.id);
    }
    window.addEventListener('winxp:begin-rename', onBeginRename);
    return () =>
      window.removeEventListener('winxp:begin-rename', onBeginRename);
  }, [icons]);

  function commitRename(icon, newName) {
    setRenamingId(null);
    const name = String(newName || '').trim();
    if (!name || !icon.vfsPath || name === icon.vfsPath.name) return;
    if (onRename) onRename({ ...icon.vfsPath, newName: name });
  }

  useImperativeHandle(ref, () => ({
    resetPositions: () => setIconPositions(getInitialPositions(icons)),
    /** 重命名后图标的 id 会跟着变（vfs:旧名 → vfs:新名），
        把原位置迁移到新 id，否则图标会被当成新图标排到别的格子 */
    migratePosition: (oldId, newId) => {
      setIconPositions(prev => {
        if (prev[newId] !== undefined || prev[oldId] === undefined) return prev;
        const next = { ...prev, [newId]: prev[oldId] };
        delete next[oldId];
        return next;
      });
    },
    /** 按名称排序并重新排布 */
    arrangeByName: () => {
      const sorted = [...icons].sort((a, b) =>
        String(a.title).localeCompare(String(b.title), 'zh-Hans-CN'),
      );
      const next = {};
      sorted.forEach((icon, index) => {
        next[icon.id] = { x: 0, y: index * 75 };
      });
      setIconPositions(next);
    },
    /** 保持当前相对位置，对齐到网格 */
    autoArrange: () => {
      setIconPositions(prev => {
        const ordered = [...icons].sort((a, b) => {
          const pa = prev[a.id] || { x: 0, y: 0 };
          const pb = prev[b.id] || { x: 0, y: 0 };
          return pa.x - pb.x || pa.y - pb.y;
        });
        const next = {};
        ordered.forEach((icon, index) => {
          next[icon.id] = { x: 0, y: index * 75 };
        });
        return next;
      });
    },
  }));

  function measure(rect) {
    if (iconsRect.find(r => r.id === rect.id)) return;
    setIconsRect(iconsRect => [...iconsRect, rect]);
  }

  useEffect(() => {
    if (!selecting) return;
    const sx = Math.min(selecting.x, mouse.docX);
    const sy = Math.min(selecting.y, mouse.docY);
    const sw = Math.abs(selecting.x - mouse.docX);
    const sh = Math.abs(selecting.y - mouse.docY);
    const selectedIds = iconsRect
      .filter(rect => {
        const { x, y, w, h } = rect;
        return x - sx < sw && sx - x < w && y - sy < sh && sy - y < h;
      })
      .map(icon => icon.id);
    setSelectedIcons(selectedIds);
  }, [iconsRect, setSelectedIcons, selecting, mouse.docX, mouse.docY]);

  useEffect(() => {
    if (draggingId === null) return;

    function handleMouseMove(e) {
      const newX = e.clientX - dragOffset.x - 10; // 10 is IconsContainer margin-left
      const newY = e.clientY - dragOffset.y - 10; // 10 is IconsContainer margin-top

      setIconPositions(prev => ({
        ...prev,
        [draggingId]: { x: newX, y: newY },
      }));

      // Update iconsRect for selection
      setIconsRect(prev =>
        prev.map(rect => {
          if (rect.id === draggingId) {
            return {
              ...rect,
              x: e.clientX - dragOffset.x,
              y: e.clientY - dragOffset.y,
            };
          }
          return rect;
        }),
      );
    }

    function handleMouseUp() {
      setDraggingId(null);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, dragOffset]);

  // 新出现的图标（例如桌面右键新建出来的）放到第一个空闲的网格位，
  // 一列放满就换下一列 —— 之前是无限往首列下方追加，图标会跑出屏幕，
  // 用户就会以为"新建没有效果"
  useEffect(() => {
    setIconPositions(prev => {
      const missing = icons.filter(icon => prev[icon.id] === undefined);
      if (!missing.length) return prev;
      // 以 80x75 的格子为一份，把已有图标占用的格子记下来
      const occupied = new Set(
        Object.values(prev).map(
          pos => `${Math.round(pos.x / 80)}:${Math.round(pos.y / 75)}`,
        ),
      );
      // 视口高度减去任务栏与边距，得到一列能放几行
      const rows = Math.max(1, Math.floor((window.innerHeight - 40) / 75));
      const next = { ...prev };
      let col = 0;
      let row = 0;
      missing.forEach(icon => {
        while (occupied.has(`${col}:${row}`)) {
          row += 1;
          if (row >= rows) {
            row = 0;
            col += 1;
          }
        }
        occupied.add(`${col}:${row}`);
        next[icon.id] = { x: col * 80, y: row * 75 };
        row += 1;
        if (row >= rows) {
          row = 0;
          col += 1;
        }
      });
      return next;
    });
  }, [icons]);

  function handleIconMouseDown(e, id) {
    const el = e.currentTarget;
    if (!el) return;
    onMouseDown(id);
    setDraggingId(id);
    const rect = el.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  return (
    <IconsContainer>
      {icons.map(icon => (
        <StyledIcon
          key={icon.id}
          {...icon}
          displayFocus={displayFocus}
          onMouseDown={e => handleIconMouseDown(e, icon.id)}
          onDoubleClick={() => onDoubleClick(icon)}
          measure={measure}
          isRenaming={renamingId === icon.id}
          onRenameCommit={newName => commitRename(icon, newName)}
          onRenameCancel={() => setRenamingId(null)}
          style={{
            position: 'absolute',
            left: iconPositions[icon.id]?.x || 0,
            top: iconPositions[icon.id]?.y || 0,
          }}
        />
      ))}
    </IconsContainer>
  );
});

function Icon({
  title,
  onMouseDown,
  onDoubleClick,
  icon,
  className,
  id,
  measure,
  style,
  isFocus,
  displayFocus,
  vfsPath,
  isRenaming,
  onRenameCommit,
  onRenameCancel,
}) {
  const ref = useRef(null);
  const inputRef = useRef(null);
  const doneRef = useRef(false);

  // 进入重命名时自动聚焦并全选，与 XP 一样就地编辑，不用浏览器提示框
  useEffect(() => {
    if (!isRenaming) return;
    doneRef.current = false;
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.select();
  }, [isRenaming]);

  function _onMouseDown(e) {
    onMouseDown(e);
  }
  function _onDoubleClick() {
    onDoubleClick();
  }
  useEffect(() => {
    const target = ref.current;
    if (!target) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const posX = left + window.scrollX;
    const posY = top + window.scrollY;
    measure({ id, x: posX, y: posY, w: width, h: height });
  }, [id, measure]);
  return (
    <div
      className={className}
      onMouseDown={_onMouseDown}
      onDoubleClick={_onDoubleClick}
      ref={ref}
      style={style}
      data-contextmenu
    >
      <contextmenu>
        <ul>
          <li data-action="open" data-icon-id={id}>
            打开
          </li>
          <li className="divider" />
          <li className="disabled">剪切</li>
          <li className="disabled">复制</li>
          <li className="divider" />
          <li className="disabled">创建快捷方式</li>
          <li
            className={vfsPath ? '' : 'disabled'}
            data-vfs="delete"
            data-drive={vfsPath ? vfsPath.driveId : ''}
            data-path={JSON.stringify(vfsPath ? vfsPath.segments : [])}
            data-name={vfsPath ? vfsPath.name : ''}
          >
            删除
          </li>
          <li
            className={vfsPath ? '' : 'disabled'}
            data-vfs="rename"
            data-drive={vfsPath ? vfsPath.driveId : ''}
            data-path={JSON.stringify(vfsPath ? vfsPath.segments : [])}
            data-name={vfsPath ? vfsPath.name : ''}
          >
            重命名
          </li>
          <li className="divider" />
          <li className="disabled">属性</li>
        </ul>
      </contextmenu>
      <div className={`${className}__img__container`}>
        <img src={icon} alt={title} className={`${className}__img`} />
      </div>
      <div className={`${className}__text__container`}>
        {isRenaming ? (
          <input
            ref={inputRef}
            className={`${className}__rename`}
            defaultValue={title}
            spellCheck={false}
            onMouseDown={e => e.stopPropagation()}
            onDoubleClick={e => e.stopPropagation()}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                doneRef.current = true;
                onRenameCommit(e.target.value);
              } else if (e.key === 'Escape') {
                e.preventDefault();
                doneRef.current = true;
                onRenameCancel();
              }
            }}
            onBlur={e => {
              // Enter/Esc 已处理过就不再重复提交
              if (doneRef.current) return;
              // 参考站的做法：blur 后延迟约 100ms 再提交。
              // 立即提交的话，用户点到别处时可能提交还没发生就被清理掉
              const value = e.target.value;
              setTimeout(() => {
                if (doneRef.current) return;
                doneRef.current = true;
                onRenameCommit(value);
              }, 100);
            }}
          />
        ) : (
          <div className={`${className}__text`}>{title}</div>
        )}
      </div>
    </div>
  );
}

const IconsContainer = styled.div`
  position: absolute;
  margin-top: 10px;
  margin-left: 10px;
`;

const StyledIcon = styled(Icon)`
  width: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  &__text__container {
    width: 100%;
    font-size: 10px;
    color: white;
    text-shadow: 0 1px 1px black;
    margin-top: 5px;
    display: flex;
    justify-content: center;

    &:before {
      content: '';
      display: block;
      flex-grow: 1;
    }
    &:after {
      content: '';
      display: block;
      flex-grow: 1;
    }
  }
  &__text {
    padding: 0 3px 2px;
    background-color: ${({ isFocus, displayFocus }) =>
      isFocus && displayFocus ? '#0b61ff' : 'transparent'};
    outline: ${({ isFocus, displayFocus }) =>
      isFocus && displayFocus ? '1px dotted #000000' : 'none'};
    outline-offset: -1px;
    text-align: center;
    flex-shrink: 1;
  }
  &__rename {
    width: auto;
    min-width: 60px;
    max-width: 150px;
    padding: 1px 2px;
    font-family: inherit;
    font-size: 10px;
    color: #000;
    background-color: #fff;
    border: 1px solid #000;
    text-shadow: none;
    outline: none;
    text-align: left;
  }
  &__img__container {
    width: 30px;
    height: 30px;
    filter: ${({ isFocus, displayFocus }) =>
      isFocus && displayFocus ? 'drop-shadow(0 0 blue)' : ''};
  }
  &__img {
    width: 30px;
    height: 30px;
    opacity: ${({ isFocus, displayFocus }) =>
      isFocus && displayFocus ? 0.5 : 1};
  }
`;

export default Icons;
