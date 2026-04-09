import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, History, CreditCard, ArrowUpRight, Clock, CheckCircle2, XCircle } from "lucide-react";
import { getStudioBalance, getStudioTransactions } from "@/services/wallet.service";
import { WalletDepositForm } from "@/components/studio/wallet-deposit-form";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const metadata = {
  title: "Wallet | StudioSmart",
};

export default async function StudioWalletPage() {
  const session = await auth();
  if (!session || !session.user.studioId) redirect("/login");

  const [balance, transactions] = await Promise.all([
    getStudioBalance(session.user.studioId),
    getStudioTransactions(session.user.studioId),
  ]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Financial Wallet</h2>
        <p className="text-muted-foreground text-sm">Manage your studio balance and transaction history.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Balance Card */}
        <Card className="md:col-span-1 bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 shadow-lg relative overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">₹{balance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              Ready for upcoming services
            </p>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
              <Wallet className="h-24 w-24" />
            </div>
          </CardContent>
        </Card>

        {/* Deposit Form Card */}
        <Card className="md:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Add Funds
            </CardTitle>
            <CardDescription>
              Scan the QR code to pay via UPI and submit your payment details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WalletDepositForm />
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="shadow-sm border-muted/60">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/5 py-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left">
                  <th className="px-6 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">Reference Number</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground text-right">Amount</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground italic">
                      No transactions yet. Add funds to see them here.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(new Date(tx.createdAt), "MMM d, yyyy • p")}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-medium">
                        {tx.referenceNumber}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        ₹{tx.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {tx.status === "PENDING" && (
                          <Badge variant="outline" className="text-amber-500 bg-amber-500/10 border-amber-500/20 gap-1.5 py-1">
                            <Clock className="w-3.5 h-3.5" /> Pending
                          </Badge>
                        )}
                        {tx.status === "APPROVED" && (
                          <Badge variant="outline" className="text-emerald-500 bg-emerald-500/10 border-emerald-500/20 gap-1.5 py-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                          </Badge>
                        )}
                        {tx.status === "REJECTED" && (
                          <Badge variant="outline" className="text-red-500 bg-red-500/10 border-red-500/20 gap-1.5 py-1">
                            <XCircle className="w-3.5 h-3.5" /> Rejected
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
