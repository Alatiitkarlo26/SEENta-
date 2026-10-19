export default function SeentaLogo({
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  showSubtitle = false,
  subtitle = 'Lost and Found Management System',
  subtitleClassName = ''
}) {
  const sizeMap = {
    sm: {
      seen: 'text-lg',
      ta: 'text-[17px]'
    },
    md: {
      seen: 'text-xl sm:text-2xl',
      ta: 'text-[19.5px] sm:text-[23px]'
    },
    lg: {
      seen: 'text-2xl sm:text-3xl',
      ta: 'text-[23px] sm:text-[28.5px]'
    },
    xl: {
      seen: 'text-3xl sm:text-4xl',
      ta: 'text-[28.5px] sm:text-[34.5px]'
    }
  };

  const selectedSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex flex-col select-none ${className}`}>
      <div className="inline-flex items-baseline leading-none">
        {/* SEEN - Albert Sans font, block uppercase text */}
        <span
          className={`font-albert font-black tracking-tight text-black dark:text-white uppercase ${selectedSize.seen}`}
          style={{ fontFamily: "'Albert Sans', sans-serif", fontWeight: 900 }}
        >
          SEEN
        </span>
        {/* ta - Alan Sans font, slightly smaller text, regular weight (not bold) in all black */}
        <span
          className={`font-alan font-normal text-black dark:text-white tracking-tight ml-0.5 ${selectedSize.ta}`}
          style={{ fontFamily: "'Alan Sans', sans-serif", fontWeight: 400 }}
        >
          ta
        </span>
      </div>

      {showSubtitle && (
        <span
          className={`text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight -mt-0.5 sm:-mt-1 ${subtitleClassName}`}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}
