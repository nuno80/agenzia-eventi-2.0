import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
// Use libsql implementation exclusively (Turso database)
import { db, users } from '@/db'

// DELETE /api/users/[id] - Delete a user
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = parseInt(id, 10)

    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    // Delete user
    const deletedUser = await db.delete(users).where(eq(users.id, userId)).returning()

    if (deletedUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
