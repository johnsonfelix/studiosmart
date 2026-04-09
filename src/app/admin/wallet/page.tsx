import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, CheckSquare, Clock, IndianRupee, CheckCircle } from "lucide-react";
import { getAllPendingTransactions, getTotalReceivedAmount } from "@/services/wallet.service";
import { AdminWalletApprovalList } from "@/components/admin/wallet-approval-list";

export const metadata = {
  title: "Wallet Requests | Admin",
};

export default async function AdminWalletPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const [pendingRequests, totalReceived] = await Promise.all([
    getAllPendingTransactions(),
    getTotalReceivedAmount(),
  ]);
  
  // Calculate total amount of pending deposits
  const totalPendingAmount = pendingRequests.reduce((sum, req) => sum + req.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">Wallet Management</h2>
        <p className="text-muted-foreground">Verify and approve studio deposit requests.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary uppercase tracking-wider">Pending Deposits</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting verification</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 uppercase tracking-wider">Pending Volume</CardTitle>
            <IndianRupee className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">₹{totalPendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 text-emerald-600/60">Total requested sum</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 uppercase tracking-wider">Total Received</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{totalReceived.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 text-blue-600/60">Total approved volume</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="bg-muted/10 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-muted-foreground" />
            Verification Queue
          </CardTitle>
          <CardDescription>
            Check the reference numbers against your bank/UPI statement before approving.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <AdminWalletApprovalList initialRequests={pendingRequests} />
        </CardContent>
      </Card>
    </div>
  );
}
