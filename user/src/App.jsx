import { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useFetcher } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import CoursePage from './components/CoursePage';
import SidebarExplorer from './components/SidebarExplorer';
import QuestionCard from './components/QuestionCard';
import MaterialViewer from './components/MaterialViewer';
import AdminDashboard from './components/AdminDashboard';
import { defaultTopics } from './data/mockTopics';
import { savePdfToStorage, loadAllSavedPdfs } from './utils/pdfStorage';
import './App.css';
import Loader from  './components/loader';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const LOCAL_STORAGE_KEY = 'pioneer_saved_categories_v2';
const ADMIN_API_KEY = 'pioneer-admin-secret-2026';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive currentRoute from real URL path — no more state for routing
  const currentRoute = (() => {
    const p = location.pathname;
    if (p.startsWith('/admin')) return 'admin';
    if (p.startsWith('/practice')) return 'practice';
    if (p.startsWith('/notes')) return 'materials';
    if (p.startsWith('/course')) return 'course';
    return 'landing';
  })();

  // Load initial categories with localStorage persistence for user-created topics
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read cached categories:', e);
    }
    return defaultTopics;
  });

  const [selectedTopic, setSelectedTopic] = useState(
    () => categories[0]?.topics[0] || defaultTopics[0]?.topics[0] || null
  );

  const [searchQuery, setSearchQuery] = useState('');

  // Selected course (category) for the course detail page
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Responsive sidebar: default open on desktop (>900px), closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth > 900 : true;
  });

  const [toast, setToast] = useState('');

  // Persist custom categories to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.warn('Failed to save categories to localStorage:', e);
    }
  }, [categories]);

  // Toast alert system
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Real URL navigation — replaces all window.location.hash calls
  const navigateTo = (route) => {
    if (route === 'admin') navigate('/admin');
    else if (route === 'course') navigate('/course');
    else if (route === 'practice') navigate('/practice');
    else if (route === 'materials') navigate('/notes');
    else navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Load any previously saved PDFs from browser IndexedDB
  useEffect(() => {
    const loadStoredPdfs = async () => {
      try {
        const stored = await loadAllSavedPdfs();
        if (stored && stored.length > 0) {
          setCategories((prev) =>
            prev.map((cat) => ({
              ...cat,
              topics: cat.topics.map((t) => {
                const userDocs = stored.filter((s) => s.topicId === t.id);
                if (userDocs.length > 0) {
                  return {
                    ...t,
                    materials: [...userDocs, ...(t.materials || [])]
                  };
                }
                return t;
              })
            }))
          );
        }
      } catch (err) {
        console.warn('Could not load stored PDFs:', err);
      }
    };

    loadStoredPdfs();
  }, []);

  // 2. Fetch shared topics from backend pioneer-db.json if online
  useEffect(() => {
    const fetchBackendTopics = async () => {
      try {
        const res = await fetch(`${API_BASE}/topics`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      } catch {
        // Backend offline, keep local state
      }
    };

    fetchBackendTopics();
  }, []);

  // Sync selectedTopic if category tree updates
  useEffect(() => {
    if (!selectedTopic) return;
    for (const cat of categories) {
      const match = cat.topics.find((t) => t.id === selectedTopic.id);
      if (match && match !== selectedTopic) {
        setSelectedTopic(match);
        break;
      }
    }
  }, [categories]);

  // Determine current category of active topic
  const currentCategory = useMemo(() => {
    if (!selectedTopic) return '';
    for (const cat of categories) {
      if (cat.topics.some((t) => t.id === selectedTopic.id)) {
        return cat.category;
      }
    }
    return 'Directory';
  }, [categories, selectedTopic]);

  // Filtered questions based on search query
  const filteredQuestions = useMemo(() => {
    if (!selectedTopic?.questions) return [];
    if (!searchQuery.trim()) return selectedTopic.questions;

    const q = searchQuery.toLowerCase();
    return selectedTopic.questions.filter(
      (item) =>
        item.questionText.toLowerCase().includes(q) ||
        item.explanation.toLowerCase().includes(q) ||
        item.options.some((opt) => opt.toLowerCase().includes(q))
    );
  }, [selectedTopic, searchQuery]);

  // Admin Action: Create New Category or New Topic
  const handleCreateTopic = async ({ categoryName, categoryIcon, isNewCategory, topic }) => {
    setCategories((prev) => {
      const catExists = prev.find((c) => c.category.toLowerCase() === categoryName.toLowerCase());

      if (catExists) {
        // Append topic to existing category
        return prev.map((c) => {
          if (c.category.toLowerCase() === categoryName.toLowerCase()) {
            return {
              ...c,
              topics: [...c.topics, topic]
            };
          }
          return c;
        });
      } else {
        // Create new category container with this topic
        return [
          ...prev,
          {
            category: categoryName,
            icon: '',
            topics: [topic]
          }
        ];
      }
    });

    setSelectedTopic(topic);

    // Sync with backend pioneer-db.json so all students worldwide see it
    try {
      await fetch(`${API_BASE}/topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        },
        body: JSON.stringify({ categoryName, categoryIcon, topic })
      });
    } catch (err) {
      console.warn('Backend sync failed, saved locally:', err);
    }
  };

  // Admin Action: Upload & attach PDF (Supports local file upload and AWS S3 direct URLs)
  const handleAdminAddPdf = async ({ topicId, file, s3Url, customTitle }) => {
    if (s3Url) {
      const s3Material = {
        id: `mat-s3-${Date.now()}`,
        topicId,
        title: (customTitle || 'AWS S3 Document').endsWith('.pdf')
          ? customTitle || 'AWS S3 Document'
          : `${customTitle || 'AWS S3 Document'}.pdf`,
        type: 'pdf',
        url: s3Url,
        size: 'AWS S3 Cloud',
        uploadedAt: new Date().toISOString().split('T')[0]
      };

      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          topics: cat.topics.map((t) => {
            if (t.id === topicId) {
              const updated = {
                ...t,
                materials: [s3Material, ...(t.materials || [])]
              };
              if (selectedTopic?.id === topicId) setSelectedTopic(updated);
              return updated;
            }
            return t;
          })
        }))
      );

      // Sync S3 material to backend pioneer-db.json
      try {
        await fetch(`${API_BASE}/topics/${topicId}/materials`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-key': ADMIN_API_KEY
          },
          body: JSON.stringify({
            title: s3Material.title,
            type: 'pdf',
            url: s3Url,
            size: 'AWS S3 Cloud'
          })
        });
      } catch (err) {
        console.warn('Backend S3 sync failed:', err);
      }

      return;
    }

    try {
      const saved = await savePdfToStorage(topicId, file, customTitle);
      
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          topics: cat.topics.map((t) => {
            if (t.id === topicId) {
              const updated = {
                ...t,
                materials: [saved, ...(t.materials || [])]
              };
              if (selectedTopic?.id === topicId) setSelectedTopic(updated);
              return updated;
            }
            return t;
          })
        }))
      );

      // Sync local uploaded PDF to backend pioneer-db.json
      try {
        await fetch(`${API_BASE}/topics/${topicId}/materials`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-key': ADMIN_API_KEY
          },
          body: JSON.stringify({
            title: saved.title,
            type: 'pdf',
            url: saved.url,
            size: saved.size
          })
        });
      } catch (err) {
        console.warn('Backend material sync failed:', err);
      }
    } catch {
      // Fallback
      const fallback = {
        id: `mat-${Date.now()}`,
        topicId,
        title: (customTitle || file.name).endsWith('.pdf') ? customTitle || file.name : `${customTitle || file.name}.pdf`,
        type: 'pdf',
        url: URL.createObjectURL(file),
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: new Date().toISOString().split('T')[0]
      };

      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          topics: cat.topics.map((t) => {
            if (t.id === topicId) {
              const updated = {
                ...t,
                materials: [fallback, ...(t.materials || [])]
              };
              if (selectedTopic?.id === topicId) setSelectedTopic(updated);
              return updated;
            }
            return t;
          })
        }))
      );
    }
  };

  // Admin Action: Add new question
  const handleAdminAddQuestion = async (topicId, newQuestion) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        topics: cat.topics.map((t) => {
          if (t.id === topicId) {
            const nextQuestions = [...(t.questions || []), { ...newQuestion, qNumber: (t.questions?.length || 0) + 1 }];
            const updated = {
              ...t,
              questions: nextQuestions
            };
            if (selectedTopic?.id === topicId) setSelectedTopic(updated);
            return updated;
          }
          return t;
        })
      }))
    );

    // Sync question to backend pioneer-db.json
    try {
      await fetch(`${API_BASE}/topics/${topicId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        },
        body: JSON.stringify(newQuestion)
      });
    } catch (err) {
      console.warn('Backend question sync failed:', err);
    }
  };

  // Admin Action: Delete material
  const handleAdminDeleteMaterial = async (topicId, materialId) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        topics: cat.topics.map((t) => {
          if (t.id === topicId) {
            const updated = {
              ...t,
              materials: (t.materials || []).filter((m) => m.id !== materialId)
            };
            if (selectedTopic?.id === topicId) setSelectedTopic(updated);
            return updated;
          }
          return t;
        })
      }))
    );

    // Sync deletion to backend pioneer-db.json
    try {
      await fetch(`${API_BASE}/topics/${topicId}/materials/${materialId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-key': ADMIN_API_KEY
        }
      });
    } catch (err) {
      console.warn('Backend delete sync failed:', err);
    }

    showToast('Material removed.');
  };

  // User click on category / topic from Landing Page -> open Course Detail Page
  const handleExploreCourseFromLanding = (topic, categoryName) => {
    // Find the full category object
    const cat = categories.find(
      (c) => c.category === categoryName || c.topics.some((t) => t.id === topic.id)
    );
    if (cat) {
      setSelectedCourse(cat);
      navigateTo('course');
    } else {
      // Fallback: go directly to practice
      setSelectedTopic(topic);
      navigateTo('practice');
    }
  };

  // From course page, start practicing a specific topic
  const handleStartTopicFromCourse = (topic) => {
    setSelectedTopic(topic);
    navigateTo('practice');
  };

 
  const [loader , setisloading] = useState(true);

  return (
    <div className="pioneer-app-root">
      {/* Toast Alert */}
      {/* {toast && <div className="pioneer-toast">{toast}</div>} */}


   {   
   
   useEffect(()=>{

     setTimeout(() => {

      setisloading(()=>(false));
      
     }, 5000);

   },[])
  
  
  
  }
      
      {

         (loader==true && <Loader/>)



      }

      {/* Top Navbar */}
      <Navbar
        currentView={currentRoute}
        onChangeView={navigateTo}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onGoToAdmin={() => navigateTo('admin')}
        isAdminRoute={currentRoute === 'admin'}
      />

      <Routes>
        {/* / → Landing Page */}
        <Route
          path="/"
          element={
            <LandingPage
              categories={categories}
              onExploreTopic={handleExploreCourseFromLanding}
              onStartPractice={() => navigateTo('practice')}
              onOpenNotes={() => navigateTo('materials')}
              onGoToAdmin={() => navigateTo('admin')}
            />
          }
        />

        {/* /admin → Admin Studio */}
        <Route
          path="/admin"
          element={
            <AdminDashboard
              categories={categories}
              onAddPdf={handleAdminAddPdf}
              onAddQuestion={handleAdminAddQuestion}
              onCreateTopic={handleCreateTopic}
              onDeleteMaterial={handleAdminDeleteMaterial}
              onExitAdmin={() => navigateTo('practice')}
              showToast={showToast}
            />
          }
        />

        {/* /course → Course Detail Page */}
        <Route
          path="/course"
          element={
            selectedCourse ? (
              <CoursePage
                category={selectedCourse}
                onBack={() => navigateTo('landing')}
                onStartTopic={handleStartTopicFromCourse}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* /practice and /notes → Explorer layout (shared sidebar) */}
        <Route
          path="/practice"
          element={
            <ExplorerLayout
              categories={categories}
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredQuestions={filteredQuestions}
              currentCategory={currentCategory}
              currentRoute="practice"
              navigateTo={navigateTo}
            />
          }
        />
        <Route
          path="/notes"
          element={
            <ExplorerLayout
              categories={categories}
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredQuestions={filteredQuestions}
              currentCategory={currentCategory}
              currentRoute="materials"
              navigateTo={navigateTo}
            />
          }
        />

        {/* Catch-all → redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// ─── Extracted Explorer Layout (shared between /practice and /notes) ───────────
function ExplorerLayout({
  categories,
  selectedTopic,
  setSelectedTopic,
  isSidebarOpen,
  setIsSidebarOpen,
  searchQuery,
  setSearchQuery,
  filteredQuestions,
  currentCategory,
  currentRoute,
  navigateTo,
}) {
  return (
    <div className="pioneer-explorer-layout">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="pioneer-mobile-backdrop"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <SidebarExplorer
        categories={categories}
        selectedTopicId={selectedTopic?.id}
        onSelectTopic={(topic) => {
          setSelectedTopic(topic);
          if (window.innerWidth <= 900) {
            setIsSidebarOpen(false);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="pioneer-content-area">
        {selectedTopic ? (
          <div className="pioneer-content-inner">
            {/* Mobile Breadcrumb / Directory Toggle Bar */}
            <div className="pioneer-mobile-dir-bar">
              <button
                type="button"
                className="pioneer-mobile-dir-btn"
                onClick={() => setIsSidebarOpen(true)}
              >
                📂 Browse Topics
              </button>
              <span className="pioneer-mobile-active-topic">{selectedTopic.title}</span>
            </div>

            {/* Breadcrumbs */}
            <nav className="pioneer-breadcrumb" aria-label="Breadcrumb">
              <span onClick={() => navigateTo('landing')} className="pioneer-bc-link">Home</span>
              <span className="pioneer-bc-sep">/</span>
              <span>{currentCategory}</span>
              <span className="pioneer-bc-sep">/</span>
              <span className="pioneer-bc-current">{selectedTopic.title}</span>
            </nav>

            {/* Topic Header */}
            <header className="pioneer-topic-banner">
              <div className="pioneer-tb-text">
                <h1 className="pioneer-topic-heading">{selectedTopic.title}</h1>
                {selectedTopic.summary && (
                  <p className="pioneer-topic-desc">{selectedTopic.summary}</p>
                )}
              </div>

              {/* View Mode Switcher */}
              <div className="pioneer-view-toggle">
                <button
                  type="button"
                  className={`pioneer-vt-btn ${currentRoute === 'practice' ? 'active' : ''}`}
                  onClick={() => navigateTo('practice')}
                >
                  Practice Questions ({selectedTopic.questions?.length || 0})
                </button>
                <button
                  type="button"
                  className={`pioneer-vt-btn ${currentRoute === 'materials' ? 'active' : ''}`}
                  onClick={() => navigateTo('materials')}
                >
                  Attached Notes ({selectedTopic.materials?.length || 0})
                </button>
              </div>
            </header>

            {/* Subview 1: Practice Questions */}
            {currentRoute === 'practice' && (
              <section className="pioneer-questions-container">
                <div className="pioneer-q-summary-bar">
                  <span className="pioneer-q-count-badge">
                    Showing <strong>{filteredQuestions.length}</strong> of{' '}
                    <strong>{selectedTopic.questions?.length || 0}</strong> questions
                  </span>

                  <div className="pioneer-quick-jumps">
                    <span className="pioneer-jump-label">Jump to:</span>
                    {filteredQuestions.map((q, idx) => (
                      <a
                        key={q.id}
                        href={`#q-${q.id}`}
                        className="pioneer-jump-pill"
                      >
                        {q.qNumber || idx + 1}
                      </a>
                    ))}
                  </div>
                </div>

                {filteredQuestions.length === 0 ? (
                  <div className="pioneer-empty-box">
                    <h3>No questions match your filter</h3>
                    <p>Try clearing your search query or pick another topic from the directory.</p>
                    {searchQuery && (
                      <button
                        type="button"
                        className="pioneer-btn-primary"
                        onClick={() => setSearchQuery('')}
                      >
                        Clear Filter
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="pioneer-questions-flow">
                    {filteredQuestions.map((q, idx) => (
                      <QuestionCard
                        key={q.id}
                        question={q}
                        index={idx}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Subview 2: Study Notes */}
            {currentRoute === 'materials' && (
              <section className="pioneer-notes-container">
                <div className="pioneer-notes-head">
                  <div>
                    <h2>Study Documents & Reference PDFs</h2>
                    <p>
                      Formula sheets and verified notes for <strong>{selectedTopic.title}</strong>.
                    </p>
                  </div>
                </div>

                {selectedTopic.materials && selectedTopic.materials.length > 0 ? (
                  <div className="pioneer-viewer-wrap">
                    <MaterialViewer materials={selectedTopic.materials} />
                  </div>
                ) : (
                  <div className="pioneer-empty-box">
                    <h3>No reference documents attached yet</h3>
                    <p>
                      Our educators are currently curating formula sheets and PDF summaries for this topic. Check back soon!
                    </p>
                  </div>
                )}
              </section>
            )}
          </div>
        ) : (
          <div className="pioneer-empty-placeholder">
            <p>Select a topic from the directory on the left to start practicing.</p>
          </div>
        )}
      </main>
    </div>
  );
}
