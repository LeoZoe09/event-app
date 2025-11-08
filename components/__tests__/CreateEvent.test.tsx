import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateEventPage from '../CreateEvent';


const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// ensure fetch exists in the test environment
beforeAll(() => {
  if (!(global as any).fetch) {
    (global as any).fetch = jest.fn();
  }
});

describe('CreateEvent component', () => {
  beforeEach(() => {
    mockPush.mockClear();
    jest.restoreAllMocks();
  });

  test('submits form successfully and navigates', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1' }),
    });

    const { container } = render(<CreateEventPage />);

    fireEvent.change(screen.getByPlaceholderText(/Event Title/i), { target: { value: 'My Event' } });
    fireEvent.change(screen.getByPlaceholderText(/Description/i), { target: { value: 'A description' } });
    fireEvent.change(screen.getByPlaceholderText(/Overview/i), { target: { value: 'Short overview' } });
    fireEvent.change(screen.getByPlaceholderText(/Venue/i), { target: { value: 'Venue 1' } });
    fireEvent.change(screen.getByPlaceholderText(/Location/i), { target: { value: 'Location 1' } });

    const dateInput = container.querySelector('input[name="date"]') as HTMLInputElement;
    const timeInput = container.querySelector('input[name="time"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2025-12-01' } });
    fireEvent.change(timeInput, { target: { value: '12:00' } });

    fireEvent.change(screen.getByPlaceholderText(/Audience/i), { target: { value: 'Developers' } });
    fireEvent.change(screen.getByPlaceholderText(/Organizer/i), { target: { value: 'Org' } });

    // file input
    const file = new File(['dummy'], 'photo.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/Event image/i) as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    // tags and agenda
    fireEvent.change(screen.getByPlaceholderText(/Tags/i), { target: { value: 'tag1, tag2' } });
    fireEvent.change(screen.getByPlaceholderText(/Agenda/i), { target: { value: 'Item 1\nItem 2' } });

  const form = container.querySelector('form') as HTMLFormElement;
  fireEvent.submit(form);

  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'));
  });

  test('shows error message when API returns error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'something went wrong' }),
    });

    const { container } = render(<CreateEventPage />);

    // minimal required fields to submit
    fireEvent.change(screen.getByPlaceholderText(/Event Title/i), { target: { value: 'My Event' } });
    fireEvent.change(screen.getByPlaceholderText(/Description/i), { target: { value: 'A description' } });
    fireEvent.change(screen.getByPlaceholderText(/Overview/i), { target: { value: 'Overview' } });
    fireEvent.change(screen.getByPlaceholderText(/Venue/i), { target: { value: 'V' } });
    fireEvent.change(screen.getByPlaceholderText(/Location/i), { target: { value: 'L' } });

    const dateInput = container.querySelector('input[name="date"]') as HTMLInputElement;
    const timeInput = container.querySelector('input[name="time"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2025-12-01' } });
    fireEvent.change(timeInput, { target: { value: '12:00' } });

    fireEvent.change(screen.getByPlaceholderText(/Audience/i), { target: { value: 'Dev' } });
    fireEvent.change(screen.getByPlaceholderText(/Organizer/i), { target: { value: 'Org' } });

    const file = new File(['dummy'], 'photo.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/Event image/i) as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.change(screen.getByPlaceholderText(/Tags/i), { target: { value: 't1' } });
    fireEvent.change(screen.getByPlaceholderText(/Agenda/i), { target: { value: 'A1' } });

  const form = container.querySelector('form') as HTMLFormElement;
  fireEvent.submit(form);

  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
