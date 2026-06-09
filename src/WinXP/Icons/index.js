import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

function Icons({
  icons,
  onMouseDown,
  onDoubleClick,
  displayFocus,
  mouse,
  selecting,
  setSelectedIcons,
}) {
  const [iconsRect, setIconsRect] = useState([]);
  const [iconPositions, setIconPositions] = useState(() => {
    const positions = {};
    icons.forEach((icon, index) => {
      positions[icon.id] = { x: 0, y: index * 100 };
    });
    return positions;
  });
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
      const newX = e.clientX - dragOffset.x - 40; // 40 is IconsContainer margin-left
      const newY = e.clientY - dragOffset.y - 40; // 40 is IconsContainer margin-top

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

  function handleIconMouseDown(e, id) {
    onMouseDown(id);
    setDraggingId(id);
    const rect = e.currentTarget.getBoundingClientRect();
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
          onDoubleClick={onDoubleClick}
          measure={measure}
          style={{
            position: 'absolute',
            left: iconPositions[icon.id]?.x || 0,
            top: iconPositions[icon.id]?.y || 0,
          }}
        />
      ))}
    </IconsContainer>
  );
}

function Icon({
  title,
  onMouseDown,
  onDoubleClick,
  icon,
  className,
  id,
  component,
  measure,
  style,
}) {
  const ref = useRef(null);
  function _onMouseDown(e) {
    onMouseDown(id);
  }
  function _onDoubleClick() {
    onDoubleClick(component);
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
    >
      <div className={`${className}__img__container`}>
        <img src={icon} alt={title} className={`${className}__img`} />
      </div>
      <div className={`${className}__text__container`}>
        <div className={`${className}__text`}>{title}</div>
      </div>
    </div>
  );
}

const IconsContainer = styled.div`
  position: absolute;
  margin-top: 40px;
  margin-left: 40px;
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
