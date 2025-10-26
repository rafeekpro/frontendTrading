import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ProfileSettings } from '../components/settings/ProfileSettings';

interface SettingsTab {
  id: string;
  label: string;
  path: string;
}

const SETTINGS_TABS: SettingsTab[] = [
  { id: 'profile', label: 'Profile', path: 'profile' },
  { id: 'api', label: 'API Connections', path: 'api' },
  { id: 'notifications', label: 'Notifications', path: 'notifications' },
  { id: 'display', label: 'Display', path: 'display' },
];

function ProfileSettingsTab() {
  return (
    <div data-testid="profile-settings">
      <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
      <ProfileSettings />
    </div>
  );
}

function APISettings() {
  return <div data-testid="api-settings">API Settings Content</div>;
}

function NotificationSettings() {
  return <div data-testid="notification-settings">Notification Settings Content</div>;
}

function DisplaySettings() {
  return <div data-testid="display-settings">Display Settings Content</div>;
}

export function Settings() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname.split('/').pop() || 'profile';

  const handleTabClick = (path: string) => {
    navigate(`/settings/${path}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab Navigation */}
        <nav
          role="tablist"
          aria-label="Settings navigation"
          className="lg:w-64"
        >
          <div className="flex flex-row lg:flex-col gap-2">
            {SETTINGS_TABS.map((tab) => {
              const isActive = currentPath === tab.path;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleTabClick(tab.path)}
                  className={`
                    px-4 py-2 text-left rounded-md transition-colors
                    ${isActive
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Tab Content */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<ProfileSettingsTab />} />
            <Route path="api" element={<APISettings />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="display" element={<DisplaySettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
