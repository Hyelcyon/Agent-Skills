module.exports = {
  theme: {
    extend: {
      keyframes: {
        shine: {
          '0%': { backgroundPosition: '100%' },
          '100%': { backgroundPosition: '-100%' }
        },
        gradientMove: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        starMovement: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(100%, 100%)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(0.98)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' }
        }
      },
      animation: {
        shine: 'shine 5s linear infinite',
        'gradient-move': 'gradientMove 6s ease infinite',
        'star-movement': 'starMovement 6s linear infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite'
      }
    }
  }
};
