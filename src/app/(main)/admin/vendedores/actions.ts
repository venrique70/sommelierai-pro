
'use server';

import { listVendedores as listVendedoresFlow } from '@/ai/flows/list-vendedores';
import { listVendorRequests as listVendorRequestsFlow } from '@/ai/flows/list-vendor-requests';
import { approveVendorRequest as approveVendorRequestFlow } from '@/ai/flows/approve-vendor-request';
import { listCorporateRequests as listCorporateRequestsFlow } from '@/ai/flows/list-corporate-requests';

import type { 
    ListVendedoresInput, 
    ListVendedoresOutput,
    ListVendorRequestsInput,
    ListVendorRequestsOutput,
    ApproveVendorRequestInput,
    ApproveVendorRequestOutput,
    ListCorporateRequestsInput,
    ListCorporateRequestsOutput,
} from '@/lib/schemas';


export async function listVendedores(input: ListVendedoresInput): Promise<ListVendedoresOutput> {
  return await listVendedoresFlow(input);
}

export async function listVendorRequests(input: ListVendorRequestsInput): Promise<ListVendorRequestsOutput> {
  return await listVendorRequestsFlow(input);
}

export async function approveVendorRequest(input: ApproveVendorRequestInput): Promise<ApproveVendorRequestOutput> {
  return await approveVendorRequestFlow(input);
}

export async function listCorporateRequests(input: ListCorporateRequestsInput): Promise<ListCorporateRequestsOutput> {
    return await listCorporateRequestsFlow(input);
}
