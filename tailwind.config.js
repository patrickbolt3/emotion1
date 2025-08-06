/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Harmonic state color spectrum
        emotion: {
          apathy: '#7E7E7E',       // Gray
          grief: '#5B7399',        // Muted blue
          fear: '#9575CD',         // Purple
          covertResistance: '#64B5F6', // Light blue
          anger: '#EF5350',        // Red
          antagonism: '#FF7043',   // Orange-red
          boredom: '#FFA726',      // Amber
          willingness: '#F9A825',  // Darker yellow/gold
          stability: '#9CCC65',    // Light green
          enthusiasm: '#26A69A',   // Teal
          exhilaration: '#42A5F5', // Blue
          action: '#5C6BC0',       // Indigo
          creativePower: '#AB47BC', // Purple
          pureAwareness: '#E8EAF6', // Light indigo-gray
        },
        gradient: {
          start: '#4F46E5',
          end: '#EC4899',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'spectrum-gradient': 'linear-gradient(to right, #7E7E7E, #5B7399, #9575CD, #64B5F6, #EF5350, #FF7043, #FFA726, #FFEE58, #9CCC65, #26A69A, #42A5F5, #5C6BC0, #AB47BC, #FFFFFF)',
        'emotion-wave': "url(\"data:image/svg+xml,%3Csvg width='1440' height='147' viewBox='0 0 1440 147' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 61.8924L60 68.3025C120 74.7126 240 87.5328 360 93.943C480 100.353 600 100.353 720 87.5328C840 74.7126 960 49.0723 1080 49.0723C1200 49.0723 1320 74.7126 1380 87.5328L1440 100.353V147H1380C1320 147 1200 147 1080 147C960 147 840 147 720 147C600 147 480 147 360 147C240 147 120 147 60 147H0V61.8924Z' fill='url(%23paint0_linear_1504_3139)'/%3E%3Cdefs%3E%3ClinearGradient id='paint0_linear_1504_3139' x1='0' y1='49.0723' x2='1440' y2='49.0723' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%234F46E5' stop-opacity='0.2'/%3E%3Cstop offset='0.515625' stop-color='%23EC4899' stop-opacity='0.3'/%3E%3Cstop offset='1' stop-color='%234F46E5' stop-opacity='0.2'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'glow': '0 0 15px 5px rgba(79, 70, 229, 0.15)',
        'glow-pink': '0 0 15px 5px rgba(236, 72, 153, 0.15)',
        'glow-emotion': '0 0 20px 5px rgba(var(--emotion-color-rgb), 0.25)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 15px 5px rgba(79, 70, 229, 0.15)' },
          '50%': { boxShadow: '0 0 25px 10px rgba(79, 70, 229, 0.25)' },
        }
      },
      lineHeight: {
        'button': '1.2',
      }
    },
  },
  plugins: [],
};