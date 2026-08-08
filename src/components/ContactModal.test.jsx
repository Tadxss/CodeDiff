import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactModal from './ContactModal';
import { submitContactForm } from '../lib/contact';

vi.mock('../lib/contact', () => ({
  submitContactForm: vi.fn(),
}));

describe('ContactModal', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders nothing when closed', () => {
    render(<ContactModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText('Get in Touch')).not.toBeInTheDocument();
  });

  it('keeps the "Get in Touch" title', () => {
    render(<ContactModal isOpen onClose={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Get in Touch' })).toBeInTheDocument();
  });

  it('requires name, email, and message before submission', () => {
    render(<ContactModal isOpen onClose={() => {}} />);
    expect(screen.getByPlaceholderText('Your name')).toBeRequired();
    expect(screen.getByPlaceholderText('your@email.com')).toBeRequired();
    expect(screen.getByPlaceholderText("What's on your mind?")).toBeRequired();
  });

  it('shows a success state after a successful submission', async () => {
    submitContactForm.mockResolvedValueOnce(true);
    render(<ContactModal isOpen onClose={() => {}} />);

    await userEvent.type(screen.getByPlaceholderText('Your name'), 'Jane Doe');
    await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'jane@example.com');
    await userEvent.type(screen.getByPlaceholderText("What's on your mind?"), 'Hello there');
    await userEvent.click(screen.getByRole('button', { name: /Send Message/ }));

    await waitFor(() => expect(screen.getByText('Message Sent!')).toBeInTheDocument());
    expect(submitContactForm).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Hello there',
    });
  });

  it('shows an error state when submission fails', async () => {
    submitContactForm.mockResolvedValueOnce(false);
    render(<ContactModal isOpen onClose={() => {}} />);

    await userEvent.type(screen.getByPlaceholderText('Your name'), 'Jane Doe');
    await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'jane@example.com');
    await userEvent.type(screen.getByPlaceholderText("What's on your mind?"), 'Hello there');
    await userEvent.click(screen.getByRole('button', { name: /Send Message/ }));

    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeInTheDocument());
  });
});
