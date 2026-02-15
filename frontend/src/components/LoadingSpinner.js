import React from 'react';

function LoadingSpinner({
    size = 'medium',
    color = '#3498db'
}) {
    const sizes = {
        small: '20px',
        medium: '40px',
        large: '60px'
    };

    const spinnerSize = sizes[size] || sizes.medium;

    const spinnerStyle = {
        width: spinnerSize,
        height: spinnerSize,
        border: `3px solid rgba(52, 152, 219, 0.2)`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    };

    const containerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
    };

    // Add keyframes for spin animation
    const style = document.createElement('style');
    style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
    document.head.appendChild(style);

    return ( <
        div style = {
            containerStyle
        } >
        <
        div style = {
            spinnerStyle
        } > < /div> <
        /div>
    );
}

export default LoadingSpinner;