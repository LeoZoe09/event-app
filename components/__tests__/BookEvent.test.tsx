import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookEvent from '../BookEvent';
import { createBooking } from '@/lib/actions/booking.actions';

// Mock the booking actions
jest.mock('@/lib/actions/booking.actions', () => ({
    createBooking: jest.fn()
}));

describe('BookEvent Component', () => {
    const mockProps = {
        eventId: 'test-event-id',
        slug: 'test-slug'
    };

    beforeEach(() => {
        // Clear mock calls between tests
        jest.clearAllMocks();
    });

    it('renders the email input form initially', () => {
        render(<BookEvent {...mockProps} />);
        
        expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your email address')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('updates email value when typing', () => {
        render(<BookEvent {...mockProps} />);
        
        const emailInput = screen.getByLabelText('Email Address');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        
        expect(emailInput).toHaveValue('test@example.com');
    });

    it('shows success message after successful booking', async () => {
        // Mock successful booking
        (createBooking as jest.Mock).mockResolvedValueOnce({ success: true });
        
        render(<BookEvent {...mockProps} />);
        
        const emailInput = screen.getByLabelText('Email Address');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        
        const submitButton = screen.getByRole('button', { name: 'Submit' });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
            expect(screen.getByText('Thank you for signing up!')).toBeInTheDocument();
        });
        
        expect(createBooking).toHaveBeenCalledWith({
            eventId: mockProps.eventId,
            slug: mockProps.slug,
            email: 'test@example.com'
        });
    });

    it('handles booking failure', async () => {
        // Mock failed booking
        (createBooking as jest.Mock).mockResolvedValueOnce({ success: false });
        
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        render(<BookEvent {...mockProps} />);
        
        const emailInput = screen.getByLabelText('Email Address');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        
        const submitButton = screen.getByRole('button', { name: 'Submit' });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Booking creation failed');
        });
        
        expect(screen.queryByText('Thank you for signing up!')).not.toBeInTheDocument();
        
        consoleSpy.mockRestore();
    });
});