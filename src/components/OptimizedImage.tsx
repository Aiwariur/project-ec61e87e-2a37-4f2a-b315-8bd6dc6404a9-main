import { ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  priority?: boolean;
}

/**
 * Компонент для оптимизированной загрузки изображений
 * 
 * Использует:
 * - WebP с fallback на JPEG
 * - Lazy loading для изображений вне viewport
 * - fetchpriority="high" для критичных изображений
 * - decoding="async" для неблокирующей декодировки
 */
const OptimizedImage = ({ 
  src, 
  alt, 
  priority = false,
  className,
  ...props 
}: OptimizedImageProps) => {
  // Определяем базовое имя файла без расширения
  const getBaseName = (path: string) => {
    const parts = path.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace(/\.(jpg|jpeg|png)$/i, '');
  };

  const baseName = getBaseName(src);
  const basePath = src.substring(0, src.lastIndexOf('/') + 1);
  
  // WebP версия
  const webpSrc = `${basePath}${baseName}.webp`;
  // JPEG fallback
  const jpegSrc = `${basePath}${baseName}.jpg`;

  return (
    <picture>
      {/* WebP для современных браузеров */}
      <source srcSet={webpSrc} type="image/webp" />
      
      {/* JPEG fallback для старых браузеров */}
      <source srcSet={jpegSrc} type="image/jpeg" />
      
      {/* Основное изображение */}
      <img
        src={jpegSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        className={className}
        {...props}
      />
    </picture>
  );
};

export default OptimizedImage;
