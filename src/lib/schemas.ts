
import { z } from "zod";
import type { Language } from "./translations";

export const WineAnalysisClientSchema = z.object({
  uid: z.string(),
  wineName: z.string().min(2, { message: "El nombre del vino debe tener al menos 2 caracteres." }),
  year: z.coerce.number().min(1800, { message: "El año debe ser válido." }).max(new Date().getFullYear() + 1, { message: "El año no puede ser en el futuro." }),
  grapeVariety: z.string().min(2, { message: "La cepa debe tener al menos 2 caracteres." }),
  wineryName: z.string().optional(),
  country: z.string().optional(),
  foodToPair: z.string().optional(),
  language: z.enum(['es', 'en']).optional(),
});


// --- Recomendación de vino por plato
export const RecommendWineSchema = z.object({
  dishDescription: z.string().min(10, { message: "La descripción del plato debe tener al menos 10 caracteres." }),
  country: z.string().min(2, { message: "Por favor, introduce un país válido." }),
  language: z.custom<Language>(),
});

export const RecommendWineByCountryInputSchema = RecommendWineSchema;

export const WineRecommendationSchema = z.object({
  wineName: z.string().describe("The full name of the recommended wine."),
  justificacionExperta: z.string().describe("The expert justification for the pairing, combining sensory analysis and pairing reasoning into a single, elegant paragraph."),
  rating: z.number().min(1).max(5).describe("A rating of the wine from 1 to 5."),
});

export const RecommendWineByCountryOutputSchema = z.array(WineRecommendationSchema);
export type RecommendWineByCountryOutput = z.infer<typeof RecommendWineByCountryOutputSchema>;



// --- Maridaje de cena completa

export const SommelierSuggestionSchema = z.object({
    wineName: z.string().describe("Nombre del vino sugerido"),
    analysis: z.object({
        visual: z.string().describe("Análisis visual del vino sugerido"),
        olfactory: z.string().describe("Análisis olfativo del vino sugerido"),
        gustatory: z.string().describe("Análisis gustativo del vino sugerido"),
    }).describe("Análisis sensorial completo del vino sugerido"),
    justification: z.string().describe("Explicación detallada de por qué esta sugerencia es superior"),
    rating: z.number().min(5).max(5).describe("La calificación para una sugerencia siempre debe ser 5")
});

export const EvaluationSchema = z.object({
  pairingDescription: z.string().describe("A summary of the user's pairing, e.g., 'Lomo Saltado con Malbec'"),
  rating: z.number().min(1).max(5).describe('A technical rating from 1 to 5 for the user\'s pairing.'),
  evaluation: z.string().describe('A detailed technical explanation of why the pairing received its rating.'),
  suggestionAvailable: z.boolean().describe("True if the rating is less than 4, indicating suggestions are available."),
  sommelierSuggestions: z.array(SommelierSuggestionSchema).optional().describe("An array of up to 3 superior, 5-star alternative wine suggestions. This should only be populated if the rating is less than 4."),
});


export const DinnerPairingSchema = z.object({
  country: z.string().min(2, { message: "Por favor, introduce el país para obtener mejores sugerencias." }),
  pairings: z.array(z.object({
    dish: z.string().min(1, "El plato no puede estar vacío."),
    wine: z.string().min(1, "El vino/licor no puede estar vacío."),
    description: z.string().min(1, "La cepa/descripción no puede estar vacía."),
  })).min(1, "Debes añadir al menos un maridaje.").max(6, "Puedes analizar un máximo de 6 maridajes."),
});

export const EvaluateDinnerPairingsInputSchema = DinnerPairingSchema.extend({
    language: z.custom<Language>(),
});

export const EvaluateDinnerPairingsOutputSchema = z.array(EvaluationSchema);
export type EvaluateDinnerPairingsOutput = z.infer<typeof EvaluateDinnerPairingsOutputSchema>;


// --- Hoja de cata (Análisis por descripción)
export const CataSheetSchema = z.object({
  descripcionVino: z.string().min(20, { message: "La descripción debe tener al menos 20 caracteres para un análisis significativo." }),
});

// --- Maridaje simple por plato
export const FoodPairingSchema = z.object({
  dishDescription: z.string().min(10, {
    message: "La descripción del plato debe tener al menos 10 caracteres.",
  }),
});

