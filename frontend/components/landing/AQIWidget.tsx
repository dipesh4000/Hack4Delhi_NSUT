"use client"

interface AQIData {
  current: number | null
  status: string
}

const getAQIColor = (aqi: number | null) => {
  if (aqi === null) return "#D1D5DB"
  if (aqi <= 50) return "#22C55E"
  if (aqi <= 100) return "#EAB308"
  if (aqi <= 150) return "#F97316"
  if (aqi <= 200) return "#EF4444"
  if (aqi <= 300) return "#DC2626"
  return "#991B1B"
}

const getAQILabel = (aqi: number | null) => {
  if (aqi === null) return "Not Available"
  if (aqi <= 50) return "Good"
  if (aqi <= 100) return "Satisfactory"
  if (aqi <= 150) return "Moderately Polluted"
  if (aqi <= 200) return "Poor"
  if (aqi <= 300) return "Very Poor"
  return "Severe"
}

export default function AQIWidget({ data }: { data?: AQIData }) {
  const defaultData: AQIData = {
    current: 150,
    status: "Moderately Polluted",
  }

  const aqiData = data || defaultData
  const currentAQI = aqiData.current
  const angle = currentAQI === null ? 0 : (currentAQI / 300) * 360

  return (
      <svg className="w-96 h-96 drop-shadow-2xl" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="circularGauge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="16.66%" stopColor="#34D399" />
            <stop offset="25%" stopColor="#FBBF24" />
            <stop offset="33.33%" stopColor="#FB923C" />
            <stop offset="50%" stopColor="#F87171" />
            <stop offset="66.66%" stopColor="#A78BFA" />
            <stop offset="83.33%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>
          <linearGradient id="needleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1F2937" />
            <stop offset="100%" stopColor="#4B5563" />
          </linearGradient>
          <radialGradient id="centerGlow">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="70%" stopColor="#f9fafb" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f3f4f6" stopOpacity="0.6" />
          </radialGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodOpacity="0.2" />
          </filter>
          <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.15" />
          </filter>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background white circle - larger with premium shadow */}
        <circle cx="200" cy="200" r="190" fill="white" filter="url(#shadow)" />

        {/* Decorative outer ring */}
        <circle cx="200" cy="200" r="188" fill="none" stroke="#E0E7FF" strokeWidth="3" opacity="0.5" />
        
        {/* Inner subtle circle for depth */}
        <circle cx="200" cy="200" r="185" fill="none" stroke="#F3F4F6" strokeWidth="2" />

        {/* Decorative tick marks around outer edge */}
        {Array.from({ length: 60 }).map((_, i) => {
          const angle = (i / 60) * Math.PI * 2 - Math.PI / 2
          const x1 = 200 + 175 * Math.cos(angle)
          const y1 = 200 + 175 * Math.sin(angle)
          const length = i % 5 === 0 ? 8 : 4
          const x2 = 200 + (175 - length) * Math.cos(angle)
          const y2 = 200 + (175 - length) * Math.sin(angle)
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i % 5 === 0 ? "#9CA3AF" : "#D1D5DB"}
              strokeWidth={i % 5 === 0 ? "2" : "1"}
              opacity="0.6"
            />
          )
        })}

        {/* Colored arc segments for each AQI category */}
        {[
          { start: 0, end: 50, color: "#10B981", label: "Good" },
          { start: 50, end: 100, color: "#EAB308", label: "Moderate" },
          { start: 100, end: 200, color: "#F97316", label: "Poor" },
          { start: 200, end: 300, color: "#EF4444", label: "Severe" },
        ].map((segment, index) => {
          const startAngle = (segment.start / 300) * 360 - 90
          const endAngle = (segment.end / 300) * 360 - 90
          const startRad = (startAngle * Math.PI) / 180
          const endRad = (endAngle * Math.PI) / 180
          const radius = 160
          const x1 = 200 + radius * Math.cos(startRad)
          const y1 = 200 + radius * Math.sin(startRad)
          const x2 = 200 + radius * Math.cos(endRad)
          const y2 = 200 + radius * Math.sin(endRad)
          const largeArc = endAngle - startAngle > 180 ? 1 : 0
          
          return (
            <g key={segment.label}>
              {/* Main colored arc */}
              <path
                d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
                fill="none"
                stroke={segment.color}
                strokeWidth="24"
                filter="url(#glow)"
                opacity="0.9"
              />
              {/* Inner accent arc */}
              <path
                d={`M ${200 + 148 * Math.cos(startRad)} ${200 + 148 * Math.sin(startRad)} A 148 148 0 ${largeArc} 1 ${200 + 148 * Math.cos(endRad)} ${200 + 148 * Math.sin(endRad)}`}
                fill="none"
                stroke={segment.color}
                strokeWidth="2"
                opacity="0.3"
              />
            </g>
          )
        })}

        {/* AQI range numbers around the circle */}
        {[0, 50, 100, 150, 200, 250, 300].map((num, index) => {
          const angleRad = (index / 6) * Math.PI * 2
          const x = 200 + 135 * Math.cos(angleRad - Math.PI / 2)
          const y = 200 + 135 * Math.sin(angleRad - Math.PI / 2)
          return (
            <text
              key={num}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#6B7280"
              fontSize="14"
              fontWeight="600"
            >
              {num}
            </text>
          )
        })}

        {/* Category labels positioned along their arcs */}
        {[
          { start: 0, end: 50, color: "#10B981", label: "Good", range: "0-50 AQI" },
          { start: 50, end: 100, color: "#EAB308", label: "Moderate", range: "51-100 AQI" },
          { start: 100, end: 200, color: "#F97316", label: "Poor", range: "101-200 AQI" },
          { start: 200, end: 300, color: "#EF4444", label: "Severe", range: "200+ AQI" },
        ].map((cat, index) => {
          const midPoint = (cat.start + cat.end) / 2
          const angleRad = (midPoint / 300) * Math.PI * 2 - Math.PI / 2
          const x = 200 + 105 * Math.cos(angleRad)
          const y = 200 + 105 * Math.sin(angleRad)
          return (
            <g key={cat.label}>
              {/* Label background */}
              <rect
                x={x - 40}
                y={y - 14}
                width="80"
                height="28"
                rx="14"
                fill="white"
                opacity="0.95"
                filter="url(#shadow)"
              />
              {/* Label text */}
              <text
                x={x}
                y={y - 3}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={cat.color}
                fontSize="12"
                fontWeight="700"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {cat.label}
              </text>
              {/* Range text */}
              <text
                x={x}
                y={y + 9}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#6B7280"
                fontSize="9"
                fontWeight="600"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {cat.range}
              </text>
            </g>
          )
        })}

        {/* Needle indicator - premium styling */}
        {currentAQI !== null && (
          <g transform={`rotate(${angle} 200 200)`}>
            {/* Needle glow effect */}
            <line x1="200" y1="200" x2="200" y2="40" stroke={getAQIColor(currentAQI)} strokeWidth="10" strokeLinecap="round" opacity="0.2" filter="url(#glow)" />
            {/* Needle shadow */}
            <line x1="200" y1="200" x2="200" y2="40" stroke="#00000025" strokeWidth="5" strokeLinecap="round" />
            {/* Main needle with gradient */}
            <line x1="200" y1="200" x2="200" y2="40" stroke="url(#needleGradient)" strokeWidth="4" strokeLinecap="round" />
            {/* Needle tip circle with glow */}
            <circle cx="200" cy="40" r="7" fill={getAQIColor(currentAQI)} opacity="0.3" filter="url(#glow)" />
            <circle cx="200" cy="40" r="6" fill={getAQIColor(currentAQI)} stroke="white" strokeWidth="2" />
          </g>
        )}

        {/* Center circle - larger and more premium */}
        <circle cx="200" cy="200" r="58" fill="url(#centerGlow)" filter="url(#shadow)" />
        <circle cx="200" cy="200" r="55" fill="none" stroke="#E5E7EB" strokeWidth="3" />

        {/* Inner circle accent with animated pulse effect */}
        <circle cx="200" cy="200" r="52" fill="none" stroke={getAQIColor(currentAQI)} strokeWidth="3" opacity="0.4" />
        <circle cx="200" cy="200" r="48" fill="none" stroke={getAQIColor(currentAQI)} strokeWidth="1.5" opacity="0.2" />
        
        {/* Subtle dot pattern in center for texture */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2
          const x = 200 + 30 * Math.cos(angle)
          const y = 200 + 30 * Math.sin(angle)
          return <circle key={i} cx={x} cy={y} r="1.5" fill="#E5E7EB" opacity="0.5" />
        })}

        {/* Main AQI number - much larger */}
        <text
          x="200"
          y="195"
          textAnchor="middle"
          fill={currentAQI !== null ? getAQIColor(currentAQI) : "#9CA3AF"}
          fontSize="56"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {currentAQI !== null ? currentAQI : "—"}
        </text>

        {/* AQI Label below number */}
        <text
          x="200"
          y="225"
          textAnchor="middle"
          fill="#6B7280"
          fontSize="14"
          fontWeight="600"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {getAQILabel(currentAQI)}
        </text>

        {/* Bottom information text */}
        <text
          x="200"
          y="270"
          textAnchor="middle"
          fill="#9CA3AF"
          fontSize="12"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          Air Quality Index
        </text>

        {/* Location name */}
        <text
          x="200"
          y="290"
          textAnchor="middle"
          fill="#0e1012ff"
          fontSize="16"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          Delhi
        </text>
      </svg>
  )
}