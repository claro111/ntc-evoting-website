import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// Mock Firebase modules before importing authService
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
}));

vi.mock('../../config/firebase', () => ({
  auth: {},
  db: {},
}));

// Import after mocking
const { signInWithEmailAndPassword } = await import('firebase/auth');
const { getDoc } = await import('firebase/firestore');
const { loginVoter } = await import('../authService');

/**
 * Feature: web-evoting-system, Property 2: Authentication succeeds for valid credentials
 * For any voter with valid registered email and correct password, 
 * the authentication system should grant access and redirect to the homepage.
 * Validates: Requirements 2.2
 */
describe('Property 2: Authentication succeeds for valid credentials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should authenticate any voter with valid credentials and registered status', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary valid email and password
        fc.emailAddress(),
        fc.string({ minLength: 8, maxLength: 20 }),
        async (email, password) => {
          // Mock successful Firebase authentication
          const mockUser = {
            uid: fc.sample(fc.uuid(), 1)[0],
            email: email,
            emailVerified: true,
          };

          signInWithEmailAndPassword.mockResolvedValue({
            user: mockUser,
          });

          // Mock Firestore voter document with 'registered' status
          getDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({
              status: 'registered',
              emailVerified: true,
              firstName: 'Test',
              lastName: 'User',
            }),
          });

          // Execute login
          const result = await loginVoter(email, password);

          // Verify authentication succeeded
          expect(result.success).toBe(true);
          expect(result.user).toBeDefined();
          expect(result.user.email).toBe(email);
          expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
            expect.anything(),
            email,
            password
          );
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design
    );
  });
});

/**
 * Feature: web-evoting-system, Property 3: Authentication fails for invalid credentials
 * For any authentication attempt with invalid email or incorrect password, 
 * the system should reject access and display an error message without revealing 
 * which credential was invalid.
 * Validates: Requirements 2.3
 */
describe('Property 3: Authentication fails for invalid credentials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject any authentication attempt with invalid credentials', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary email and password combinations
        fc.emailAddress(),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (email, password) => {
          // Mock Firebase authentication failure
          signInWithEmailAndPassword.mockRejectedValue({
            code: 'auth/invalid-credential',
            message: 'Invalid credentials',
          });

          // Execute login
          const result = await loginVoter(email, password);

          // Verify authentication failed
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
          
          // Verify error message doesn't reveal which credential was invalid
          const errorMessage = result.error.toLowerCase();
          expect(errorMessage).not.toContain('email');
          expect(errorMessage).not.toContain('password');
          expect(errorMessage).toMatch(/invalid|incorrect|failed/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject authentication for voters with pending status', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 8, maxLength: 20 }),
        async (email, password) => {
          // Mock successful Firebase authentication
          const mockUser = {
            uid: fc.sample(fc.uuid(), 1)[0],
            email: email,
          };

          signInWithEmailAndPassword.mockResolvedValue({
            user: mockUser,
          });

          // Mock Firestore voter document with 'pending' status
          getDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({
              status: 'pending',
              emailVerified: false,
            }),
          });

          // Execute login
          const result = await loginVoter(email, password);

          // Verify authentication was rejected due to pending status
          expect(result.success).toBe(false);
          expect(result.error).toContain('pending');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject authentication for voters with unverified email', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 8, maxLength: 20 }),
        async (email, password) => {
          // Mock successful Firebase authentication
          const mockUser = {
            uid: fc.sample(fc.uuid(), 1)[0],
            email: email,
          };

          signInWithEmailAndPassword.mockResolvedValue({
            user: mockUser,
          });

          // Mock Firestore voter document with approved but unverified email
          getDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({
              status: 'approved_pending_verification',
              emailVerified: false,
            }),
          });

          // Execute login
          const result = await loginVoter(email, password);

          // Verify authentication was rejected due to unverified email
          expect(result.success).toBe(false);
          expect(result.error).toContain('verify');
        }
      ),
      { numRuns: 100 }
    );
  });
});
