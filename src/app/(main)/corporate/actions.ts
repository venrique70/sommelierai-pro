
'use server';

import { requestCorporateInfo as requestCorporateInfoFlow, getCorporateInfo as getCorporateInfoFlow } from '@/ai/flows';
import { 
    RequestCorporateInfoInput, 
    RequestCorporateInfoOutput, 
    GetCorporateInfoInput,
    GetCorporateInfoOutput 
} from '@/lib/schemas';

export async function requestCorporateInfo(input: RequestCorporateInfoInput): Promise<RequestCorporateInfoOutput> {
    return await requestCorporateInfoFlow(input);
}

export async function getCorporateInfo(input: GetCorporateInfoInput): Promise<GetCorporateInfoOutput> {
    return await getCorporateInfoFlow(input);
}
