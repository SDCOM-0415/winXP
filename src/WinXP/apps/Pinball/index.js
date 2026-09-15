import React, { useState } from 'react';
import styled from 'styled-components';

/**
 * 三维弹球。
 *
 * 游戏本体是第三方作品 SpaceCadetPinball 的 Emscripten 编译产物（见 public/pinball/NOTICE.md），
 * 放在 public/pinball/ 下，不参与打包，只在打开本应用时才请求。
 *
 * 之所以用 iframe 而不是直接挂 canvas：它是一份自带文档与输入处理的完整 Emscripten 应用，
 * 隔离在独立文档里可以避免和主应用的全局键盘处理（如屏保空闲计时）互相干扰。
 *
 * 另外它是一个 Win32 program，菜单栏（游戏/选项/帮助）由它自己在 canvas 上绘制，
 * 所以本应用不再叠加自己的菜单栏，否则会出现两条。
 */
export default function Pinball() {
  const [failed, setFailed] = useState(false);

  return (
    <Div>
      {failed ? (
        <div className="pb__error">
          <p className="pb__error__title">无法启动三维弹球</p>
          <p className="pb__error__hint">
            没有找到 <code>pinball/index.html</code>。
            <br />
            请确认构建产物中存在 <code>pinball/</code> 目录（它由{' '}
            <code>public/pinball/</code> 原样拷贝而来）。
          </p>
        </div>
      ) : (
        <iframe
          className="pb__frame"
          title="三维弹球"
          src="pinball/index.html"
          allow="fullscreen; autoplay"
          allowFullScreen
          onError={() => setFailed(true)}
        />
      )}
    </Div>
  );
}

const Div = styled.div`
  height: 100%;
  background-color: #000;
  overflow: hidden;

  .pb__frame {
    display: block;
    width: 100%;
    height: 100%;
    border: none;
  }
  .pb__error {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: #c0c0c0;
    font-size: 11px;
    text-align: center;
  }
  .pb__error__title {
    margin: 0;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
  }
  .pb__error__hint {
    margin: 0;
    line-height: 1.8;
  }
  .pb__error code {
    color: #ffe08a;
  }
`;
