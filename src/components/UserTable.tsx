import { useState, Fragment } from 'react'
import type { User, Role, ActivityLevel } from '../types/user'
import StatusBadge from './StatusBadge'
import UserDetailPanel from './UserDetailPanel'

interface Props {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (id: string) => void
}

const roleBadge: Record<Role, string> = {
  Admin:  'bg-purple-100 text-purple-700',
  Editor: 'bg-blue-100 text-blue-700',
  Viewer: 'bg-gray-100 text-gray-600',
}

const activityStyle: Record<ActivityLevel, string> = {
  High:     'bg-green-100 text-green-700',
  Medium:   'bg-yellow-100 text-yellow-700',
  Low:      'bg-orange-100 text-orange-600',
  Inactive: 'bg-gray-100 text-gray-400',
}

const activityDot: Record<ActivityLevel, string> = {
  High:     'bg-green-500',
  Medium:   'bg-yellow-400',
  Low:      'bg-orange-400',
  Inactive: 'bg-gray-300',
}

// Shared header cell — accepts optional hide class
const TH = ({
  children,
  right,
  className = '',
}: {
  children?: React.ReactNode
  right?: boolean
  className?: string
}) => (
  <th className={`px-4 py-3 font-medium text-gray-500 uppercase tracking-wide text-xs whitespace-nowrap
    ${right ? 'text-right' : ''} ${className}`}>
    {children}
  </th>
)

export default function UserTable({ users, onEdit, onDelete }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) =>
    setExpandedId(prev => (prev === id ? null : id))

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-gray-200">
        <svg className="w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z" />
        </svg>
        <p className="text-sm">No users found.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-left">
            {/* Always visible */}
            <TH />
            <TH>Name</TH>
            <TH>Role</TH>
            <TH>Status</TH>
            {/* Hidden on mobile */}
            <TH className="hidden md:table-cell">Email</TH>
            <TH className="hidden lg:table-cell">Last Login</TH>
            <TH className="hidden lg:table-cell">Activity</TH>
            <TH className="hidden xl:table-cell">Groups / Permissions</TH>
            <TH right>Actions</TH>
          </tr>
        </thead>
        <tbody>
          {users.map(user => {
            const expanded = expandedId === user.id
            return (
              <Fragment key={user.id}>
                <tr
                  className={`border-b border-gray-100 transition-colors cursor-pointer
                    ${expanded ? 'bg-indigo-50' : 'bg-white hover:bg-gray-50'}`}
                  onClick={() => toggleExpand(user.id)}
                >
                  {/* Expand chevron */}
                  <td className="pl-4 pr-2 py-3 w-8" aria-label={expanded ? 'Collapse details' : 'Expand details'}>
                    <svg
                      aria-hidden="true"
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200
                        ${expanded ? 'rotate-90 text-indigo-500' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </td>

                  {/* Name — on mobile also shows email beneath */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-xs shrink-0">
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 whitespace-nowrap">{user.name}</p>
                        {/* Email visible only when the Email column is hidden */}
                        <p className="text-xs text-gray-400 truncate md:hidden">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${roleBadge[user.role]}`}>
                      {user.role}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={user.status} />
                  </td>

                  {/* Email — hidden on mobile */}
                  <td className="hidden md:table-cell px-4 py-3 text-gray-500 whitespace-nowrap">
                    {user.email}
                  </td>

                  {/* Last Login — hidden below lg */}
                  <td className="hidden lg:table-cell px-4 py-3 text-gray-500 whitespace-nowrap">
                    {user.lastLogin}
                  </td>

                  {/* Activity — hidden below lg */}
                  <td className="hidden lg:table-cell px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${activityStyle[user.activityLevel]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${activityDot[user.activityLevel]}`} />
                      {user.activityLevel}
                    </span>
                  </td>

                  {/* Groups — hidden below xl */}
                  <td className="hidden xl:table-cell px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-48">
                      {user.groups.map(g => (
                        <span key={g} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md font-medium whitespace-nowrap">
                          {g}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => onEdit(user)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                        aria-label={`Edit ${user.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(user.id)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                        aria-label={`Delete ${user.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Detail Panel */}
                {expanded && (
                  <tr className="border-b border-gray-100">
                    <td colSpan={9} className="p-0">
                      <UserDetailPanel user={user} />
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
