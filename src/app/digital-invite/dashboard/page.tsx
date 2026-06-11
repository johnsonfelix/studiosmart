import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Copy, Plus, Sparkles, CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function DigitalInviteDashboard() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const invites = await prisma.digitalInvite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-brand/30">
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">StudioSmart <span className="text-white/40 font-normal">| My Invites</span></Link>
          <Button asChild variant="outline" className="border-brand/30 text-brand hover:bg-brand/10">
            <Link href="/digital-invite">
              <Plus className="w-4 h-4 mr-2" /> Create New
            </Link>
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-serif mb-4">My Digital Invites</h1>
          <p className="text-white/60">Manage your digital wedding invitations, drafts, and payments.</p>
        </div>

        {invites.length === 0 ? (
          <div className="glass p-12 rounded-[2rem] text-center border border-white/10 flex flex-col items-center max-w-2xl mx-auto mt-20">
            <div className="w-20 h-20 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-4">No invites yet</h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto">You haven't created any digital invitations yet. Choose a template and start designing for your special day.</p>
            <Button asChild className="brand-gradient border-0 text-white shadow-lg shadow-brand/20">
              <Link href="/digital-invite">Browse Templates</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {invites.map((invite) => {
              const isPaid = invite.paymentStatus === "PAID";
              
              return (
                <div key={invite.id} className="glass rounded-[2rem] overflow-hidden border border-white/10 hover:border-white/20 transition-all flex flex-col">
                  <div className="relative aspect-video w-full bg-black/50 overflow-hidden">
                    {invite.heroImageUrl ? (
                      <Image 
                        src={invite.heroImageUrl} 
                        alt="Hero" 
                        fill 
                        className="object-cover opacity-60"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-brand/20 to-transparent" />
                    )}
                    
                    <div className="absolute top-4 right-4 z-10">
                      {isPaid ? (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold tracking-widest uppercase rounded-full border border-green-500/20 backdrop-blur-md">
                          Published
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold tracking-widest uppercase rounded-full border border-amber-500/20 backdrop-blur-md">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-2xl font-serif mb-1 truncate">{invite.brideName} & {invite.groomName}</h3>
                    <p className="text-sm text-white/50 mb-6">
                      Template: <span className="capitalize text-white/70">{invite.templateId.replace("-", " ")}</span>
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-white/5 space-y-3">
                      {isPaid ? (
                        <>
                          <div className="flex gap-2">
                            <Button asChild variant="secondary" className="w-full">
                              <Link href={`/invite/${invite.id}`} target="_blank">
                                <ExternalLink className="w-4 h-4 mr-2" /> View
                              </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full border-white/10 hover:bg-white/5">
                              {/* Edit functionality to be implemented in a real scenario */}
                              <Link href="#">
                                Edit
                              </Link>
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <Button variant="default" className="w-full brand-gradient border-0 text-white shadow-lg shadow-brand/20">
                            <CreditCard className="w-4 h-4 mr-2" /> Pay ₹99 & Publish
                          </Button>
                          <Button asChild variant="ghost" className="w-full text-white/50 hover:text-white">
                            <Link href="#">Continue Editing</Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
