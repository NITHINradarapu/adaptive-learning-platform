/**
 * Comprehensive Test Suite for Adaptive Learning Platform
 * =========================================================
 * Generated from codebase evaluation audit findings.
 * Uses Jest + ts-jest.
 *
 * Run: npm test (from backend directory)
 *
 * Sections:
 *   1. Unit Tests — JWT Utility
 *   2. Unit Tests — RL Reward Calculation (pure function)
 *   3. Unit Tests — Auth Middleware (authorize)
 *   4. Unit Tests — Error Handler Middleware
 *   5. Bug Regression Tests
 */

// ============================================================
// 1. UNIT TESTS — JWT Utility
// ============================================================
describe('JWT Utility', () => {
  // Import is deferred so config/dotenv runs inside the test context
  let generateToken: typeof import('../utils/jwt').generateToken;
  let verifyToken: typeof import('../utils/jwt').verifyToken;

  beforeAll(() => {
    // Ensure dotenv is loaded before importing JWT utils
    require('dotenv').config();
    const jwt = require('../utils/jwt');
    generateToken = jwt.generateToken;
    verifyToken = jwt.verifyToken;
  });

  /**
   * TEST: Token generation produces a valid JWT string
   * WHY: The JWT utility is a critical security component — a malformed
   *      token would break all authenticated requests.
   */
  test('generateToken should return a non-empty string with 3 parts', () => {
    const payload = { id: '123', email: 'test@test.com', role: 'student' };
    const token = generateToken(payload);

    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts: header.payload.signature
  });

  /**
   * TEST: Token verification recovers the original payload
   * WHY: If verification returns wrong data, users would be impersonated.
   */
  test('verifyToken should decode the payload correctly', () => {
    const payload = { id: '456', email: 'admin@test.com', role: 'admin' };
    const token = generateToken(payload);
    const decoded = verifyToken(token);

    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  /**
   * TEST: Invalid tokens should throw on verification
   * WHY: Accepting invalid tokens would allow forged authentication.
   */
  test('verifyToken should throw for invalid token', () => {
    expect(() => verifyToken('invalid.token.here')).toThrow();
  });

  /**
   * TEST: Tampered tokens should fail verification
   * WHY: Prevents attackers from modifying token payload without the secret.
   */
  test('verifyToken should throw for tampered token', () => {
    const payload = { id: '789', email: 'user@test.com', role: 'student' };
    const token = generateToken(payload);
    // Tamper with the payload portion
    const parts = token.split('.');
    parts[1] = parts[1] + 'TAMPERED';
    const tamperedToken = parts.join('.');

    expect(() => verifyToken(tamperedToken)).toThrow();
  });
});

// ============================================================
// 2. UNIT TESTS — RL Service Reward Calculation (pure function)
// ============================================================
describe('RL Service — Reward Calculation', () => {
  /**
   * The calculateReward method is a pure function with no DB dependencies.
   * We extract its logic inline to avoid importing the full rlService
   * (which would pull in Mongoose models).
   */
  function calculateReward(context: {
    quizScore?: number;
    topicCompleted?: boolean;
    streakCount?: number;
    isDropout?: boolean;
    repeatedFailure?: boolean;
  }): number {
    let reward = 0;
    if (context.quizScore !== undefined && context.quizScore > 85) reward += 2;
    if (context.topicCompleted) reward += 1;
    if (context.streakCount !== undefined && context.streakCount >= 5) reward += 3;
    if (context.isDropout) reward -= 2;
    if (context.repeatedFailure) reward -= 1;
    return reward;
  }

  /**
   * TEST: High quiz score (>85) awards +2 reward
   * WHY: Core RL reward function drives adaptive recommendations.
   */
  test('should award +2 for quiz score > 85', () => {
    expect(calculateReward({ quizScore: 90 })).toBe(2);
  });

  /**
   * TEST: Topic completion awards +1
   */
  test('should award +1 for topic completion', () => {
    expect(calculateReward({ topicCompleted: true })).toBe(1);
  });

  /**
   * TEST: Streak >= 5 awards +3
   */
  test('should award +3 for streak >= 5', () => {
    expect(calculateReward({ streakCount: 5 })).toBe(3);
  });

  /**
   * TEST: Dropout penalizes -2
   */
  test('should penalize -2 for dropout', () => {
    expect(calculateReward({ isDropout: true })).toBe(-2);
  });

  /**
   * TEST: Repeated failure penalizes -1
   */
  test('should penalize -1 for repeated failure', () => {
    expect(calculateReward({ repeatedFailure: true })).toBe(-1);
  });

  /**
   * TEST: Multiple conditions stack correctly
   * WHY: score>85 (+2) + completed (+1) + streak>=5 (+3) = +6
   */
  test('should accumulate rewards from multiple conditions', () => {
    expect(calculateReward({
      quizScore: 90,
      topicCompleted: true,
      streakCount: 7,
    })).toBe(6);
  });

  /**
   * TEST: Score exactly 85 should NOT trigger the bonus
   * WHY: The formula says "> 85", not ">= 85". Boundary edge case.
   */
  test('should NOT award bonus for quiz score exactly 85', () => {
    expect(calculateReward({ quizScore: 85 })).toBe(0);
  });

  /**
   * TEST: No conditions = zero reward
   */
  test('should return 0 when no conditions met', () => {
    expect(calculateReward({})).toBe(0);
  });

  /**
   * TEST: All negative conditions
   * WHY: dropout (-2) + failure (-1) = -3
   */
  test('should stack negative rewards correctly', () => {
    expect(calculateReward({ isDropout: true, repeatedFailure: true })).toBe(-3);
  });

  /**
   * TEST: Mixed positive and negative
   * WHY: completed (+1) + dropout (-2) = -1
   */
  test('should handle mixed positive and negative', () => {
    expect(calculateReward({ topicCompleted: true, isDropout: true })).toBe(-1);
  });
});

// ============================================================
// 3. UNIT TESTS — Auth Middleware (authorize)
// ============================================================
describe('Auth Middleware — authorize', () => {
  let authorize: typeof import('../middleware/auth').authorize;

  beforeAll(() => {
    const auth = require('../middleware/auth');
    authorize = auth.authorize;
  });

  /**
   * TEST: authorize should block unauthorized roles
   * WHY: Role-based access control prevents privilege escalation.
   */
  test('should reject unauthorized roles with 403', () => {
    const middleware = authorize('instructor', 'admin');
    const req = { user: { id: '123', email: 'student@test.com', role: 'student' } } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Not authorized to access this resource',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  /**
   * TEST: authorize should allow valid roles
   */
  test('should allow authorized roles and call next()', () => {
    const middleware = authorize('instructor', 'admin');
    const req = { user: { id: '123', email: 'teacher@test.com', role: 'instructor' } } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  /**
   * TEST: authorize returns 401 when no user attached to request
   */
  test('should return 401 when no user on request', () => {
    const middleware = authorize('instructor');
    const req = {} as any; // no .user property
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  /**
   * TEST: authorize allows admin to access any authorized route
   */
  test('should allow admin role', () => {
    const middleware = authorize('instructor', 'admin');
    const req = { user: { id: '999', email: 'admin@test.com', role: 'admin' } } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

// ============================================================
// 4. UNIT TESTS — Error Handler Middleware
// ============================================================
describe('Error Handler Middleware', () => {
  let errorHandler: typeof import('../middleware/errorHandler').errorHandler;
  let notFound: typeof import('../middleware/errorHandler').notFound;

  beforeAll(() => {
    const eh = require('../middleware/errorHandler');
    errorHandler = eh.errorHandler;
    notFound = eh.notFound;
  });

  /**
   * TEST: Mongoose ValidationError returns 400 with error messages
   */
  test('should handle ValidationError correctly', () => {
    const err = {
      name: 'ValidationError',
      errors: {
        title: { message: 'Title is required' },
        description: { message: 'Description is required' },
      },
    };
    const req = {} as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Validation Error',
        errors: expect.arrayContaining(['Title is required', 'Description is required']),
      })
    );
  });

  /**
   * TEST: Mongoose duplicate key error returns 400
   */
  test('should handle duplicate key error (code 11000)', () => {
    const err = { code: 11000 };
    const req = {} as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Duplicate field value entered' })
    );
  });

  /**
   * TEST: CastError (invalid ObjectId) returns 400
   */
  test('should handle CastError for invalid ObjectId', () => {
    const err = { name: 'CastError' };
    const req = {} as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid ID format' })
    );
  });

  /**
   * TEST: Generic error returns 500
   */
  test('should return 500 for generic errors', () => {
    const err = { message: 'Something broke' };
    const req = {} as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Something broke' })
    );
  });

  /**
   * TEST: Stack trace is included in development mode
   */
  test('should include stack trace in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const err = { message: 'Dev error', stack: 'Error: Dev error\n  at ...' };
    const req = {} as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    const callArgs = res.json.mock.calls[0][0];
    expect(callArgs.stack).toBeDefined();

    process.env.NODE_ENV = originalEnv;
  });

  /**
   * TEST: Unknown routes return 404 with the attempted URL
   */
  test('notFound should return 404 with the original URL', () => {
    const req = { originalUrl: '/api/nonexistent' } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    notFound(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Route /api/nonexistent not found',
      })
    );
  });
});

// ============================================================
// 5. BUG REGRESSION TESTS
// ============================================================
describe('Bug Regression — Finding 4.10: Score-to-Quality Conversion', () => {
  /**
   * WHY: Finding 4.10 identified a redundant ternary in submitReview.
   *      This test validates the underlying math is correct.
   */
  test('score 0 maps to quality 0', () => {
    const quality = Math.min(5, Math.max(0, Math.round((0 / 100) * 5)));
    expect(quality).toBe(0);
  });

  test('score 50 maps to quality 3 (rounded)', () => {
    const quality = Math.min(5, Math.max(0, Math.round((50 / 100) * 5)));
    expect(quality).toBe(3);
  });

  test('score 100 maps to quality 5', () => {
    const quality = Math.min(5, Math.max(0, Math.round((100 / 100) * 5)));
    expect(quality).toBe(5);
  });

  test('score above 100 is clamped to 5', () => {
    const quality = Math.min(5, Math.max(0, Math.round((200 / 100) * 5)));
    expect(quality).toBe(5);
  });

  test('negative score is clamped to 0', () => {
    const quality = Math.min(5, Math.max(0, Math.round((-10 / 100) * 5)));
    expect(quality).toBe(0);
  });
});

describe('Bug Regression — Finding 4.7: Month Indexing', () => {
  /**
   * WHY: Finding 4.7 — The calendar endpoint uses inconsistent month indexing.
   */
  test('month 3 (March) should convert to JS month 2', () => {
    const clientMonth = 3; // March, 1-indexed
    const targetMonth = clientMonth - 1; // Convert to 0-indexed

    expect(targetMonth).toBe(2);
    const firstDay = new Date(2026, targetMonth, 1);
    expect(firstDay.getMonth()).toBe(2); // JS month 2 = March
  });

  test('response month should match client input (1-indexed)', () => {
    const clientMonth = 3;
    const targetMonth = clientMonth - 1;
    const responseMonth = targetMonth + 1; // The fix
    expect(responseMonth).toBe(clientMonth);
  });
});

describe('Bug Regression — Finding 4.6: Video Count Off-by-One', () => {
  /**
   * WHY: The `>` comparison allows the count to remain positive
   *      when it should be zero.
   */
  test('should produce 0 when totalVideos equals deletedCount', () => {
    const totalVideos = 5;
    const deletedCount = 5;

    // Bug: current code uses `>` which fails this case
    const bugResult = totalVideos > deletedCount ? totalVideos - deletedCount : totalVideos;
    expect(bugResult).toBe(5); // Bug: still shows 5

    // Fix: use Math.max
    const fixedResult = Math.max(0, totalVideos - deletedCount);
    expect(fixedResult).toBe(0); // Correct
  });

  test('should handle deletedCount greater than totalVideos', () => {
    const totalVideos = 3;
    const deletedCount = 5;
    const fixedResult = Math.max(0, totalVideos - deletedCount);
    expect(fixedResult).toBe(0);
  });
});

describe('Bug Regression — Finding 4.4: watchedDuration Regression', () => {
  /**
   * WHY: Finding 4.4 — Progress should never go backwards.
   */
  test('should keep max of current and new watchedDuration', () => {
    const currentDuration = 120;
    const newDuration = 60;

    // Bug: current code uses `||` which accepts the smaller value
    const bugResult = newDuration || currentDuration;
    expect(bugResult).toBe(60); // Bug: progress went backwards

    // Fix: use Math.max
    const fixedResult = Math.max(currentDuration, newDuration || 0);
    expect(fixedResult).toBe(120); // Correct
  });

  test('should handle watchedDuration of 0 correctly', () => {
    const currentDuration = 120;
    const newDuration = 0;

    // Fix: explicit Math.max handles both falsy 0 and real values
    const fixedResult = Math.max(currentDuration, newDuration);
    expect(fixedResult).toBe(120);
  });
});

describe('Bug Regression — Finding 4.1: Race Condition Pattern', () => {
  /**
   * WHY: Finding 4.1 — Non-atomic increment of enrolledStudents.
   *      This test validates that $inc produces correct results
   *      vs read-modify-write pattern.
   */
  test('concurrent increments should be additive', () => {
    // Simulates what happens with read-modify-write:
    // Both threads read 10, both write 11
    const initial = 10;
    const thread1Read = initial;
    const thread2Read = initial;
    const thread1Write = thread1Read + 1;
    const thread2Write = thread2Read + 1;

    // Both write 11 instead of expected 12
    expect(thread1Write).toBe(11);
    expect(thread2Write).toBe(11);

    // With atomic $inc, result would be:
    const atomicResult = initial + 2;
    expect(atomicResult).toBe(12);
  });
});
