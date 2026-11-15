import express from 'express';
import { db, saveDb } from '../service/dbservice.js';

const router = express.Router();

// 1. Get all topic categories and their question sets (Public for students)
router.get('/', (req, res) => {
  if (!db.categories) {
    db.categories = [];
  }

  res.json({
    success: true,
    count: db.categories.length,
    categories: db.categories
  });
});

// 2. Get a single topic by ID (Public)
router.get('/:topicId', (req, res) => {
  const { topicId } = req.params;
  let foundTopic = null;
  let categoryName = '';

  for (const cat of db.categories || []) {
    const t = cat.topics.find((item) => item.id === topicId);
    if (t) {
      foundTopic = t;
      categoryName = cat.category;
      break;
    }
  }

  if (!foundTopic) {
    return res.status(404).json({
      success: false,
      message: 'Topic not found'
    });
  }

  res.json({
    success: true,
    category: categoryName,
    topic: foundTopic
  });
});

// 3. Add or create a new Category / Topic (Requires Admin Auth)
router.post('/', (req, res) => {
  const { categoryName, categoryIcon, topic } = req.body;

  if (!categoryName || !topic || !topic.title) {
    return res.status(400).json({
      success: false,
      message: 'categoryName and topic object with title are required.'
    });
  }

  if (!db.categories) {
    db.categories = [];
  }

  const existingCat = db.categories.find(
    (c) => c.category.toLowerCase() === categoryName.trim().toLowerCase()
  );

  const newTopic = {
    id: topic.id || `t_${Date.now()}`,
    title: topic.title.trim(),
    summary: topic.summary || '',
    materials: topic.materials || [],
    questions: topic.questions || [],
    createdAt: new Date().toISOString()
  };

  if (existingCat) {
    existingCat.topics.push(newTopic);
  } else {
    db.categories.push({
      category: categoryName.trim(),
      icon: categoryIcon || '📁',
      topics: [newTopic]
    });
  }

  saveDb(); // Persist to backend/data/pioneer-db.json

  res.status(201).json({
    success: true,
    message: `Topic "${newTopic.title}" created successfully in "${categoryName}".`,
    topic: newTopic,
    categories: db.categories
  });
});

// 4. Attach PDF or S3 Material to a Topic (Requires Admin Auth)
router.post('/:topicId/materials', (req, res) => {
  const { topicId } = req.params;
  const { title, type, url, size } = req.body;

  if (!title || !url) {
    return res.status(400).json({
      success: false,
      message: 'Title and URL are required.'
    });
  }

  let targetTopic = null;
  for (const cat of db.categories || []) {
    const match = cat.topics.find((t) => t.id === topicId);
    if (match) {
      targetTopic = match;
      break;
    }
  }

  if (!targetTopic) {
    return res.status(404).json({
      success: false,
      message: 'Target topic not found'
    });
  }

  if (!targetTopic.materials) {
    targetTopic.materials = [];
  }

  const newMaterial = {
    id: `mat_${Date.now()}`,
    title: title.trim(),
    type: type || (url.toLowerCase().endsWith('.pdf') ? 'pdf' : 'pptx'),
    url: url.trim(),
    size: size || 'PDF Document',
    uploadedAt: new Date().toISOString().split('T')[0]
  };

  targetTopic.materials.unshift(newMaterial);
  saveDb(); // Persist to backend/data/pioneer-db.json

  res.status(201).json({
    success: true,
    message: 'Material attached to topic successfully.',
    material: newMaterial
  });
});

// 5. Delete Material from a Topic (Requires Admin Auth)
router.delete('/:topicId/materials/:materialId', (req, res) => {
  const { topicId, materialId } = req.params;

  let targetTopic = null;
  for (const cat of db.categories || []) {
    const match = cat.topics.find((t) => t.id === topicId);
    if (match) {
      targetTopic = match;
      break;
    }
  }

  if (!targetTopic || !targetTopic.materials) {
    return res.status(404).json({
      success: false,
      message: 'Topic or materials not found'
    });
  }

  const idx = targetTopic.materials.findIndex((m) => m.id === materialId);
  if (idx === -1) {
    return res.status(404).json({
      success: false,
      message: 'Material not found'
    });
  }

  const removed = targetTopic.materials.splice(idx, 1)[0];
  saveDb(); // Persist to backend/data/pioneer-db.json

  res.json({
    success: true,
    message: 'Material deleted successfully.',
    material: removed
  });
});

// 6. Add Question to a Topic (Requires Admin Auth)
router.post('/:topicId/questions', (req, res) => {
  const { topicId } = req.params;
  const { questionText, options, correctOption, explanation, difficulty } = req.body;

  if (!questionText || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'questionText and at least two options are required.'
    });
  }

  let targetTopic = null;
  for (const cat of db.categories || []) {
    const match = cat.topics.find((t) => t.id === topicId);
    if (match) {
      targetTopic = match;
      break;
    }
  }

  if (!targetTopic) {
    return res.status(404).json({
      success: false,
      message: 'Target topic not found'
    });
  }

  if (!targetTopic.questions) {
    targetTopic.questions = [];
  }

  const newQuestion = {
    id: `q_${Date.now()}`,
    qNumber: targetTopic.questions.length + 1,
    questionText: questionText.trim(),
    options,
    correctOption: Number(correctOption) || 0,
    explanation: explanation ? explanation.trim() : 'Step-by-step logic verified by Pioneer.',
    difficulty: difficulty || 'Medium',
    createdAt: new Date().toISOString()
  };

  targetTopic.questions.push(newQuestion);
  saveDb(); // Persist to backend/data/pioneer-db.json

  res.status(201).json({
    success: true,
    message: 'Question added to topic successfully.',
    question: newQuestion
  });
});

export default router;
