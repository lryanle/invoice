"use client"

import { useRef } from "react"
import { ClientList, ClientListRef } from "@/components/client-list"
import { CreateClientDialog } from "@/components/create-client-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function ClientsPageClient() {
  const clientListRef = useRef<ClientListRef>(null)

  const handleClientCreated = () => {
    // Trigger a refresh of the client list
    if (clientListRef.current) {
      clientListRef.current.refreshClients()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Clients</h1>
              <p className="text-muted-foreground">Manage clients you send invoices to</p>
            </div>
            <CreateClientDialog onClientCreated={handleClientCreated}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </CreateClientDialog>
          </div>

          {/* Client List */}
          <ClientList ref={clientListRef} />
        </div>
      </main>
    </div>
  )
}
