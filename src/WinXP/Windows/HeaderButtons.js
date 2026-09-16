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
  height: 21px;
  display: flex;
  align-items: center;
  margin-top: 0;
  margin-right: 2px;
  gap: 2px;
  .header__button {
    position: relative;
    width: 21px;
    height: 21px;
    border: var(--winbtn-border);
    border-radius: var(--winbtn-radius);
    flex-shrink: 0;
    cursor: url(${cursorLink}), pointer;
    &:hover {
      filter: brightness(120%);
    }
    &:hover:active {
      filter: brightness(90%);
    }
  }
  .header__button--minimize {
    box-shadow: var(--winbtn-shadow);
    background-image: var(--winbtn-bg);
    &:before {
      content: '';
      position: absolute;
      left: 4px;
      top: 13px;
      height: 3px;
      width: 8px;
      background-color: var(--winbtn-glyph);
    }
  }
  .header__button--maximize {
    box-shadow: var(--winbtn-shadow);
    background-image: var(--winbtn-bg);
    &:before {
      content: '';
      position: absolute;
      display: block;
      left: 4px;
      top: 4px;
      box-shadow: inset 0 3px var(--winbtn-glyph),
        inset 0 0 0 1px var(--winbtn-glyph);
      height: 12px;
      width: 12px;
    }
  }
  .header__button--maximized {
    box-shadow: var(--winbtn-shadow);
    background-image: var(--winbtn-bg);
    &:before {
      content: '';
      position: absolute;
      display: block;
      left: 7px;
      top: 4px;
      box-shadow: inset 0 2px var(--winbtn-glyph),
        inset 0 0 0 1px var(--winbtn-glyph);
      height: 8px;
      width: 8px;
    }
    &:after {
      content: '';
      position: absolute;
      display: block;
      left: 4px;
      top: 7px;
      box-shadow: inset 0 2px var(--winbtn-glyph),
        inset 0 0 0 1px var(--winbtn-glyph), 1px -1px var(--winbtn-bg);
      height: 8px;
      width: 8px;
      background-color: var(--winbtn-bg);
    }
  }
  .header__button--close {
    box-shadow: var(--winbtn-close-shadow);
    background-image: var(--winbtn-close-bg);
    &:before {
      content: '';
      position: absolute;
      left: 9px;
      top: 2px;
      transform: rotate(45deg);
      height: 16px;
      width: 2px;
      background-color: var(--winbtn-glyph);
    }
    &:after {
      content: '';
      position: absolute;
      left: 9px;
      top: 2px;
      transform: rotate(-45deg);
      height: 16px;
      width: 2px;
      background-color: var(--winbtn-glyph);
    }
  }
  .header__button--disable {
    outline: none;
    opacity: 0.5;
    &:hover {
      filter: brightness(100%);
    }
  }
`;
