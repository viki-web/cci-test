import { useState, useMemo, useCallback } from 'react'
import type { User, UserFormData, Role, Status } from './types/user'
import { mockUsers } from './data/mockUsers'
import UserTable from './components/UserTable'
import UserForm from './components/UserForm'
import Modal from './components/Modal'
import ConfirmDialog from './components/ConfirmDialog'
import { ToastContainer, useToast } from './components/Toast'

type FilterRole = Role | 'All'
type FilterStatus = Status | 'All'

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

export default function App() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<FilterRole>('All')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const { toasts, toast, dismiss } = useToast()

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      const matchRole = roleFilter === 'All' || u.role === roleFilter
      const matchStatus = statusFilter === 'All' || u.status === statusFilter
      return matchSearch && matchRole && matchStatus
    })
  }, [users, search, roleFilter, statusFilter])

  const openAdd = useCallback(() => { setEditing(null); setModalOpen(true) }, [])
  const openEdit = useCallback((user: User) => { setEditing(user); setModalOpen(true) }, [])
  const closeModal = useCallback(() => { setModalOpen(false); setEditing(null) }, [])

  const handleSubmit = useCallback((data: UserFormData) => {
    if (editing) {
      setUsers(prev => prev.map(u => u.id === editing.id ? { ...u, ...data } : u))
      toast(`${data.name} updated successfully.`, 'success')
    } else {
      const newUser: User = { ...data, id: generateId(), createdAt: new Date().toISOString().slice(0, 10) }
      setUsers(prev => [newUser, ...prev])
      toast(`${data.name} added successfully.`, 'success')
    }
    closeModal()
  }, [editing, closeModal, toast])

  const handleDeleteRequest = useCallback((id: string) => {
    setPendingDeleteId(id)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (!pendingDeleteId) return
    const user = users.find(u => u.id === pendingDeleteId)
    setUsers(prev => prev.filter(u => u.id !== pendingDeleteId))
    setPendingDeleteId(null)
    toast(`${user?.name ?? 'User'} removed.`, 'info')
  }, [pendingDeleteId, users, toast])

  const handleDeleteCancel = useCallback(() => setPendingDeleteId(null), [])

  const activeCount = users.filter(u => u.status === 'Active').length
  const adminCount = users.filter(u => u.role === 'Admin').length
  const pendingUser = users.find(u => u.id === pendingDeleteId)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-gray-900 leading-none truncate">User Management</h1>
              <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">Administrator Dashboard</p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg
              hover:bg-indigo-700 transition-colors shadow-sm shrink-0"
          >
            <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add User</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-4 sm:space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4" role="region" aria-label="Summary statistics">
          {[
            {
              label: 'Total Users', value: users.length,
              icon: 'M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z',
              color: 'text-indigo-600 bg-indigo-50',
            },
            {
              label: 'Active', value: activeCount,
              icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
              color: 'text-green-600 bg-green-50',
            },
            {
              label: 'Admins', value: adminCount,
              icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
              color: 'text-purple-600 bg-purple-50',
            },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`} aria-hidden="true">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={stat.icon} />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 truncate">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center"
          role="search" aria-label="Filter users">
          <div className="relative flex-1 sm:min-w-52">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7 7 0 1010 17a7 7 0 006.65-4.35z" />
            </svg>
            <input
              type="search"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search users"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none
                focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as FilterRole)}
              aria-label="Filter by role"
              className="flex-1 sm:flex-none px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-white
                focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition text-gray-600"
            >
              {(['All', 'Admin', 'Editor', 'Viewer'] as FilterRole[]).map(r => (
                <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as FilterStatus)}
              aria-label="Filter by status"
              className="flex-1 sm:flex-none px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-white
                focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition text-gray-600"
            >
              {(['All', 'Active', 'Inactive'] as FilterStatus[]).map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
              ))}
            </select>
          </div>

          <span className="text-xs text-gray-400 sm:ml-auto" aria-live="polite">
            {filtered.length} of {users.length} users
          </span>
        </div>

        {/* Table */}
        <UserTable users={filtered} onEdit={openEdit} onDelete={handleDeleteRequest} />
      </main>

      {/* Add / Edit modal */}
      {modalOpen && (
        <Modal title={editing ? 'Edit User' : 'Add New User'} onClose={closeModal}>
          <UserForm initial={editing ?? undefined} onSubmit={handleSubmit} onCancel={closeModal} />
        </Modal>
      )}

      {/* Delete confirmation */}
      {pendingDeleteId && pendingUser && (
        <ConfirmDialog
          title="Delete user?"
          message={`"${pendingUser.name}" will be permanently removed. This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
