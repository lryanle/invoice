import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const company = await DatabaseService.getCompanyById(id)

    if (!company || company.userId !== userId) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, address } = body

    // Verify ownership
    const company = await DatabaseService.getCompanyById(id)
    if (!company || company.userId !== userId) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    await DatabaseService.updateCompany(id, { name, email, address })
    const updatedCompany = await DatabaseService.getCompanyById(id)

    return NextResponse.json(updatedCompany)
  } catch (error) {
    console.error("Error updating company:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const company = await DatabaseService.getCompanyById(id)
    if (!company || company.userId !== userId) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    await DatabaseService.deleteCompany(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting company:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
