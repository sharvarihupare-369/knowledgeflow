"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  UserX,
  Search,
  Check,
  X,
  UserPlus,
  Send,
  Mail,
  ShieldAlert,
  RefreshCw,
  ChevronDown
} from "lucide-react";
import {
  useUnifiedUsers,
  useApproveJoinRequest,
  useRejectJoinRequest,
  useDeactivateUser,
  useReactivateUser,
  useInvites,
  useCreateInvites,
  useRevokeInvite,
  useResendInvite,
} from "@/hooks/useAdmin";
import { useUser } from "@/hooks/useUser";
import { useCollections } from "@/hooks/useCollections";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { format } from "date-fns";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

export default function InvitesAndTeamPage() {
  const { data: user } = useUser();
  const [mainTab, setMainTab] = useState<"INVITES" | "JOIN_REQUESTS">("INVITES");

  // ================= JOIN REQUESTS STATE =================
  const { data: unifiedUsers = [], isLoading: isLoadingReqs } = useUnifiedUsers();
  const { mutate: approveRequest, isPending: isApproving } = useApproveJoinRequest();
  const { mutate: rejectRequest, isPending: isRejecting } = useRejectJoinRequest();
  const { mutate: deactivateUser, isPending: isDeactivating } = useDeactivateUser();
  const { mutate: reactivateUser, isPending: isReactivating } = useReactivateUser();
  const [reqActiveTab, setReqActiveTab] = useState("ALL USERS");
  const [reqCollections, setReqCollections] = useState<Record<string, string[]>>({});
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");

  // ================= INVITES STATE =================
  const { data: invites = [], isLoading: isLoadingInvites } = useInvites();
  const { mutate: createInvites, isPending: isCreating } = useCreateInvites();
  const { mutate: revokeInvite, isPending: isRevoking } = useRevokeInvite();
  const { mutate: resendInvite, isPending: isResending } = useResendInvite();
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [inviteSearchQuery, setInviteSearchQuery] = useState("");
  const { data: collections = [] } = useCollections();
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  if (user?.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  // ================= JOIN REQUESTS HANDLERS =================
  const handleApprove = (id: string) => {
    approveRequest({ id, collectionIds: reqCollections[id] || [] }, {
      onSuccess: () => toast.success("Request approved successfully"),
      onError: () => toast.error("Failed to approve request"),
    });
  };

  const handleRejectReq = (id: string) => {
    rejectRequest(id, {
      onSuccess: () => toast.success("Request rejected successfully"),
      onError: () => toast.error("Failed to reject request"),
    });
  };

  const handleDeactivateUser = (id: string) => {
    deactivateUser(id, {
      onSuccess: () => toast.success("User deactivated"),
      onError: () => toast.error("Failed to deactivate user"),
    });
  };

  const handleReactivateUser = (id: string) => {
    reactivateUser(id, {
      onSuccess: () => toast.success("User reactivated"),
      onError: () => toast.error("Failed to reactivate user"),
    });
  };

  const pendingReqs = unifiedUsers.filter((u: any) => u.type === 'REQUEST' && u.status === 'PENDING');
  const approvedUsers = unifiedUsers.filter((u: any) => u.type === 'MEMBER' && u.status === 'ACTIVE');
  const deactivatedUsers = unifiedUsers.filter((u: any) => u.type === 'MEMBER' && u.status === 'INACTIVE');
  const rejectedReqs = unifiedUsers.filter((u: any) => u.type === 'REQUEST' && u.status === 'INACTIVE');

  const reqStats = [
    { id: "ALL USERS", label: "ALL USERS", value: unifiedUsers.length.toString(), icon: Users, color: "text-blue-600", bgColor: "bg-blue-50" },
    { id: "PENDING REQUESTS", label: "PENDING REQUESTS", value: pendingReqs.length.toString(), icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-50" },
    { id: "APPROVED", label: "APPROVED", value: approvedUsers.length.toString(), icon: CheckCircle2, color: "text-green-600", bgColor: "bg-green-50" },
    { id: "REJECTED", label: "REJECTED", value: rejectedReqs.length.toString(), icon: XCircle, color: "text-red-600", bgColor: "bg-red-50" },
    { id: "DEACTIVATED", label: "DEACTIVATED", value: deactivatedUsers.length.toString(), icon: UserX, color: "text-slate-600", bgColor: "bg-slate-100" },
  ];
  
  let displayRequests = reqActiveTab === "ALL USERS" ? unifiedUsers 
    : reqActiveTab === "PENDING REQUESTS" ? pendingReqs 
    : reqActiveTab === "APPROVED" ? approvedUsers 
    : reqActiveTab === "REJECTED" ? rejectedReqs 
    : deactivatedUsers;
    
  if (userSearchQuery.trim()) {
    const q = userSearchQuery.toLowerCase();
    displayRequests = displayRequests.filter((u: any) => 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q) || 
      (u.organisation?.name || "").toLowerCase().includes(q)
    );
  }

  // ================= INVITES HANDLERS =================
  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = emailInput.trim();
      if (val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        if (!emails.includes(val)) {
          setEmails([...emails, val]);
        }
        setEmailInput("");
      } else if (val) {
        toast.error("Please enter a valid email address.");
      }
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter(e => e !== emailToRemove));
  };

  const handleSendInvites = () => {
    if (emails.length === 0) {
      toast.error("Please add at least one email address.");
      return;
    }
    createInvites({ emails, collectionIds: selectedCollections }, {
      onSuccess: () => {
        toast.success("Invitations sent successfully!");
        setEmails([]);
      },
      onError: (err: any) => toast.error(err.response?.data?.message || "Failed to send invitations.")
    });
  };

  const handleRevoke = (id: string) => {
    revokeInvite(id, {
      onSuccess: () => toast.success("Invitation revoked."),
      onError: (err: any) => toast.error(err.response?.data?.message || "Failed to revoke invitation.")
    });
  };

  const handleResend = (id: string) => {
    resendInvite(id, {
      onSuccess: () => toast.success("Invitation resent."),
      onError: (err: any) => toast.error(err.response?.data?.message || "Failed to resend invitation.")
    });
  };

  const totalInvites = invites.length;
  const pending = invites.filter(i => i.status === "PENDING").length;
  const accepted = invites.filter(i => i.status === "ACCEPTED").length;
  const expired = invites.filter(i => i.status === "EXPIRED").length;
  const revoked = invites.filter(i => i.status === "REVOKED").length;

  const inviteStats = [
    { label: "TOTAL INVITES", value: totalInvites, icon: Mail, color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: "PENDING", value: pending, icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-50" },
    { label: "ACCEPTED", value: accepted, icon: CheckCircle2, color: "text-green-600", bgColor: "bg-green-50" },
    { label: "EXPIRED", value: expired, icon: XCircle, color: "text-red-600", bgColor: "bg-red-50" },
    { label: "REVOKED", value: revoked, icon: XCircle, color: "text-slate-600", bgColor: "bg-slate-100" },
  ];
  const filteredInvites = invites.filter(invite => invite.email.toLowerCase().includes(inviteSearchQuery.toLowerCase()));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setMainTab("INVITES")}
          className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${mainTab === "INVITES" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Invitations
        </button>
        <button
          onClick={() => setMainTab("JOIN_REQUESTS")}
          className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${mainTab === "JOIN_REQUESTS" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Users & Join Requests
        </button>
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        {mainTab === "INVITES" ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              {inviteStats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="flex flex-col justify-center p-4 rounded-xl border border-gray-200 bg-white">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-full ${stat.bgColor}`}>
                        <Icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                      <span className="text-xs font-semibold text-gray-500 tracking-wider">
                        {stat.label}
                      </span>
                    </div>
                    <div className="text-3xl font-semibold text-gray-900 pl-[3.25rem]">
                      {stat.value}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
              <div className="flex items-start gap-3 mb-6">
                <Send className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Invite new members</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter one or more email addresses. Press <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded text-xs">Enter</kbd> or <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded text-xs">,</kbd> after each. Invitees will receive an email to join <strong>{user?.companyName || "the organisation"}</strong>.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    EMAIL ADDRESSES
                  </label>
                  <div className="w-full flex flex-wrap gap-2 items-center min-h-[46px] p-2 border border-gray-200 rounded-lg focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                    {emails.map((email) => (
                      <span key={email} className="inline-flex items-center px-2.5 py-1 rounded-md text-sm bg-blue-50 text-blue-700">
                        {email}
                        <button type="button" onClick={() => removeEmail(email)} className="ml-1.5 text-blue-400 hover:text-blue-600">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      id="inviteEmailInput"
                      name="inviteEmailInput"
                      type="email"
                      autoComplete="off"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={handleEmailKeyDown}
                      className="flex-1 min-w-[200px] outline-none text-sm placeholder-gray-400 p-1 bg-transparent"
                      placeholder={emails.length === 0 ? "name@company.com" : ""}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    GRANT ACCESS TO COLLECTIONS
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 border border-gray-200 rounded-lg text-sm bg-gray-50 max-h-[250px] overflow-y-auto">
                    <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-md hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 bg-white shadow-sm">
                      <input
                        type="checkbox"
                        checked={selectedCollections.length === collections.length && collections.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCollections(collections.map(c => c.id));
                          } else {
                            setSelectedCollections([]);
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="font-semibold text-gray-900">All Collections</span>
                    </label>
                    {collections.map(c => (
                      <label key={c.id} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-md hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 bg-white shadow-sm">
                        <input
                          type="checkbox"
                          checked={selectedCollections.includes(c.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCollections([...selectedCollections, c.id]);
                            } else {
                              setSelectedCollections(selectedCollections.filter(id => id !== c.id));
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="text-gray-700 truncate">{c.name}</span>
                      </label>
                    ))}
                    {collections.length === 0 && (
                      <span className="text-gray-400 italic col-span-full">No collections available</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Members will only see the collections you select.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Invites are scoped to your organisation.
                </div>
                <Button onClick={handleSendInvites} isLoading={isCreating} className="bg-slate-500 hover:bg-slate-600 text-white rounded-lg px-6">
                  <Send className="w-4 h-4 mr-2" />
                  Send invites
                </Button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Sent invitations</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Track invites you have already sent. Resend or revoke at any time.
                    </p>
                  </div>
                </div>
                <div className="relative w-full md:w-80">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="inviteSearchInput"
                    name="inviteSearchInput"
                    type="text"
                    autoComplete="off"
                    value={inviteSearchQuery}
                    onChange={(e) => setInviteSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search by email..."
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 border-y border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3">EMAIL</th>
                      <th className="px-6 py-3">INVITED BY</th>
                      <th className="px-6 py-3">COLLECTIONS</th>
                      <th className="px-6 py-3">SENT</th>
                      <th className="px-6 py-3">STATUS</th>
                      <th className="px-6 py-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {isLoadingInvites ? (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">Loading...</td></tr>
                    ) : filteredInvites.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-500">No invites sent yet.</td></tr>
                    ) : (
                      filteredInvites.map((invite) => (
                        <tr key={invite.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-gray-900 text-sm">{invite.email}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                                {invite.inviter?.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm text-gray-600">{invite.inviter?.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-[200px] truncate" title={invite.collectionIds?.length ? invite.collectionIds.map((id: string) => collections.find((c: any) => c.id === id)?.name || "Unknown").join(", ") : "All Collections"}>
                            {invite.collectionIds?.length
                              ? invite.collectionIds.map((id: string) => collections.find((c: any) => c.id === id)?.name || "Unknown").join(", ")
                              : "All Collections"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(invite.createdAt), "MMM d, yyyy")}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${invite.status === "PENDING" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                                invite.status === "ACCEPTED" ? "bg-green-100 text-green-800 border-green-200" :
                                  invite.status === "REVOKED" ? "bg-gray-100 text-gray-800 border-gray-200" :
                                    "bg-red-100 text-red-800 border-red-200"
                              }`}>
                              {invite.status.charAt(0) + invite.status.slice(1).toLowerCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              {invite.status === 'PENDING' && (
                                <>
                                  <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleResend(invite.id)} disabled={isRevoking || isResending}>
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleRevoke(invite.id)} disabled={isRevoking || isResending} title="Revoke">
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              {reqStats.map((stat) => {
                const Icon = stat.icon;
                const isActive = reqActiveTab === stat.id;
                return (
                  <button
                    key={stat.id}
                    onClick={() => setReqActiveTab(stat.id)}
                    className={`flex flex-col justify-center p-4 rounded-xl border transition-all text-left ${isActive
                        ? "border-blue-200 bg-blue-50/50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-full ${stat.bgColor}`}>
                        <Icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                      <span className="text-xs font-semibold text-gray-500 tracking-wider">
                        {stat.label}
                      </span>
                    </div>
                    <div className="text-3xl font-semibold text-gray-900 pl-[3.25rem]">
                      {stat.value}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <UserPlus className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Users</h2>
                    <p className="text-sm text-gray-500 mt-1 max-w-xl">
                      Users who signed up with an email matching your organization domain. Approve to grant workspace access.
                    </p>
                  </div>
                </div>
                <div className="relative w-full md:w-80">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="userSearchInput"
                    name="userSearchInput"
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    autoComplete="off"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search name, email, organization..."
                  />
                </div>
              </div>

              <div className="overflow-x-auto min-h-[350px] pb-48 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 border-y border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3">USER</th>
                      <th className="px-6 py-3">ORGANIZATION</th>
                      <th className="px-6 py-3">COLLECTIONS</th>
                      <th className="px-6 py-3">REQUESTED</th>
                      <th className="px-6 py-3">STATUS</th>
                      <th className="px-6 py-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {isLoadingReqs ? (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">Loading...</td></tr>
                    ) : displayRequests.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-500">No users found.</td></tr>
                    ) : (
                      displayRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                                {request.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-sm">{request.name}</div>
                                <div className="text-gray-500 text-xs mt-0.5">{request.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.organisation?.name || "-"}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {request.type === 'MEMBER' ? (
                              <div className="text-gray-900 font-medium truncate max-w-[200px]">
                                {request.collectionIds?.length === collections.length && collections.length > 0
                                  ? "All Collections"
                                  : request.collectionIds?.length > 0
                                  ? collections.filter(c => request.collectionIds.includes(c.id)).map(c => c.name).join(", ")
                                  : "None"}
                              </div>
                            ) : (
                              <div className="relative">
                                <button
                                  onClick={() => setOpenDropdownId(openDropdownId === request.id ? null : request.id)}
                                  className="flex items-center justify-between w-[160px] px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
                                >
                                  <span className="truncate">
                                    {(reqCollections[request.id] || []).length === collections.length && collections.length > 0
                                      ? "All Collections"
                                      : (reqCollections[request.id] || []).length > 0
                                        ? `${(reqCollections[request.id] || []).length} Selected`
                                        : "Select Collections"}
                                  </span>
                                  <ChevronDown className="h-4 w-4 text-gray-400 ml-2 shrink-0" />
                                </button>

                                {openDropdownId === request.id && (
                                  <div className="absolute z-10 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 p-1.5 left-0 max-h-[220px] overflow-y-auto">
                                    {collections.length > 0 && (
                                      <label className="flex items-center gap-2.5 cursor-pointer text-[13px] hover:bg-gray-50 p-1.5 rounded-md transition-all">
                                        <input
                                          type="checkbox"
                                          className="rounded h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 transition-colors"
                                          checked={(reqCollections[request.id] || []).length === collections.length}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setReqCollections({ ...reqCollections, [request.id]: collections.map(c => c.id) });
                                            } else {
                                              setReqCollections({ ...reqCollections, [request.id]: [] });
                                            }
                                          }}
                                        />
                                        <span className="font-semibold text-gray-800">All Collections</span>
                                      </label>
                                    )}
                                    {collections.length === 0 && <span className="text-xs text-gray-400 p-1">No collections available</span>}
                                    {collections.length > 0 && <div className="h-px bg-gray-100 my-1"></div>}
                                    {collections.map(c => (
                                      <label key={c.id} className="flex items-center gap-2.5 cursor-pointer text-[13px] hover:bg-gray-50 p-1.5 rounded-md transition-all">
                                        <input
                                          type="checkbox"
                                          className="rounded h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 transition-colors"
                                          checked={(reqCollections[request.id] || []).includes(c.id)}
                                          onChange={(e) => {
                                            const current = reqCollections[request.id] || [];
                                            setReqCollections({
                                              ...reqCollections,
                                              [request.id]: e.target.checked
                                                ? [...current, c.id]
                                                : current.filter(id => id !== c.id)
                                            });
                                          }}
                                        />
                                        <span className="truncate text-gray-600">{c.name}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(request.createdAt), "MMM d, yyyy")}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : request.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-200'
                              : request.type === 'REQUEST' && request.status === 'INACTIVE' ? 'bg-red-100 text-red-800 border-red-200'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}>
                              {request.status === 'PENDING' ? 'Pending'
                                : request.status === 'ACTIVE' ? 'Approved'
                                : request.type === 'REQUEST' && request.status === 'INACTIVE' ? 'Rejected'
                                : 'Deactivated'
                              }
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              {request.status === 'PENDING' && request.type === 'REQUEST' && (
                                <>
                                  <Button variant="ghost" size="sm" className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleRejectReq(request.id)} disabled={isApproving || isRejecting}>
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                  <Button size="sm" className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleApprove(request.id)} disabled={isApproving || isRejecting}>
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                </>
                              )}
                              {request.status === 'ACTIVE' && request.type === 'MEMBER' && (
                                <Button variant="ghost" size="sm" className="h-8 px-3 text-slate-600 hover:text-slate-700 hover:bg-slate-100" onClick={() => handleDeactivateUser(request.id)} disabled={isDeactivating}>
                                  <UserX className="h-4 w-4 mr-1" />
                                  Deactivate
                                </Button>
                              )}
                              {request.status === 'INACTIVE' && request.type === 'MEMBER' && (
                                <Button variant="ghost" size="sm" className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleReactivateUser(request.id)} disabled={isReactivating}>
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Reactivate
                                </Button>
                              )}
                              {request.status === 'INACTIVE' && request.type === 'REQUEST' && (
                                <span className="text-xs text-gray-400 mr-2">No actions</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
