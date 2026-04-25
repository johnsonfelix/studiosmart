"use client";

import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { IndianRupee, History } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  referenceNumber: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  studio: {
    name: string;
  };
}

export function RecentTransactionsList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <History className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-muted-foreground">No Transactions</h3>
          <p className="text-muted-foreground text-sm max-w-xs">No wallet transactions found in the system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30 text-left">
            <th className="px-6 py-4 font-medium text-muted-foreground">Studio</th>
            <th className="px-6 py-4 font-medium text-muted-foreground">Reference</th>
            <th className="px-6 py-4 font-medium text-muted-foreground text-right">Amount</th>
            <th className="px-6 py-4 font-medium text-muted-foreground">Date</th>
            <th className="px-6 py-4 font-medium text-muted-foreground text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b hover:bg-muted/5 transition-colors">
              <td className="px-6 py-4 font-medium">
                {tx.studio.name}
              </td>
              <td className="px-6 py-4">
                <code className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border">
                  {tx.referenceNumber}
                </code>
              </td>
              <td className="px-6 py-4 text-right font-bold">
                ₹{tx.amount.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-muted-foreground text-xs">
                {format(new Date(tx.createdAt), "MMM d, yyyy • p")}
              </td>
              <td className="px-6 py-4 text-right">
                <Badge 
                  variant={
                    tx.status === "APPROVED" ? "default" : 
                    tx.status === "REJECTED" ? "destructive" : 
                    "outline"
                  }
                  className={
                    tx.status === "APPROVED" ? "bg-emerald-500 hover:bg-emerald-600 border-0" : 
                    tx.status === "PENDING" ? "bg-amber-500/10 text-amber-600 border-amber-200" :
                    ""
                  }
                >
                  {tx.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
