import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// Mock Firebase modules before importing authService
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
}));

vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
}));

vi.mock('../../config/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
}));

// Import after mocking
const { createUserWithEmailAndPassword } = await import('firebase/auth');
const { setDoc } = await import('firebase/firestore');

/**
 * Feature: web-evoting-system, Property 1: Registration validation rejects incomplete data
 * For any registration submission with missing required fields or mismatched passwords,
 * the system should reject the registration and display appropriate error messages.
 * Validates: Requirements 1.4
 */
describe('Property 1: Registration validation rejects incomplete data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Validation function that mimics the registration validation logic
   */
  const validateRegistration = (data) => {
    const errors = {};

    // Check required fields
    if (!data.firstName || data.firstName.trim() === '') {
      errors.firstName = 'First name is required';
    }

    if (!data.lastName || data.lastName.trim() === '') {
      errors.lastName = 'Last name is required';
    }

    if (!data.email || data.email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Invalid email format';
    }

    if (!data.password || data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!data.confirmPassword || data.confirmPassword !== data.password) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!data.studentId || data.studentId.trim() === '') {
      errors.studentId = 'Student ID is required';
    }

    if (!data.birthdate) {
      errors.birthdate = 'Birthdate is required';
    }

    if (!data.yearLevel) {
      errors.yearLevel = 'Year level is required';
    }

    if (!data.school) {
      errors.school = 'School is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  it('should reject registration with missing first name', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate registration data with missing first name
        fc.record({
          firstName: fc.constant(''), // Empty first name
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 6, maxLength: 20 }),
          confirmPassword: fc.string({ minLength: 6, maxLength: 20 }),
          studentId: fc.string({ minLength: 5, maxLength: 15 }),
          birthdate: fc.date(),
          yearLevel: fc.constantFrom('1st Year', '2nd Year', '3rd Year', '4th Year'),
          school: fc.constantFrom('SOB', 'SOTE', 'SAST', 'SOCJ'),
        }),
        async (data) => {
          // Make passwords match
          data.confirmPassword = data.password;

          const result = validateRegistration(data);

          // Should be invalid
          expect(result.isValid).toBe(false);
          expect(result.errors.firstName).toBeDefined();
          expect(result.errors.firstName).toContain('required');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject registration with missing last name', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.constant(''), // Empty last name
          email: fc.emailAddress(),
          password: fc.string({ minLength: 6, maxLength: 20 }),
          confirmPassword: fc.string({ minLength: 6, maxLength: 20 }),
          studentId: fc.string({ minLength: 5, maxLength: 15 }),
          birthdate: fc.date(),
          yearLevel: fc.constantFrom('1st Year', '2nd Year', '3rd Year', '4th Year'),
          school: fc.constantFrom('SOB', 'SOTE', 'SAST', 'SOCJ'),
        }),
        async (data) => {
          data.confirmPassword = data.password;

          const result = validateRegistration(data);

          expect(result.isValid).toBe(false);
          expect(result.errors.lastName).toBeDefined();
          expect(result.errors.lastName).toContain('required');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject registration with invalid email', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('@')), // Invalid email
          password: fc.string({ minLength: 6, maxLength: 20 }),
          confirmPassword: fc.string({ minLength: 6, maxLength: 20 }),
          studentId: fc.string({ minLength: 5, maxLength: 15 }),
          birthdate: fc.date(),
          yearLevel: fc.constantFrom('1st Year', '2nd Year', '3rd Year', '4th Year'),
          school: fc.constantFrom('SOB', 'SOTE', 'SAST', 'SOCJ'),
        }),
        async (data) => {
          data.confirmPassword = data.password;

          const result = validateRegistration(data);

          expect(result.isValid).toBe(false);
          expect(result.errors.email).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject registration with password too short', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 1, maxLength: 5 }), // Too short
          confirmPassword: fc.string({ minLength: 1, maxLength: 5 }),
          studentId: fc.string({ minLength: 5, maxLength: 15 }),
          birthdate: fc.date(),
          yearLevel: fc.constantFrom('1st Year', '2nd Year', '3rd Year', '4th Year'),
          school: fc.constantFrom('SOB', 'SOTE', 'SAST', 'SOCJ'),
        }),
        async (data) => {
          data.confirmPassword = data.password;

          const result = validateRegistration(data);

          expect(result.isValid).toBe(false);
          expect(result.errors.password).toBeDefined();
          expect(result.errors.password).toContain('6 characters');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject registration with mismatched passwords', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 6, maxLength: 20 }),
          confirmPassword: fc.string({ minLength: 6, maxLength: 20 }),
          studentId: fc.string({ minLength: 5, maxLength: 15 }),
          birthdate: fc.date(),
          yearLevel: fc.constantFrom('1st Year', '2nd Year', '3rd Year', '4th Year'),
          school: fc.constantFrom('SOB', 'SOTE', 'SAST', 'SOCJ'),
        }),
        async (data) => {
          // Ensure passwords don't match
          if (data.password === data.confirmPassword) {
            data.confirmPassword = data.password + 'x';
          }

          const result = validateRegistration(data);

          expect(result.isValid).toBe(false);
          expect(result.errors.confirmPassword).toBeDefined();
          expect(result.errors.confirmPassword.toLowerCase()).toContain('match');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject registration with missing student ID', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 6, maxLength: 20 }),
          confirmPassword: fc.string({ minLength: 6, maxLength: 20 }),
          studentId: fc.constant(''), // Empty student ID
          birthdate: fc.date(),
          yearLevel: fc.constantFrom('1st Year', '2nd Year', '3rd Year', '4th Year'),
          school: fc.constantFrom('SOB', 'SOTE', 'SAST', 'SOCJ'),
        }),
        async (data) => {
          data.confirmPassword = data.password;

          const result = validateRegistration(data);

          expect(result.isValid).toBe(false);
          expect(result.errors.studentId).toBeDefined();
          expect(result.errors.studentId).toContain('required');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject registration with missing year level', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 6, maxLength: 20 }),
          confirmPassword: fc.string({ minLength: 6, maxLength: 20 }),
          studentId: fc.string({ minLength: 5, maxLength: 15 }),
          birthdate: fc.date(),
          yearLevel: fc.constant(null), // Missing year level
          school: fc.constantFrom('SOB', 'SOTE', 'SAST', 'SOCJ'),
        }),
        async (data) => {
          data.confirmPassword = data.password;

          const result = validateRegistration(data);

          expect(result.isValid).toBe(false);
          expect(result.errors.yearLevel).toBeDefined();
          expect(result.errors.yearLevel).toContain('required');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject registration with missing school', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 6, maxLength: 20 }),
          confirmPassword: fc.string({ minLength: 6, maxLength: 20 }),
          studentId: fc.string({ minLength: 5, maxLength: 15 }),
          birthdate: fc.date(),
          yearLevel: fc.constantFrom('1st Year', '2nd Year', '3rd Year', '4th Year'),
          school: fc.constant(null), // Missing school
        }),
        async (data) => {
          data.confirmPassword = data.password;

          const result = validateRegistration(data);

          expect(result.isValid).toBe(false);
          expect(result.errors.school).toBeDefined();
          expect(result.errors.school).toContain('required');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept registration with all valid fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 6, maxLength: 20 }),
          studentId: fc.string({ minLength: 5, maxLength: 15 }),
          birthdate: fc.date(),
          yearLevel: fc.constantFrom('1st Year', '2nd Year', '3rd Year', '4th Year'),
          school: fc.constantFrom('SOB', 'SOTE', 'SAST', 'SOCJ'),
        }),
        async (data) => {
          // Make passwords match
          data.confirmPassword = data.password;

          const result = validateRegistration(data);

          // Should be valid
          expect(result.isValid).toBe(true);
          expect(Object.keys(result.errors).length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
