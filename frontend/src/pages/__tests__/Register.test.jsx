import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../../test/utils/test-utils';
import { Register } from '../Register';

describe('Register Component', () => {
    it('renders register form', () => {
        render(<Register />);

        expect(screen.getByText('Create your account')).toBeInTheDocument();
        expect(screen.getByLabelText('Email address')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    });

    it('shows link to login page', () => {
        render(<Register />);

        const loginLink = screen.getByRole('link', { name: 'Sign in' });
        expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('has all required input fields', () => {
        render(<Register />);

        const emailInput = screen.getByLabelText('Email address');
        const passwordInput = screen.getByLabelText('Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm Password');

        expect(emailInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();
        expect(confirmPasswordInput).toBeInTheDocument();
        expect(emailInput).toHaveAttribute('type', 'email');
        expect(passwordInput).toHaveAttribute('type', 'password');
        expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });
});
