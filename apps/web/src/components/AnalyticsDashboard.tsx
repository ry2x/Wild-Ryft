import { useState } from 'react';

interface TrendItem {
  championId: string;
  name: string;
  lane: string;
  winRateHistory: number[]; // e.g. [52.1, 52.4, 53.0, 52.8, 53.0]
  dates: string[];          // e.g. ["2026-07-02", "2026-07-03", ...]
  currentWinRate: string;
  currentPickRate: string;
  currentBanRate: string;
  tier: string;
}

interface AnalyticsDashboardMessages {
  chartTitle: string;
  compTitle: string;
  selectLabel: string;
  tableChamp: string;
  tableLane: string;
  tableTier: string;
  tableWr: string;
  tablePr: string;
  tableBr: string;
  lanes: Record<string, string>;
}

interface Props {
  championsTrends: TrendItem[];
  messages: AnalyticsDashboardMessages;
}

const COLORS = [
  '#00f0ff', // Electric Teal
  '#c89b3c', // Gold
  '#ff4655', // Crimson
  '#b355ff', // Purple
  '#10b981', // Green
  '#00bcff', // Sky Blue
  '#ff9c00', // Orange
  '#ffea00', // Yellow
];

export default function AnalyticsDashboard({
  championsTrends,
  messages
}: Props) {
  // Select top 3 by default
  const defaultSelected = championsTrends.slice(0, 3).map(c => c.championId);
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultSelected);

  // Toggle selection
  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter(x => x !== id));
      }
    } else {
      if (selectedIds.length < 5) { // Max 5 comparison lines
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  // Filter trends to selected champions
  const activeTrends = championsTrends.filter(c => selectedIds.includes(c.championId));

  // Determine SVG chart coordinates
  const width = 600;
  const height = 320;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  // Find overall min and max win rate to dynamically scale Y axis
  const allRates = activeTrends.flatMap(t => t.winRateHistory);
  const rawMin = allRates.length > 0 ? Math.min(...allRates) : 45;
  const rawMax = allRates.length > 0 ? Math.max(...allRates) : 55;
  
  // Create beautiful padding on Y scale
  const yMin = Math.max(0, Math.floor(rawMin - 0.5));
  const yMax = Math.min(100, Math.ceil(rawMax + 0.5));
  const yDiff = yMax - yMin || 1;

  // X coordinate calculation (based on 10 days)
  const maxDays = championsTrends[0]?.dates.length || 10;
  const getX = (index: number) => {
    return paddingLeft + (index * (width - paddingLeft - paddingRight) / (maxDays - 1));
  };

  // Y coordinate calculation
  const getY = (val: number) => {
    return height - paddingBottom - ((val - yMin) * (height - paddingTop - paddingBottom) / yDiff);
  };

  // Generate grid values for Y-axis (4 division lines)
  const yGridValues: number[] = [];
  for (let i = 0; i <= 4; i++) {
    yGridValues.push(yMin + (yDiff * i / 4));
  }

  // Format dates for display (convert YYYY-MM-DD to MM/DD)
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="analytics-dashboard">
      
      {/* Selection buttons */}
      <div className="selector-panel glass">
        <div className="selector-label">{messages.selectLabel}</div>
        <div className="selector-grid">
          {championsTrends.map((champ, idx) => {
            const isSelected = selectedIds.includes(champ.championId);
            const indexColor = COLORS[idx % COLORS.length];
            return (
              <button
                key={champ.championId}
                onClick={() => toggleSelection(champ.championId)}
                className={`champ-select-tag ${isSelected ? 'active' : ''}`}
                style={{
                  borderColor: isSelected ? indexColor : 'rgba(255,255,255,0.08)',
                  boxShadow: isSelected ? `0 0 6px ${indexColor}40` : 'none',
                }}
              >
                <span 
                  className="color-indicator" 
                  style={{ backgroundColor: isSelected ? indexColor : 'var(--text-muted)' }}
                ></span>
                {champ.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Chart Panel */}
      <div className="chart-panel glass">
        <h2 className="panel-title">{messages.chartTitle}</h2>
        <div className="svg-container">
          <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
            <defs>
              <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal Grid lines and Y Labels */}
            {yGridValues.map((gridVal, i) => {
              const y = getY(gridVal);
              return (
                <g key={i} opacity="0.6">
                  <line 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={width - paddingRight} 
                    y2={y} 
                    stroke="rgba(255,255,255,0.06)" 
                    strokeDasharray="4,4" 
                  />
                  <text 
                    x={paddingLeft - 8} 
                    y={y + 4} 
                    fill="var(--text-secondary)" 
                    fontSize="10" 
                    textAnchor="end"
                    fontFamily="var(--font-heading)"
                  >
                    {gridVal.toFixed(1)}%
                  </text>
                </g>
              );
            })}

            {/* X Labels (Dates) */}
            {championsTrends[0]?.dates.map((dateStr, i) => {
              // Only draw 5 dates to avoid overlapping on narrow screens
              if (i % 2 !== 0 && i !== maxDays - 1) return null;
              const x = getX(i);
              return (
                <text
                  key={i}
                  x={x}
                  y={height - 12}
                  fill="var(--text-muted)"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="var(--font-heading)"
                >
                  {formatDate(dateStr)}
                </text>
              );
            })}

            {/* Chart Lines */}
            {activeTrends.map((champ) => {
              const colorIdx = championsTrends.findIndex(c => c.championId === champ.championId);
              const color = COLORS[colorIdx % COLORS.length];

              // Generate path definition
              let d = '';
              champ.winRateHistory.forEach((rate, idx) => {
                const x = getX(idx);
                const y = getY(rate);
                if (idx === 0) {
                  d = `M ${x} ${y}`;
                } else {
                  // Draw cubic bezier curve or smooth path
                  const prevX = getX(idx - 1);
                  const prevY = getY(champ.winRateHistory[idx - 1]);
                  const cpX1 = prevX + (x - prevX) / 2;
                  const cpY1 = prevY;
                  const cpX2 = prevX + (x - prevX) / 2;
                  const cpY2 = y;
                  d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
                }
              });

              return (
                <g key={champ.championId}>
                  {/* Glowing line shadow */}
                  <path
                    d={d}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    filter="url(#glow)"
                    opacity="0.85"
                  />
                  
                  {/* Dots on points */}
                  {champ.winRateHistory.map((rate, idx) => (
                    <circle
                      key={idx}
                      cx={getX(idx)}
                      cy={getY(rate)}
                      r="4"
                      fill={color}
                      stroke="var(--bg-deep)"
                      strokeWidth="1.5"
                    />
                  ))}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="comparison-table-panel glass">
        <h2 className="panel-title">{messages.compTitle}</h2>
        <div className="table-wrapper">
          <table className="comp-table">
            <thead>
              <tr>
                <th>{messages.tableChamp}</th>
                <th>{messages.tableLane}</th>
                <th>{messages.tableTier}</th>
                <th>{messages.tableWr}</th>
                <th>{messages.tablePr}</th>
                <th>{messages.tableBr}</th>
              </tr>
            </thead>
            <tbody>
              {activeTrends.map((champ) => {
                const colorIdx = championsTrends.findIndex(c => c.championId === champ.championId);
                const color = COLORS[colorIdx % COLORS.length];
                return (
                  <tr key={champ.championId}>
                    <td>
                      <div className="comp-name-td">
                        <span className="bullet" style={{ backgroundColor: color }}></span>
                        <strong>{champ.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="comp-lane-td">
                        {messages.lanes[champ.lane] ?? champ.lane.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`tier-badge ${champ.tier.toLowerCase()}`}>{champ.tier}</span>
                    </td>
                    <td className="comp-wr-td">{champ.currentWinRate}</td>
                    <td>{champ.currentPickRate}</td>
                    <td>{champ.currentBanRate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .analytics-dashboard {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .selector-panel {
          padding: 16px;
          border-radius: 12px;
        }

        .selector-label {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 12px;
          text-transform: uppercase;
        }

        .selector-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .champ-select-tag {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: var(--text-secondary);
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .champ-select-tag:hover {
          background: rgba(255,255,255,0.06);
          color: #fff;
        }

        .champ-select-tag.active {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
        }

        .color-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .chart-panel {
          padding: 20px;
          border-radius: 12px;
        }

        .panel-title {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 16px;
          color: var(--text-primary);
          letter-spacing: 0.5px;
        }

        .svg-container {
          background: rgba(0,0,0,0.2);
          border-radius: 8px;
          padding: 12px;
          border: 1px solid rgba(255,255,255,0.03);
        }

        .comparison-table-panel {
          padding: 20px;
          border-radius: 12px;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .comp-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .comp-table th {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 12px;
          border-bottom: 1px solid rgba(200, 155, 60, 0.1);
        }

        .comp-table td {
          padding: 14px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          font-size: 0.9rem;
        }

        .comp-table tbody tr:hover {
          background: rgba(255,255,255,0.02);
        }

        .comp-name-td {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .bullet {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .comp-lane-td {
          font-size: 0.75rem;
          background: rgba(255,255,255,0.05);
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--text-secondary);
        }

        .comp-wr-td {
          color: var(--accent-cyan);
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
