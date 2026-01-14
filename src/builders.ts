import type {
  ActionButton,
  ActionDefinition,
  ActionMetadata,
  TransactionRequest,
  TransactionResponse,
  LinkedAction,
  TypedActionParameter,
  ActionParameter,
  ActionParameterSelectable,
  ActionParameterOption,
  ActionParameterType,
  SelectableParameterType,
  ActionLinks,
} from './types';
import { validateTransactionRequest } from './validators';

// Create a button action
export function button(config: {
  label: string;
  value: string;
  disabled?: boolean;
}): ActionButton {
  return {
    label: config.label,
    value: config.value,
    type: 'button',
    disabled: config.disabled,
  };
}

// Create an input action
export function input(config: {
  label: string;
  placeholder?: string;
  disabled?: boolean;
}): ActionButton {
  return {
    label: config.label,
    value: '__input__',
    type: 'input',
    placeholder: config.placeholder,
    disabled: config.disabled,
  };
}

// =============================================================================
// SOLANA-STYLE LINKED ACTIONS & PARAMETERS BUILDERS
// =============================================================================

/**
 * Create a linked action with optional parameters
 * Uses Solana-style href templates with {parameter} placeholders
 *
 * @example
 * ```ts
 * linkedAction({
 *   href: '/api/swap?amount={amount}&token={token}',
 *   label: 'Swap Tokens',
 *   parameters: [
 *     textParam({ name: 'amount', label: 'Amount', required: true }),
 *     selectParam({
 *       name: 'token',
 *       label: 'Token',
 *       options: [
 *         { label: 'USDC', value: '0x...' },
 *         { label: 'USDT', value: '0x...' }
 *       ]
 *     })
 *   ]
 * })
 * ```
 */
export function linkedAction(config: {
  href: string;
  label: string;
  disabled?: boolean;
  parameters?: TypedActionParameter[];
}): LinkedAction {
  return {
    type: 'transaction',
    href: config.href,
    label: config.label,
    disabled: config.disabled,
    parameters: config.parameters,
  };
}

/**
 * Create a simple linked action button (no parameters, just a static href)
 *
 * @example
 * ```ts
 * actionButton({
 *   href: '/api/tip?amount=1',
 *   label: 'Tip 1 MNT'
 * })
 * ```
 */
export function actionButton(config: {
  href: string;
  label: string;
  disabled?: boolean;
}): LinkedAction {
  return {
    type: 'transaction',
    href: config.href,
    label: config.label,
    disabled: config.disabled,
  };
}

/**
 * Create a text parameter
 */
export function textParam(config: {
  name: string;
  label?: string;
  required?: boolean;
  pattern?: string;
  patternDescription?: string;
}): ActionParameter {
  return {
    type: 'text',
    name: config.name,
    label: config.label,
    required: config.required,
    pattern: config.pattern,
    patternDescription: config.patternDescription,
  };
}

/**
 * Create a number parameter
 */
export function numberParam(config: {
  name: string;
  label?: string;
  required?: boolean;
  min?: number | string;
  max?: number | string;
}): ActionParameter {
  return {
    type: 'number',
    name: config.name,
    label: config.label,
    required: config.required,
    min: config.min,
    max: config.max,
  };
}

/**
 * Create an amount parameter (for token/ETH amounts)
 */
export function amountParam(config: {
  name: string;
  label?: string;
  required?: boolean;
  min?: number | string;
  max?: number | string;
}): ActionParameter {
  return {
    type: 'amount',
    name: config.name,
    label: config.label || 'Amount',
    required: config.required,
    min: config.min,
    max: config.max,
  };
}

/**
 * Create an address parameter (for wallet addresses)
 */
export function addressParam(config: {
  name: string;
  label?: string;
  required?: boolean;
}): ActionParameter {
  return {
    type: 'address',
    name: config.name,
    label: config.label || 'Address',
    required: config.required,
    pattern: '^0x[a-fA-F0-9]{40}$',
    patternDescription: 'Valid Ethereum address (0x...)',
  };
}

/**
 * Create a select dropdown parameter
 */
export function selectParam(config: {
  name: string;
  label?: string;
  required?: boolean;
  options: ActionParameterOption[];
}): ActionParameterSelectable {
  return {
    type: 'select',
    name: config.name,
    label: config.label,
    required: config.required,
    options: config.options,
  };
}

/**
 * Create a radio button group parameter
 */
export function radioParam(config: {
  name: string;
  label?: string;
  required?: boolean;
  options: ActionParameterOption[];
}): ActionParameterSelectable {
  return {
    type: 'radio',
    name: config.name,
    label: config.label,
    required: config.required,
    options: config.options,
  };
}

/**
 * Create a checkbox parameter (multiple selection)
 */
export function checkboxParam(config: {
  name: string;
  label?: string;
  required?: boolean;
  options: ActionParameterOption[];
}): ActionParameterSelectable {
  return {
    type: 'checkbox',
    name: config.name,
    label: config.label,
    required: config.required,
    options: config.options,
  };
}

/**
 * Create a date parameter
 */
export function dateParam(config: {
  name: string;
  label?: string;
  required?: boolean;
  min?: string;
  max?: string;
}): ActionParameter {
  return {
    type: 'date',
    name: config.name,
    label: config.label,
    required: config.required,
    min: config.min,
    max: config.max,
  };
}

/**
 * Create a textarea parameter (multi-line text)
 */
export function textareaParam(config: {
  name: string;
  label?: string;
  required?: boolean;
}): ActionParameter {
  return {
    type: 'textarea',
    name: config.name,
    label: config.label,
    required: config.required,
  };
}

