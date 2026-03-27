import { useState } from 'react'
import type { User, UserFormData, Role, Status, ActivityLevel } from '../types/user'
import { ALL_GROUPS } from '../data/mockUsers'

interface Props {
  initial?: User
  onSubmit: (data: UserFormData) => void
  onCancel: () => void
}

const ACTIVITY_LEVELS: ActivityLevel[] = ['High', 'Medium', 'Low', 'Inactive']

const ROLE_OPTIONS: { value: Role; label: string; desc: string; icon: string; color: string; ring: string }[] = [
  {
    value: 'Admin',
    label: 'Admin',
    desc: 'Full access, manage users & settings',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    ring: 'ring-purple-500 border-purple-500 bg-purple-50',
  },
  {
    value: 'Editor',
    label: 'Editor',
    desc: 'Create & edit content, view reports',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    ring: 'ring-blue-500 border-blue-500 bg-blue-50',
  },
  {
    value: 'Viewer',
    label: 'Viewer',
    desc: 'Read-only access to content',
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    color: 'text-gray-600 bg-gray-50 border-gray-200',
    ring: 'ring-gray-400 border-gray-400 bg-gray-50',
  },
]

const GROUP_ICONS: Record<string, string> = {
  Engineering: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  Marketing:   'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z',
  Sales:       'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  Support:     'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
  Finance:     'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  Management:  'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  HR:          'M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z',
}

interface Errors { name?: string; email?: string }

const empty: UserFormData = {
  name: '', email: '', role: 'Viewer', status: 'Active',
  lastLogin: '', activityLevel: 'Medium', groups: [],
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  )
}

function InputField({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

export default function UserForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<UserFormData>(
    initial
      ? { name: initial.name, email: initial.email, role: initial.role, status: initial.status, lastLogin: initial.lastLogin, activityLevel: initial.activityLevel, groups: [...initial.groups] }
      : empty
  )
  const [errors, setErrors] = useState<Errors>({})

  const validate = (): boolean => {
    const next: Errors = {}
    if (!form.name.trim()) next.name = 'Full name is required.'
    if (!form.email.trim()) {
      next.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email address.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (validate()) onSubmit(form)
  }

  const setField = (key: keyof UserFormData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key as keyof Errors]) setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const toggleGroup = (group: string) =>
    setForm(prev => ({
      ...prev,
      groups: prev.groups.includes(group)
        ? prev.groups.filter(g => g !== group)
        : [...prev.groups, group],
    }))

  const inputBase = 'w-full px-3 py-2.5 text-sm rounded-lg border outline-none transition focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400'

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

      {/* ── User Information ─────────────────────────────── */}
      <Section title="User Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Full Name" error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              placeholder="e.g. Jane Doe"
              className={`${inputBase} ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
            />
          </InputField>
          <InputField label="Email Address" error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={e => setField('email', e.target.value)}
              placeholder="jane@example.com"
              className={`${inputBase} ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
            />
          </InputField>
        </div>
      </Section>

      {/* ── Role ─────────────────────────────────────────── */}
      <Section title="Role">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ROLE_OPTIONS.map(opt => {
            const active = form.role === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setField('role', opt.value)}
                className={`relative flex flex-col gap-2 p-4 rounded-xl border-2 text-left transition-all
                  ${active ? `${opt.ring} ring-2` : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}
              >
                {active && (
                  <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center border ${opt.color}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={opt.icon} />
                  </svg>
                </span>
                <span className="text-sm font-semibold text-gray-800">{opt.label}</span>
                <span className="text-xs text-gray-500 leading-snug">{opt.desc}</span>
              </button>
            )
          })}
        </div>
      </Section>

      {/* ── Status & Activity ────────────────────────────── */}
      <Section title="Status & Activity">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Status</label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              {(['Active', 'Inactive'] as Status[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setField('status', s)}
                  className={`flex-1 py-2.5 text-sm font-medium transition
                    ${form.status === s
                      ? s === 'Active'
                        ? 'bg-green-600 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Activity Level</label>
            <select
              value={form.activityLevel}
              onChange={e => setField('activityLevel', e.target.value)}
              className={`${inputBase} border-gray-300 bg-white`}
            >
              {ACTIVITY_LEVELS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </Section>

      {/* ── Groups & Permissions ─────────────────────────── */}
      <Section title="Groups & Permissions">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ALL_GROUPS.map(g => {
            const checked = form.groups.includes(g)
            return (
              <label
                key={g}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none
                  ${checked
                    ? 'border-indigo-400 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleGroup(g)}
                  className="sr-only"
                />
                {/* custom checkbox */}
                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition
                  ${checked ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}`}
                >
                  {checked && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0
                  ${checked ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={GROUP_ICONS[g] ?? GROUP_ICONS.HR} />
                  </svg>
                </span>
                <span className={`text-sm font-medium ${checked ? 'text-indigo-700' : 'text-gray-700'}`}>{g}</span>
              </label>
            )
          })}
        </div>
        {form.groups.length > 0 && (
          <p className="mt-2 text-xs text-indigo-600 font-medium">
            {form.groups.length} group{form.groups.length !== 1 ? 's' : ''} selected: {form.groups.join(', ')}
          </p>
        )}
      </Section>

      {/* ── Divider + Actions ────────────────────────────── */}
      <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-gray-400 order-2 sm:order-1">
          {initial ? `Editing user · ID ${initial.id}` : 'All fields marked are required'}
        </p>
        <div className="flex gap-2 order-1 sm:order-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm"
          >
            {initial ? 'Save Changes' : 'Add User'}
          </button>
        </div>
      </div>

    </form>
  )
}
