import { z } from 'zod';
import type {
  ActionMetadata,
  TransactionRequest,
  TransactionResponse,
  ValidationResult,
} from './types';

// Ethereum address regex
const addressRegex = /^0x[a-fA-F0-9]{40}$/;

// Hex string regex
const hexRegex = /^0x[a-fA-F0-9]*$/;

// Zod Schemas
export const ActionButtonSchema = z.object({
  label: z.string().min(1).max(50),
  value: z.string().min(1),
  type: z.enum(['button', 'input']),
  placeholder: z.string().optional(),
  disabled: z.boolean().optional(),
});

export const ActionMetadataSchema = z.object({
  title: z.string().min(1).max(100),
  icon: z.string().url(),
  description: z.string().min(1).max(500),
  actions: z.array(ActionButtonSchema).min(1),
  disabled: z.boolean().optional(),
  error: z.object({ message: z.string() }).optional(),
});

export const TransactionRequestSchema = z.object({
  account: z.string().regex(addressRegex, 'Invalid Ethereum address'),
  action: z.string().min(1),
  input: z.string().optional(),
});

export const EVMTransactionSchema = z.object({
  to: z.string().regex(addressRegex, 'Invalid to address'),
  value: z.string(),
  data: z.string().regex(hexRegex, 'Invalid hex data'),
  chainId: z.number().positive(),
});

export const TransactionResponseSchema = z.object({
  transaction: EVMTransactionSchema,
  message: z.string().optional(),
});

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
