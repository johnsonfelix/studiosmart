import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Manage Users | StudioSmart" };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      studio: {
        select: {
          name: true
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
      </div>

      <div className="border rounded-md bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-10 px-4 text-left font-medium">Name</th>
              <th className="h-10 px-4 text-left font-medium">Email</th>
              <th className="h-10 px-4 text-left font-medium">Role</th>
              <th className="h-10 px-4 text-left font-medium">Studio</th>
              <th className="h-10 px-4 text-left font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                <td className="p-4 align-middle">{user.name}</td>
                <td className="p-4 align-middle">{user.email}</td>
                <td className="p-4 align-middle">
                   <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                     user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
                     user.role === 'STUDIO' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                   }`}>
                     {user.role}
                   </span>
                </td>
                <td className="p-4 align-middle text-muted-foreground">{user.studio?.name || "N/A"}</td>
                <td className="p-4 align-middle text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
