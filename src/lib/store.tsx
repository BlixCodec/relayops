"use client";

// Single store for RelayOps. One reducer owns every mutation, and each
// decision action follows the same pattern (see docs/design-spec.md):
// update state → append audit event → toast (toast fires in useRelay actions).

import { createContext, useContext, useMemo, useReducer } from "react";
import { toast } from "sonner";
import { exceptions as seedExceptions } from "@/lib/data";
import { getTechnicianById } from "@/lib/data";
import { computeSeedShift, nowHHMM, shiftSeedTime } from "@/lib/time";
import type {
  ApprovalType,
  Exception,
  Role,
} from "@/lib/types";

interface RelayState {
  role: Role | null;
  exceptions: Exception[];
}

type RelayAction =
  | { type: "select-role"; role: Role }
  | { type: "switch-role" }
  | { type: "assign-tech"; exceptionId: string; techId: string; time: string }
  | {
      type: "escalate";
      exceptionId: string;
      reason: string;
      requestedApproval: ApprovalType;
      time: string;
    }
  | {
      type: "decide";
      exceptionId: string;
      outcome: "approved" | "denied";
      note: string;
      time: string;
    }
  | { type: "resolve"; exceptionId: string; time: string };

const approvalLabels: Record<ApprovalType, string> = {
  overtime: "overtime approval",
  "cross-branch-transfer": "cross-branch transfer",
  "goodwill-credit": "goodwill credit",
};

function updateException(
  state: RelayState,
  id: string,
  update: (e: Exception) => Exception,
): RelayState {
  return {
    ...state,
    exceptions: state.exceptions.map((e) => (e.id === id ? update(e) : e)),
  };
}

function relayReducer(state: RelayState, action: RelayAction): RelayState {
  switch (action.type) {
    case "select-role":
      return { ...state, role: action.role };

    case "switch-role":
      if (!state.role) return state;
      return {
        ...state,
        role: state.role === "dispatcher" ? "manager" : "dispatcher",
      };

    case "assign-tech": {
      const tech = getTechnicianById(action.techId);
      if (!tech) return state;
      return updateException(state, action.exceptionId, (e) => ({
        ...e,
        assignedTech: action.techId,
        status: e.status === "open" ? "assigned" : e.status,
        auditTrail: [
          ...e.auditTrail,
          {
            time: action.time,
            actor: "Dispatcher",
            action: `Assigned ${tech.name}`,
          },
        ],
      }));
    }

    case "escalate":
      return updateException(state, action.exceptionId, (e) => ({
        ...e,
        status: "awaiting-decision",
        escalation: {
          reason: action.reason,
          requestedApproval: action.requestedApproval,
          escalatedBy: "Dispatcher",
          escalatedAt: action.time,
        },
        auditTrail: [
          ...e.auditTrail,
          {
            time: action.time,
            actor: "Dispatcher",
            action: `Escalated to Regional Operations — ${approvalLabels[action.requestedApproval]} requested`,
          },
        ],
      }));

    case "decide":
      return updateException(state, action.exceptionId, (e) => {
        if (!e.escalation) return e;
        return {
          ...e,
          status: action.outcome === "approved" ? "assigned" : "open",
          escalation: {
            ...e.escalation,
            decision: {
              outcome: action.outcome,
              by: "Operations Manager",
              note: action.note,
              at: action.time,
            },
          },
          auditTrail: [
            ...e.auditTrail,
            {
              time: action.time,
              actor: "Operations Manager",
              action:
                action.outcome === "approved"
                  ? `Approved with note: ${action.note}`
                  : `Denied with instructions: ${action.note}`,
            },
          ],
        };
      });

    case "resolve":
      return updateException(state, action.exceptionId, (e) => ({
        ...e,
        status: "resolved",
        auditTrail: [
          ...e.auditTrail,
          {
            time: action.time,
            actor: "Technician",
            action: "Work complete — customer signed off",
          },
        ],
      }));
  }
}

const RelayContext = createContext<{
  state: RelayState;
  dispatch: React.Dispatch<RelayAction>;
} | null>(null);

// Normalize the seeded morning times to the real clock once, at store init,
// so seeded and live audit entries always read in chronological order.
function createInitialState(): RelayState {
  const shift = computeSeedShift();
  return {
    role: null,
    exceptions: seedExceptions.map((e) => ({
      ...e,
      escalation: e.escalation && {
        ...e.escalation,
        escalatedAt: shiftSeedTime(e.escalation.escalatedAt, shift),
        decision: e.escalation.decision && {
          ...e.escalation.decision,
          at: shiftSeedTime(e.escalation.decision.at, shift),
        },
      },
      auditTrail: e.auditTrail.map((entry) => ({
        ...entry,
        time: shiftSeedTime(entry.time, shift),
      })),
    })),
  };
}

export function RelayProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(relayReducer, null, createInitialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <RelayContext.Provider value={value}>{children}</RelayContext.Provider>;
}

export function useRelay() {
  const ctx = useContext(RelayContext);
  if (!ctx) throw new Error("useRelay must be used inside <RelayProvider>");
  const { state, dispatch } = ctx;

  return {
    role: state.role,
    exceptions: state.exceptions,

    selectRole(role: Role) {
      dispatch({ type: "select-role", role });
    },

    switchRole() {
      dispatch({ type: "switch-role" });
    },

    assignTech(exceptionId: string, techId: string) {
      dispatch({ type: "assign-tech", exceptionId, techId, time: nowHHMM() });
      const tech = getTechnicianById(techId);
      toast.success(
        tech
          ? `${tech.name} is on it — added to the exception's timeline.`
          : "Technician assigned — added to the exception's timeline.",
      );
    },

    escalate(
      exceptionId: string,
      reason: string,
      requestedApproval: ApprovalType,
    ) {
      dispatch({
        type: "escalate",
        exceptionId,
        reason,
        requestedApproval,
        time: nowHHMM(),
      });
      toast.success(
        "Escalation sent to Regional Operations — a manager will review shortly.",
      );
    },

    decide(exceptionId: string, outcome: "approved" | "denied", note: string) {
      dispatch({ type: "decide", exceptionId, outcome, note, time: nowHHMM() });
      if (outcome === "approved") {
        toast.success(
          "Approved — the branch will see your note on the exception.",
        );
      } else {
        // Neutral icon: a denial isn't a success moment (#16).
        toast.info("Denied with instructions — the branch will see your note.");
      }
    },

    resolve(exceptionId: string) {
      dispatch({ type: "resolve", exceptionId, time: nowHHMM() });
      toast.success("Resolved — moved to Resolved today; timeline complete.");
    },
  };
}