// --- Maridaje por tiempos de comida
export const CoursePairingSchema = z.object({
  entrada: z.string().min(5, { message: "Por favor, describe la entrada." }),
  primerPlato: z.string().min(5, { message: "Por favor, describe el primer plato." }),
  segundoPlato: z.string().min(5, { message: "Por favor, describe el segundo plato." }),
  tercerPlato: z.string().min(5, { message: "Por favor, describe el tercer plato." }),
  cuartoPlato: z.string().min(5, { message: "Por favor, describe el cuarto plato." }),
  postre: z.string().min(5, { message: "Por favor, describe el postre." }),
});

// --- MI BODEGA ---

// Schema para el formulario de cliente
export const WineInCellarClientSchema = z.object({
    name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
    variety: z.string().min(2, { message: "La variedad debe tener al menos 2 caracteres." }),
    year: z.coerce.number().min(1800, { message: "El año debe ser válido." }).max(new Date().getFullYear() + 1, { message: "El año no puede ser en el futuro." }),
    quantity: z.coerce.number().min(1, { message: "La cantidad debe ser al menos 1." }),
    status: z.enum(["Listo para Beber", "Necesita Guarda", "En su punto"]).default("Listo para Beber"),
});
export type WineInCellarFormValues = z.infer<typeof WineInCellarClientSchema>;

// Schema que representa un vino en la BD (incluye ID)
export const WineInCellarSchema = WineInCellarClientSchema.extend({
    id: z.string(),
    dateAdded: z.string(),
});
export type WineInCellar = z.infer<typeof WineInCellarSchema>;


// --- AÑADIR VINO ---
export const AddWineToCellarServerSchema = WineInCellarClientSchema.extend({
  uid: z.string(),
});
export type AddWineToCellarInput = z.infer<typeof AddWineToCellarServerSchema>;

export const AddWineToCellarOutputSchema = z.object({
  success: z.boolean(),
  wineId: z.string().optional(),
  wine: WineInCellarSchema.optional(),
  error: z.string().optional(),
});
export type AddWineToCellarOutput = z.infer<typeof AddWineToCellarOutputSchema>;


// --- LISTAR VINOS ---
export const ListWinesFromCellarInputSchema = z.object({
  uid: z.string(),
});
export type ListWinesFromCellarInput = z.infer<typeof ListWinesFromCellarInputSchema>;

export const ListWinesFromCellarOutputSchema = z.object({
  wines: z.array(WineInCellarSchema).optional(),
  error: z.string().optional(),
  success: z.boolean().optional(),
});
export type ListWinesFromCellarOutput = z.infer<typeof ListWinesFromCellarOutputSchema>;


// --- ACTUALIZAR VINO ---
export const UpdateWineInCellarServerSchema = WineInCellarClientSchema.extend({
  uid: z.string(),
  wineId: z.string(),
});
export type UpdateWineInCellarInput = z.infer<typeof UpdateWineInCellarServerSchema>;

export const UpdateWineInCellarOutputSchema = z.object({
  success: z.boolean(),
  updatedWine: WineInCellarSchema.optional(),
  error: z.string().optional(),
});
export type UpdateWineInCellarOutput = z.infer<typeof UpdateWineInCellarOutputSchema>;


// --- ELIMINAR VINO ---
export const DeleteWineFromCellarInputSchema = z.object({
  uid: z.string(),
  wineId: z.string(),
});
export type DeleteWineFromCellarInput = z.infer<typeof DeleteWineFromCellarInputSchema>;

export const DeleteWineFromCellarOutputSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});
export type DeleteWineFromCellarOutput = z.infer<typeof DeleteWineFromCellarOutputSchema>;



// --- AFILIADOS ---

// Listar Vendedores (Admin)
export const ListVendedoresInputSchema = z.object({
  adminUid: z.string().describe('The UID of the user requesting the list, must be an admin.'),
});
export type ListVendedoresInput = z.infer<typeof ListVendedoresInputSchema>;

export const VendedorSchema = z.object({
  uid: z.string(),
  displayName: z.string(),
  email: z.string(),
  role: z.string(),
  activeReferrals: z.number(),
  totalCommission: z.number(),
});
export type Vendedor = z.infer<typeof VendedorSchema>;

export const ListVendedoresOutputSchema = z.object({
  vendedores: z.array(VendedorSchema).optional(),
  error: z.string().optional(),
});
export type ListVendedoresOutput = z.infer<typeof ListVendedoresOutputSchema>;

