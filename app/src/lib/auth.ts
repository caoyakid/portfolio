import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        const adminEmail = process.env.ADMIN_EMAIL
        ;(session.user as any).isAdmin = session.user.email === adminEmail
        ;(session.user as any).id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
  },
}
