// Action button type
export type ActionType = 'button' | 'input';

// Single action button/input
export interface ActionButton {
  label: string;
  value: string;
  type: ActionType;
  placeholder?: string;
  disabled?: boolean;
}

// Error structure
export interface ActionError {
  message: string;
}

// GET response - action metadata
export interface ActionMetadata {
  title: string;
  icon: string;
  description: string;
  actions: ActionButton[];
  disabled?: boolean;
  error?: ActionError;
}

// POST body - transaction request
export interface TransactionRequest {
  account: string;
  action: string;
  input?: string;
}

// Transaction object
export interface EVMTransaction {
  to: string;
  value: string;
  data: string;
  chainId: number;
}

// POST response
export interface TransactionResponse {
  transaction: EVMTransaction;
  message?: string;
}

// Context passed to handler
export interface ActionContext {
  account: string;
  action: string;
  input?: string;
}

// Handler function type
export type ActionHandler = (context: ActionContext) => Promise<TransactionResponse>;

// Full action definition
export interface ActionDefinition {
  title: string;
  icon: string;
  description: string;
  actions: ActionButton[];
  disabled?: boolean;
  handler: ActionHandler;
}

// Chain configuration
export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// Validation result type
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
