"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteInvoiceDialog } from "@/components/delete-invoice-dialog";
import { DateRangeFilter, DateRangeFilterValue } from "@/components/date-range-filter";
import { AmountFilter, AmountFilterValue } from "@/components/amount-filter";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Building,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  date: string;
  dueDate: string;
  customerRef?: string;
  total: number;
  status: "draft" | "complete";
  createdAt: string;
}

interface Client {
  _id: string;
  name: string;
}

export function InvoicesPageClient() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateRangeFilterValue>({
    type: "range",
    startDate: undefined,
    endDate: undefined,
    singleDate: undefined,
  });
  const [dueDateFilter, setDueDateFilter] = useState<DateRangeFilterValue>({
    type: "range",
    startDate: undefined,
    endDate: undefined,
    singleDate: undefined,
  });
  const [amountFilter, setAmountFilter] = useState<AmountFilterValue>({
    operator: "equal",
    amount: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch invoices
      const invoicesResponse = await fetch("/api/invoices");
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json();
        setInvoices(invoicesData);
      }

      // Fetch clients
      const clientsResponse = await fetch("/api/clients");
      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        setClients(clientsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (
    invoiceId: string,
    invoiceNumber: string
  ) => {
    setDownloadingId(invoiceId);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        
        // Get filename from response headers
        const contentDisposition = response.headers.get('content-disposition');
        const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || `invoice-${invoiceNumber}.pdf`;
        a.download = filename;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "PDF Downloaded",
          description: "Invoice PDF has been downloaded successfully.",
        });
      } else {
        throw new Error("Failed to download PDF");
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Error",
        description: "Failed to download PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleInvoiceDeleted = () => {
    fetchData();
    toast({
      title: "Invoice deleted",
      description: "The invoice has been successfully deleted.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "complete":
        return "default";
      default:
        return "secondary";
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c._id === clientId);
    return client?.name || "Unknown Client";
  };

  const matchesDateFilter = (invoiceDate: string, filter: DateRangeFilterValue) => {
    if (!filter.startDate && !filter.endDate && !filter.singleDate) return true;
    
    const date = new Date(invoiceDate);
    
    if (filter.type === "range") {
      if (filter.startDate && filter.endDate) {
        return date >= filter.startDate && date <= filter.endDate;
      } else if (filter.startDate) {
        return date >= filter.startDate;
      } else if (filter.endDate) {
        return date <= filter.endDate;
      }
    } else if (filter.type === "before" && filter.singleDate) {
      return date < filter.singleDate;
    } else if (filter.type === "on" && filter.singleDate) {
      return date.toDateString() === filter.singleDate.toDateString();
    } else if (filter.type === "after" && filter.singleDate) {
      return date > filter.singleDate;
    }
    
    return true;
  };

  const matchesAmountFilter = (amount: number, filter: AmountFilterValue) => {
    if (filter.amount === null || filter.amount === undefined) return true;
    
    switch (filter.operator) {
      case "less_than":
        return amount < filter.amount;
      case "less_than_equal":
        return amount <= filter.amount;
      case "equal":
        return amount === filter.amount;
      case "greater_than":
        return amount > filter.amount;
      case "greater_than_equal":
        return amount >= filter.amount;
      case "not_equal":
        return amount !== filter.amount;
      default:
        return true;
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const clientName = getClientName(invoice.clientId);
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerRef?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;
    const matchesClient =
      clientFilter === "all" || invoice.clientId === clientFilter;
    const matchesDate = matchesDateFilter(invoice.date, dateFilter);
    const matchesDueDate = matchesDateFilter(invoice.dueDate, dueDateFilter);
    const matchesAmount = matchesAmountFilter(invoice.total, amountFilter);

    return matchesSearch && matchesStatus && matchesClient && matchesDate && matchesDueDate && matchesAmount;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const renderEmptyState = () => {
    const isFirstInvoice = invoices.length === 0;
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
        <p className="text-muted-foreground mb-4">
          {isFirstInvoice
            ? "Create your first invoice to get started"
            : "Try adjusting your filters"}
        </p>
        {isFirstInvoice && (
          <Link href="/invoices/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </Link>
        )}
      </div>
    );
  };

  const renderTableContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (filteredInvoices.length === 0) {
      return renderEmptyState();
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvoices.map((invoice) => (
            <TableRow key={invoice._id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  {invoice.invoiceNumber}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  {getClientName(invoice.clientId)}
                </div>
              </TableCell>
              <TableCell>
                {invoice.customerRef || "-"}
              </TableCell>
              <TableCell>
                {new Date(invoice.date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(invoice.dueDate).toLocaleDateString()}
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(invoice.total)}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusColor(invoice.status)}>
                  {invoice.status.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleDownloadPDF(invoice._id, invoice.invoiceNumber)
                    }
                    disabled={downloadingId === invoice._id}
                  >
                    {downloadingId === invoice._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>

                  <Link href={`/invoices/manage/${invoice._id}`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>

                  <DeleteInvoiceDialog
                    invoice={invoice}
                    onInvoiceDeleted={handleInvoiceDeleted}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DeleteInvoiceDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
              <p className="text-muted-foreground">Manage all your invoices</p>
            </div>
            <Link href="/invoices/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search and Basic Filters */}
                <div className="flex gap-4 flex-wrap">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search invoices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Clients</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client._id} value={client._id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Advanced Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="invoice-date-filter" className="text-sm font-medium">Invoice Date</label>
                    <DateRangeFilter
                      value={dateFilter}
                      onChange={setDateFilter}
                      placeholder="Filter by invoice date"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="due-date-filter" className="text-sm font-medium">Due Date</label>
                    <DateRangeFilter
                      value={dueDateFilter}
                      onChange={setDueDateFilter}
                      placeholder="Filter by due date"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="amount-filter" className="text-sm font-medium">Amount</label>
                    <AmountFilter
                      value={amountFilter}
                      onChange={setAmountFilter}
                      placeholder="Filter by amount"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoices Table */}
          <Card>
            <CardContent className="p-0">{renderTableContent()}</CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