// Solicitar Rol de Vendedor (User)
export const RequestVendorRoleInputSchema = z.object({
  uid: z.string(),
});
export type RequestVendorRoleInput = z.infer<typeof RequestVendorRoleInputSchema>;

export const RequestVendorRoleOutputSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
});
export type RequestVendorRoleOutput = z.infer<typeof RequestVendorRoleOutputSchema>;


// Listar Solicitudes de Vendedor (Admin)
export const ListVendorRequestsInputSchema = z.object({
  adminUid: z.string(),
});
export type ListVendorRequestsInput = z.infer<typeof ListVendorRequestsInputSchema>;

export const VendorRequestSchema = z.object({
  uid: z.string(),
  displayName: z.string(),
  email: z.string(),
  requestedAt: z.string(),
});
export type VendorRequest = z.infer<typeof VendorRequestSchema>;

export const ListVendorRequestsOutputSchema = z.object({
  requests: z.array(VendorRequestSchema).optional(),
  error: z.string().optional(),
});
export type ListVendorRequestsOutput = z.infer<typeof ListVendorRequestsOutputSchema>;


// Aprobar Solicitud de Vendedor (Admin)
export const ApproveVendorRequestInputSchema = z.object({
  adminUid: z.string(),
  uidToApprove: z.string(),
});
export type ApproveVendorRequestInput = z.infer<typeof ApproveVendorRequestInputSchema>;

export const ApproveVendorRequestOutputSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
});
export type ApproveVendorRequestOutput = z.infer<typeof ApproveVendorRequestOutputSchema>;


// --- PLANES CORPORATIVOS ---

// Solicitar información (Cliente)
export const RequestCorporateInfoClientSchema = z.object({
  companyName: z.string().min(2, { message: "El nombre de la empresa es requerido." }),
  contactName: z.string().min(2, { message: "El nombre del contacto es requerido." }),
  contactEmail: z.string().email({ message: "Por favor, introduce un correo válido." }),
});
export type RequestCorporateInfoInput = z.infer<typeof RequestCorporateInfoClientSchema>;

export const RequestCorporateInfoOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
});
export type RequestCorporateInfoOutput = z.infer<typeof RequestCorporateInfoOutputSchema>;


// Obtener información (Cliente con código)
export const GetCorporateInfoInputSchema = z.object({
  accessCode: z.string().min(6, { message: "El código de acceso no es válido." }),
});
export type GetCorporateInfoInput = z.infer<typeof GetCorporateInfoInputSchema>;

// (El schema de salida de getCorporateInfo se definirá en el propio flujo ya que es estático)
export const CorporatePlanDataSchema = z.any();
export const GetCorporateInfoOutputSchema = z.object({
  success: z.boolean(),
  data: CorporatePlanDataSchema.optional(),
  error: z.string().optional(),
});
export type GetCorporateInfoOutput = z.infer<typeof GetCorporateInfoOutputSchema>;


// Listar Solicitudes Corporativas (Admin)
export const ListCorporateRequestsInputSchema = z.object({
  adminUid: z.string(),
});
export type ListCorporateRequestsInput = z.infer<typeof ListCorporateRequestsInputSchema>;

export const CorporateRequestSchema = z.object({
  id: z.string(),
  companyName: z.string(),
  contactName: z.string(),
  contactEmail: z.string(),
  accessCode: z.string(),
  requestedAt: z.string(),
});
export type CorporateRequest = z.infer<typeof CorporateRequestSchema>;

export const ListCorporateRequestsOutputSchema = z.object({
  requests: z.array(CorporateRequestSchema).optional(),
  error: z.string().optional(),
});
export type ListCorporateRequestsOutput = z.infer<typeof ListCorporateRequestsOutputSchema>;


// Registrar Venta Corporativa (Vendedor/Afiliado)
export const RegisterCorporateSaleSchema = z.object({
  vendedorUid: z.string(),
  accessCode: z.string().min(6, { message: "El código de acceso no es válido." }),
  plan: z.enum(['Copa Premium', 'Sibarita']),
  subscriptions: z.coerce.number().min(1, "Debe haber al menos una suscripción."),
  billingCycle: z.enum(['monthly', 'yearly']),
});
export type RegisterCorporateSaleInput = z.infer<typeof RegisterCorporateSaleSchema>;

export const RegisterCorporateSaleOutputSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
    error: z.string().optional(),
});
export type RegisterCorporateSaleOutput = z.infer<typeof RegisterCorporateSaleOutputSchema>;
