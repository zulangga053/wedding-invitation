import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

import { AuthForm } from '@/components/auth/auth-form';

const auth = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

const navigation = vi.hoisted(() => ({
  useRouter: vi.fn(),
}));

vi.mock('@/components/providers/auth-provider', () => ({
  useAuth: auth.useAuth,
}));

vi.mock('next/navigation', () => ({
  useRouter: navigation.useRouter,
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: { href: string; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function mockUseAuth() {
  const mocks = {
    getToken: vi.fn(),
    signInEmail: vi.fn(),
    signUpEmail: vi.fn(),
    signInGoogle: vi.fn(),
    logout: vi.fn(),
  };
  auth.useAuth.mockReturnValue({
    user: null,
    loading: false,
    authenticated: false,
    ...mocks,
  });
  return mocks;
}

beforeEach(() => {
  vi.clearAllMocks();
  navigation.useRouter.mockReturnValue({ replace: vi.fn() });
});

describe('AuthForm login mode', () => {
  it('renders fields, submit button and register toggle', () => {
    mockUseAuth();
    render(<AuthForm mode="login" />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Kata Sandi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Masuk' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Masuk dengan Google' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Daftar' })).toHaveAttribute('href', '/register');
  });

  it('shows validation errors when submitting an empty form', async () => {
    const user = userEvent.setup();
    mockUseAuth();
    render(<AuthForm mode="login" />);

    await user.click(screen.getByRole('button', { name: 'Masuk' }));

    expect(await screen.findByText('Masukkan email yang valid')).toBeInTheDocument();
    expect(await screen.findByText('Kata sandi minimal 8 karakter')).toBeInTheDocument();
  });

  it('calls signInEmail and navigates to /admin on submit', async () => {
    const user = userEvent.setup();
    const { signInEmail } = mockUseAuth();
    const replace = vi.fn();
    navigation.useRouter.mockReturnValue({ replace });
    signInEmail.mockResolvedValue(undefined);

    render(<AuthForm mode="login" />);
    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Kata Sandi'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Masuk' }));

    await waitFor(() => {
      expect(signInEmail).toHaveBeenCalledWith('user@example.com', 'password123');
    });
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/admin');
    });
  });

  it('disables the submit button while the request is pending', async () => {
    const user = userEvent.setup();
    const { signInEmail } = mockUseAuth();
    let resolveRequest!: () => void;
    signInEmail.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveRequest = resolve;
        })
    );

    render(<AuthForm mode="login" />);
    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Kata Sandi'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Masuk' }));

    expect(await screen.findByText('Memproses…')).toBeDisabled();

    resolveRequest();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Masuk' })).toBeEnabled();
    });
  });

  it('shows the sign-in error message on failure', async () => {
    const user = userEvent.setup();
    const { signInEmail } = mockUseAuth();
    signInEmail.mockRejectedValue(new Error('Email atau kata sandi salah'));

    render(<AuthForm mode="login" />);
    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Kata Sandi'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Masuk' }));

    expect(await screen.findByText('Email atau kata sandi salah')).toBeInTheDocument();
  });

  it('falls back to a generic message when the error is not an Error instance', async () => {
    const user = userEvent.setup();
    const { signInEmail } = mockUseAuth();
    signInEmail.mockRejectedValue('boom');

    render(<AuthForm mode="login" />);
    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Kata Sandi'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Masuk' }));

    expect(await screen.findByText('Gagal masuk. Coba lagi.')).toBeInTheDocument();
  });

  it('signs in with Google and navigates to /admin', async () => {
    const user = userEvent.setup();
    const { signInGoogle } = mockUseAuth();
    const replace = vi.fn();
    navigation.useRouter.mockReturnValue({ replace });
    signInGoogle.mockResolvedValue(undefined);

    render(<AuthForm mode="login" />);
    await user.click(screen.getByRole('button', { name: 'Masuk dengan Google' }));

    await waitFor(() => {
      expect(signInGoogle).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/admin');
    });
  });
});

describe('AuthForm register mode', () => {
  it('renders sign-up button and login toggle', () => {
    mockUseAuth();
    render(<AuthForm mode="register" />);

    expect(screen.getByRole('button', { name: 'Daftar' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Masuk' })).toHaveAttribute('href', '/login');
  });

  it('calls signUpEmail and navigates to /admin on submit', async () => {
    const user = userEvent.setup();
    const { signUpEmail } = mockUseAuth();
    const replace = vi.fn();
    navigation.useRouter.mockReturnValue({ replace });
    signUpEmail.mockResolvedValue(undefined);

    render(<AuthForm mode="register" />);
    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Kata Sandi'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Daftar' }));

    await waitFor(() => {
      expect(signUpEmail).toHaveBeenCalledWith('new@example.com', 'password123');
    });
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/admin');
    });
  });
});
