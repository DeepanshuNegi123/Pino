import { useState, useMemo } from 'react';

/**
 * SidebarExplorer: Clean directory navigation for subject categories and topics.
 */
export default function SidebarExplorer({
  categories = [],
  selectedTopicId,
  onSelectTopic,
  searchQuery = '',
  isOpen = true,
  onCloseMobile
}) {
  const [openCategories, setOpenCategories] = useState(() => {
    const state = {};
    categories.forEach((cat) => {
      state[cat.category] = true;
    });
    return state;
  });

  const toggleCategory = (catName) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();

    return categories
      .map((cat) => {
        const matchingTopics = cat.topics.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            (t.summary && t.summary.toLowerCase().includes(q))
        );
        if (matchingTopics.length > 0 || cat.category.toLowerCase().includes(q)) {
          return {
            ...cat,
            topics: matchingTopics.length > 0 ? matchingTopics : cat.topics
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [categories, searchQuery]);

  return (
    <aside className={`pioneer-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="pioneer-sidebar-header">
        <div className="pioneer-sidebar-title">
          <span className="pioneer-dir-icon">📁</span>
          <span>Topics Directory</span>
        </div>
        {onCloseMobile && (
          <button
            type="button"
            className="pioneer-sidebar-close-btn"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        )}
      </div>

      <nav className="pioneer-tree-nav">
        {filteredTree.length === 0 ? (
          <div className="pioneer-sidebar-empty">No matching topics found.</div>
        ) : (
          filteredTree.map((cat) => {
            const isCatOpen = openCategories[cat.category] ?? true;
            const totalQuestions = cat.topics.reduce(
              (acc, t) => acc + (t.questions?.length || 0),
              0
            );

            return (
              <div key={cat.category} className="pioneer-cat-group">
                <button
                  type="button"
                  className="pioneer-cat-header-btn"
                  onClick={() => toggleCategory(cat.category)}
                  aria-expanded={isCatOpen}
                >
                  <span className="pioneer-arrow">{isCatOpen ? '▼' : '▶'}</span>
                  <span className="pioneer-cat-ico">{cat.icon || '📂'}</span>
                  <span className="pioneer-cat-txt">{cat.category}</span>
                  <span className="pioneer-cat-badge">{totalQuestions}</span>
                </button>

                {isCatOpen && (
                  <div className="pioneer-topic-list">
                    {cat.topics.map((topic) => {
                      const isSelected = topic.id === selectedTopicId;
                      const qCount = topic.questions?.length || 0;
                      const matCount = topic.materials?.length || 0;

                      return (
                        <div
                          key={topic.id}
                          className={`pioneer-topic-item ${isSelected ? 'active' : ''}`}
                          onClick={() => {
                            onSelectTopic(topic);
                            if (onCloseMobile) onCloseMobile();
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <span className="pioneer-topic-bullet">📄</span>
                          <span className="pioneer-topic-title-txt">{topic.title}</span>
                          <div className="pioneer-topic-counts">
                            {matCount > 0 && (
                              <span className="pioneer-mat-count" title={`${matCount} PDF note(s)`}>
                                📑{matCount}
                              </span>
                            )}
                            <span className="pioneer-q-count">{qCount}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </nav>
    </aside>
  );
}
