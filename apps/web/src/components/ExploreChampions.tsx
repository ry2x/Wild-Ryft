import { useState, useEffect, type MouseEvent } from 'react';
import type { ChampionWithText } from '../lib/db';
import type { Lane, Role } from '@wild-ryft/shared';

interface ExploreChampionsMessages {
  searchPlaceholder: string;
  laneLabel: string;
  roleLabel: string;
  favLabel: string;
  onlyFav: string;
  all: string;
  noResults: string;
  lanes: Record<Lane, string>;
  roles: Record<Role, string>;
}

interface Props {
  initialChampions: ChampionWithText[];
  messages: ExploreChampionsMessages;
}

export default function ExploreChampions({
  initialChampions,
  messages
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLane, setSelectedLane] = useState<Lane | 'all'>('all');
  const [selectedRole, setSelectedRole] = useState<Role | 'all'>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Load favorites on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('wr_fav_champions');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load favorites', e);
    }
  }, []);

  // Save favorites when updated
  const toggleFavorite = (id: string, e: MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail page
    e.stopPropagation();
    
    let updated;
    if (favorites.includes(id)) {
      updated = favorites.filter(fav => fav !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem('wr_fav_champions', JSON.stringify(updated));
  };

  // Filter logic
  const filteredChampions = initialChampions.filter(c => {
    // 1. Search Query
    const nameMatch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Lane Filter
    const laneMatch = selectedLane === 'all' || c.lanes.includes(selectedLane);
    
    // 3. Role Filter
    const roleMatch = selectedRole === 'all' || c.roles.includes(selectedRole);
    
    // 4. Favorites Filter
    const favMatch = !showOnlyFavorites || favorites.includes(c.id);

    return nameMatch && laneMatch && roleMatch && favMatch;
  });

  const getFallbackIcon = (name: string) => {
    const initials = name.slice(0, 2).toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="#101a30"/><text x="40" y="46" font-family="Outfit, sans-serif" font-size="28" font-weight="bold" fill="#c89b3c" text-anchor="middle">textPlaceholder</text></svg>`.replace('textPlaceholder', initials);
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  return (
    <div className="explore-container">
      {/* Search & Fav Toggle Bar */}
      <div className="filter-header-bar">
        <div className="search-box-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <input 
            type="text" 
            placeholder={messages.searchPlaceholder} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <button 
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          className={`fav-only-toggle ${showOnlyFavorites ? 'active' : ''}`}
        >
          <svg viewBox="0 0 24 24" fill={showOnlyFavorites ? 'var(--accent-gold)' : 'none'} stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span>{messages.onlyFav}</span>
        </button>
      </div>

      {/* Lane Filter Bar */}
      <div className="filter-section">
        <div className="filter-label">{messages.laneLabel}</div>
        <div className="filter-buttons-scroll">
          <button 
            onClick={() => setSelectedLane('all')}
            className={`filter-btn ${selectedLane === 'all' ? 'active' : ''}`}
          >
            {messages.all}
          </button>
          
          {(['top', 'jungle', 'mid', 'bot', 'support'] as Lane[]).map(lane => (
            <button 
              key={lane}
              onClick={() => setSelectedLane(lane)}
              className={`filter-btn lane-btn ${selectedLane === lane ? 'active' : ''}`}
            >
              {/* Lane specific simple representations */}
              <span className={`lane-icon icon-${lane}`}></span>
              <span>{messages.lanes[lane]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Role Filter Bar */}
      <div className="filter-section">
        <div className="filter-label">{messages.roleLabel}</div>
        <div className="filter-buttons-scroll">
          <button 
            onClick={() => setSelectedRole('all')}
            className={`filter-btn ${selectedRole === 'all' ? 'active' : ''}`}
          >
            {messages.all}
          </button>
          
          {(['fighter', 'mage', 'assassin', 'marksman', 'support', 'tank'] as Role[]).map(role => (
            <button 
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`filter-btn ${selectedRole === role ? 'active' : ''}`}
            >
              <span>{messages.roles[role]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Champions Grid */}
      {filteredChampions.length === 0 ? (
        <div className="no-results glass">
          <p>{messages.noResults}</p>
        </div>
      ) : (
        <div className="explore-grid">
          {filteredChampions.map(c => {
            const isFav = favorites.includes(c.id);
            return (
              <a 
                href={`/champion/${c.id}`} 
                key={c.id} 
                className="champ-grid-card glass"
              >
                <div className="fav-star-container">
                  <button 
                    onClick={(e) => toggleFavorite(c.id, e)}
                    className={`fav-star-btn ${isFav ? 'active' : ''}`}
                    title={messages.favLabel}
                  >
                    <svg viewBox="0 0 24 24" fill={isFav ? 'var(--accent-gold)' : 'none'} stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </button>
                </div>
                
                <img 
                  src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${c.id}.png`} 
                  alt={c.name}
                  className="grid-card-avatar"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getFallbackIcon(c.name);
                  }}
                />
                
                <div className="grid-card-info">
                  <h3 className="grid-card-name">{c.name}</h3>
                  <p className="grid-card-roles">
                    {c.roles.map((r) => messages.roles[r] || r).join(' • ')}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Embedded CSS specific to this component */}
      <style>{`
        .explore-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .filter-header-bar {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .search-box-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          width: 18px;
          height: 18px;
          stroke: var(--text-muted);
          fill: none;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 12px 16px 12px 42px;
          color: #fff;
          font-family: var(--font-body);
          font-size: 0.95rem;
          outline: none;
          transition: var(--transition-fast);
        }

        .search-input:focus {
          border-color: var(--accent-cyan);
          box-shadow: var(--shadow-glow-cyan);
          background: var(--bg-surface-hover);
        }

        .fav-only-toggle {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .fav-only-toggle:hover {
          border-color: var(--accent-gold);
          color: var(--text-primary);
          background: var(--bg-surface-hover);
        }

        .fav-only-toggle.active {
          border-color: var(--accent-gold);
          color: var(--accent-gold);
          background: rgba(200, 155, 60, 0.1);
          box-shadow: 0 0 10px rgba(200, 155, 60, 0.15);
        }

        .fav-only-toggle svg {
          width: 16px;
          height: 16px;
        }

        .filter-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-label {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-muted);
        }

        .filter-buttons-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          -webkit-overflow-scrolling: touch;
        }

        .filter-buttons-scroll::-webkit-scrollbar {
          height: 3px;
        }

        .filter-btn {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .filter-btn:hover {
          background: var(--bg-surface-hover);
          color: var(--text-primary);
          border-color: var(--text-secondary);
        }

        .filter-btn.active {
          background: var(--accent-gold);
          color: var(--bg-deep);
          border-color: var(--accent-gold);
          font-weight: 700;
          box-shadow: var(--shadow-glow-gold);
        }

        .lane-btn.active {
          background: var(--accent-blue);
          color: #fff;
          border-color: var(--accent-blue);
          box-shadow: var(--shadow-glow-cyan);
        }

        /* Explore Grid */
        .explore-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 12px;
          margin-top: 8px;
        }

        @media (min-width: 768px) {
          .explore-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 16px;
          }
        }

        .champ-grid-card {
          border-radius: 12px;
          padding: 12px;
          text-align: center;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          transition: var(--transition-normal);
          cursor: pointer;
        }

        .champ-grid-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent-cyan);
          box-shadow: 0 4px 15px rgba(0, 240, 255, 0.15), var(--shadow-glow-cyan);
        }

        .fav-star-container {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 10;
        }

        .fav-star-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          transition: var(--transition-fast);
        }

        .fav-star-btn:hover {
          color: var(--accent-gold);
          transform: scale(1.2);
        }

        .fav-star-btn.active {
          color: var(--accent-gold);
          filter: drop-shadow(0 0 4px var(--accent-gold-glow));
        }

        .fav-star-btn svg {
          width: 18px;
          height: 18px;
        }

        .grid-card-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 2px solid var(--border-subtle);
          object-fit: cover;
          margin-bottom: 8px;
          transition: var(--transition-fast);
        }

        .champ-grid-card:hover .grid-card-avatar {
          border-color: var(--accent-cyan);
          transform: scale(1.05);
        }

        .grid-card-name {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .grid-card-roles {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .no-results {
          padding: 40px;
          text-align: center;
          color: var(--text-secondary);
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
}
