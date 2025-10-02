import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { DatabaseService } from "@/lib/database"
import { withErrorHandling, createError } from "@/lib/error-handler"

async function handleGetClients(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    throw createError.unauthorized("Authentication required to access clients")
  }

  const clients = await DatabaseService.getClientsByUser(userId)
  return NextResponse.json(clients)
}

export const GET = withErrorHandling(handleGetClients)

async function handleCreateClient(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    throw createError.unauthorized("Authentication required to create clients")
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

  const clientId = await DatabaseService.createClient({
    userId,
    name: name.trim(),
    email: email?.trim() || '',
    invoiceCounter: 0,
    address: {
      street1: address?.trim() || '',
      city: '',
      state: '',
      country: '',
      zip: ''
    },
  })

  const client = await DatabaseService.getClientById(clientId.toString())
  return NextResponse.json(client, { status: 201 })
}

export const POST = withErrorHandling(handleCreateClient)
