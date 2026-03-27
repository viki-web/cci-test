export type Role = 'Admin' | 'Editor' | 'Viewer'
export type Status = 'Active' | 'Inactive'
export type ActivityLevel = 'High' | 'Medium' | 'Low' | 'Inactive'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  status: Status
  lastLogin: string
  activityLevel: ActivityLevel
  groups: string[]
  createdAt: string
}

export interface UserFormData {
  name: string
  email: string
  role: Role
  status: Status
  lastLogin: string
  activityLevel: ActivityLevel
  groups: string[]
}
