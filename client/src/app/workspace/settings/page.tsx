"use client";

import { motion } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { User, Settings as SettingsIcon, LogOut, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

export default function SettingsPage() {
  const { data: user } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-3xl space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Settings
        </h1>
        <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
          Manage your account preferences and workspace settings.
        </p>
      </motion.div>

      {/* Profile Section */}
      <motion.section variants={fadeUp} className="rounded-[16px] overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", boxShadow: "var(--shadow-sm)" }}>
        <div className="flex items-center gap-2 border-b px-6 py-4" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface-2)" }}>
           <User className="h-4 w-4 text-[var(--text-secondary)]" />
           <h2 className="text-sm font-semibold text-[var(--text-primary)]">Profile Information</h2>
        </div>
        
        <div className="p-6 space-y-6">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                 <label className="block text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                    Full Name
                 </label>
                 <div className="p-3 rounded-lg border text-sm font-medium" style={{ background: "var(--bg-surface-2)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
                    {user?.name || "—"}
                 </div>
              </div>
              
              <div>
                 <label className="block text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                    Email Address
                 </label>
                 <div className="p-3 rounded-lg border text-sm font-medium" style={{ background: "var(--bg-surface-2)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
                    {user?.email || "—"}
                 </div>
              </div>

              <div>
                 <label className="block text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                    Company
                 </label>
                 <div className="p-3 rounded-lg border text-sm font-medium" style={{ background: "var(--bg-surface-2)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
                    {user?.companyName || "—"}
                 </div>
              </div>
              
               <div>
                 <label className="block text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                    Role
                 </label>
                 <div className="p-3 rounded-lg border text-sm font-medium" style={{ background: "var(--bg-surface-2)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
                    {user?.role || "Member"}
                 </div>
              </div>
           </div>
        </div>
      </motion.section>

      {/* Account Actions */}
      <motion.section variants={fadeUp} className="rounded-[16px] overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", boxShadow: "var(--shadow-sm)" }}>
        <div className="flex items-center gap-2 border-b px-6 py-4" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface-2)" }}>
           <SettingsIcon className="h-4 w-4 text-[var(--text-secondary)]" />
           <h2 className="text-sm font-semibold text-[var(--text-primary)]">Account Preferences</h2>
        </div>
        
        <div className="p-6 flex items-center justify-between">
           <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Sign out</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Log out of your KnowledgeFlow account on this device.</p>
           </div>
           <Button onClick={handleLogout} className="bg-[var(--bg-surface-2)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)]">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
           </Button>
        </div>
      </motion.section>

      {/* Danger Zone */}
      <motion.section variants={fadeUp} className="rounded-[16px] overflow-hidden border border-red-200 dark:border-red-900/50" style={{ background: "var(--bg-surface)" }}>
        <div className="flex items-center gap-2 border-b border-red-100 dark:border-red-900/30 px-6 py-4 bg-red-50 dark:bg-red-950/20">
           <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
           <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
        </div>
        
        <div className="p-6 flex items-center justify-between">
           <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Delete account</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Permanently delete your account and all associated data.</p>
           </div>
           <Button 
              onClick={() => toast.error("Account deletion requires admin approval.")} 
              className="bg-red-600 text-white hover:bg-red-700"
           >
              Delete account
           </Button>
        </div>
      </motion.section>

    </motion.div>
  );
}
