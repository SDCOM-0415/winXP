import cursorLink from 'assets/cursors/link.cur';
import React from 'react';
import styled from 'styled-components';

function HeaderButtons({
  buttons,
  onMaximize,
  onMinimize,
  onClose,
  maximized,
  resizable,
  className,
}) {
  const buttonElements = {
    minimize: (
      <button
        key="minimize"
        className="header__button header__button--minimize"
        onMouseUp={onMinimize}
      />
    ),
    maximize: (
      <button
        key="maximize"
        className={`header__button ${
          maximized ? 'header__button--maximized' : 'header__button--maximize'
        } ${resizable ? '' : 'header__button--disable'}`}
        onMouseUp={onMaximize}
      />
    ),
    close: (
      <button
        key="button"
        className="header__button header__button--close"
        onMouseUp={onClose}
      />
    ),
  };

  return (
    <div className={className}>
      {buttons ? (
        buttons.map(b => buttonElements[b])
      ) : (
        <>
          {buttonElements.minimize}
          {buttonElements.maximize}
          {buttonElements.close}
        </>
      )}
    </div>
  );
}

export default styled(HeaderButtons)`
  opacity: ${({ isFocus }) => (isFocus ? 1 : 0.6)};
  height: var(--winbtn-size);
  display: flex;
  align-items: center;
  margin-top: 0;
  margin-right: 2px;
  gap: 0;
  .header__button {
    position: relative;
    width: var(--winbtn-size);
    height: var(--winbtn-size);
    margin-left: -1px;
    border: var(--winbtn-border);
    border-radius: var(--winbtn-radius);
    flex-shrink: 0;
    cursor: url(${cursorLink}), pointer;
    &:hover:active {
      filter: brightness(90%);
    }
  }
  /* 最小化/最大化用基准提供的位图绘制图标，比 CSS 画更还原 */
  .header__button--minimize,
  .header__button--maximize,
  .header__button--maximized {
    background-image: var(--winbtn-bg);
    box-shadow: var(--winbtn-shadow);
    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      image-rendering: pixelated;
    }
    &:hover {
      background-image: var(--winbtn-bg-hover);
      box-shadow: var(--winbtn-shadow-hover);
    }
  }
  .header__button--minimize:before {
    background-image: var(--winbtn-min-image);
  }
  .header__button--maximize:before {
    background-image: var(--winbtn-max-image);
  }
  /* 基准未提供 luna 的 restore 位图，最大化状态仍用 CSS 画两个叠放的方块 */
  .header__button--maximized:before {
    background-image: none;
    left: 7px;
    top: 4px;
    right: auto;
    bottom: auto;
    box-shadow: inset 0 2px var(--winbtn-glyph),
      inset 0 0 0 1px var(--winbtn-glyph);
    height: 8px;
    width: 8px;
  }
  .header__button--maximized:after {
    content: '';
    position: absolute;
    display: block;
    left: 4px;
    top: 7px;
    box-shadow: inset 0 2px var(--winbtn-glyph),
      inset 0 0 0 1px var(--winbtn-glyph), 1px -1px var(--winbtn-base-color);
    height: 8px;
    width: 8px;
    background-color: var(--winbtn-base-color);
  }
  .header__button--close {
    background-image: var(--winbtn-close-bg);
    box-shadow: var(--winbtn-close-shadow);
    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      background-image: var(--winbtn-close-image);
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      image-rendering: pixelated;
    }
    &:hover {
      background-image: var(--winbtn-close-bg-hover);
      box-shadow: var(--winbtn-close-shadow-hover);
    }
  }
  .header__button--disable {
    outline: none;
    opacity: 0.5;
  }
`;
