import React from 'react';
import './logo.css';

const Logo = ({ width, height }) => {
    return (  
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 20 10" className="shadow">
            <defs>
                <radialGradient id="gradPurple" cx="65%" cy="50%" r="50%" fx="80%" fy="50%">
                    <stop offset="0%" stopColor="#e2d0e2" />
                    <stop offset="60%" stopColor="#c5a0c5" />
                    <stop offset="100%" stopColor="#8e578e" />
                </radialGradient>
            </defs>
            <g id="shape8">
                <ellipse cx="11" cy="5" rx="9" ry="4.5" fill="url(#gradPurple)" />
                <path d="M3,6.5 Q3,8.5 0,8.25 Q3.25,10.2 5,8.25" fill="#8e578e" />
                <text x="4.5" y="6.2" fontSize="3.25px" fill="white">
                    Chit Chat
                </text>
            </g>
        </svg>
    );
}
 
export default Logo;
