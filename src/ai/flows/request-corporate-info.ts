
'use server';
/**
 * @fileOverview A Genkit flow for a company to request corporate plan information.
 * It registers the request and sends an access code via email.
 */

import { ai } from '@/ai/genkit';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
    RequestCorporateInfoInput, 
    RequestCorporateInfoOutput, 
    RequestCorporateInfoClientSchema 
} from '@/lib/schemas';
import { z } from 'zod';

function generateAccessCode(length: number = 6): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `CORP-${result}`;
}

const sendEmailTool = ai.defineTool(
    {
        name: 'sendEmail',
        description: 'Sends an email to a specified address.',
        inputSchema: z.object({
            to: z.string().email(),
            subject: z.string(),
            body: z.string(),
        }),
        outputSchema: z.object({ success: z.boolean() }),
    },
    async ({ to, subject, body }) => {
        // In a real application, this would integrate with a transactional email service
        // like SendGrid, Mailgun, or Resend.
        // For this prototype, we'll just log it to the console.
        console.log("--- SIMULATING EMAIL ---");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log("Body:");
        console.log(body);
        console.log("--- END SIMULATION ---");
        
        // We will assume the email is always sent successfully for the prototype.
        return { success: true };
    }
);


export async function requestCorporateInfo(input: RequestCorporateInfoInput): Promise<RequestCorporateInfoOutput> {
    return requestCorporateInfoFlow(input);
}

const requestCorporateInfoFlow = ai.defineFlow(
    {
        name: 'requestCorporateInfoFlow',
        inputSchema: RequestCorporateInfoClientSchema,
        outputSchema: z.object({
            success: z.boolean(),
            message: z.string(),
            error: z.string().optional()
        }),
        tools: [sendEmailTool],
    },
    async (input) => {
        try {
            const accessCode = generateAccessCode();

            // 1. Store the request in Firestore
            const corporateRequestsRef = collection(db, 'corporateRequests');
            await addDoc(corporateRequestsRef, {
                ...input,
                accessCode,
                status: 'pending', // Can be used later to track conversion
                requestedAt: serverTimestamp(),
            });

            // 2. Send the confirmation email with the access code
            const subject = "Tu Código de Acceso a los Planes Corporativos de SommelierPro AI";
            const body = `
Hola ${input.contactName},

Gracias por tu interés en los planes corporativos de SommelierPro AI para ${input.companyName}.

Tu código de acceso exclusivo para ver los detalles de los planes es:
  
**${accessCode}**

Puedes usar este código en nuestra página de planes corporativos para desbloquear la información.

Si tienes alguna pregunta, no dudes en responder a este correo.

Saludos cordiales,
El equipo de SommelierPro AI
`;
            const emailResult = await sendEmailTool({ to: input.contactEmail, subject, body });
            
            if (!emailResult.success) {
                // Even if email fails, the request is stored. Admin can follow up.
                console.warn(`Failed to send email to ${input.contactEmail}, but request was stored.`);
            }

            return {
                success: true,
                message: "Solicitud registrada y correo con código de acceso enviado."
            };

        } catch (e: any) {
            console.error("Error in requestCorporateInfoFlow:", e);
            return {
                success: false,
                message: "No se pudo procesar la solicitud.",
                error: e.message || "Ocurrió un error inesperado en el servidor."
            };
        }
    }
);
