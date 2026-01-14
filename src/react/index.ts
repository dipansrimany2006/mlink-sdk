'use client';

// Components
export { Mlink, default as MlinkComponent } from './Mlink';
export { MlinkProvider, useMlinkContext } from './MlinkProvider';

// Hooks
export { useMlink } from './useMlink';
export { useExecuteMlink } from './useExecuteMlink';
export type { UseExecuteMlinkReturnEnhanced } from './useExecuteMlink';
export {
  useMlinkWagmiAdapter,
  useMlinkEthersAdapter,
  createMlinkAdapter,
} from './adapters';

// Themes
export {
  lightTheme,
  darkTheme,
  mantleTheme,
  themePresets,
  resolveTheme,
} from './themes';

// Types
export type {
  MlinkStatus,
  MlinkInstance,
  MlinkAdapter,
  WagmiAdapterConfig,
  EthersAdapterConfig,
  MlinkTheme,
  MlinkThemePreset,
  MlinkProviderConfig,
  MlinkProps,
  ActionButtonProps,
  ExecutionResult,
  UseMlinkOptions,
  UseExecuteMlinkReturn,
  RegistrationStatus,
  RegistrationResult,
} from './types';
