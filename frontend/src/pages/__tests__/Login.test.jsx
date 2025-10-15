import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../../test/utils/test-utils';
import { Login } from '../Login';

describe('Login Component', () => {
    it('renders login form', () => {
        render(<Login />);

        expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
        expect(screen.getByLabelText('Email address')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    });

    it('shows link to register page', () => {
        render(<Login />);

        const registerLink = screen.getByRole('link', { name: 'Sign up' });
        expect(registerLink).toHaveAttribute('href', '/register');
    });

    it('has email and password input fields', () => {
        render(<Login />);

        const emailInput = screen.getByLabelText('Email address');
        const passwordInput = screen.getByLabelText('Password');

        expect(emailInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();
        expect(emailInput).toHaveAttribute('type', 'email');
        expect(passwordInput).toHaveAttribute('type', 'password');
    });
});
