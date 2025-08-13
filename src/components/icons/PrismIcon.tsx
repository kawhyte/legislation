import React from 'react';

interface BalanceScaleIconProps extends React.SVGProps<SVGSVGElement> {}

const BalanceScaleIcon: React.FC<BalanceScaleIconProps> = (props) => (
 <svg width="200" height="200" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">

  <circle cx="50" cy="50" r="48" fill="url(#purple-gradient)"/>
  

  <path d="M50 30 L70 65 L30 65 Z" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.4)" stroke-width="1"/>


  <line x1="10" y1="50" x2="40" y2="50" stroke="white" stroke-width="3" stroke-linecap="round"/>


  <line x1="60" y1="40" x2="90" y2="30" stroke="#00FFFF" stroke-width="3" stroke-linecap="round"/> 
  <line x1="60" y1="50" x2="90" y2="50" stroke="#7FFF00" stroke-width="3" stroke-linecap="round"/> 
  <line x1="60" y1="60" x2="90" y2="70" stroke="#FF00FF" stroke-width="3" stroke-linecap="round"/> 

  <defs>
    <linearGradient id="purple-gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
      <stop stop-color="#483D8B"/>
      <stop offset="1" stop-color="#2B2050"/>
    </linearGradient>
  </defs>
</svg>
);

export default BalanceScaleIcon;