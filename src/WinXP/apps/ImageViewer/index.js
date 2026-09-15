import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';

import {
  useVfs,
  getNode,
  listChildren,
  isImageName,
  resolvePicture,
} from '../../vfs';

const ZOOM_MIN = 10;
const ZOOM_MAX = 400;
const ZOOM_STEP = 1.25;

export default function ImageViewer({ onClose, injectProps }) {
  const { vfs } = useVfs();
  const filePath =
    injectProps && injectProps.filePath ? injectProps.filePath : null;

  const positionedRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [fit, setFit] = useState(true);
  const [rotate, setRotate] = useState(0);

  /** 同目录下的所有图片，作为上一张/下一张的浏览序列 */
  const list = useCallback(() => {
    if (!filePath) return [];
    const dir = getNode(vfs.drives[filePath.driveId], filePath.segments);
    return listChildren(dir)
      .filter(({ name }) => isImageName(name))
      .map(({ name, node }) => ({
        name,
        url: resolvePicture(node.contents),
      }));
  }, [vfs, filePath])();

  // 打开时定位到传入的那张图。用 ref 守卫保证只定位一次，
  // 而依赖列表写完整（避免 exhaustive-deps 告警）
  useEffect(() => {
    if (positionedRef.current || !filePath) return;
    positionedRef.current = true;
    const at = list.findIndex(item => item.name === filePath.name);
    if (at >= 0) setIndex(at);
  }, [list, filePath]);

  const current = list[index] || null;
  const src = current ? current.url : null;

  /**
   * 缩放语义：最佳适应交给 CSS 的 max-width/max-height 完成（scale 固定为 1）；
   * 其余模式去掉尺寸约束，按真实像素比例缩放，这样 100% 就是真正的实际大小。
   */
  const scale = fit ? 1 : zoom / 100;

  function go(step) {
    if (list.length < 2) return;
    setIndex(prev => (prev + step + list.length) % list.length);
    setFit(true);
    setZoom(100);
    setRotate(0);
  }

  function zoomBy(factor) {
    setFit(false);
    setZoom(prev =>
      Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(prev * factor))),
    );
  }

  return (
    <Div>
      <div className="iv__stage">
        {src ? (
          <img
            className={`iv__img${fit ? '' : ' iv__img--natural'}`}
            src={src}
            alt={current ? current.name : ''}
            draggable={false}
            style={{
              transform: `rotate(${rotate}deg) scale(${scale})`,
              imageRendering: scale > 1 ? 'pixelated' : 'auto',
            }}
          />
        ) : (
          <div className="iv__empty">
            <p className="iv__empty__title">无法显示此图片</p>
            <p className="iv__empty__hint">
              {current
                ? `文件「${current.name}」没有在项目资源里找到对应的图片文件。`
                : '没有传入要查看的图片。'}
            </p>
          </div>
        )}
      </div>

      <div className="iv__bar">
        <button
          type="button"
          className="iv__btn"
          onClick={() => go(-1)}
          disabled={list.length < 2}
          title="上一张"
        >
          ‹
        </button>
        <button
          type="button"
          className="iv__btn"
          onClick={() => go(1)}
          disabled={list.length < 2}
          title="下一张"
        >
          ›
        </button>
        <span className="iv__sep" />
        <button
          type="button"
          className="iv__btn iv__btn--wide"
          onClick={() => zoomBy(ZOOM_STEP)}
          title="放大"
        >
          放大
        </button>
        <button
          type="button"
          className="iv__btn iv__btn--wide"
          onClick={() => zoomBy(1 / ZOOM_STEP)}
          title="缩小"
        >
          缩小
        </button>
        <button
          type="button"
          className="iv__btn iv__btn--wide"
          onClick={() => {
            setFit(false);
            setZoom(100);
          }}
          title="实际大小"
        >
          实际大小
        </button>
        <button
          type="button"
          className="iv__btn iv__btn--wide"
          onClick={() => setFit(true)}
          title="最佳适应"
        >
          最佳适应
        </button>
        <span className="iv__sep" />
        <button
          type="button"
          className="iv__btn iv__btn--wide"
          onClick={() => setRotate(prev => (prev + 90) % 360)}
          title="顺时针旋转"
        >
          顺时针
        </button>
        <button
          type="button"
          className="iv__btn iv__btn--wide"
          onClick={() => setRotate(prev => (prev + 270) % 360)}
          title="逆时针旋转"
        >
          逆时针
        </button>
        <span className="iv__sep" />
        <button
          type="button"
          className="iv__btn"
          onClick={onClose}
          title="关闭"
        >
          ✕
        </button>
      </div>

      <div className="iv__status">
        <span className="iv__name">
          {current ? current.name : '图片和传真查看器'}
          {list.length > 1 ? ` （${index + 1}/${list.length}）` : ''}
        </span>
        <span>
          {fit ? '最佳适应' : `${zoom}%`}
          {rotate ? `　旋转 ${rotate}°` : ''}
        </span>
      </div>
    </Div>
  );
}

const Div = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ece9d8;
  font-size: 11px;
  color: #000;
  overflow: hidden;

  .iv__stage {
    flex: 1;
    min-height: 0;
    margin: 3px;
    background-color: #fff;
    border: 1px solid;
    border-color: #7f9db9 #fff #fff #7f9db9;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .iv__img {
    max-width: 100%;
    max-height: 100%;
    user-select: none;
  }
  .iv__img--natural {
    max-width: none;
    max-height: none;
  }
  .iv__empty {
    text-align: center;
    color: #404040;
    padding: 0 24px;
  }
  .iv__empty__title {
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 700;
  }
  .iv__empty__hint {
    margin: 0;
    line-height: 1.6;
  }
  .iv__bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 3px 6px;
    flex-shrink: 0;
  }
  .iv__sep {
    width: 1px;
    height: 18px;
    margin: 0 4px;
    background-color: #aca899;
    box-shadow: 1px 0 0 #fff;
  }
  .iv__btn {
    font-family: inherit;
    font-size: 11px;
    width: 26px;
    height: 22px;
    border: 1px solid #7f9db9;
    border-radius: 3px;
    background: linear-gradient(
      to bottom,
      #fdfdfd 0%,
      #f0f0ea 45%,
      #e3e3dc 100%
    );
    cursor: url(../../assets/cursors/default.cur), default;
    &:hover:not(:disabled) {
      background: linear-gradient(
        to bottom,
        #ffffff,
        #eaf2fd 45%,
        #d6e4f8 100%
      );
    }
    &:active:not(:disabled) {
      background: linear-gradient(to bottom, #dcdcd4, #e8e8e2);
    }
    &:disabled {
      color: #a0a0a0;
      cursor: default;
    }
  }
  .iv__btn--wide {
    width: auto;
    padding: 0 7px;
  }
  .iv__status {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 2px 6px;
    flex-shrink: 0;
    border-top: 1px solid #aca899;
    box-shadow: inset 0 1px 0 #fff;
    color: #404040;
  }
  .iv__name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;
