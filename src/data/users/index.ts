// src/data/users/index.ts
// Data Access Layer for Users
import 'server-only'
import { eq } from 'drizzle-orm'
import { db, users } from '@/db'

// Type definitions
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

// Get all users
export async function getAllUsers() {
  try {
    // Only admin users should be able to fetch all users
    // const adminUser = await requireAdminUser();

    const allUsers = await db.select().from(users).orderBy(users.createdAt)

    return { success: true, data: allUsers }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { success: false, error: 'Failed to fetch users' }
  }
}

// Get a user by ID
export async function getUserById(id: number) {
  try {
    // Regular users can fetch their own data, admins can fetch any user
    // const currentUser = await requireUser();
    // Add authorization logic here

    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    return { success: true, data: user }
  } catch (error) {
    console.error('Error fetching user:', error)
    return { success: false, error: 'Failed to fetch user' }
  }
}

// Create a new user
export async function createUser(userData: NewUser) {
  try {
    // In a real implementation, we might have different rules for user creation
    // For example, only admins can create users, or users can register themselves

    const [newUser] = await db.insert(users).values(userData).returning()

    return { success: true, data: newUser }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: 'Failed to create user' }
  }
}

// Update a user
export async function updateUser(id: number, userData: Partial<User>) {
  try {
    // Users can update their own data, admins can update any user
    // const currentUser = await requireUser();
    // Add authorization logic here

    const [updatedUser] = await db.update(users).set(userData).where(eq(users.id, id)).returning()

    if (!updatedUser) {
      return { success: false, error: 'User not found' }
    }

    return { success: true, data: updatedUser }
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, error: 'Failed to update user' }
  }
}

// Delete a user
export async function deleteUser(id: number) {
  try {
    // Only admin users should be able to delete users
    // const adminUser = await requireAdminUser();

    const [deletedUser] = await db.delete(users).where(eq(users.id, id)).returning()

    if (!deletedUser) {
      return { success: false, error: 'User not found' }
    }

    return { success: true, data: deletedUser }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: 'Failed to delete user' }
  }
}
