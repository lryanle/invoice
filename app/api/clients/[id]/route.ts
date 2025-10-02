import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { DatabaseService } from "@/lib/database"
import { withErrorHandling, createError } from "@/lib/error-handler"

async function handleGetClient(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  const { id } = await params

  if (!userId) {
    throw createError.unauthorized("Authentication required to access client")
  }

  if (!id || typeof id !== 'string') {
    throw createError.validationError("Valid client ID is required")
  }

  const client = await DatabaseService.getClientById(id)

  if (!client || client.userId !== userId) {
    throw createError.notFound("Client not found")
  }

  return NextResponse.json(client)
}

export const GET = withErrorHandling(handleGetClient)

async function handleUpdateClient(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  const { id } = await params

  if (!userId) {
    throw createError.unauthorized("Authentication required to update client")
  }

  if (!id || typeof id !== 'string') {
    throw createError.validationError("Valid client ID is required")
  }

  const body = await request.json()
  const { name, email, address } = body

  // Validate required fields
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw createError.validationError("Client name is required and must be a non-empty string")
  }

  if (email && typeof email !== 'string') {
    throw createError.validationError("Email must be a string")
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError.validationError("Invalid email format")
  }

  // Verify ownership
  const client = await DatabaseService.getClientById(id)
  if (!client || client.userId !== userId) {
    throw createError.notFound("Client not found")
  }

  await DatabaseService.updateClient(id, { 
    name: name.trim(), 
    email: email?.trim() || undefined, 
    address: address?.trim() || undefined 
  })
  const updatedClient = await DatabaseService.getClientById(id)

  return NextResponse.json(updatedClient)
}

export const PUT = withErrorHandling(handleUpdateClient)

async function handleDeleteClient(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  const { id } = await params

  if (!userId) {
    throw createError.unauthorized("Authentication required to delete client")
  }

  if (!id || typeof id !== 'string') {
    throw createError.validationError("Valid client ID is required")
  }

  // Verify ownership
  const client = await DatabaseService.getClientById(id)
  if (!client || client.userId !== userId) {
    throw createError.notFound("Client not found")
  }

  await DatabaseService.deleteClient(id)
  return NextResponse.json({ success: true })
}

export const DELETE = withErrorHandling(handleDeleteClient)
