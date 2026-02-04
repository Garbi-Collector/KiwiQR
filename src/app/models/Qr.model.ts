export interface QRMode {
  id: QRModeType;
  name: string;
  icon: string;
  description: string;
}

export type QRModeType = 'standard' | 'kiwi' | 'rounded' | 'dots';

export interface QRColorScheme {
  dark: string;
  light: string;
}

export interface QRGenerateOptions {
  text: string;
  mode: QRModeType;
  size?: number;
  margin?: number;
}
