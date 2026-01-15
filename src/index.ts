// =============================================================================
// TYPES
// =============================================================================

// Core types
export type {
  ActionType,
  ActionButton,
  ActionMetadata,
  ActionError,
  TransactionRequest,
  TransactionResponse,
  EVMTransaction,
  ActionHandler,
  ActionDefinition,
  ActionContext,
  ChainConfig,
  ValidationResult,
} from './types';

// Solana-style linked action types
export type {
  ActionParameterType,
  SelectableParameterType,
  ActionParameterOption,
  ActionParameterBase,
  ActionParameter,
  ActionParameterSelectable,
  TypedActionParameter,
  LinkedActionType,
  LinkedAction,
  ActionLinks,
  PostNextActionLink,
  InlineNextActionLink,
  NextActionLink,
} from './types';

// =============================================================================
// BUILDERS
// =============================================================================

// Core builders
export { createAction, button, input } from './builders';
export type { Action, ExtendedActionDefinition } from './builders';

// Solana-style linked action builders
export {
  linkedAction,
  actionButton,
  createLinks,
  buildHref,
  extractParams,
  hasParameters,
  isSelectableParam,
} from './builders';

// Parameter builders
export {
  textParam,
  numberParam,
  amountParam,
  addressParam,
  selectParam,
  radioParam,
  checkboxParam,
  dateParam,
  textareaParam,
  option,
} from './builders';

// =============================================================================
// VALIDATORS
// =============================================================================

export {
  validateActionMetadata,
  validateTransactionRequest,
  validateTransactionResponse,
  validateLinkedAction,
  validateParameter,
  validateParameterValues,
  isValidAddress,
  isValidHex,
} from './validators';

// Zod schemas
export {
  ActionMetadataSchema,
  TransactionRequestSchema,
  TransactionResponseSchema,
  ActionButtonSchema,
  LinkedActionSchema,
  ActionLinksSchema,
  ActionParameterSchema,
  ActionParameterSelectableSchema,
  TypedActionParameterSchema,
  ActionParameterOptionSchema,
  NextActionLinkSchema,
} from './validators';

// Utilities
export {
  createMlinkUrl,
  parseMlinkUrl,
  isMlinkUrl,
  parseEther,
  formatEther,
  shortenAddress,
  getExplorerUrl,
  getChainById,
  getAddressExplorerUrl,
} from './utils';

// Constants
export {
  MANTLE_MAINNET,
  MANTLE_SEPOLIA,
  SUPPORTED_CHAINS,
  DEFAULT_CHAIN,
  MLINK_BASE_URL,
  ACTION_QUERY_PARAM,
  REGISTRY_URL,
  REGISTRY_VALIDATE_ENDPOINT,
} from './constants';
