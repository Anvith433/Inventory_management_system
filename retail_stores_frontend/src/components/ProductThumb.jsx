import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import { categoryStyle } from '../utils/catalog';

/**
 * Product picture. Uses the product's own image when it has one and it loads;
 * otherwise a soft tile tinted by category with a line illustration.
 */
export default function ProductThumb({ src, alt, category, size = 'md', className = '' }) {
  const [failed, setFailed] = useState(false);
  const style = categoryStyle(category);
  const showImage = src && !failed;

  const iconSize = { xs: 18, sm: 22, md: 52, lg: 72 }[size] || 52;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundColor: style.bg, color: style.fg }}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <>
          {(size === 'md' || size === 'lg') && (
            <span
              aria-hidden="true"
              className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full opacity-40"
              style={{ backgroundColor: '#fff' }}
            />
          )}
          <Icon name={style.icon} size={iconSize} strokeWidth={size === 'md' || size === 'lg' ? 1.25 : 1.75} />
        </>
      )}
    </div>
  );
}

ProductThumb.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  category: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  className: PropTypes.string,
};
