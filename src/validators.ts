import { z } from 'zod';
import type {
  ActionMetadata,
  TransactionRequest,
  TransactionResponse,
  LinkedAction,
  TypedActionParameter,
  ValidationResult,
} from './types';

// Ethereum address regex
const addressRegex = /^0x[a-fA-F0-9]{40}$/;

// Hex string regex
const hexRegex = /^0x[a-fA-F0-9]*$/;

// =============================================================================
// LEGACY SCHEMAS (Backwards compatible)
// =============================================================================

export const ActionButtonSchema = z.object({
  label: z.string().min(1).max(50),
  value: z.string().min(1),
  type: z.enum(['button', 'input']),
  placeholder: z.string().optional(),
  disabled: z.boolean().optional(),
});

// =============================================================================
// SOLANA-STYLE PARAMETER SCHEMAS
// =============================================================================

/**
 * Parameter types enum
 */
export const ActionParameterTypeSchema = z.enum([
  'text',
  'number',
  'email',
  'url',
  'date',
  'datetime-local',
  'textarea',
  'select',
  'radio',
  'checkbox',
  'address',
  'token',
  'amount',
]);

/**
 * Option for select/radio/checkbox
 */
export const ActionParameterOptionSchema = z.object({
  label: z.string().min(1),
  value: z.string(),
  selected: z.boolean().optional(),
});

/**
 * Base parameter fields
 */
const ActionParameterBaseSchema = z.object({
  name: z.string().min(1).max(50),
  label: z.string().max(100).optional(),
  required: z.boolean().optional(),
  pattern: z.string().optional(),
  patternDescription: z.string().optional(),
  min: z.union([z.string(), z.number()]).optional(),
  max: z.union([z.string(), z.number()]).optional(),
});

/**
 * Non-selectable parameter (text, number, etc.)
 */
export const ActionParameterSchema = ActionParameterBaseSchema.extend({
  type: z.enum([
    'text', 'number', 'email', 'url', 'date', 'datetime-local',
    'textarea', 'address', 'token', 'amount'
  ]).optional(),
});

/**
 * Selectable parameter (select, radio, checkbox)
 */
export const ActionParameterSelectableSchema = ActionParameterBaseSchema.extend({
  type: z.enum(['select', 'radio', 'checkbox']),
  options: z.array(ActionParameterOptionSchema).min(1),
});

/**
 * Union of all parameter types
 */
export const TypedActionParameterSchema = z.union([
  ActionParameterSelectableSchema,
  ActionParameterSchema,
]);

// =============================================================================
// LINKED ACTION SCHEMAS
// =============================================================================

/**
 * Linked action type enum
 */
export const LinkedActionTypeSchema = z.enum(['transaction', 'post', 'external-link']);

/**
 * Linked action with href template and parameters
 */
export const LinkedActionSchema = z.object({
  type: LinkedActionTypeSchema.optional(),
  href: z.string().min(1),
  label: z.string().min(1).max(50),
  disabled: z.boolean().optional(),
  parameters: z.array(TypedActionParameterSchema).optional(),
});

/**
 * Links section containing linked actions
 */
export const ActionLinksSchema = z.object({
  actions: z.array(LinkedActionSchema).min(1),
});

// =============================================================================
// ACTION CHAINING SCHEMAS
// =============================================================================

export const PostNextActionLinkSchema = z.object({
  type: z.literal('post'),
  href: z.string().min(1),
});

export const InlineNextActionLinkSchema: z.ZodType<{ type: 'inline'; action: ActionMetadata }> = z.object({
  type: z.literal('inline'),
  action: z.lazy(() => ActionMetadataSchema),
});

export const NextActionLinkSchema = z.union([
  PostNextActionLinkSchema,
  InlineNextActionLinkSchema,
]);

// =============================================================================
// MAIN SCHEMAS (Enhanced)
// =============================================================================

/**
 * Icon can be URL or base64 data URI
 */
const iconSchema = z.string().refine(
  (val) => {
    // Allow URLs
    if (val.startsWith('http://') || val.startsWith('https://')) return true;
    // Allow base64 data URIs
    if (val.startsWith('data:image/')) return true;
    // Allow relative paths
    if (val.startsWith('/')) return true;
    return false;
  },
  { message: 'Icon must be a valid URL, base64 data URI, or relative path' }
);

/**
 * Enhanced ActionMetadata schema with links support
 */
