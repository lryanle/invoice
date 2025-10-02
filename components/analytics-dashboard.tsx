"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { UserAnalytics } from "@/components/user-analytics"
import { ClientAnalytics } from "@/components/client-analytics"
import { BarChart3, Users, TrendingUp, Activity } from "lucide-react"

interface Client {
  _id: string
  name: string
}

export function AnalyticsDashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<string>("all")

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients")
        if (response.ok) {
          const data = await response.json()
          setClients(data)
        }
      } catch (error) {
        console.error("Error fetching clients:", error)
      }
    }

    fetchClients()
  }, [])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="user" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="user" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>User Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="client" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Client Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="user" className="space-y-6">
          <UserAnalytics />
        </TabsContent>

        <TabsContent value="client" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Client Selection</span>
              </CardTitle>
              <CardDescription>
                Select a client to view detailed analytics, or choose "All Clients" to see an overview comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>All Clients Overview</span>
                      </div>
                    </SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client._id} value={client._id}>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{client.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedClient === "all" && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>Overview Mode</span>
                  </Badge>
                )}
                
                {selectedClient && selectedClient !== "all" && (
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>Individual Client</span>
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <ClientAnalytics clientId={selectedClient} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
