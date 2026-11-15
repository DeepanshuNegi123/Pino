import express from 'express';
import { db } from '../service/dbservice.js';

const router = express.Router();

// 1. Get all enrollments (optionally filter by ?userId=)
router.get('/', (req, res) => {
  const { userId } = req.query;
  let results = db.enrollments;

  if (userId) {
    results = results.filter((e) => e.userId === userId);
  }

  // Attach course details to each enrollment for easy display on frontend
  const enriched = results.map((enrollment) => {
    const course = db.courses.find((c) => c.id === enrollment.courseId);
    return {
      ...enrollment,
      course: course || null
    };
  });

  res.json({
    success: true,
    count: enriched.length,
    enrollments: enriched
  });
});

// 2. Enroll in a course
router.post('/', (req, res) => {
  const { courseId, userId = 'u1' } = req.body;

  if (!courseId) {
    return res.status(400).json({
      success: false,
      message: 'courseId is required to enroll'
    });
  }

  const course = db.courses.find((c) => c.id === String(courseId));
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Check if already enrolled
  const alreadyEnrolled = db.enrollments.find(
    (e) => e.courseId === String(courseId) && e.userId === userId
  );

  if (alreadyEnrolled) {
    return res.status(400).json({
      success: false,
      message: 'Already enrolled in this course'
    });
  }

  const newEnrollment = {
    id: `e_${Date.now()}`,
    courseId: String(courseId),
    userId,
    enrolledAt: new Date().toISOString()
  };

  db.enrollments.push(newEnrollment);

  res.status(201).json({
    success: true,
    message: 'Successfully enrolled in course',
    enrollment: {
      ...newEnrollment,
      course
    }
  });
});

// 3. Unenroll / cancel enrollment
router.delete('/:id', (req, res) => {
  const index = db.enrollments.findIndex((e) => e.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Enrollment record not found'
    });
  }

  const removed = db.enrollments.splice(index, 1)[0];

  res.json({
    success: true,
    message: 'Enrollment cancelled successfully',
    enrollment: removed
  });
});

export default router;
