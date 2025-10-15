import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../../test/utils/test-utils';
import { Dashboard } from '../Dashboard';

describe('Dashboard Component', () => {
    it('renders dashboard title', () => {
        render(<Dashboard />);

        expect(screen.getByText('Task Dashboard')).toBeInTheDocument();
    });

    it('shows create task button', () => {
        render(<Dashboard />);

        expect(screen.getByRole('button', { name: /new task/i })).toBeInTheDocument();
    });

    it('has search input', () => {
        render(<Dashboard />);

        expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
    });

    it('has status filter dropdown', () => {
        render(<Dashboard />);

        expect(screen.getByDisplayValue('All Status')).toBeInTheDocument();
    });

    it('has priority filter dropdown', () => {
        render(<Dashboard />);

        expect(screen.getByDisplayValue('All Priority')).toBeInTheDocument();
    });
});