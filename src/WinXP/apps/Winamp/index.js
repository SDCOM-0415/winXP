import React, { useEffect, useRef } from 'react';
import Webamp from 'webamp';
import { initialTracks } from './config';

function Winamp({ onClose, onMinimize }) {
  const ref = useRef(null);
  const webamp = useRef(null);

  useEffect(() => {
    const target = ref.current;
    if (!target) {
      return;
    }

    const instance = new Webamp({
      initialTracks,
    });
    webamp.current = instance;

    instance.renderWhenReady(target);

    return () => {
      if (webamp.current) {
        webamp.current.dispose();
        webamp.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (webamp.current) {
      webamp.current.onClose(onClose);
      webamp.current.onMinimize(onMinimize);
    }
  });

  return (
    <div
      style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0 }}
      ref={ref}
    />
  );
}

export default Winamp;
