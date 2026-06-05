import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

function ContextMenu({ className, items, position, onClose, onClickItem }) {
  const ref = useRef();
  const [hoverIndex, setHoverIndex] = useState(-1);
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  if (!items || items.length === 0) return null;
  return (
    <div
      ref={ref}
      className={className}
      style={{ top: position.y, left: position.x }}
    >
      {items.map((item, index) => {
        if (item.type === 'separator') {
          return <div key={index} className="ctx-separator" />;
        }
        if (item.type === 'submenu') {
          return (
            <div
              key={index}
              className={`ctx-item${hoverIndex === index ? ' ctx-hover' : ''}${
                item.disabled ? ' ctx-disabled' : ''
              }`}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(-1)}
            >
              <div className="ctx-icon" />
              <div className="ctx-text">{item.text}</div>
              <div className="ctx-arrow" />
              {hoverIndex === index && (
                <div className="ctx-submenu">
                  {item.items.map((sub, si) => {
                    if (sub.type === 'separator') {
                      return <div key={si} className="ctx-separator" />;
                    }
                    return (
                      <div
                        key={si}
                        className={`ctx-item${
                          sub.disabled ? ' ctx-disabled' : ''
                        }`}
                        onClick={e => {
                          e.stopPropagation();
                          if (!sub.disabled) {
                            onClickItem(sub.text);
                            onClose();
                          }
                        }}
                      >
                        <div className="ctx-icon" />
                        <div className="ctx-text">{sub.text}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }
        return (
          <div
            key={index}
            className={`ctx-item${hoverIndex === index ? ' ctx-hover' : ''}${
              item.disabled ? ' ctx-disabled' : ''
            }`}
            onMouseEnter={() => setHoverIndex(index)}
            onClick={e => {
              e.stopPropagation();
              if (!item.disabled) {
                onClickItem(item.text);
                onClose();
              }
            }}
          >
            <div className="ctx-icon" />
            <div className="ctx-text">{item.text}</div>
          </div>
        );
      })}
    </div>
  );
}

export default styled(ContextMenu)`
  position: fixed;
  z-index: 99999;
  background: #fff;
  border: 1px solid #7f9db9;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  padding: 2px 0;
  min-width: 180px;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  .ctx-item {
    display: flex;
    align-items: center;
    height: 22px;
    padding: 0 24px 0 28px;
    cursor: default;
    white-space: nowrap;
    position: relative;
    color: #000;
  }
  .ctx-item.ctx-hover {
    background: #2f71cd;
    color: #fff;
  }
  .ctx-item.ctx-disabled {
    color: #808080;
  }
  .ctx-item.ctx-disabled.ctx-hover {
    background: transparent;
    color: #808080;
  }
  .ctx-icon {
    position: absolute;
    left: 6px;
    width: 16px;
    height: 16px;
  }
  .ctx-text {
    flex: 1;
  }
  .ctx-arrow {
    position: absolute;
    right: 6px;
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-left: 4px solid #000;
  }
  .ctx-item.ctx-hover .ctx-arrow {
    border-left-color: #fff;
  }
  .ctx-separator {
    height: 1px;
    margin: 3px 2px;
    background: #d6d2c2;
  }
  .ctx-submenu {
    position: absolute;
    left: 100%;
    top: -2px;
    background: #fff;
    border: 1px solid #7f9db9;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
    padding: 2px 0;
    min-width: 160px;
    z-index: 100000;
  }
`;
