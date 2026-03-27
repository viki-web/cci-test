import type { User } from '../types/user'

export const mockUsers: User[] = [
  { id: '1', name: 'Alice Johnson',  email: 'alice@example.com',  role: 'Admin',  status: 'Active',   lastLogin: '2026-03-26', activityLevel: 'High',     groups: ['Engineering', 'Management'],      createdAt: '2024-01-15' },
  { id: '2', name: 'Bob Smith',      email: 'bob@example.com',    role: 'Editor', status: 'Active',   lastLogin: '2026-03-25', activityLevel: 'Medium',   groups: ['Marketing', 'Sales'],             createdAt: '2024-02-03' },
  { id: '3', name: 'Carol White',    email: 'carol@example.com',  role: 'Viewer', status: 'Inactive', lastLogin: '2026-01-10', activityLevel: 'Inactive', groups: ['Support'],                        createdAt: '2024-02-18' },
  { id: '4', name: 'David Lee',      email: 'david@example.com',  role: 'Editor', status: 'Active',   lastLogin: '2026-03-20', activityLevel: 'High',     groups: ['Engineering'],                    createdAt: '2024-03-07' },
  { id: '5', name: 'Eva Martinez',   email: 'eva@example.com',    role: 'Viewer', status: 'Active',   lastLogin: '2026-03-22', activityLevel: 'Low',      groups: ['Sales', 'Finance'],               createdAt: '2024-03-22' },
  { id: '6', name: 'Frank Brown',    email: 'frank@example.com',  role: 'Admin',  status: 'Inactive', lastLogin: '2025-12-01', activityLevel: 'Inactive', groups: ['Management', 'HR'],               createdAt: '2024-04-01' },
  { id: '7', name: 'Grace Kim',      email: 'grace@example.com',  role: 'Viewer', status: 'Active',   lastLogin: '2026-03-24', activityLevel: 'Medium',   groups: ['Support', 'Engineering'],         createdAt: '2024-04-14' },
  { id: '8', name: 'Henry Wilson',   email: 'henry@example.com',  role: 'Editor', status: 'Inactive', lastLogin: '2026-02-15', activityLevel: 'Low',      groups: ['Finance'],                        createdAt: '2024-05-09' },
]

export const ALL_GROUPS = ['Engineering', 'Marketing', 'Sales', 'Support', 'Finance', 'Management', 'HR']
