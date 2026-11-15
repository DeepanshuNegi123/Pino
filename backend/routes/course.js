import express from 'express';
import { db, saveDb } from '../service/dbservice.js';

const router = express.Router();

// 1. Get all courses (supports optional ?category= and ?search= query params)
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let results = db.courses;

  if (category) {
    results = results.filter(
      (c) => c.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search) {
    results = results.filter(
      (c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.json({
    success: true,
    count: results.length,
    courses: results
  });
});

// 2. Get a single course by ID
router.get('/:id', (req, res) => {
  const course = db.courses.find((c) => c.id === req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  res.json({
    success: true,
    course
  });
});

// 3. Create a new course (Requires Admin Auth)
router.post('/', (req, res) => {
  const { title, description, instructor, price, category, thumbnail, lessons } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: 'Title is required'
    });
  }

  const newCourse = {
    id: String(Date.now()),
    title,
    description: description || '',
    instructor: instructor || 'Pioneer Instructor',
    price: Number(price) || 0,
    category: category || 'General',
    thumbnail: thumbnail || '',
    lessons: lessons || [],
    materials: [],
    createdAt: new Date().toISOString()
  };

  db.courses.push(newCourse);
  saveDb(); // Persist to disk

  res.status(201).json({
    success: true,
    message: 'Course created successfully',
    course: newCourse
  });
});

// 4. Update an existing course (Requires Admin Auth)
router.put('/:id', (req, res) => {
  const courseIndex = db.courses.findIndex((c) => c.id === req.params.id);

  if (courseIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  const updatedCourse = {
    ...db.courses[courseIndex],
    ...req.body,
    id: db.courses[courseIndex].id // keep original ID
  };

  db.courses[courseIndex] = updatedCourse;
  saveDb(); // Persist to disk

  res.json({
    success: true,
    message: 'Course updated successfully',
    course: updatedCourse
  });
});

// 5. Delete a course (Requires Admin Auth)
router.delete('/:id', (req, res) => {
  const courseIndex = db.courses.findIndex((c) => c.id === req.params.id);

  if (courseIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  const deletedCourse = db.courses.splice(courseIndex, 1)[0];
  saveDb(); // Persist to disk

  res.json({
    success: true,
    message: 'Course deleted successfully',
    course: deletedCourse
  });
});

// 6. Add PDF, S3, or PPTX material to a course (Requires Admin Auth)
router.post('/:id/materials', (req, res) => {
  const course = db.courses.find((c) => c.id === req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  const { title, type, url, size } = req.body;

  if (!title || !url) {
    return res.status(400).json({
      success: false,
      message: 'Title and URL are required'
    });
  }

  const detectedType = type || (url.toLowerCase().endsWith('.pdf') ? 'pdf' : 'pptx');

  if (!course.materials) {
    course.materials = [];
  }

  const newMaterial = {
    id: `m_${Date.now()}`,
    title,
    type: detectedType.toLowerCase(),
    url,
    size: size || 'PDF Document',
    uploadedAt: new Date().toISOString()
  };

  course.materials.push(newMaterial);
  saveDb(); // Persist to disk

  res.status(201).json({
    success: true,
    message: 'Material added successfully',
    material: newMaterial
  });
});

// 7. Delete a material from a course (Requires Admin Auth)
router.delete('/:id/materials/:materialId', (req, res) => {
  const course = db.courses.find((c) => c.id === req.params.id);

  if (!course || !course.materials) {
    return res.status(404).json({
      success: false,
      message: 'Course or materials not found'
    });
  }

  const materialIndex = course.materials.findIndex((m) => m.id === req.params.materialId);

  if (materialIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Material not found'
    });
  }

  const removed = course.materials.splice(materialIndex, 1)[0];
  saveDb(); // Persist to disk

  res.json({
    success: true,
    message: 'Material deleted successfully',
    material: removed
  });
});

export default router;