/**
 * Create an option for select/radio/checkbox parameters
 */
export function option(
  label: string,
  value: string,
  selected?: boolean
): ActionParameterOption {
  return { label, value, selected };
}

/**
 * Create a links object with actions array
 *
 * @example
 * ```ts
 * createLinks([
 *   actionButton({ href: '/api/tip?amount=1', label: 'Tip 1 MNT' }),
 *   actionButton({ href: '/api/tip?amount=5', label: 'Tip 5 MNT' }),
 *   linkedAction({
 *     href: '/api/tip?amount={amount}',
 *     label: 'Custom Amount',
 *     parameters: [amountParam({ name: 'amount', required: true })]
 *   })
 * ])
 * ```
 */
export function createLinks(actions: LinkedAction[]): ActionLinks {
  return { actions };
}

/**
 * Replace placeholders in href template with parameter values
 *
 * @example
 * ```ts
 * buildHref('/api/swap?amount={amount}&token={token}', { amount: '100', token: '0x...' })
 * // Returns: '/api/swap?amount=100&token=0x...'
 * ```
 */
export function buildHref(
  template: string,
  params: Record<string, string | string[]>
): string {
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    const placeholder = `{${key}}`;
    const replacement = Array.isArray(value) ? value.join(',') : value;
    result = result.replace(new RegExp(placeholder, 'g'), encodeURIComponent(replacement));
  }
  return result;
}

/**
 * Extract parameter names from href template
 *
 * @example
 * ```ts
 * extractParams('/api/swap?amount={amount}&token={token}')
 * // Returns: ['amount', 'token']
 * ```
 */
export function extractParams(template: string): string[] {
  const matches = template.match(/\{([^}]+)\}/g);
  if (!matches) return [];
  return matches.map((m) => m.slice(1, -1));
}

/**
 * Check if a linked action has parameters that need to be collected
 */
export function hasParameters(action: LinkedAction): boolean {
  return Boolean(action.parameters && action.parameters.length > 0);
}

/**
 * Check if a parameter is selectable (select/radio/checkbox)
 */
export function isSelectableParam(
  param: TypedActionParameter
): param is ActionParameterSelectable {
  return param.type === 'select' || param.type === 'radio' || param.type === 'checkbox';
}

// Action object returned by createAction
export interface Action {
  getMetadata(): ActionMetadata;
  handleRequest(request: TransactionRequest): Promise<TransactionResponse>;
}

/**
 * Extended action definition that supports both legacy actions and linked actions
 */
export interface ExtendedActionDefinition extends Omit<ActionDefinition, 'actions'> {
  /** Primary button label */
  label?: string;
  /** Legacy actions array (backwards compatible) */
  actions?: ActionButton[];
  /** Solana-style linked actions */
  links?: ActionLinks;
}

/**
 * Create a complete action with support for both legacy and Solana-style linked actions
 *
 * @example Legacy style (backwards compatible):
 * ```ts
 * createAction({
 *   title: 'Tip',
 *   icon: 'https://...',
 *   description: 'Send a tip',
 *   actions: [
 *     button({ label: '1 MNT', value: '1' }),
 *     input({ label: 'Custom' })
 *   ],
 *   handler: async (ctx) => ({ transaction: {...} })
 * })
 * ```
 *
 * @example Solana-style linked actions:
 * ```ts
 * createAction({
 *   title: 'Swap Tokens',
 *   icon: 'https://...',
 *   description: 'Swap tokens on DEX',
 *   links: createLinks([
 *     actionButton({ href: '/api/swap?amount=10', label: 'Swap 10' }),
 *     linkedAction({
 *       href: '/api/swap?amount={amount}&token={token}',
 *       label: 'Custom Swap',
 *       parameters: [
 *         amountParam({ name: 'amount', required: true }),
 *         selectParam({ name: 'token', options: [...] })
 *       ]
 *     })
 *   ]),
 *   handler: async (ctx) => ({ transaction: {...} })
 * })
 * ```
 */
export function createAction(definition: ExtendedActionDefinition): Action {
  // Validate definition
  if (!definition.title) throw new Error('Action title is required');
  if (!definition.icon) throw new Error('Action icon is required');
  if (!definition.description) throw new Error('Action description is required');

  // Must have either actions or links
  const hasLegacyActions = definition.actions && definition.actions.length > 0;
  const hasLinkedActions = definition.links?.actions && definition.links.actions.length > 0;

  if (!hasLegacyActions && !hasLinkedActions) {
    throw new Error('At least one action or linked action is required');
  }

  if (typeof definition.handler !== 'function') {
    throw new Error('Handler must be a function');
  }

  return {
    getMetadata(): ActionMetadata {
      return {
        type: 'action',
        title: definition.title,
        icon: definition.icon,
        description: definition.description,
        label: definition.label,
        actions: definition.actions,
        links: definition.links,
        disabled: definition.disabled,
      };
    },

    async handleRequest(
      request: TransactionRequest
    ): Promise<TransactionResponse> {
      // Validate request
      const validation = validateTransactionRequest(request);
      if (!validation.success) {
        throw new Error(validation.error);
      }

      // Handle legacy actions
      if (definition.actions) {
        const selectedAction = definition.actions.find(
          (a) => a.value === request.action || (a.type === 'input' && request.action === '__input__')
        );

        if (selectedAction) {
          // If input type, require input value
          if (selectedAction.type === 'input' && !request.input) {
            throw new Error('Input value is required');
          }
        }
      }

      // Call handler with full context including data
      const response = await definition.handler({
        account: request.account,
        action: request.action,
        input: request.input,
        data: request.data,
      });

      return response;
    },
  };
}
