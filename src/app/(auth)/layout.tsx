/**
 * FILE: src/app/(auth)/layout.tsx
 * TYPE: Layout Component
 *
 * PURPOSE: Simple layout for auth pages (login, signup, forgot-password)
 * No sidebar or header, just clean centered content
 */

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-gray-50">{children}</div>
}
