/**
 * Admin Authentication Middleware
 * - All GET requests are 100% public (for students and visitors to read and practice).
 * - Mutation requests (POST, PUT, DELETE) require a secret header `x-admin-key`.
 */
export const adminAuth = (req, res, next) => {
  // 1. Allow all public GET requests (Zero friction for students)
  if (req.method === 'GET' || req.method === 'OPTIONS') {
    return next();
  }

  // 2. Verify admin secret key for write actions (POST, PUT, DELETE)
  const clientKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_KEY || 'pioneer-admin-secret-2026';

  if (!clientKey || clientKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing or invalid x-admin-key header. Public users have read-only access.'
    });
  }

  next();
};
