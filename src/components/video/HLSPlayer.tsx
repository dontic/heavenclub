import React, { useEffect, useRef, useState } from 'react';

type HLSPlayerProps = {
  src: string;
  width?: string;
  height?: string;
  controls?: boolean;
  autoplay?: boolean;
  className?: string;
  title?: string;
};

export default function HLSPlayer({
  src,
  width = '100%',
  height = 'auto',
  controls = true,
  autoplay = false,
  className = '',
  title = 'Video stream',
}: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    // Check if HLS is supported natively
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = src;
    } else {
      // Use hls.js for browsers that don't support HLS natively
      import('hls.js')
        .then(({ default: Hls }) => {
          if (Hls.isSupported()) {
            const hls = new Hls({
              debug: false,
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
              if (data.fatal) {
                handleError();
              }
            });

            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              if (autoplay) video.play();
            });
          } else {
            handleError();
            console.error('HLS is not supported in this browser.');
          }
        })
        .catch((err) => {
          handleError();
          console.error('Failed to load hls.js', err);
        });
    }

    return () => {
      // Cleanup
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
        videoRef.current.load();
      }
    };
  }, [src, autoplay]);

  return (
    <div className={className} style={{ position: 'relative' }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="text-center p-4">
            <p className="text-red-500 font-medium">Error al cargar el video</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        controls={controls}
        width={width}
        height={height}
        style={{ width, height }}
        className="rounded-lg"
        title={title}
      />
    </div>
  );
}
