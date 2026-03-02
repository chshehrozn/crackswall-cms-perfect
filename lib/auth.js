import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { queryOne } from './db.js';
import rateLimit from './rate-limit.js';

const loginLimiter = rateLimit({ interval: 15 * 60 * 1000, uniqueTokenPerInterval: 500 }); // 15 mins


export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    await loginLimiter.check(5, credentials.email); // Max 5 attempts per email per 15m
                } catch {
                    throw new Error("Too many login attempts. Please try again in 15 minutes.");
                }

                try {
                    const user = await queryOne(
                        'SELECT * FROM users WHERE email = ? AND type = 1 LIMIT 1',
                        [credentials.email]
                    );
                    if (!user) return null;
                    const valid = await bcrypt.compare(credentials.password, user.password);
                    if (!valid) return null;
                    return { id: String(user.id), name: user.name, email: user.email };
                } catch (err) {
                    console.error('Auth error:', err.message);
                    return null;
                }
            },
        }),
    ],
    pages: { signIn: '/admin/login' },
    session: { strategy: 'jwt' },
    callbacks: {
        async jwt({ token, user }) {
            if (user) token.id = user.id;
            return token;
        },
        async session({ session, token }) {
            if (token) session.user.id = token.id;
            return session;
        },
    },
});
