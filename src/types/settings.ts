export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  timezone: string;
  language: string;
  createdAt: Date;
}

export interface APIConnection {
  id: string;
  provider: 'openai' | 'anthropic' | 'gemini';
  status: 'connected' | 'disconnected' | 'error';
  apiKey: string; // masked
  lastSync?: Date;
}

export interface NotificationSettings {
  email: boolean;
  browser: boolean;
  priceAlerts: boolean;
  tradeAlerts: boolean;
  opportunityAlerts: boolean;
  systemAlerts: boolean;
}

export interface DisplaySettings {
  theme: 'light' | 'dark';
  dateFormat: string;
  currency: string;
  language: string;
  timezone: string;
}

export type SettingsTab = 'profile' | 'api' | 'notifications' | 'display';
