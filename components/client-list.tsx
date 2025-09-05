"use client"

import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EditClientDialog } from "@/components/edit-client-dialog"
import { DeleteClientDialog } from "@/components/delete-client-dialog"
import { useToast } from "@/hooks/use-toast"
import { Building, Building2, Mail, MapPin, Edit, Trash2 } from "lucide-react"
import { SkeletonCard } from "@/components/ui/skeleton"

interface Client {
  _id: string
  name: string
  email: string
  address: {
    street1: string
    street2?: string
    city: string
    state: string
    country: string
    zip: string
  }
  createdAt: string
}

export interface ClientListRef {
  refreshClients: () => void
}

export const ClientList = forwardRef<ClientListRef>((props, ref) => {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients")
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      } else {
        throw new Error("Failed to fetch clients")
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
      toast({
        title: "Error",
        description: "Failed to load clients. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useImperativeHandle(ref, () => ({
    refreshClients: fetchClients
  }))

  const handleClientUpdated = () => {
    fetchClients()
  }

  const handleClientDeleted = () => {
    fetchClients()
    toast({
      title: "Client deleted",
      description: "The client has been successfully deleted.",
    })
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={`client-skeleton-${i}`} />
        ))}
      </div>
    )
  }

  if (clients.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
          <p className="text-muted-foreground mb-4">Add your first client to start creating invoices</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {clients.map((client) => (
        <Card key={client._id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  {client.name}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {new Date(client.createdAt).toLocaleDateString()}
                </Badge>
              </div>
              <div className="flex gap-1">
                <EditClientDialog client={client} onClientUpdated={handleClientUpdated}>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </EditClientDialog>
                <DeleteClientDialog client={client} onClientDeleted={handleClientDeleted}>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DeleteClientDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{client.email}</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <div>{client.address.street1}</div>
                {client.address.street2 && <div>{client.address.street2}</div>}
                <div>
                  {client.address.city}, {client.address.state} {client.address.zip}
                </div>
                <div>{client.address.country}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})
