import React, { useRef, useEffect } from 'react';

function Paint({ onClose, isFocus }) {
  const iframeRef = useRef(null);
  const origin = window.location.origin;

  useEffect(() => {
    function handleMessage(e) {
      if (e.origin !== origin) return;
      if (!iframeRef.current || e.source !== iframeRef.current.contentWindow)
        return;
      const { xpPaintAction } = e.data || {};
      if (
        xpPaintAction === 'requestExitFromPaint' ||
        xpPaintAction === 'forceExitNoSave'
      ) {
        onClose && onClose();
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose, origin]);

  function handleLoad() {
    iframeRef.current.contentWindow.postMessage(
      { xpPaintAction: 'init', parentOrigin: origin },
      origin,
    );
    iframeRef.current.contentWindow.postMessage(
      { xpPaintAction: 'newImage' },
      origin,
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <iframe
        ref={iframeRef}
        src="/paint/index.html"
        frameBorder="0"
        title="paint"
        onLoad={handleLoad}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          backgroundColor: '#808080',
        }}
      />
      {!isFocus && (
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
          }}
        />
      )}
    </div>
  );
}

export default Paint;
