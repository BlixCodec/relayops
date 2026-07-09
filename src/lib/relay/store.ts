import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Exception, Notification, Role } from "./types";
import {
  branches,
  favoritesList,
  initialDecisionHistory,
  initialExceptions,
  initialNotifications,
  technicians,
  workspace,
} from "./seed";

interface RelayState {
  role: Role;
  activeBranchId: string;
  currentUser: { dispatcher: string; manager: string };
  exceptions: Exception[];
  decisionHistory: Exception[];
  notifications: Notification[];
  drawerExceptionId: string | null;
  notificationsOpen: boolean;
  commandOpen: boolean;
  collapsedCards: Record<string, boolean>;
  favoriteFilter: string | null;

  setRole: (r: Role) => void;
  setBranch: (id: string) => void;
  openDrawer: (id: string) => void;
  closeDrawer: () => void;
  toggleNotifications: (v?: boolean) => void;
  toggleCommand: (v?: boolean) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  toggleCardCollapsed: (id: string) => void;
  setCardCollapsed: (id: string, value: boolean) => void;
  setFavoriteFilter: (branchId: string | null) => void;

  escalate: (id: string, reason: string) => void;
  approve: (id: string, note?: string) => void;
  deny: (id: string, note: string) => void;
  assignTechnician: (id: string, techId: string) => void;
  resolve: (id: string, note?: string) => void;
  addNote: (id: string, note: string) => void;
  toggleFavorite: (id: string) => void;
}

const iso = () => new Date().toISOString();
const uid = () => `id-${Math.random().toString(36).slice(2, 9)}`;

