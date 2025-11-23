/**
 * FILE: src/components/dashboard/settings/SettingsTabs.tsx
 * TYPE: Client Component
 * WHY: Interactive tab navigation with state management
 *
 * FEATURES:
 * - 3 tabs: Profilo, Notifiche, Template Email
 * - State management for active tab
 * - Responsive design
 */

'use client'

import { useState } from 'react'
import { EmailTemplateSettings } from './EmailTemplateSettings'
import { NotificationSettingsForm } from './NotificationSettings'
import { ProfileSettingsForm } from './ProfileSettings'

type Tab = 'profile' | 'notifications' | 'templates'

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  const tabs = [
    { id: 'profile' as const, label: 'Profilo', icon: '👤' },
    { id: 'notifications' as const, label: 'Notifiche', icon: '🔔' },
    { id: 'templates' as const, label: 'Template Email', icon: '📧' },
  ]

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }
              `}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'profile' && <ProfileSettingsForm />}
        {activeTab === 'notifications' && <NotificationSettingsForm />}
        {activeTab === 'templates' && <EmailTemplateSettings />}
      </div>
    </div>
  )
}
