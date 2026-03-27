import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
}

export default function SafeImage({ src, alt, className, fallbackSrc, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const [hasError, setHasError] = useState(false);
  const [useProxy, setUseProxy] = useState(false);

  useEffect(() => {
    if (!src) {
      setHasError(true);
      return;
    }

    let processedSrc = src;

    // 1. Fix HTTP mixed content issues (Vercel is HTTPS)
    if (processedSrc.startsWith('http://')) {
      processedSrc = processedSrc.replace('http://', 'https://');
    }

    // 2. Fix Google Drive links (convert view links to direct image links)
    if (processedSrc.includes('drive.google.com/file/d/')) {
      const match = processedSrc.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        processedSrc = `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
    } else if (processedSrc.includes('drive.google.com/open?id=')) {
      const match = processedSrc.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        processedSrc = `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
    }

    // 3. Fix Dropbox links (change dl=0 to raw=1)
    if (processedSrc.includes('dropbox.com') && processedSrc.includes('dl=0')) {
      processedSrc = processedSrc.replace('dl=0', 'raw=1');
    }

    // 4. If the direct link fails (e.g., on Vercel due to hotlink protection), route through a proxy
    if (useProxy && processedSrc.startsWith('http')) {
      processedSrc = `https://wsrv.nl/?url=${encodeURIComponent(processedSrc)}`;
    }

    setImgSrc(processedSrc);
    setHasError(false);
  }, [src, useProxy]);

  const handleError = () => {
    if (!useProxy && src && src.startsWith('http')) {
      // If the direct image fails to load (CORS, 403, Hotlink protection), try the proxy fallback
      setUseProxy(true);
    } else {
      // If the proxy also fails, show the fallback UI
      setHasError(true);
    }
  };

  if (hasError || !imgSrc) {
    if (fallbackSrc) {
      return <img src={fallbackSrc} alt={alt || 'Fallback'} className={className} {...props} />;
    }
    return (
      <div className={`flex flex-col items-center justify-center bg-surface text-tertiary ${className}`} {...(props as any)}>
        <ImageOff className="w-1/3 h-1/3 mb-2 opacity-50" />
        <span className="text-[10px] uppercase tracking-widest opacity-50 text-center px-2">Image Unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
}
