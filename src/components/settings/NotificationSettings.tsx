import { useState, useEffect } from 'react';
import { NotificationSettings as NotificationSettingsType } from '../../types/settings';

const DEFAULT_SETTINGS: NotificationSettingsType = {
  email: true,
  browser: false,
  priceAlerts: true,
  tradeAlerts: true,
  opportunityAlerts: true,
  systemAlerts: false,
};

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettingsType>(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const handleToggle = (key: keyof NotificationSettingsType) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    alert('Notification preferences saved!');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>

      <div className="space-y-4">
        {/* Email Notifications */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium">Email Notifications</span>
          <input
            type="checkbox"
            checked={settings.email}
            onChange={() => handleToggle('email')}
            className="w-5 h-5"
          />
        </label>

        {/* Browser Notifications */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium">Browser Notifications</span>
          <input
            type="checkbox"
            checked={settings.browser}
            onChange={() => handleToggle('browser')}
            className="w-5 h-5"
          />
        </label>

        <hr className="my-4" />

        <h4 className="text-sm font-semibold">Alert Types</h4>

        {/* Price Alerts */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm">Price Alerts</span>
          <input
            type="checkbox"
            checked={settings.priceAlerts}
            onChange={() => handleToggle('priceAlerts')}
            className="w-5 h-5"
          />
        </label>

        {/* Trade Alerts */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm">Trade Alerts</span>
          <input
            type="checkbox"
            checked={settings.tradeAlerts}
            onChange={() => handleToggle('tradeAlerts')}
            className="w-5 h-5"
          />
        </label>

        {/* Opportunity Alerts */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm">Opportunity Alerts</span>
          <input
            type="checkbox"
            checked={settings.opportunityAlerts}
            onChange={() => handleToggle('opportunityAlerts')}
            className="w-5 h-5"
          />
        </label>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}
