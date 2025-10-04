import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}, ref) => {
  
  // Determine button classes based on props
  const getButtonClasses = () => {
    let classes = ['btn-component'];
    
    // Variant styles
    switch (variant) {
      case 'primary':
        classes.push('btn-primary');
        break;
      case 'secondary':
        classes.push('btn-secondary');
        break;
      case 'outline':
        classes.push('btn-outline');
        break;
      case 'ghost':
        classes.push('btn-ghost');
        break;
      case 'danger':
        classes.push('btn-danger');
        break;
      case 'success':
        classes.push('btn-success');
        break;
      default:
        classes.push('btn-primary');
    }
    
    // Size styles
    switch (size) {
      case 'small':
        classes.push('btn-small');
        break;
      case 'medium':
        classes.push('btn-medium');
        break;
      case 'large':
        classes.push('btn-large');
        break;
      default:
        classes.push('btn-medium');
    }
    
    // State classes
    if (disabled || loading) classes.push('btn-disabled');
    if (loading) classes.push('btn-loading');
    if (fullWidth) classes.push('btn-full-width');
    
    // Custom className
    if (className) classes.push(className);
    
    return classes.join(' ');
  };

  return (
    <button
      ref={ref}
      type={type}
      className={getButtonClasses()}
      disabled={disabled || loading}
      onClick={disabled || loading ? undefined : onClick}
      style={buttonStyles.base}
      {...props}
    >
      {loading && (
        <span className="btn-loading-spinner" style={buttonStyles.loadingSpinner}>
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
        </span>
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className="btn-icon-left" style={buttonStyles.iconLeft}>
          {icon}
        </span>
      )}
      
      <span className="btn-content" style={loading ? { opacity: 0.7 } : {}}>
        {children}
      </span>
      
      {icon && iconPosition === 'right' && !loading && (
        <span className="btn-icon-right" style={buttonStyles.iconRight}>
          {icon}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

// Styles object for inline styling
const buttonStyles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    textDecoration: 'none',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: '1',
    userSelect: 'none',
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
  },
  loadingSpinner: {
    marginRight: '8px',
    display: 'flex',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: '8px',
    display: 'flex',
    alignItems: 'center',
  },
  iconRight: {
    marginLeft: '8px',
    display: 'flex',
    alignItems: 'center',
  },
};

export default Button;
