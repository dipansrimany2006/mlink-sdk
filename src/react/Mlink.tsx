'use client';

import React, { useState, useCallback } from 'react';
import type { MlinkProps, MlinkTheme } from './types';
import type { ActionButton } from '../types';
import { useMlink } from './useMlink';
import { useExecuteMlink } from './useExecuteMlink';
import { useMlinkContext } from './MlinkProvider';
import { resolveTheme, themeToCSS } from './themes';

export function Mlink({
  url,
  adapter,
  theme: themeProp,
  onSuccess,
  onError,
  className = '',
  stylePreset = 'default',
}: MlinkProps) {
  const context = useMlinkContext();
  const resolvedTheme = themeProp ? resolveTheme(themeProp) : context.theme;

  const { status: fetchStatus, metadata, error: fetchError } = useMlink(url);

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

  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const handleInputChange = useCallback((actionValue: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [actionValue]: value }));
  }, []);

  const handleAction = useCallback(
    async (action: ActionButton) => {
      const input = action.type === 'input' ? inputValues[action.value] : undefined;
      await execute(action.value, input);
    },
    [execute, inputValues]
  );

  // Loading state
  if (fetchStatus === 'loading') {
    return (
      <MlinkContainer theme={resolvedTheme} className={className} preset={stylePreset}>
        <MlinkSkeleton />
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

      {/* Actions */}
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
    </MlinkContainer>
  );
}

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

// Action button component
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
