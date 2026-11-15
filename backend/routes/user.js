import express from 'express';
import { db } from '../service/dbservice.js';

const router = express.Router();

// 1. Get all users
router.get('/', (req, res) => {
  res.json({
    success: true,
    users: db.users
  });
});

// 2. Get user by ID
router.get('/:id', (req, res) => {
  const user = db.users.find((u) => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Also include the courses this user is enrolled in
  const userEnrollments = db.enrollments.filter((e) => e.userId === user.id);
  const enrolledCourses = userEnrollments
    .map((e) => db.courses.find((c) => c.id === e.courseId))
    .filter(Boolean);

  res.json({
    success: true,
    user: {
      ...user,
      enrolledCourses
    }
  });
});

// 3. Update user profile (no auth required for now)
router.put('/:id', (req, res) => {
  const index = db.users.findIndex((u) => u.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  db.users[index] = {
    ...db.users[index],
    ...req.body,
    id: db.users[index].id // keep original ID
  };

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: db.users[index]
  });
});

export default router;
