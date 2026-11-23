import { useState } from 'react';

/**
 * Navbar: Spacious, responsive header with navigation between
 * Landing, Practice Q&A, Study Notes, Search, and Admin Studio.
 */
export default function Navbar({
  currentView,
  onChangeView,
  searchQuery,
  onSearchChange,
  onToggleSidebar,
  onGoToAdmin,
  isAdminRoute = false
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view) => {
    onChangeView(view);
    setMobileMenuOpen(false);
  };

  const handleAdminClick = () => {
    onGoToAdmin();
    setMobileMenuOpen(false);
  };

  return (
    <header className="pioneer-navbar">
      <div className="pioneer-nav-container">
        {/* Left: Brand & Mobile Sidebar Toggle */}
        <div className="pioneer-nav-brand-group">
          {currentView !== 'landing' && !isAdminRoute && (
            <button
              type="button"
              className="pioneer-sidebar-toggle-btn"
              onClick={onToggleSidebar}
              title="Toggle Directory Tree"
              aria-label="Toggle Directory Tree"
            >
              Menu
            </button>
          )}

          <div
            className="pioneer-brand"
            onClick={() => handleNavClick('landing')}
            role="button"
            tabIndex={0}
          >
            <div className="pioneer-brand-logo">P</div>
            <div className="pioneer-brand-names">
              <span className="pioneer-brand-title">Pioneer</span>
              <span className="pioneer-brand-tag">Knowledge & Practice</span>
            </div>
          </div>
        </div>

        {/* Center: Search Bar (Desktop) */}
        {!isAdminRoute && (
          <div className="pioneer-search-box pioneer-desktop-search">
            <input
              type="text"
              className="pioneer-search-input"
              placeholder="Search aptitude, reasoning, math, or coding questions..."
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentView === 'landing' && e.target.value) {
                  onChangeView('practice');
                }
              }}
            />
            {searchQuery && (
              <button
                type="button"
                className="pioneer-clear-search"
                onClick={() => onSearchChange('')}
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Desktop Nav Links */}
        <nav className="pioneer-nav-links pioneer-desktop-nav">
          <button
            type="button"
            className={`pioneer-nav-link ${currentView === 'landing' && !isAdminRoute ? 'active' : ''}`}
            onClick={() => handleNavClick('landing')}
          >
            Home
          </button>

          <button
            type="button"
            className={`pioneer-nav-link ${currentView === 'practice' && !isAdminRoute ? 'active' : ''}`}
            onClick={() => handleNavClick('practice')}
          >
            Practice Q&A
          </button>

          <button
            type="button"
            className={`pioneer-nav-link ${currentView === 'materials' && !isAdminRoute ? 'active' : ''}`}
            onClick={() => handleNavClick('materials')}
          >
            Study Notes & PDFs
          </button>

          {/* Admin Route Link */}
          <button
            type="button"
            className={`pioneer-nav-admin-link ${isAdminRoute ? 'active' : ''}`}
            onClick={handleAdminClick}
            title="Go to Admin Upload & Management Studio"
          >
            Admin Studio
          </button>
        </nav>

        {/* Mobile Menu Hamburger Toggle */}
        <button
          type="button"
          className="pioneer-mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="pioneer-mobile-drawer">
          {!isAdminRoute && (
            <div className="pioneer-search-box pioneer-mobile-search">
              <input
                type="text"
                className="pioneer-search-input"
                placeholder="Search questions or topics..."
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentView === 'landing' && e.target.value) {
                    onChangeView('practice');
                  }
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="pioneer-clear-search"
                  onClick={() => onSearchChange('')}
                >
                  Clear
                </button>
              )}
            </div>
          )}

          <div className="pioneer-mobile-nav-items">
            <button
              type="button"
              className={`pioneer-mobile-nav-link ${currentView === 'landing' && !isAdminRoute ? 'active' : ''}`}
              onClick={() => handleNavClick('landing')}
            >
              Home
            </button>

            <button
              type="button"
              className={`pioneer-mobile-nav-link ${currentView === 'practice' && !isAdminRoute ? 'active' : ''}`}
              onClick={() => handleNavClick('practice')}
            >
              Practice Questions
            </button>

            <button
              type="button"
              className={`pioneer-mobile-nav-link ${currentView === 'materials' && !isAdminRoute ? 'active' : ''}`}
              onClick={() => handleNavClick('materials')}
            >
              Study Notes & PDFs
            </button>

            <button
              type="button"
              className={`pioneer-mobile-nav-link pioneer-mobile-admin-link ${isAdminRoute ? 'active' : ''}`}
              onClick={handleAdminClick}
            >
              Admin Studio (Upload & Topics)
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
