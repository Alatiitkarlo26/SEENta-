export default function PUPLogo({ className = "w-11 h-11" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer Circle with Cog Teeth */}
      <circle cx="50" cy="50" r="48" fill="#800000" stroke="#f59e0b" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="41" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2 2" />
      {/* Inner Red Disc */}
      <circle cx="50" cy="50" r="37" fill="#8B0000" stroke="#fef08a" strokeWidth="1" />
      {/* 5-pointed Gold Star */}
      <polygon
        points="50,16 60.5,37.3 84,40.7 67,57.3 71,80.7 50,69.6 29,80.7 33,57.3 16,40.7 39.5,37.3"
        fill="#facc15"
        stroke="#ca8a04"
        strokeWidth="1.5"
      />
      {/* Center detail */}
      <circle cx="50" cy="50" r="6" fill="#800000" stroke="#facc15" strokeWidth="1.5" />
      <text x="50" y="93" textAnchor="middle" fill="#fef08a" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">
        1904
      </text>
    </svg>
  );
}
