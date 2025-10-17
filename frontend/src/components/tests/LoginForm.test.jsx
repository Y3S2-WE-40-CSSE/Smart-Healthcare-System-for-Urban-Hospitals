import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import LoginForm from '../LoginForm';
import { AuthProvider } from '../../context/AuthContext';
import * as api from '../../services/api';

// Mock the API
vi.mock('../../services/api');

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLoginForm = () => {
    return render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );
  };

  // ✅ POSITIVE CASES
  describe('Rendering', () => {
    test('should render login form with all elements', () => {
      // Act
      renderLoginForm();

      // Assert
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    test('should have empty input fields initially', () => {
      // Act
      renderLoginForm();

      // Assert
      expect(screen.getByLabelText(/email/i)).toHaveValue('');
      expect(screen.getByLabelText(/password/i)).toHaveValue('');
    });
  });

  describe('User Interactions', () => {
    test('should update email field when user types', async () => {
      // Arrange
      const user = userEvent.setup();
      renderLoginForm();
      const emailInput = screen.getByLabelText(/email/i);

      // Act
      await user.type(emailInput, 'test@example.com');

      // Assert
      expect(emailInput).toHaveValue('test@example.com');
    });

    test('should update password field when user types', async () => {
      // Arrange
      const user = userEvent.setup();
      renderLoginForm();
      const passwordInput = screen.getByLabelText(/password/i);

      // Act
      await user.type(passwordInput, 'password123');

      // Assert
      expect(passwordInput).toHaveValue('password123');
    });

    test('should successfully login with valid credentials', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { id: '1', name: 'Test User', role: 'patient' },
            token: 'fake-token'
          }
        }
      };
      api.login.mockResolvedValue(mockResponse);
      
      renderLoginForm();

      // Act
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Assert
      await waitFor(() => {
        expect(api.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        });
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  // ❌ NEGATIVE CASES
  describe('Validation', () => {
    test('should show error for invalid email format', async () => {
      // Arrange
      const user = userEvent.setup();
      renderLoginForm();

      // Act
      await user.type(screen.getByLabelText(/email/i), 'invalid-email');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeInTheDocument();
      });
    });

    test('should show error when login fails', async () => {
      // Arrange
      const user = userEvent.setup();
      api.login.mockRejectedValue({
        response: {
          data: {
            message: 'Invalid credentials'
          }
        }
      });
      
      renderLoginForm();

      // Act
      await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    test('should disable submit button while logging in', async () => {
      // Arrange
      const user = userEvent.setup();
      api.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      renderLoginForm();
      const submitButton = screen.getByRole('button', { name: /login/i });

      // Act
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(submitButton);

      // Assert
      expect(submitButton).toBeDisabled();
    });
  });

  // 🔄 EDGE CASES
  describe('Edge Cases', () => {
    test('should handle network errors gracefully', async () => {
      // Arrange
      const user = userEvent.setup();
      api.login.mockRejectedValue(new Error('Network Error'));
      
      renderLoginForm();

      // Act
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/network error|something went wrong/i)).toBeInTheDocument();
      });
    });

    test('should trim whitespace from email input', async () => {
      // Arrange
      const user = userEvent.setup();
      api.login.mockResolvedValue({ data: { success: true } });
      
      renderLoginForm();

      // Act
      await user.type(screen.getByLabelText(/email/i), '  test@example.com  ');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Assert
      await waitFor(() => {
        expect(api.login).toHaveBeenCalledWith(
          expect.objectContaining({
            email: expect.stringMatching(/^\S.*\S$/) // No leading/trailing spaces
          })
        );
      });
    });
  });
});