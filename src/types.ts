// Action button type
export type ActionType = 'button' | 'input';

// Single action button/input (legacy support)
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

// =============================================================================
// SOLANA-STYLE LINKED ACTIONS & PARAMETERS
// =============================================================================

/**
 * Parameter types supported by linked actions
 * Similar to HTML input types + blockchain-specific types
 */
export type ActionParameterType =
  | 'text'
  | 'number'
  | 'email'
  | 'url'
  | 'date'
  | 'datetime-local'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  // EVM-specific types
  | 'address'
  | 'token'
  | 'amount';

/**
 * Selectable parameter types that require options array
 */
export type SelectableParameterType = 'select' | 'radio' | 'checkbox';

/**
 * Option for select/radio/checkbox parameters
 */
export interface ActionParameterOption {
  label: string;
  value: string;
  selected?: boolean;
}

/**
 * Base action parameter (non-selectable types)
 */
export interface ActionParameterBase {
  /** Parameter name - used as placeholder key in href template */
  name: string;
  /** Display label for the input */
  label?: string;
  /** Whether this parameter is required */
  required?: boolean;
  /** Regex pattern for validation */
  pattern?: string;
  /** Description of what the pattern expects */
  patternDescription?: string;
  /** Minimum value (for number/date types) */
  min?: string | number;
  /** Maximum value (for number/date types) */
  max?: string | number;
}

/**
 * Non-selectable parameter (text, number, etc.)
 */
export interface ActionParameter extends ActionParameterBase {
  type?: Exclude<ActionParameterType, SelectableParameterType>;
}

/**
 * Selectable parameter (select, radio, checkbox)
 */
export interface ActionParameterSelectable extends ActionParameterBase {
  type: SelectableParameterType;
  /** Options for selection */
  options: ActionParameterOption[];
}

/**
 * Union type for all parameter types
 */
export type TypedActionParameter = ActionParameter | ActionParameterSelectable;

/**
 * Linked action type
 */
export type LinkedActionType = 'transaction' | 'post' | 'external-link';

/**
 * Linked action with href template and parameters
 * Similar to Solana's LinkedAction
 */
export interface LinkedAction {
  /** Type of action (defaults to 'transaction') */
  type?: LinkedActionType;
  /** URL template with {parameter} placeholders */
  href: string;
  /** Button label */
  label: string;
  /** Whether this action is disabled */
  disabled?: boolean;
  /** Parameters to collect from user */
  parameters?: TypedActionParameter[];
}

/**
 * Links section containing linked actions
 */
export interface ActionLinks {
  /** Array of linked actions */
  actions: LinkedAction[];
}

// =============================================================================
// ACTION CHAINING (for multi-step transactions)
// =============================================================================

/**
 * POST callback for next action after transaction confirms
 */
export interface PostNextActionLink {
  type: 'post';
  /** Callback URL to get next action */
  href: string;
}

/**
 * Inline next action (embedded in response)
 */
export interface InlineNextActionLink {
  type: 'inline';
  /** Next action metadata */
  action: ActionMetadata;
}

/**
 * Next action link (for chaining)
 */
export type NextActionLink = PostNextActionLink | InlineNextActionLink;

// =============================================================================
// GET/POST TYPES
// =============================================================================

/**
 * GET response - action metadata
 * Enhanced with optional links.actions for Solana-style linked actions
 */
export interface ActionMetadata {
  /** Action type (defaults to 'action') */
  type?: 'action' | 'completed';
  /** Action title */
  title: string;
  /** Icon URL or base64 image */
  icon: string;
  /** Action description */
  description: string;
  /** Primary button label (used when no linked actions) */
  label?: string;
  /** Legacy actions array (for backwards compatibility) */
  actions?: ActionButton[];
  /** Linked actions with parameters (Solana-style) */
  links?: ActionLinks;
  /** Whether the entire action is disabled */
  disabled?: boolean;
  /** Error to display */
  error?: ActionError;
}

/**
 * POST body - transaction request
 * Enhanced to support parameter data
 */
export interface TransactionRequest {
  /** User's wallet address */
  account: string;
  /** Selected action value or href */
  action: string;
  /** Legacy single input value */
  input?: string;
  /** Parameter values collected from form (Solana-style) */
  data?: Record<string, string | string[]>;
}

// Transaction object
export interface EVMTransaction {
  to: string;
  value: string;
  data: string;
  chainId: number;
}

/**
 * POST response - Enhanced to support multiple transactions and chaining
 */
export interface TransactionResponse {
  /** Single transaction (for simple cases) */
  transaction?: EVMTransaction;
  /** Multiple transactions (for batch/multi-contract) */
  transactions?: EVMTransaction[];
  /** Message to display to user */
  message?: string;
  /** Next action for chaining */
  links?: {
    next?: NextActionLink;
  };
}

/**
 * Context passed to handler
 * Enhanced to support parameter data
 */
export interface ActionContext {
  /** User's wallet address */
  account: string;
  /** Selected action value or href */
  action: string;
  /** Legacy single input value */
  input?: string;
  /** Parameter values from form (Solana-style) */
  data?: Record<string, string | string[]>;
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
