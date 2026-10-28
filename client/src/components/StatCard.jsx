import React from 'react';

const StatCard = ({ title, amount, subtitle, icon: Icon, color = 'primary', currency = '$' }) => {
  const colorMap = {
    primary: {
      bg: 'bg-primary bg-opacity-10',
      text: 'text-primary',
      border: 'border-primary',
    },
    success: {
      bg: 'bg-success bg-opacity-10',
      text: 'text-success',
      border: 'border-success',
    },
    danger: {
      bg: 'bg-danger bg-opacity-10',
      text: 'text-danger',
      border: 'border-danger',
    },
    warning: {
      bg: 'bg-warning bg-opacity-10',
      text: 'text-warning',
      border: 'border-warning',
    },
    info: {
      bg: 'bg-info bg-opacity-10',
      text: 'text-info',
      border: 'border-info',
    },
  };

  const currentTheme = colorMap[color] || colorMap.primary;

  return (
    <div className="card card-hover h-100 p-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="text-secondary small fw-bold text-uppercase">{title}</span>
        {Icon && (
          <div className={`stat-icon-wrapper ${currentTheme.bg} ${currentTheme.text}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
      <div className="fs-3 fw-bold text-dark my-1">
        {currency}
        {Number(amount || 0).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
      {subtitle && <div className="text-muted small mt-1">{subtitle}</div>}
    </div>
  );
};

export default StatCard;
