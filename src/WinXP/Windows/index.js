import React, { useRef, memo } from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import styled from 'styled-components';

import { useElementResize } from 'hooks';
import HeaderButtons from './HeaderButtons';

function Windows({
  apps,
  onMouseDown,
  onClose,
  onMinimize,
  onMaximize,
  focusedAppId,
}) {
  return (
    <div style={{ position: 'relative', zIndex: 0 }}>
      {apps.map(app => (
        <StyledWindow
          show={!app.minimized}
          key={app.id}
          id={app.id}
          onMouseDown={onMouseDown}
          onMouseUpClose={onClose}
          onMouseUpMinimize={onMinimize}
          onMouseUpMaximize={onMaximize}
          isFocus={focusedAppId === app.id} // for styledWindow
          {...app}
        />
      ))}
    </div>
  );
}

const Window = memo(function ({
  injectProps,
  id,
  onMouseDown,
  onMouseUpClose,
  onMouseUpMinimize,
  onMouseUpMaximize,
  header,
  defaultSize,
  defaultOffset,
  resizable,
  maximized,
  component,
  zIndex,
  isFocus,
  className,
}) {
  function _onMouseDown() {
    onMouseDown(id);
  }
  function _onMouseUpClose() {
    onMouseUpClose(id);
  }
  function _onMouseUpMinimize() {
    onMouseUpMinimize(id);
  }
  function _onMouseUpMaximize() {
    if (resizable) onMouseUpMaximize(id);
  }
  function onDoubleClickHeader(e) {
    if (e.target !== dragRef.current) return;
    _onMouseUpMaximize();
  }
  const dragRef = useRef(null);
  const ref = useRef(null);
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const { offset, size } = useElementResize(ref, {
    dragRef,
    defaultOffset,
    defaultSize,
    boundary: {
      top: 1,
      right: windowWidth - 1,
      bottom: windowHeight - 31,
      left: 1,
    },
    resizable,
    resizeThreshold: 10,
  });
  let width, height, x, y;
  if (maximized) {
    width = windowWidth + 6;
    height = windowHeight - 24;
    x = -3;
    y = -3;
  } else {
    width = size.width;
    height = size.height;
    x = offset.x;
    y = offset.y;
  }
  return (
    <div
      className={className}
      ref={ref}
      onMouseDown={_onMouseDown}
      style={{
        transform: `translate(${x}px,${y}px)`,
        width: width ? `${width}px` : 'auto',
        height: height ? `${height}px` : 'auto',
        zIndex,
      }}
    >
      <div className="header__bg" />
      <header
        className="app__header"
        ref={dragRef}
        onDoubleClick={onDoubleClickHeader}
        data-contextmenu
      >
        <contextmenu>
          <ul>
            <li className="disabled">还原</li>
            <li className="disabled">移动</li>
            <li className="disabled">大小</li>
            <li className="disabled" onClick={_onMouseUpMinimize}>
              最小化
            </li>
            <li
              className={maximized ? 'disabled' : ''}
              onClick={_onMouseUpMaximize}
            >
              最大化
            </li>
            <li className="divider" />
            <li onClick={_onMouseUpClose}>关闭</li>
          </ul>
        </contextmenu>
        {!header.noIcon && (
          <img
            onDoubleClick={_onMouseUpClose}
            src={header.icon}
            alt={header.title}
            className="app__header__icon"
            draggable={false}
          />
        )}
        <div className="app__header__title">{header.title}</div>
        <HeaderButtons
          buttons={header.buttons}
          onMaximize={_onMouseUpMaximize}
          onMinimize={_onMouseUpMinimize}
          onClose={_onMouseUpClose}
          maximized={maximized}
          resizable={resizable}
          isFocus={isFocus}
        />
      </header>
      <div className="app__content">
        {component({
          onClose: _onMouseUpClose,
          onMinimize: _onMouseUpMinimize,
          isFocus,
          ...injectProps,
        })}
      </div>
    </div>
  );
});

const StyledWindow = styled(Window)`
  display: ${({ show }) => (show ? 'flex' : 'none')};
  position: absolute;
  box-sizing: border-box;
  padding: 3px;
  padding: ${({ header }) => (header.invisible ? 0 : 3)}px;
  background-color: ${({ isFocus }) =>
    isFocus ? 'var(--window-frame)' : 'var(--window-frame-inactive)'};
  border: var(--window-border-width) var(--window-border-style);
  border-color: var(--window-border-color);
  flex-direction: column;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  .header__bg {
    background: ${({ isFocus }) =>
      isFocus ? 'var(--titlebar-bg)' : 'var(--titlebar-bg-inactive)'};
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: var(--titlebar-bg-height);
    pointer-events: none;
    border-top-left-radius: 7px;
    border-top-right-radius: 7px;
    overflow: hidden;
  }
  .app__header {
    display: ${({ header }) => (header.invisible ? 'none' : 'flex')};
    height: var(--titlebar-height);
    line-height: var(--titlebar-height);
    padding: var(--titlebar-padding);
    font-family: var(--titlebar-font);
    font-weight: var(--titlebar-font-weight);
    font-size: var(--titlebar-font-size);
    letter-spacing: var(--titlebar-letter-spacing);
    text-shadow: var(--titlebar-text-shadow);
    color: var(--titlebar-text);
    position: absolute;
    left: 3px;
    right: 3px;
    align-items: center;
  }
  .app__header__icon {
    width: 15px;
    height: 15px;
    margin-left: 1px;
    margin-right: 3px;
  }
  .app__header__title {
    flex: 1;
    pointer-events: none;
    padding-right: 5px;
    letter-spacing: 0.5px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .app__content {
    flex: 1;
    position: relative;
    margin-top: 25px;
    height: calc(100% - 25px);
  }
`;

export default Windows;
