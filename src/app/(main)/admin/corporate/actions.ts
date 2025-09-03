"use server";

import {
  requestCorporateInfo as _requestCorporateInfo,
  getCorporateInfo as _getCorporateInfo,
} from "@/lib/actions/corporate";

// Wrappers async requeridos por Next en "use server"
export async function requestCorporateInfo(input: any) {
  return _requestCorporateInfo(input);
}

export async function getCorporateInfo(input: any) {
  return _getCorporateInfo(input);
}
