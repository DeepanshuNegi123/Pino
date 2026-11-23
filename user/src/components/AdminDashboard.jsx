import { useState } from 'react';

/**
 * AdminDashboard: Dedicated admin route for managing content,
 * uploading PDFs, creating new categories & topics, and adding questions.
 */
export default function AdminDashboard({
  categories = [],
  onAddPdf,
  onAddQuestion,
  onCreateTopic,
  onDeleteMaterial,
  onExitAdmin,
  showToast
}) {
  // Admin Gate / Password Protection State
  const EXPECTED_KEY = 'meow';
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('pioneer_admin_auth') === 'true';
  });
  const [authError, setAuthError] = useState('');

  const handleUnlock = (e) => {
    e.preventDefault();
    if (adminKeyInput.trim() === EXPECTED_KEY) {
      sessionStorage.setItem('pioneer_admin_auth', 'true');
      setIsAuthenticated(true);
      setAuthError('');
      showToast('Admin Studio unlocked.');
    } else {
      setAuthError('Incorrect admin key. Access denied.');
      showToast('Invalid admin key.');
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem('pioneer_admin_auth');
    setIsAuthenticated(false);
    onExitAdmin();
  };

  const [activeTab, setActiveTab] = useState('upload-pdf'); // 'upload-pdf' | 'create-topic' | 'add-question' | 'manage-content'

  // PDF Upload Form State
  const [pdfSourceType, setPdfSourceType] = useState('upload'); // 'upload' | 's3'
  const [s3Url, setS3Url] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfCategoryMode, setPdfCategoryMode] = useState('existing'); // 'existing' | 'new'
  const [pdfCategory, setPdfCategory] = useState(categories[0]?.category || 'Quantitative Aptitude');
  const [newPdfCategoryName, setNewPdfCategoryName] = useState('');

  const [pdfTopicMode, setPdfTopicMode] = useState('existing'); // 'existing' | 'new'
  const [pdfTopicId, setPdfTopicId] = useState(categories[0]?.topics[0]?.id || '');
  const [newPdfTopicTitle, setNewPdfTopicTitle] = useState('');
  const [newPdfTopicSummary, setNewPdfTopicSummary] = useState('');

  const [isUploading, setIsUploading] = useState(false);

  // Dedicated "Create Course / Topic" Form State
  const [courseCategoryMode, setCourseCategoryMode] = useState('existing');
  const [courseCategory, setCourseCategory] = useState(categories[0]?.category || 'Quantitative Aptitude');
  const [newCourseCatName, setNewCourseCatName] = useState('');
  const [newCourseTopicTitle, setNewCourseTopicTitle] = useState('');
  const [newCourseTopicSummary, setNewCourseTopicSummary] = useState('');

  // Question Form State
  const [qCategoryMode, setQCategoryMode] = useState('existing');
  const [qCategory, setQCategory] = useState(categories[0]?.category || 'Quantitative Aptitude');
  const [newQCategoryName, setNewQCategoryName] = useState('');

  const [qTopicMode, setQTopicMode] = useState('existing');
  const [qTopicId, setQTopicId] = useState(categories[0]?.topics[0]?.id || '');
  const [newQTopicTitle, setNewQTopicTitle] = useState('');
  const [newQTopicSummary, setNewQTopicSummary] = useState('');

  const [qText, setQText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOpt, setCorrectOpt] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');

  // Topics for selected categories
  const pdfTopics = categories.find((c) => c.category === pdfCategory)?.topics || [];
  const qTopics = categories.find((c) => c.category === qCategory)?.topics || [];

  // Summary counts
  const totalQuestions = categories.reduce(
    (sum, cat) => sum + cat.topics.reduce((qSum, t) => qSum + (t.questions?.length || 0), 0),
    0
  );

  const totalTopics = categories.reduce((sum, cat) => sum + cat.topics.length, 0);

  // Collect all attached materials
  const allMaterials = [];
  categories.forEach((cat) => {
    cat.topics.forEach((t) => {
      (t.materials || []).forEach((m) => {
        allMaterials.push({ ...m, topicTitle: t.title, topicId: t.id, category: cat.category });
      });
    });
  });

  // Handle PDF file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Please select a valid .pdf file');
      return;
    }

    setPdfFile(file);
    if (!pdfTitle) {
      setPdfTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  // Submit PDF Upload or S3 Link
  const handlePdfSubmit = async (e) => {
    e.preventDefault();
    if (pdfSourceType === 'upload' && !pdfFile) {
      showToast('Please select a PDF file to upload.');
      return;
    }
    if (pdfSourceType === 's3' && !s3Url.trim()) {
      showToast('Please enter your AWS S3 public PDF URL.');
      return;
    }

    let finalCategoryName = pdfCategory;
    let finalCategoryIcon = '';

    if (pdfCategoryMode === 'new') {
      if (!newPdfCategoryName.trim()) {
        showToast('Please enter a name for the new category.');
        return;
      }
      finalCategoryName = newPdfCategoryName.trim();
    }

    let targetTopicId = pdfTopicId;
    let newTopicObj = null;

    if (pdfCategoryMode === 'new' || pdfTopicMode === 'new') {
      if (!newPdfTopicTitle.trim()) {
        showToast('Please enter a title for the new subtopic.');
        return;
      }
      const slug = newPdfTopicTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      targetTopicId = `topic-${slug}-${Date.now().toString().slice(-4)}`;
      newTopicObj = {
        id: targetTopicId,
        title: newPdfTopicTitle.trim(),
        summary: newPdfTopicSummary.trim() || 'Comprehensive study modules & practice tests.',
        questions: [],
        materials: []
      };

      // Create topic first
      onCreateTopic({
        categoryName: finalCategoryName,
        categoryIcon: finalCategoryIcon,
        isNewCategory: pdfCategoryMode === 'new',
        topic: newTopicObj
      });
    }

    if (!targetTopicId) {
      showToast('Please select or create a destination topic.');
      return;
    }

    setIsUploading(true);
    try {
      await onAddPdf({
        topicId: targetTopicId,
        file: pdfSourceType === 'upload' ? pdfFile : null,
        s3Url: pdfSourceType === 's3' ? s3Url.trim() : null,
        customTitle: pdfTitle.trim() || (pdfFile ? pdfFile.name : 'AWS S3 Document.pdf')
      });

      setPdfFile(null);
      setS3Url('');
      setPdfTitle('');
      setNewPdfTopicTitle('');
      setNewPdfTopicSummary('');
      setNewPdfCategoryName('');
      setPdfTopicMode('existing');
      setPdfCategoryMode('existing');
      showToast('✅ PDF uploaded & attached to topic successfully!');
    } catch (err) {
      showToast('Failed to upload PDF: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Standalone Course / Topic Creation
  const handleCreateCourseSubmit = (e) => {
    e.preventDefault();

    let finalCategoryName = courseCategory;
    let finalCategoryIcon = '';

    if (courseCategoryMode === 'new') {
      if (!newCourseCatName.trim()) {
        showToast('Please provide a category name.');
        return;
      }
      finalCategoryName = newCourseCatName.trim();
    }

    if (!newCourseTopicTitle.trim()) {
      showToast('Please enter a subtopic title.');
      return;
    }

    const slug = newCourseTopicTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newTopicId = `topic-${slug}-${Date.now().toString().slice(-4)}`;

    const newTopic = {
      id: newTopicId,
      title: newCourseTopicTitle.trim(),
      summary: newCourseTopicSummary.trim() || 'Comprehensive study modules & practice tests.',
      questions: [],
      materials: []
    };

    onCreateTopic({
      categoryName: finalCategoryName,
      categoryIcon: finalCategoryIcon,
      isNewCategory: courseCategoryMode === 'new',
      topic: newTopic
    });

    setNewCourseTopicTitle('');
    setNewCourseTopicSummary('');
    setNewCourseCatName('');
    setCourseCategoryMode('existing');
    showToast(`✅ Created topic "${newTopic.title}" in ${finalCategoryName}!`);
  };

  // Submit Question
  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    if (!qText.trim() || !optA.trim() || !optB.trim()) {
      showToast('Please fill in question text and at least options A and B.');
      return;
    }

    let finalCategoryName = qCategory;
    let finalCategoryIcon = '';

    if (qCategoryMode === 'new') {
      if (!newQCategoryName.trim()) {
        showToast('Please enter a name for the new category.');
        return;
      }
      finalCategoryName = newQCategoryName.trim();
    }

    let targetTopicId = qTopicId;

    if (qCategoryMode === 'new' || qTopicMode === 'new') {
      if (!newQTopicTitle.trim()) {
        showToast('Please enter a subtopic title for this question.');
        return;
      }
      const slug = newQTopicTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      targetTopicId = `topic-${slug}-${Date.now().toString().slice(-4)}`;
      const newTopic = {
        id: targetTopicId,
        title: newQTopicTitle.trim(),
        summary: newQTopicSummary.trim() || 'Curated question sets and exercises.',
        questions: [],
        materials: []
      };

      onCreateTopic({
        categoryName: finalCategoryName,
        categoryIcon: finalCategoryIcon,
        isNewCategory: qCategoryMode === 'new',
        topic: newTopic
      });
    }

    if (!targetTopicId) {
      showToast('Please select or create a target topic.');
      return;
    }

    const newQuestion = {
      id: `q-custom-${Date.now()}`,
      questionText: qText.trim(),
      options: [optA.trim(), optB.trim(), optC.trim(), optD.trim()].filter(Boolean),
      correctOption: Number(correctOpt),
      explanation: explanation.trim() || 'Step-by-step explanation verified by Pioneer.',
      difficulty
    };

    onAddQuestion(targetTopicId, newQuestion);

    // Reset question form
    setQText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setExplanation('');
    showToast('✅ Question published directly to topic!');
  };

  // 1. If not authenticated, show Admin Gate Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="pioneer-admin-lock-screen">
        <div className="pioneer-lock-card">
          <h2>Admin Studio Restricted</h2>
          <p>
            This portal is restricted to Pioneer administrators for publishing course materials and questions.
          </p>

          <form onSubmit={handleUnlock} className="pioneer-lock-form">
            <div className="pioneer-form-group">
              <label>Admin Secret Key</label>
              <input
                type="password"
                className="pioneer-input"
                placeholder="Enter admin secret key..."
                value={adminKeyInput}
                onChange={(e) => setAdminKeyInput(e.target.value)}
                autoFocus
                required
              />
            </div>

            {authError && <div className="pioneer-auth-error">{authError}</div>}

            <button type="submit" className="pioneer-btn-primary pioneer-btn-lg" style={{ width: '100%' }}>
              Unlock Studio →
            </button>
          </form>

          <div className="pioneer-lock-footer">
            <button
              type="button"
              className="pioneer-btn-link"
              onClick={onExitAdmin}
            >
              ← Return to Student Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pioneer-admin-root">
      {/* Admin Top Header Banner */}
      <header className="pioneer-admin-header">
        <div className="pioneer-admin-header-inner">
          <div className="pioneer-admin-title-group">
            <span className="pioneer-admin-badge">ADMIN STUDIO</span>
            <h1>Curriculum & Upload Studio</h1>
            <p>Upload lecture PDFs, create new course categories, and publish practice questions.</p>
          </div>

          <div className="pioneer-admin-header-actions">
            <button
              type="button"
              className="pioneer-btn-admin-preview"
              onClick={handleLock}
              title="Lock and sign out of admin studio"
            >
              Lock & Sign Out
            </button>
            <button
              type="button"
              className="pioneer-btn-admin-preview"
              onClick={onExitAdmin}
            >
              ← Back to Student View
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="pioneer-admin-container">
        {/* Metric Cards */}
        <div className="pioneer-admin-metrics">
          <div className="pioneer-metric-card">
            <div>
              <div className="pioneer-metric-value">{categories.length}</div>
              <div className="pioneer-metric-label">Subject Tracks</div>
            </div>
          </div>

          <div className="pioneer-metric-card">
            <div>
              <div className="pioneer-metric-value">{totalTopics}</div>
              <div className="pioneer-metric-label">Course Subtopics</div>
            </div>
          </div>

          <div className="pioneer-metric-card">
            <div>
              <div className="pioneer-metric-value">{totalQuestions}</div>
              <div className="pioneer-metric-label">Published Questions</div>
            </div>
          </div>

          <div className="pioneer-metric-card">
            <div>
              <div className="pioneer-metric-value">{allMaterials.length}</div>
              <div className="pioneer-metric-label">Attached PDF Notes</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="pioneer-admin-tabs">
          <button
            type="button"
            className={`pioneer-admin-tab-btn ${activeTab === 'upload-pdf' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload-pdf')}
          >
            Upload & Attach PDF
          </button>
          <button
            type="button"
            className={`pioneer-admin-tab-btn ${activeTab === 'create-topic' ? 'active' : ''}`}
            onClick={() => setActiveTab('create-topic')}
          >
            + Add Topic or Course
          </button>
          <button
            type="button"
            className={`pioneer-admin-tab-btn ${activeTab === 'add-question' ? 'active' : ''}`}
            onClick={() => setActiveTab('add-question')}
          >
            Add Practice Question
          </button>
          <button
            type="button"
            className={`pioneer-admin-tab-btn ${activeTab === 'manage-content' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage-content')}
          >
            Stored Files ({allMaterials.length})
          </button>
        </div>

        {/* TAB 1: Upload PDF (With inline category / topic creator) */}
        {activeTab === 'upload-pdf' && (
          <section className="pioneer-admin-panel">
            <div className="pioneer-panel-head">
              <h2>Upload PDF Document</h2>
              <p>Choose an existing topic or create a new course topic on the fly to attach this PDF.</p>
            </div>

            <form onSubmit={handlePdfSubmit} className="pioneer-admin-form">
              {/* Category Selection or Creation */}
              <div className="pioneer-form-group">
                <div className="pioneer-label-row">
                  <label>1. Category / Track</label>
                  <div className="pioneer-mode-toggle">
                    <button
                      type="button"
                      className={`pioneer-mode-btn ${pdfCategoryMode === 'existing' ? 'active' : ''}`}
                      onClick={() => setPdfCategoryMode('existing')}
                    >
                      Choose Existing
                    </button>
                    <button
                      type="button"
                      className={`pioneer-mode-btn ${pdfCategoryMode === 'new' ? 'active' : ''}`}
                      onClick={() => {
                        setPdfCategoryMode('new');
                        setPdfTopicMode('new');
                      }}
                    >
                      + Create New Category
                    </button>
                  </div>
                </div>

                {pdfCategoryMode === 'existing' ? (
                  <select
                    value={pdfCategory}
                    onChange={(e) => {
                      setPdfCategory(e.target.value);
                      const cat = categories.find((c) => c.category === e.target.value);
                      if (cat?.topics?.[0]) setPdfTopicId(cat.topics[0].id);
                    }}
                    className="pioneer-input"
                  >
                    {categories.map((c) => (
                      <option key={c.category} value={c.category}>
                        {c.category}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="pioneer-inline-create-box">
                    <div className="pioneer-inline-grid">
                      <div className="flex-1">
                        <span className="pioneer-sub-label">New Category Name</span>
                        <input
                          type="text"
                          className="pioneer-input"
                          placeholder="e.g. Computer Networks & Cloud"
                          value={newPdfCategoryName}
                          onChange={(e) => setNewPdfCategoryName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Topic Selection or Creation */}
              <div className="pioneer-form-group">
                <div className="pioneer-label-row">
                  <label>2. Topic / Module in Directory</label>
                  {pdfCategoryMode === 'existing' && (
                    <div className="pioneer-mode-toggle">
                      <button
                        type="button"
                        className={`pioneer-mode-btn ${pdfTopicMode === 'existing' ? 'active' : ''}`}
                        onClick={() => setPdfTopicMode('existing')}
                      >
                        Choose Existing Topic
                      </button>
                      <button
                        type="button"
                        className={`pioneer-mode-btn ${pdfTopicMode === 'new' ? 'active' : ''}`}
                        onClick={() => setPdfTopicMode('new')}
                      >
                        + Create New Topic
                      </button>
                    </div>
                  )}
                </div>

                {pdfTopicMode === 'existing' && pdfCategoryMode === 'existing' ? (
                  <select
                    value={pdfTopicId}
                    onChange={(e) => setPdfTopicId(e.target.value)}
                    className="pioneer-input"
                  >
                    {pdfTopics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="pioneer-inline-create-box">
                    <div className="pioneer-form-group">
                      <span className="pioneer-sub-label">New Subtopic / Chapter Name</span>
                      <input
                        type="text"
                        className="pioneer-input"
                        placeholder="e.g. OSI Model & TCP/IP Deep Dive"
                        value={newPdfTopicTitle}
                        onChange={(e) => setNewPdfTopicTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="pioneer-form-group" style={{ marginTop: 8 }}>
                      <span className="pioneer-sub-label">Short Description / Key Concepts</span>
                      <input
                        type="text"
                        className="pioneer-input"
                        placeholder="e.g. Layer protocols, encapsulation, and packet routing."
                        value={newPdfTopicSummary}
                        onChange={(e) => setNewPdfTopicSummary(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* PDF Source: File Upload or AWS S3 URL */}
              <div className="pioneer-form-group">
                <div className="pioneer-label-row">
                  <label>3. PDF Source</label>
                  <div className="pioneer-mode-toggle">
                    <button
                      type="button"
                      className={`pioneer-mode-btn ${pdfSourceType === 'upload' ? 'active' : ''}`}
                      onClick={() => setPdfSourceType('upload')}
                    >
                      Upload PDF File
                    </button>
                    <button
                      type="button"
                      className={`pioneer-mode-btn ${pdfSourceType === 's3' ? 'active' : ''}`}
                      onClick={() => setPdfSourceType('s3')}
                    >
                      Paste AWS S3 URL
                    </button>
                  </div>
                </div>

                {pdfSourceType === 'upload' ? (
                  <div className="pioneer-dropzone">
                    <input
                      type="file"
                      id="admin-pdf-input"
                      accept=".pdf,application/pdf"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="admin-pdf-input" className="pioneer-dropzone-label">
                      <span className="pioneer-drop-title">
                        {pdfFile ? pdfFile.name : 'Click or drag PDF document here'}
                      </span>
                      <span className="pioneer-drop-sub">
                        {pdfFile
                          ? `${(pdfFile.size / 1024 / 1024).toFixed(2)} MB • Ready to attach`
                          : 'Supports formula sheets, study materials, lecture summaries up to 50MB'}
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="pioneer-inline-create-box">
                    <span className="pioneer-sub-label">AWS S3 Public Document URL</span>
                    <input
                      type="url"
                      className="pioneer-input"
                      placeholder="https://your-bucket-name.s3.region.amazonaws.com/notes/sample.pdf"
                      value={s3Url}
                      onChange={(e) => {
                        setS3Url(e.target.value);
                        if (!pdfTitle && e.target.value) {
                          const parts = e.target.value.split('/');
                          const filename = parts[parts.length - 1];
                          if (filename) setPdfTitle(decodeURIComponent(filename.replace(/\.pdf$/i, '')));
                        }
                      }}
                      required={pdfSourceType === 's3'}
                    />
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                      Paste the Object URL from your AWS S3 bucket. Pioneer will stream and embed it directly.
                    </span>
                  </div>
                )}
              </div>

              {/* Title input */}
              <div className="pioneer-form-group">
                <label>4. Display Title for Students</label>
                <input
                  type="text"
                  className="pioneer-input"
                  placeholder="e.g. Complete OSI Model Cheat Sheet 2026"
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                />
              </div>

              <div className="pioneer-form-actions">
                <button
                  type="submit"
                  disabled={isUploading || !pdfFile}
                  className="pioneer-btn-primary pioneer-btn-lg"
                >
                  {isUploading ? 'Uploading & Creating...' : 'Save & Attach PDF to Directory →'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* TAB 2: Dedicated Course & Topic Creator */}
        {activeTab === 'create-topic' && (
          <section className="pioneer-admin-panel">
            <div className="pioneer-panel-head">
              <h2>Add Course Topic to Directory</h2>
              <p>Add a new category or expand an existing track with new study topics.</p>
            </div>

            <form onSubmit={handleCreateCourseSubmit} className="pioneer-admin-form">
              <div className="pioneer-form-group">
                <div className="pioneer-label-row">
                  <label>1. Category Track</label>
                  <div className="pioneer-mode-toggle">
                    <button
                      type="button"
                      className={`pioneer-mode-btn ${courseCategoryMode === 'existing' ? 'active' : ''}`}
                      onClick={() => setCourseCategoryMode('existing')}
                    >
                      Use Existing Category
                    </button>
                    <button
                      type="button"
                      className={`pioneer-mode-btn ${courseCategoryMode === 'new' ? 'active' : ''}`}
                      onClick={() => setCourseCategoryMode('new')}
                    >
                      + Create New Category
                    </button>
                  </div>
                </div>

                {courseCategoryMode === 'existing' ? (
                  <select
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value)}
                    className="pioneer-input"
                  >
                    {categories.map((c) => (
                      <option key={c.category} value={c.category}>
                        {c.category} ({c.topics.length} topics)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="pioneer-inline-create-box">
                    <div className="pioneer-inline-grid">
                      <div className="flex-1">
                        <span className="pioneer-sub-label">Category Name</span>
                        <input
                          type="text"
                          className="pioneer-input"
                          placeholder="e.g. Cloud Computing & DevOps"
                          value={newCourseCatName}
                          onChange={(e) => setNewCourseCatName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pioneer-form-group">
                <label>2. Topic Title</label>
                <input
                  type="text"
                  className="pioneer-input"
                  placeholder="e.g. AWS S3, CloudFront & Storage Architecture"
                  value={newCourseTopicTitle}
                  onChange={(e) => setNewCourseTopicTitle(e.target.value)}
                  required
                />
              </div>

              <div className="pioneer-form-group">
                <label>3. Topic Summary / Description</label>
                <textarea
                  rows={3}
                  className="pioneer-input pioneer-textarea"
                  placeholder="Summarize the core concepts covered in this module..."
                  value={newCourseTopicSummary}
                  onChange={(e) => setNewCourseTopicSummary(e.target.value)}
                />
              </div>

              <div className="pioneer-form-actions">
                <button type="submit" className="pioneer-btn-primary pioneer-btn-lg">
                  + Add Topic to Platform Directory
                </button>
              </div>
            </form>
          </section>
        )}

        {/* TAB 3: Add Question */}
        {activeTab === 'add-question' && (
          <section className="pioneer-admin-panel">
            <div className="pioneer-panel-head">
              <h2>Add Practice Question</h2>
              <p>Publish an MCQ with detailed options, answer key, and step-by-step breakdown.</p>
            </div>

            <form onSubmit={handleQuestionSubmit} className="pioneer-admin-form">
              {/* Category Selection */}
              <div className="pioneer-form-group">
                <div className="pioneer-label-row">
                  <label>Category Track</label>
                  <div className="pioneer-mode-toggle">
                    <button
                      type="button"
                      className={`pioneer-mode-btn ${qCategoryMode === 'existing' ? 'active' : ''}`}
                      onClick={() => setQCategoryMode('existing')}
                    >
                      Existing
                    </button>
                    <button
                      type="button"
                      className={`pioneer-mode-btn ${qCategoryMode === 'new' ? 'active' : ''}`}
                      onClick={() => {
                        setQCategoryMode('new');
                        setQTopicMode('new');
                      }}
                    >
                      + New
                    </button>
                  </div>
                </div>

                {qCategoryMode === 'existing' ? (
                  <select
                    value={qCategory}
                    onChange={(e) => {
                      setQCategory(e.target.value);
                      const cat = categories.find((c) => c.category === e.target.value);
                      if (cat?.topics?.[0]) setQTopicId(cat.topics[0].id);
                    }}
                    className="pioneer-input"
                  >
                    {categories.map((c) => (
                      <option key={c.category} value={c.category}>
                        {c.category}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="pioneer-inline-create-box">
                    <input
                      type="text"
                      className="pioneer-input"
                      placeholder="New Category Name (e.g. Discrete Mathematics)"
                      value={newQCategoryName}
                      onChange={(e) => setNewQCategoryName(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Topic Selection */}
              <div className="pioneer-form-group">
                <div className="pioneer-label-row">
                  <label>Topic Directory</label>
                  {qCategoryMode === 'existing' && (
                    <div className="pioneer-mode-toggle">
                      <button
                        type="button"
                        className={`pioneer-mode-btn ${qTopicMode === 'existing' ? 'active' : ''}`}
                        onClick={() => setQTopicMode('existing')}
                      >
                        Existing
                      </button>
                      <button
                        type="button"
                        className={`pioneer-mode-btn ${qTopicMode === 'new' ? 'active' : ''}`}
                        onClick={() => setQTopicMode('new')}
                      >
                        + New
                      </button>
                    </div>
                  )}
                </div>

                {qTopicMode === 'existing' && qCategoryMode === 'existing' ? (
                  <select
                    value={qTopicId}
                    onChange={(e) => setQTopicId(e.target.value)}
                    className="pioneer-input"
                  >
                    {qTopics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="pioneer-inline-create-box">
                    <input
                      type="text"
                      className="pioneer-input"
                      placeholder="New Subtopic Name (e.g. Graph Theory & Trees)"
                      value={newQTopicTitle}
                      onChange={(e) => setNewQTopicTitle(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="pioneer-form-group">
                <label>Question Text</label>
                <textarea
                  rows={4}
                  className="pioneer-input pioneer-textarea"
                  placeholder="Enter the question prompt clearly here..."
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  required
                />
              </div>

              {/* Options Builder */}
              <div className="pioneer-options-builder">
                <label className="pioneer-builder-label">Options & Answer Key (Select radio for correct answer)</label>
                
                <div className="pioneer-opt-row">
                  <input
                    type="radio"
                    name="correct-opt"
                    checked={correctOpt === 0}
                    onChange={() => setCorrectOpt(0)}
                  />
                  <span className="pioneer-opt-tag">A</span>
                  <input
                    type="text"
                    className="pioneer-input"
                    placeholder="Option A text"
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    required
                  />
                </div>

                <div className="pioneer-opt-row">
                  <input
                    type="radio"
                    name="correct-opt"
                    checked={correctOpt === 1}
                    onChange={() => setCorrectOpt(1)}
                  />
                  <span className="pioneer-opt-tag">B</span>
                  <input
                    type="text"
                    className="pioneer-input"
                    placeholder="Option B text"
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    required
                  />
                </div>

                <div className="pioneer-opt-row">
                  <input
                    type="radio"
                    name="correct-opt"
                    checked={correctOpt === 2}
                    onChange={() => setCorrectOpt(2)}
                  />
                  <span className="pioneer-opt-tag">C</span>
                  <input
                    type="text"
                    className="pioneer-input"
                    placeholder="Option C text"
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                  />
                </div>

                <div className="pioneer-opt-row">
                  <input
                    type="radio"
                    name="correct-opt"
                    checked={correctOpt === 3}
                    onChange={() => setCorrectOpt(3)}
                  />
                  <span className="pioneer-opt-tag">D</span>
                  <input
                    type="text"
                    className="pioneer-input"
                    placeholder="Option D text"
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                  />
                </div>
              </div>

              <div className="pioneer-form-group">
                <label>Difficulty Rating</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="pioneer-input"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="pioneer-form-group">
                <label>Step-by-Step Logic & Explanation</label>
                <textarea
                  rows={4}
                  className="pioneer-input pioneer-textarea"
                  placeholder="Explain formulas, calculation steps, and reason for correct option..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                />
              </div>

              <div className="pioneer-form-actions">
                <button type="submit" className="pioneer-btn-primary pioneer-btn-lg">
                  Publish Question →
                </button>
              </div>
            </form>
          </section>
        )}

        {/* TAB 4: Manage Content */}
        {activeTab === 'manage-content' && (
          <section className="pioneer-admin-panel">
            <div className="pioneer-panel-head">
              <h2>Uploaded Materials & Documents</h2>
              <p>All PDFs attached across your topics directory.</p>
            </div>

            {allMaterials.length === 0 ? (
              <div className="pioneer-empty-state">
                <h3>No materials uploaded yet</h3>
                <p>Use the "Upload & Attach PDF" tab above to add documents.</p>
              </div>
            ) : (
              <div className="pioneer-materials-table-wrap">
                <table className="pioneer-admin-table">
                  <thead>
                    <tr>
                      <th>Document Title</th>
                      <th>Category & Topic</th>
                      <th>Format</th>
                      <th>Date / Size</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allMaterials.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.title}</strong>
                        </td>
                        <td>
                          <span className="pioneer-badge-neutral">{item.category}</span>
                          <span className="pioneer-sub-topic">{item.topicTitle}</span>
                        </td>
                        <td>
                          <span className="pioneer-badge-pdf">PDF</span>
                        </td>
                        <td>{item.size || item.uploadedAt || 'N/A'}</td>
                        <td>
                          <div className="pioneer-table-actions">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="pioneer-btn-sm-ghost"
                            >
                              Preview
                            </a>
                            <button
                              type="button"
                              className="pioneer-btn-sm-danger"
                              onClick={() => onDeleteMaterial(item.topicId, item.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