export const useRelayStore = create<RelayState>()(
  persist(
    (set, get) => ({
      role: "dispatcher",
      activeBranchId: workspace.defaultBranch,
      currentUser: { dispatcher: "Alicia Monroe", manager: "Renata Voss" },
      exceptions: initialExceptions,
      decisionHistory: initialDecisionHistory,
      notifications: initialNotifications,
      drawerExceptionId: null,
      notificationsOpen: false,
      commandOpen: false,
      collapsedCards: {},
      favoriteFilter: null,

      toggleCardCollapsed: (id) =>
        set((s) => ({
          collapsedCards: { ...s.collapsedCards, [id]: !s.collapsedCards[id] },
        })),

      setCardCollapsed: (id, value) =>
        set((s) => ({
          collapsedCards: { ...s.collapsedCards, [id]: value },
        })),

      setFavoriteFilter: (favoriteFilter) => set({ favoriteFilter }),

      setRole: (role) => set({ role }),
      setBranch: (activeBranchId) => set({ activeBranchId, favoriteFilter: null }),
      openDrawer: (id) => set({ drawerExceptionId: id }),
      closeDrawer: () => set({ drawerExceptionId: null }),
      toggleNotifications: (v) => set((s) => ({ notificationsOpen: v ?? !s.notificationsOpen })),
      toggleCommand: (v) => set((s) => ({ commandOpen: v ?? !s.commandOpen })),
      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      escalate: (id, reason) => {
        const user = get().currentUser.dispatcher;
        set((s) => {
          const ex = s.exceptions.find((e) => e.id === id);
          const branchName = branches.find((b) => b.id === ex?.branchId)?.name ?? "Branch";
          const at = iso();
          return {
            exceptions: s.exceptions.map((e) =>
              e.id === id
                ? {
                    ...e,
                    status: "escalated",
                    escalation: { reason, by: user, at },
                    audit: [
                      ...e.audit,
                      {
                        id: uid(),
                        at,
                        actor: user,
                        actorRole: "dispatcher",
                        action: "Escalated to Regional Operations",
                        note: reason,
                      },
                    ],
                  }
                : e,
            ),
            notifications: [
              {
                id: uid(),
                kind: "escalation",
                message: `${branchName} escalated ${ex?.customer ?? "an exception"} to Regional Operations.`,
                at,
                read: false,
                exceptionId: id,
                actionLabel: "View escalation",
              },
              ...s.notifications,
            ],
          };
        });
      },

      approve: (id, note) => {
        const user = get().currentUser.manager;
        set((s) => {
          const ex = s.exceptions.find((e) => e.id === id);
          const branchName = branches.find((b) => b.id === ex?.branchId)?.name ?? "Branch";
          const customer = ex?.customer ?? "the escalation";
          const at = iso();
          const message = note
            ? `Regional Operations approved ${customer} for ${branchName}. ${note}`
            : `Regional Operations approved ${customer} for ${branchName}. Dispatch can proceed.`;
          return {
            exceptions: s.exceptions.map((e) =>
              e.id === id
                ? {
                    ...e,
                    status: "approved",
                    decision: { outcome: "approved", by: user, at, note },
                    audit: [
                      ...e.audit,
                      {
                        id: uid(),
                        at,
                        actor: user,
                        actorRole: "manager",
                        action: "Approved escalation",
                        note,
                      },
                    ],
                  }
                : e,
            ),
            notifications: [
              {
                id: uid(),
                kind: "decision",
                message,
                at,
                read: false,
                exceptionId: id,
                actionLabel: "Open decision",
              },
              ...s.notifications,
            ],
          };
        });
      },

      deny: (id, note) => {
        const user = get().currentUser.manager;
        set((s) => {
          const ex = s.exceptions.find((e) => e.id === id);
          const branchName = branches.find((b) => b.id === ex?.branchId)?.name ?? "Branch";
          const at = iso();
          return {
            exceptions: s.exceptions.map((e) =>
              e.id === id
                ? {
                    ...e,
                    status: "denied",
                    decision: { outcome: "denied", by: user, at, note },
                    audit: [
                      ...e.audit,
                      {
                        id: uid(),
                        at,
                        actor: user,
                        actorRole: "manager",
                        action: "Denied escalation",
                        note,
                      },
                    ],
                  }
                : e,
            ),
            notifications: [
              {
                id: uid(),
                kind: "decision",
                message: `Regional Operations denied ${ex?.customer ?? "the escalation"} for ${branchName}.`,
                at,
                read: false,
                exceptionId: id,
                actionLabel: "Open decision",
              },
              ...s.notifications,
            ],
          };
        });
      },

      assignTechnician: (id, techId) => {
        const tech = technicians.find((t) => t.id === techId);
        const user = get().currentUser.dispatcher;
        const at = iso();
        set((s) => ({
          exceptions: s.exceptions.map((e) =>
            e.id === id
              ? {
                  ...e,
                  status: e.status === "escalated" ? e.status : "assigned",
                  assignedTech: techId,
                  audit: [
                    ...e.audit,
                    {
                      id: uid(),
                      at,
                      actor: user,
                      actorRole: "dispatcher",
                      action: `Assigned ${tech?.name ?? "technician"}`,
                    },
                  ],
                }
              : e,
          ),
        }));
      },

      resolve: (id, note) => {
        const user = get().currentUser.dispatcher;
        const at = iso();
        set((s) => ({
          exceptions: s.exceptions.map((e) =>
            e.id === id
              ? {
                  ...e,
                  status: "resolved",
                  audit: [
                    ...e.audit,
                    {
                      id: uid(),
                      at,
                      actor: user,
                      actorRole: "dispatcher",
                      action: "Resolved",
                      note,
                    },
                  ],
                }
              : e,
          ),
        }));
      },

      addNote: (id, note) => {
        const s = get();
        const user = s.role === "dispatcher" ? s.currentUser.dispatcher : s.currentUser.manager;
        const at = iso();
        set((cur) => ({
          exceptions: cur.exceptions.map((e) =>
            e.id === id
              ? {
                  ...e,
                  audit: [
                    ...e.audit,
                    {
                      id: uid(),
                      at,
                      actor: user,
                      actorRole: s.role,
                      action: "Added internal note",
                      note,
                    },
                  ],
                }
              : e,
          ),
        }));
      },

      toggleFavorite: (id) => {
        const role = get().role;
        set((s) => ({
          exceptions: s.exceptions.map((e) => {
            if (e.id !== id) return e;
            const fav = new Set(e.favoritedBy ?? []);
            if (fav.has(role)) fav.delete(role);
            else fav.add(role);
            return { ...e, favoritedBy: Array.from(fav) };
          }),
        }));
      },
    }),
    {
      name: "relay-ui",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      partialize: (s) => ({
        role: s.role,
        activeBranchId: s.activeBranchId,
        currentUser: s.currentUser,
        exceptions: s.exceptions,
        decisionHistory: s.decisionHistory,
        notifications: s.notifications,
        collapsedCards: s.collapsedCards,
        favoriteFilter: s.favoriteFilter,
      }),
    },
  ),
);

export { branches, technicians, favoritesList, workspace };
export const branchById = (id: string) => branches.find((b) => b.id === id);
export const techById = (id?: string) => technicians.find((t) => t.id === id);
