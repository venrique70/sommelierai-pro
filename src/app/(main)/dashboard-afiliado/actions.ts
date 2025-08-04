
'use server';

import { registerCorporateSale as registerCorporateSaleFlow } from '@/ai/flows';
import type { RegisterCorporateSaleInput } from '@/lib/schemas';

// Define a simple output type for the action
export interface RegisterSaleOutput {
    success: boolean;
    message: string;
}

export async function registerCorporateSale(input: RegisterCorporateSaleInput): Promise<RegisterSaleOutput> {
    try {
        const result = await registerCorporateSaleFlow(input);
        if (result.success) {
            return { success: true, message: result.message || 'Venta registrada con éxito.' };
        } else {
            return { success: false, message: result.error || 'No se pudo registrar la venta.' };
        }
    } catch (error: any) {
        return { success: false, message: error.message || 'Ocurrió un error inesperado.' };
    }
}
