import type { User } from '../types/user'

interface ActivityLog {
  time: string
  event: string
  detail: string
}

function generateLogs(user: User): ActivityLog[] {
  const base: ActivityLog[] = [
    { time: `${user.lastLogin} 09:14`, event: 'Login',           detail: 'Successful sign-in from Chrome / macOS' },
    { time: `${user.lastLogin} 09:30`, event: 'Profile Update',  detail: 'Updated display name' },
    { time: `${user.createdAt} 08:00`, event: 'Account Created', detail: 'Account provisioned by Admin' },
  ]
  if (user.role === 'Admin') {
    base.splice(1, 0, { time: `${user.lastLogin} 10:05`, event: 'Permission Change', detail: 'Granted Editor access to Reports module' })
  }
  if (user.status === 'Inactive') {
    base.unshift({ time: user.lastLogin, event: 'Deactivated', detail: 'Account marked inactive' })
  }
  return base
}

const eventColor: Record<string, string> = {
  Login:            'bg-green-100 text-green-700',
  'Profile Update': 'bg-blue-100 text-blue-700',
  'Account Created':'bg-indigo-100 text-indigo-700',
  'Permission Change': 'bg-purple-100 text-purple-700',
  Deactivated:      'bg-red-100 text-red-600',
}

function passwordAge(lastLogin: string): number {
  const diff = Date.now() - new Date(lastLogin).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 30))
}

interface Props {
  user: User
}

export default function UserDetailPanel({ user }: Props) {
  const logs = generateLogs(user)
  const pwAge = passwordAge(user.lastLogin)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 border-t border-gray-200">

      {/* Activity Logs */}
      <div className="md:col-span-1 bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Activity</h3>
        <ul className="space-y-3">
          {logs.map((log, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className={`mt-0.5 shrink-0 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${eventColor[log.event] ?? 'bg-gray-100 text-gray-600'}`}>
                {log.event}
              </span>
              <div className="min-w-0">
                <p className="text-xs text-gray-700 leading-snug">{log.detail}</p>
                <p className="text-xs text-gray-400 mt-0.5">{log.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Groups & Permissions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Groups & Permissions</h3>
        {user.groups.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No groups assigned.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {user.groups.map(g => (
              <span key={g} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg font-medium">
                <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z" />
                </svg>
                {g}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Role Permissions</h4>
          <ul className="space-y-1.5 text-xs text-gray-600">
            {user.role === 'Admin' && (
              <>
                <li className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Manage users &amp; roles</li>
                <li className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Access all modules</li>
                <li className="flex items-center gap-1.5"><span className="text-green-500">✓</span> View audit logs</li>
              </>
            )}
            {user.role === 'Editor' && (
              <>
                <li className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Create &amp; edit content</li>
                <li className="flex items-center gap-1.5"><span className="text-green-500">✓</span> View reports</li>
                <li className="flex items-center gap-1.5"><span className="text-red-400">✗</span> Manage users</li>
              </>
            )}
            {user.role === 'Viewer' && (
              <>
                <li className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Read-only access</li>
                <li className="flex items-center gap-1.5"><span className="text-red-400">✗</span> Edit content</li>
                <li className="flex items-center gap-1.5"><span className="text-red-400">✗</span> Manage users</li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Security Settings</h3>
        <ul className="space-y-3">
          <li className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Two-Factor Auth</span>
            {user.role === 'Admin' ? (
              <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Enabled
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Disabled
              </span>
            )}
          </li>
          <li className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Account Status</span>
            <span className={`text-xs font-medium ${user.status === 'Active' ? 'text-green-600' : 'text-red-500'}`}>
              {user.status}
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Last Login</span>
            <span className="text-xs text-gray-500">{user.lastLogin}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Last Password Update</span>
            <span className="text-xs text-gray-500">{user.createdAt}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Password Age</span>
            <span className={`text-xs font-medium ${pwAge > 6 ? 'text-red-500' : pwAge > 3 ? 'text-yellow-600' : 'text-green-600'}`}>
              {pwAge} mo{pwAge !== 1 ? 's' : ''}
              {pwAge > 6 && ' — Expired'}
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Session Timeout</span>
            <span className="text-xs text-gray-500">30 min</span>
          </li>
        </ul>
      </div>

    </div>
  )
}
