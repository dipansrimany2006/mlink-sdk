'use client';

import React, { useState, useCallback, useMemo } from 'react';
import type { MlinkProps, MlinkTheme } from './types';
import type {
  ActionButton,
  LinkedAction,
  TypedActionParameter,
  ActionParameterSelectable,
} from '../types';
import { useMlink } from './useMlink';
import { useExecuteMlink } from './useExecuteMlink';
import { useMlinkContext } from './MlinkProvider';
import { resolveTheme, themeToCSS } from './themes';
import { buildHref, hasParameters, isSelectableParam } from '../builders';

export function Mlink({
  url,
  adapter,
  theme: themeProp,
  onSuccess,
  onError,
  className = '',
  stylePreset = 'default',
  registryUrl,
  requireRegistration = true,
  allowPending = true,
  allowBlocked = false,
}: MlinkProps) {
  const context = useMlinkContext();
  const resolvedTheme = themeProp ? resolveTheme(themeProp) : context.theme;

  const { status: fetchStatus, metadata, error: fetchError, registration } = useMlink(url, {
    registryUrl,
    requireRegistration,
    allowPending,
    allowBlocked,
  });

  const {
    execute,
    status: execStatus,
    txHash,
    error: execError,
    reset,
  } = useExecuteMlink({
    adapter,
    actionUrl: url,
    onSuccess,
    onError,
  });

  // State for legacy inputs
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // State for linked action parameters
  const [paramValues, setParamValues] = useState<Record<string, string | string[]>>({});

  // Currently selected linked action (if showing parameter form)
  const [selectedLinkedAction, setSelectedLinkedAction] = useState<LinkedAction | null>(null);

  const handleInputChange = useCallback((actionValue: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [actionValue]: value }));
  }, []);

  const handleParamChange = useCallback((name: string, value: string | string[]) => {
    setParamValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Handle legacy action execution
  const handleAction = useCallback(
    async (action: ActionButton) => {
      const input = action.type === 'input' ? inputValues[action.value] : undefined;
      await execute(action.value, input);
    },
    [execute, inputValues]
  );

  // Handle linked action click
  const handleLinkedAction = useCallback(
    async (action: LinkedAction) => {
      if (hasParameters(action)) {
        // Show parameter form
        setSelectedLinkedAction(action);
        // Initialize param values with defaults
        const defaults: Record<string, string | string[]> = {};
        action.parameters?.forEach((param) => {
          if (isSelectableParam(param)) {
            const selectedOption = param.options.find((o) => o.selected);
            if (selectedOption) {
              defaults[param.name] = param.type === 'checkbox' ? [selectedOption.value] : selectedOption.value;
            }
          }
        });
        setParamValues(defaults);
      } else {
        // Execute directly with href
        await execute(action.href, undefined, {});
      }
    },
    [execute]
  );

  // Execute linked action with parameters
  const handleExecuteWithParams = useCallback(async () => {
    if (!selectedLinkedAction) return;

    // Build the final href with parameter values
    const finalHref = buildHref(selectedLinkedAction.href, paramValues);

    await execute(finalHref, undefined, paramValues);
    setSelectedLinkedAction(null);
    setParamValues({});
  }, [selectedLinkedAction, paramValues, execute]);

  // Cancel parameter form
  const handleCancelParams = useCallback(() => {
    setSelectedLinkedAction(null);
    setParamValues({});
  }, []);

  // Check if we have linked actions
  const hasLinkedActions = useMemo(() => {
    return metadata?.links?.actions && metadata.links.actions.length > 0;
  }, [metadata]);

  // Loading/Validating state
  if (fetchStatus === 'loading' || fetchStatus === 'validating') {
    return (
      <MlinkContainer theme={resolvedTheme} className={className} preset={stylePreset}>
        <MlinkSkeleton />
      </MlinkContainer>
    );
  }

  // Unregistered state
  if (fetchStatus === 'unregistered') {
    return (
      <MlinkContainer theme={resolvedTheme} className={className} preset={stylePreset}>
        <MlinkUnregistered
          message={fetchError || 'This MLink is not registered.'}
          registryUrl={registryUrl}
        />
      </MlinkContainer>
    );
  }

  // Blocked state
  if (fetchStatus === 'blocked') {
    return (
      <MlinkContainer theme={resolvedTheme} className={className} preset={stylePreset}>
        <MlinkBlocked message={fetchError || 'This MLink has been blocked.'} />
      </MlinkContainer>
    );
  }

  // Error state
  if (fetchStatus === 'error' || !metadata) {
    return (
      <MlinkContainer theme={resolvedTheme} className={className} preset={stylePreset}>
        <MlinkError message={fetchError || 'Failed to load action'} />
      </MlinkContainer>
    );
  }

  // Success state after transaction
  if (execStatus === 'success' && txHash) {
    return (
      <MlinkContainer theme={resolvedTheme} className={className} preset={stylePreset}>
        <MlinkSuccess
          message={metadata.title}
          txHash={txHash}
          onReset={reset}
        />
      </MlinkContainer>
    );
  }

  // Parameter form for linked action
  if (selectedLinkedAction && hasParameters(selectedLinkedAction)) {
    return (
      <MlinkContainer theme={resolvedTheme} className={className} preset={stylePreset}>
        <div className="mlink-content">
          <h3 className="mlink-title">{selectedLinkedAction.label}</h3>
          <p className="mlink-description">Fill in the details below</p>
        </div>

        {execError && (
          <div className="mlink-error-banner">{execError}</div>
        )}

        <div className="mlink-params">
          {selectedLinkedAction.parameters?.map((param) => (
            <ParameterInput
              key={param.name}
              param={param}
              value={paramValues[param.name] || ''}
              onChange={(value) => handleParamChange(param.name, value)}
              disabled={execStatus === 'executing'}
            />
          ))}
        </div>

        <div className="mlink-actions">
          <button
            className="mlink-button"
            onClick={handleExecuteWithParams}
            disabled={execStatus === 'executing'}
          >
            {execStatus === 'executing' ? <MlinkSpinner /> : selectedLinkedAction.label}
          </button>
          <button
            className="mlink-button mlink-button-secondary"
            onClick={handleCancelParams}
            disabled={execStatus === 'executing'}
          >
            Back
          </button>
        </div>
      </MlinkContainer>
    );
  }

  return (
    <MlinkContainer theme={resolvedTheme} className={className} preset={stylePreset}>
      {/* Icon */}
      <div className="mlink-icon">
        <img src={metadata.icon} alt={metadata.title} />
      </div>

      {/* Content */}
      <div className="mlink-content">
        <h3 className="mlink-title">{metadata.title}</h3>
        <p className="mlink-description">{metadata.description}</p>
      </div>

      {/* Error display */}
      {execError && (
        <div className="mlink-error-banner">
          {execError}
        </div>
      )}

      {/* Linked Actions (Solana-style) */}
      {hasLinkedActions && (
        <div className="mlink-actions">
          {/* Quick action buttons (no parameters) */}
          <div className="mlink-quick-actions">
            {metadata.links!.actions
              .filter((a) => !hasParameters(a))
              .map((action, index) => (
                <button
                  key={`${action.href}-${index}`}
                  className="mlink-button mlink-button-quick"
                  onClick={() => handleLinkedAction(action)}
                  disabled={metadata.disabled || action.disabled || execStatus === 'executing'}
                >
                  {execStatus === 'executing' ? <MlinkSpinner /> : action.label}
                </button>
              ))}
          </div>

          {/* Actions with parameters */}
          {metadata.links!.actions
            .filter((a) => hasParameters(a))
            .map((action, index) => (
              <button
                key={`param-${action.href}-${index}`}
                className="mlink-button mlink-button-custom"
                onClick={() => handleLinkedAction(action)}
                disabled={metadata.disabled || action.disabled || execStatus === 'executing'}
              >
                {action.label}
              </button>
            ))}
        </div>
      )}

      {/* Legacy Actions (backwards compatible) */}
      {!hasLinkedActions && metadata.actions && (
        <div className="mlink-actions">
          {metadata.actions.map((action, index) => (
            <ActionButtonComponent
              key={`${action.value}-${index}`}
              action={action}
              inputValue={inputValues[action.value] || ''}
              onInputChange={(value) => handleInputChange(action.value, value)}
              onExecute={() => handleAction(action)}
              loading={execStatus === 'executing'}
              disabled={metadata.disabled === true || action.disabled === true}
            />
          ))}
        </div>
      )}
    </MlinkContainer>
  );
}

// =============================================================================
// PARAMETER INPUT COMPONENT
// =============================================================================

interface ParameterInputProps {
  param: TypedActionParameter;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  disabled: boolean;
}

function ParameterInput({ param, value, onChange, disabled }: ParameterInputProps) {
  const strValue = Array.isArray(value) ? value.join(',') : value;

  if (isSelectableParam(param)) {
    return (
      <SelectableParamInput
        param={param}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    );
  }

  // Map parameter type to input type
  const inputType = getInputType(param.type);

  if (param.type === 'textarea') {
    return (
      <div className="mlink-param-group">
        {param.label && <label className="mlink-param-label">{param.label}</label>}
        <textarea
          className="mlink-textarea"
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={param.required}
        />
      </div>
    );
  }

  return (
    <div className="mlink-param-group">
      {param.label && (
        <label className="mlink-param-label">
          {param.label}
          {param.required && <span className="mlink-required">*</span>}
        </label>
      )}
      <input
        type={inputType}
        className="mlink-input"
        value={strValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={param.required}
        pattern={param.pattern}
        min={param.min?.toString()}
        max={param.max?.toString()}
        placeholder={param.label || param.name}
      />
      {param.patternDescription && (
        <span className="mlink-param-hint">{param.patternDescription}</span>
      )}
    </div>
  );
}

function SelectableParamInput({
  param,
  value,
  onChange,
  disabled,
}: {
  param: ActionParameterSelectable;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  disabled: boolean;
}) {
  const arrayValue = Array.isArray(value) ? value : value ? [value] : [];

  if (param.type === 'select') {
    return (
      <div className="mlink-param-group">
        {param.label && (
          <label className="mlink-param-label">
            {param.label}
            {param.required && <span className="mlink-required">*</span>}
          </label>
        )}
        <select
          className="mlink-select"
          value={arrayValue[0] || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={param.required}
        >
          <option value="">Select {param.label || param.name}</option>
          {param.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (param.type === 'radio') {
    return (
      <div className="mlink-param-group">
        {param.label && (
          <label className="mlink-param-label">
            {param.label}
            {param.required && <span className="mlink-required">*</span>}
          </label>
        )}
        <div className="mlink-radio-group">
          {param.options.map((opt) => (
            <label key={opt.value} className="mlink-radio-label">
              <input
                type="radio"
                name={param.name}
                value={opt.value}
                checked={arrayValue[0] === opt.value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (param.type === 'checkbox') {
    return (
      <div className="mlink-param-group">
        {param.label && (
          <label className="mlink-param-label">
            {param.label}
            {param.required && <span className="mlink-required">*</span>}
          </label>
        )}
        <div className="mlink-checkbox-group">
          {param.options.map((opt) => (
            <label key={opt.value} className="mlink-checkbox-label">
              <input
                type="checkbox"
                value={opt.value}
                checked={arrayValue.includes(opt.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...arrayValue, opt.value]);
                  } else {
                    onChange(arrayValue.filter((v) => v !== opt.value));
                  }
                }}
                disabled={disabled}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

function getInputType(paramType?: string): string {
  switch (paramType) {
    case 'number':
    case 'amount':
      return 'number';
    case 'email':
      return 'email';
    case 'url':
      return 'url';
    case 'date':
      return 'date';
    case 'datetime-local':
      return 'datetime-local';
    case 'address':
    case 'token':
    case 'text':
    default:
      return 'text';
  }
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

// Container component
interface MlinkContainerProps {
  theme: MlinkTheme;
  className: string;
  preset: 'default' | 'compact' | 'minimal';
  children: React.ReactNode;
}

function MlinkContainer({ theme, className, preset, children }: MlinkContainerProps) {
  return (
    <div
      className={`mlink-container mlink-${preset} ${className}`}
      style={themeToCSS(theme)}
    >
      {children}
    </div>
  );
}

// Skeleton loading component
function MlinkSkeleton() {
  return (
    <div className="mlink-skeleton">
      <div className="mlink-skeleton-icon" />
      <div className="mlink-skeleton-content">
        <div className="mlink-skeleton-title" />
        <div className="mlink-skeleton-description" />
      </div>
      <div className="mlink-skeleton-button" />
    </div>
  );
}

// Error component
function MlinkError({ message }: { message: string }) {
  return (
    <div className="mlink-error">
      <div className="mlink-error-icon">!</div>
      <p className="mlink-error-message">{message}</p>
    </div>
  );
}

// Unregistered component
function MlinkUnregistered({ message, registryUrl }: { message: string; registryUrl?: string }) {
  const registerUrl = registryUrl
    ? `${registryUrl}/dashboard/register`
    : 'https://mlink-client.vercel.app/dashboard/register';

  return (
    <div className="mlink-unregistered">
      <div className="mlink-unregistered-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="mlink-unregistered-title">Unregistered MLink</h3>
      <p className="mlink-unregistered-message">{message}</p>
      <a
        href={registerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mlink-button"
      >
        Register MLink
      </a>
    </div>
  );
}

// Blocked component
function MlinkBlocked({ message }: { message: string }) {
  return (
    <div className="mlink-blocked">
      <div className="mlink-blocked-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      </div>
      <h3 className="mlink-blocked-title">Blocked MLink</h3>
      <p className="mlink-blocked-message">{message}</p>
    </div>
  );
}

// Success component
interface MlinkSuccessProps {
  message: string;
  txHash: string;
  onReset: () => void;
}

function MlinkSuccess({ message, txHash, onReset }: MlinkSuccessProps) {
  const shortHash = `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;

  return (
    <div className="mlink-success">
      <div className="mlink-success-icon">✓</div>
      <h3 className="mlink-success-title">Transaction Sent</h3>
      <p className="mlink-success-message">{message}</p>
      <code className="mlink-success-hash">{shortHash}</code>
      <button className="mlink-button mlink-button-secondary" onClick={onReset}>
        Done
      </button>
    </div>
  );
}

// Action button component (legacy)
interface ActionButtonComponentProps {
  action: ActionButton;
  inputValue: string;
  onInputChange: (value: string) => void;
  onExecute: () => void;
  loading: boolean;
  disabled: boolean;
}

function ActionButtonComponent({
  action,
  inputValue,
  onInputChange,
  onExecute,
  loading,
  disabled,
}: ActionButtonComponentProps) {
  if (action.type === 'input') {
    return (
      <div className="mlink-input-group">
        <input
          type="text"
          className="mlink-input"
          placeholder={action.placeholder || action.label}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          disabled={disabled || loading}
        />
        <button
          className="mlink-button"
          onClick={onExecute}
          disabled={disabled || loading || !inputValue.trim()}
        >
          {loading ? <MlinkSpinner /> : action.label}
        </button>
      </div>
    );
  }

  return (
    <button
      className="mlink-button"
      onClick={onExecute}
      disabled={disabled || loading}
    >
      {loading ? <MlinkSpinner /> : action.label}
    </button>
  );
}

// Spinner component
function MlinkSpinner() {
  return <span className="mlink-spinner" />;
}

export default Mlink;
