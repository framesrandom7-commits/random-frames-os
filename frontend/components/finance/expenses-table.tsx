"use client";

import React, { useState, useTransition } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { Prisma, ExpenseCategory, PaymentMethod } from "@prisma/client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { deleteExpense, createExpense } from "@/app/actions/expense";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ExpensesTableProps {
  data: {
    expenses: Prisma.ExpenseGetPayload<{}>[];
    total: number;
    totalPages: number;
    page: number;
  };
}

export default function ExpensesTable({ data }: ExpensesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "OTHER" as ExpenseCategory,
    amount: "",
    date: new Date().toISOString().split('T')[0],
    paymentMethod: "CARD" as PaymentMethod,
    clientId: "",
    projectId: "",
    notes: ""
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const setFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentCategory = searchParams.get("category");

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      setIsDeleting(id);
      await deleteExpense(id);
      setIsDeleting(null);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await createExpense({
        title: formData.title,
        category: formData.category,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date),
        paymentMethod: formData.paymentMethod,
        clientId: formData.clientId || undefined,
        projectId: formData.projectId,
        notes: formData.notes || undefined,
      });
      setIsAddOpen(false);
      setFormData({
        title: "",
        category: "MISCELLANEOUS",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        paymentMethod: "CARD",
        clientId: "",
        projectId: "",
        notes: ""
      });
    });
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-4 rounded-lg border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0 w-full sm:w-auto">
          <Badge 
            variant="outline" 
            className={`cursor-pointer whitespace-nowrap ${!currentCategory ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-zinc-400 border-white/10'}`}
            onClick={() => setFilter("category", null)}
          >
            All Categories
          </Badge>
          {Object.values(ExpenseCategory).map(cat => (
            <Badge 
              key={cat}
              variant="outline" 
              className={`cursor-pointer whitespace-nowrap ${currentCategory === cat ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-zinc-400 border-white/10'}`}
              onClick={() => setFilter("category", cat)}
            >
              {cat.replace("_", " ")}
            </Badge>
          ))}
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <Button onClick={() => setIsAddOpen(true)} className="bg-[#C1121F] hover:bg-[#a00f1a] text-white whitespace-nowrap w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" /> Add Expense
          </Button>
          <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Record New Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-white/5 border-white/10" placeholder="e.g. Adobe Subscription" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-white/5 border-white/10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: (v || "MISCELLANEOUS") as ExpenseCategory})}>
                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {Object.values(ExpenseCategory).map(c => <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={formData.paymentMethod} onValueChange={(v) => setFormData({...formData, paymentMethod: (v || "CARD") as PaymentMethod})}>
                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {Object.values(PaymentMethod).map(c => <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Client ID (Optional)</Label>
                <Input value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} className="bg-white/5 border-white/10" placeholder="Client ID" />
              </div>
              <div className="space-y-2">
                <Label>Project ID (Optional)</Label>
                <Input value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} className="bg-white/5 border-white/10" placeholder="Project ID" />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="bg-white/5 border-white/10" />
              </div>
              <Button type="submit" disabled={isPending} className="w-full bg-[#C1121F] hover:bg-[#a00f1a] text-white">
                {isPending ? 'Saving...' : 'Save Expense'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-hidden bg-white/5 border border-white/10 rounded-lg flex flex-col backdrop-blur-md">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <Table>
            <TableHeader className="bg-black/40 sticky top-0 z-10 backdrop-blur-md">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-zinc-400 font-medium">Date</TableHead>
                <TableHead className="text-zinc-400 font-medium">Title</TableHead>
                <TableHead className="text-zinc-400 font-medium">Client</TableHead>
                <TableHead className="text-zinc-400 font-medium">Category</TableHead>
                <TableHead className="text-zinc-400 font-medium">Payment Method</TableHead>
                <TableHead className="text-zinc-400 font-medium text-right">Amount</TableHead>
                <TableHead className="text-zinc-400 font-medium w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.expenses.length === 0 ? (
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableCell colSpan={7} className="h-32 text-center text-zinc-500">
                    No expenses found in this category.
                  </TableCell>
                </TableRow>
              ) : (
                data.expenses.map((expense) => (
                  <TableRow key={expense.id} className="border-white/10 hover:bg-white/5 transition-colors">
                    <TableCell className="text-zinc-400 text-sm">
                      {new Date(expense.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-white">{expense.title}</div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-white truncate">{(expense as any).client?.businessName || "No Client"}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700">
                        {expense.category.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">
                      {expense.paymentMethod.replace("_", " ")}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-400">
                      -{formatCurrency(Number(expense.amount))}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(expense.id)}
                        disabled={isDeleting === expense.id}
                        className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
