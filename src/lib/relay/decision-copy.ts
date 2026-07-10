import { recommendationTree } from "./recommendation-tree";
import type { Exception } from "./types";

export function managerApprovalCopy(exception: Exception) {
  const recommendedTech = recommendationTree(exception).tech;

  return recommendedTech
    ? {
        note: `${recommendedTech.name} can proceed; notify dispatch and the customer.`,
        toast: `Dispatch has approval; ${recommendedTech.name} can proceed.`,
      }
    : {
        note: "Proceed with the recommended action and notify dispatch.",
        toast: "Dispatch has approval and instructions.",
      };
}