export const ActionMetadataSchema = z.object({
  type: z.enum(['action', 'completed']).optional(),
  title: z.string().min(1).max(200),
  icon: iconSchema,
  description: z.string().min(1).max(1000),
  label: z.string().max(50).optional(),
  // Legacy actions (optional)
  actions: z.array(ActionButtonSchema).optional(),
  // Solana-style linked actions (optional)
  links: ActionLinksSchema.optional(),
  disabled: z.boolean().optional(),
  error: z.object({ message: z.string() }).optional(),
}).refine(
  (data) => {
    // Must have either actions or links (or both)
    return (data.actions && data.actions.length > 0) ||
           (data.links?.actions && data.links.actions.length > 0);
  },
  { message: 'Must have at least one action or linked action' }
);

/**
 * Enhanced TransactionRequest with data support
 */
export const TransactionRequestSchema = z.object({
  account: z.string().regex(addressRegex, 'Invalid Ethereum address'),
  action: z.string().min(1),
  input: z.string().optional(),
  // Solana-style parameter data
  data: z.record(z.union([z.string(), z.array(z.string())])).optional(),
});

export const EVMTransactionSchema = z.object({
  to: z.string().regex(addressRegex, 'Invalid to address'),
  value: z.string(),
  data: z.string().regex(hexRegex, 'Invalid hex data'),
  chainId: z.number().positive(),
});

/**
 * Enhanced TransactionResponse with multi-tx and chaining support
 */
export const TransactionResponseSchema = z.object({
  // Single transaction (legacy)
  transaction: EVMTransactionSchema.optional(),
  // Multiple transactions (batch)
  transactions: z.array(EVMTransactionSchema).optional(),
  message: z.string().optional(),
  // Action chaining
  links: z.object({
    next: NextActionLinkSchema.optional(),
  }).optional(),
}).refine(
  (data) => {
    // Must have either transaction or transactions
    return data.transaction !== undefined || (data.transactions && data.transactions.length > 0);
  },
  { message: 'Must have either transaction or transactions' }
);

// Validation functions
export function validateActionMetadata(
  data: unknown
): ValidationResult<ActionMetadata> {
  const result = ActionMetadataSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as ActionMetadata };
  }
  return { success: false, error: result.error.message };
}

export function validateTransactionRequest(
  data: unknown
): ValidationResult<TransactionRequest> {
  const result = TransactionRequestSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.message };
}

export function validateTransactionResponse(
  data: unknown
): ValidationResult<TransactionResponse> {
  const result = TransactionResponseSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as TransactionResponse };
  }
  return { success: false, error: result.error.message };
}

export function isValidAddress(address: string): boolean {
  return addressRegex.test(address);
}

export function isValidHex(hex: string): boolean {
  return hexRegex.test(hex);
}

// =============================================================================
// NEW VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate a linked action
 */
export function validateLinkedAction(
  data: unknown
): ValidationResult<LinkedAction> {
  const result = LinkedActionSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as LinkedAction };
  }
  return { success: false, error: result.error.message };
}

/**
 * Validate a parameter
 */
export function validateParameter(
  data: unknown
): ValidationResult<TypedActionParameter> {
  const result = TypedActionParameterSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as TypedActionParameter };
  }
  return { success: false, error: result.error.message };
}

/**
 * Validate parameter values against their definitions
 */
export function validateParameterValues(
  parameters: TypedActionParameter[],
  values: Record<string, string | string[]>
): ValidationResult<Record<string, string | string[]>> {
  const errors: string[] = [];

  for (const param of parameters) {
    const value = values[param.name];

    // Check required
    if (param.required && (value === undefined || value === '' || (Array.isArray(value) && value.length === 0))) {
      errors.push(`${param.label || param.name} is required`);
      continue;
    }

    // Skip validation if no value and not required
    if (value === undefined || value === '') continue;

    const strValue = Array.isArray(value) ? value[0] : value;

    // Validate pattern
    if (param.pattern && strValue) {
      const regex = new RegExp(param.pattern);
      if (!regex.test(strValue)) {
        errors.push(param.patternDescription || `${param.label || param.name} has invalid format`);
      }
    }

    // Validate min/max for number types
    if ((param.type === 'number' || param.type === 'amount') && strValue) {
      const numValue = parseFloat(strValue);
      if (isNaN(numValue)) {
        errors.push(`${param.label || param.name} must be a number`);
      } else {
        if (param.min !== undefined && numValue < Number(param.min)) {
          errors.push(`${param.label || param.name} must be at least ${param.min}`);
        }
        if (param.max !== undefined && numValue > Number(param.max)) {
          errors.push(`${param.label || param.name} must be at most ${param.max}`);
        }
      }
    }

    // Validate address type
    if (param.type === 'address' && strValue && !isValidAddress(strValue)) {
      errors.push(`${param.label || param.name} must be a valid Ethereum address`);
    }
  }

  if (errors.length > 0) {
    return { success: false, error: errors.join(', ') };
  }

  return { success: true, data: values };
}
