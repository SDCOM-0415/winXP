import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

/**
 * 屏保。
 * 支持三种效果：三维星空 / 气泡 / 字幕。
 * 任意鼠标移动、点击、滚轮或按键即退出 —— 与真实 XP 行为一致。
 */

const MARQUEE_TEXT = 'Windows XP';

function Screensaver({ type = 'starfield', onDismiss }) {
  const canvasRef = useRef(null);
  const [armed, setArmed] = useState(false);

  // 触发屏保的那次鼠标移动不应立刻把它关掉，延迟一小段时间再接受输入
  useEffect(() => {
    const t = window.setTimeout(() => setArmed(true), 300);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!armed) return undefined;
    const events = ['mousemove', 'mousedown', 'wheel', 'keydown', 'touchstart'];
    const dismiss = () => onDismiss && onDismiss();
    events.forEach(ev => window.addEventListener(ev, dismiss, true));
    return () => {
      events.forEach(ev => window.removeEventListener(ev, dismiss, true));
    };
  }, [armed, onDismiss]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let w = 0;
    let h = 0;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const cx = () => w / 2;
    const cy = () => h / 2;
    const rand = (min, max) => min + Math.random() * (max - min);

    // 三维星空：z 轴推进，越近越大越亮
    let stars = [];
    function initStars() {
      stars = Array.from({ length: 320 }, () => ({
        x: rand(-w, w),
        y: rand(-h, h),
        z: rand(1, w),
      }));
    }
    initStars();

    // 气泡：自下而上漂浮
    let bubbles = [];
    function initBubbles() {
      bubbles = Array.from({ length: 60 }, () => ({
        x: rand(0, w),
        y: rand(0, h),
        r: rand(8, 46),
        vy: rand(0.3, 1.4),
        phase: rand(0, Math.PI * 2),
      }));
    }
    initBubbles();

    let marqueeX = w;
    let t0 = performance.now();

    function drawStarfield(dt) {
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.fillRect(0, 0, w, h);
      const fov = Math.max(w, h);
      for (const s of stars) {
        s.z -= dt * 0.12 * (w / 700);
        if (s.z <= 1) {
          s.x = rand(-w, w);
          s.y = rand(-h, h);
          s.z = w;
        }
        const k = fov / s.z;
        const sx = cx() + s.x * k;
        const sy = cy() + s.y * k;
        if (sx < 0 || sx > w || sy < 0 || sy > h) continue;
        const size = Math.max(0.5, (1 - s.z / w) * 2.6);
        const alpha = Math.min(1, 1 - s.z / w + 0.15);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillRect(sx, sy, size, size);
      }
    }

    function drawBubbles() {
      ctx.fillStyle = '#000418';
      ctx.fillRect(0, 0, w, h);
      const t = performance.now() / 1000;
      for (const b of bubbles) {
        b.y -= b.vy;
        if (b.y + b.r < 0) {
          b.y = h + b.r;
          b.x = rand(0, w);
        }
        const bx = b.x + Math.sin(t * 1.4 + b.phase) * 12;
        const grad = ctx.createRadialGradient(
          bx - b.r * 0.35,
          b.y - b.r * 0.35,
          b.r * 0.1,
          bx,
          b.y,
          b.r,
        );
        grad.addColorStop(0, 'rgba(255,255,255,0.85)');
        grad.addColorStop(0.55, 'rgba(150,200,255,0.22)');
        grad.addColorStop(1, 'rgba(90,140,220,0.06)');
        ctx.beginPath();
        ctx.arc(bx, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(220,240,255,0.28)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    function drawMarquee(dt) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);
      marqueeX -= dt * 0.22;
      const fontSize = Math.max(48, Math.round(h / 6));
      ctx.font = `bold ${fontSize}px Tahoma, 'Noto Sans', sans-serif`;
      const textWidth = ctx.measureText(MARQUEE_TEXT).width;
      if (marqueeX < -textWidth) marqueeX = w;
      const y = h / 2 + fontSize / 3;
      const grad = ctx.createLinearGradient(0, y - fontSize, 0, y);
      grad.addColorStop(0, '#bfe4ff');
      grad.addColorStop(0.5, '#3d8ce0');
      grad.addColorStop(1, '#0b2f7a');
      ctx.fillStyle = grad;
      ctx.fillText(MARQUEE_TEXT, marqueeX, y);
    }

    let last = performance.now();
    function frame(now) {
      const dt = Math.min(48, now - last);
      last = now;
      if (type === 'bubbles') drawBubbles();
      else if (type === 'marquee') drawMarquee(dt);
      else drawStarfield(dt);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      void t0;
    };
  }, [type]);

  return (
    <Div onDoubleClick={onDismiss}>
      <canvas ref={canvasRef} />
    </Div>
  );
}

const Div = styled.div`
  position: absolute;
  inset: 0;
  z-index: 9999999;
  background: #000;
  cursor: none;
  overflow: hidden;
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
`;

export default Screensaver;
