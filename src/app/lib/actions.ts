'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            const rawError = error.cause?.err?.message || '';
            if (rawError === '2FA_REQUIRED') {
                return '2FA_REQUIRED';
            }
            if (rawError === 'Invalid 2FA code') {
                return 'Invalid 2FA code.';
            }

            switch (error.type) {
                case 'CredentialsSignin':
                    if (rawError.includes('Account locked')) {
                        return rawError;
                    }
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}
