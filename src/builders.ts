import type {
  ActionButton,
  ActionDefinition,
  ActionMetadata,
  TransactionRequest,
  TransactionResponse,
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

// Action object returned by createAction
export interface Action {
  getMetadata(): ActionMetadata;
  handleRequest(request: TransactionRequest): Promise<TransactionResponse>;
}

// Create a complete action
export function createAction(definition: ActionDefinition): Action {
  // Validate definition
  if (!definition.title) throw new Error('Action title is required');
  if (!definition.icon) throw new Error('Action icon is required');
  if (!definition.description) throw new Error('Action description is required');
  if (!definition.actions || definition.actions.length === 0) {
    throw new Error('At least one action is required');
  }
  if (typeof definition.handler !== 'function') {
    throw new Error('Handler must be a function');
  }

  return {
    getMetadata(): ActionMetadata {
      return {
        title: definition.title,
        icon: definition.icon,
        description: definition.description,
        actions: definition.actions,
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

      // Find the selected action
      const selectedAction = definition.actions.find(
        (a) => a.value === request.action || (a.type === 'input' && request.action === '__input__')
      );

      if (!selectedAction) {
        throw new Error('Invalid action selected');
      }

      // If input type, require input value
      if (selectedAction.type === 'input' && !request.input) {
        throw new Error('Input value is required');
      }

      // Call handler
      const response = await definition.handler({
        account: request.account,
        action: request.action,
        input: request.input,
      });

      return response;
    },
  };
}
