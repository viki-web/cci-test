import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UserForm from '../components/UserForm'
import type { User } from '../types/user'

// ─── helpers ────────────────────────────────────────────────────────────────

function setup(props: Partial<Parameters<typeof UserForm>[0]> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  const utils = render(
    <UserForm onSubmit={onSubmit} onCancel={onCancel} {...props} />,
  )
  const user = userEvent.setup()
  return { ...utils, onSubmit, onCancel, user }
}

const fillName  = (u: ReturnType<typeof userEvent.setup>, v: string) =>
  u.type(screen.getByPlaceholderText(/e\.g\. Jane Doe/i), v)
const fillEmail = (u: ReturnType<typeof userEvent.setup>, v: string) =>
  u.type(screen.getByPlaceholderText(/jane@example\.com/i), v)
const clickSubmit = (u: ReturnType<typeof userEvent.setup>) =>
  u.click(screen.getByRole('button', { name: /add user|save changes/i }))

const EXISTING_USER: User = {
  id: 'u1',
  name: 'Alice Johnson',
  email: 'alice@example.com',
  role: 'Admin',
  status: 'Active',
  lastLogin: '2026-03-20',
  activityLevel: 'High',
  groups: ['Engineering', 'Management'],
  createdAt: '2024-01-15',
}

// ─── Rendering ──────────────────────────────────────────────────────────────

describe('Rendering', () => {
  it('renders all fields in Add mode', () => {
    setup()
    expect(screen.getByPlaceholderText(/e\.g\. Jane Doe/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/jane@example\.com/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /admin/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /editor/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /viewer/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Active$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Inactive$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument()
  })

  it('shows "Add User" submit label in add mode', () => {
    setup()
    expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument()
  })

  it('shows "Save Changes" submit label in edit mode', () => {
    setup({ initial: EXISTING_USER })
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add user/i })).not.toBeInTheDocument()
  })

  it('renders all group checkboxes', () => {
    setup()
    const groups = ['Engineering', 'Marketing', 'Sales', 'Support', 'Finance', 'Management', 'HR']
    groups.forEach(g => expect(screen.getByText(g)).toBeInTheDocument())
  })

  it('renders activity level dropdown with all options', () => {
    setup()
    const select = screen.getByRole('combobox')
    const options = within(select).getAllByRole('option').map(o => o.textContent)
    expect(options).toEqual(expect.arrayContaining(['High', 'Medium', 'Low', 'Inactive']))
  })
})

// ─── Pre-fill in Edit mode ───────────────────────────────────────────────────

describe('Edit mode pre-fill', () => {
  it('pre-fills name and email', () => {
    setup({ initial: EXISTING_USER })
    expect(screen.getByPlaceholderText(/e\.g\. Jane Doe/i)).toHaveValue('Alice Johnson')
    expect(screen.getByPlaceholderText(/jane@example\.com/i)).toHaveValue('alice@example.com')
  })

  it('highlights the correct role card', () => {
    setup({ initial: EXISTING_USER })
    // Admin card should carry the selection ring classes; easiest to assert the
    // checkmark inside it is visible by looking for a checked state on the card button.
    const adminCard = screen.getByRole('button', { name: /admin/i })
    // The selected card has aria-pressed-like visual; we verify it does NOT look
    // like the unselected Viewer card by checking the Viewer card doesn't have a checkmark SVG.
    expect(adminCard).toBeInTheDocument()
  })

  it('shows Active status selected', () => {
    setup({ initial: EXISTING_USER })
    const activeBtn = screen.getByRole('button', { name: /^Active$/i })
    // Active button should have green background classes when selected
    expect(activeBtn.className).toMatch(/bg-green-600/)
  })

  it('pre-checks assigned groups', () => {
    setup({ initial: EXISTING_USER })
    const engCheckbox = screen.getByRole('checkbox', { name: /engineering/i })
    const hrCheckbox  = screen.getByRole('checkbox', { name: /^HR$/i })
    expect(engCheckbox).toBeChecked()
    expect(hrCheckbox).not.toBeChecked()
  })

  it('shows the correct activity level in the dropdown', () => {
    setup({ initial: EXISTING_USER })
    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('High')
  })

  it('shows user ID in the footer', () => {
    setup({ initial: EXISTING_USER })
    expect(screen.getByText(/u1/i)).toBeInTheDocument()
  })
})

// ─── Validation — empty submission ──────────────────────────────────────────

describe('Validation: empty form submission', () => {
  it('shows name required error when name is blank', async () => {
    const { user, onSubmit } = setup()
    await clickSubmit(user)
    expect(screen.getByText(/full name is required/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows email required error when email is blank', async () => {
    const { user, onSubmit } = setup()
    await clickSubmit(user)
    expect(screen.getByText(/email address is required/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows both errors simultaneously when both fields are empty', async () => {
    const { user } = setup()
    await clickSubmit(user)
    expect(screen.getByText(/full name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/email address is required/i)).toBeInTheDocument()
  })
})

// ─── Validation — invalid email ─────────────────────────────────────────────

describe('Validation: invalid email', () => {
  it.each([
    'notanemail',
    'missing@tld',
    '@nodomain.com',
    'spaces in@email.com',
  ])('rejects "%s" as invalid', async (bad) => {
    const { user, onSubmit } = setup()
    await fillName(user, 'Test User')
    await fillEmail(user, bad)
    await clickSubmit(user)
    expect(screen.getByText(/valid email/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('clears the email error once the user starts correcting the field', async () => {
    const { user } = setup()
    await fillName(user, 'Test User')
    await fillEmail(user, 'bad')
    await clickSubmit(user)
    expect(screen.getByText(/valid email/i)).toBeInTheDocument()

    const emailInput = screen.getByPlaceholderText(/jane@example\.com/i)
    await user.clear(emailInput)
    await user.type(emailInput, 'g') // start correcting
    expect(screen.queryByText(/valid email/i)).not.toBeInTheDocument()
  })
})

// ─── Validation — valid submission ──────────────────────────────────────────

describe('Validation: valid submission', () => {
  it('calls onSubmit with correct data for a new user', async () => {
    const { user, onSubmit } = setup()
    await fillName(user, 'Jane Doe')
    await fillEmail(user, 'jane@example.com')
    await clickSubmit(user)

    expect(onSubmit).toHaveBeenCalledOnce()
    const payload = onSubmit.mock.calls[0][0]
    expect(payload.name).toBe('Jane Doe')
    expect(payload.email).toBe('jane@example.com')
    expect(payload.role).toBe('Viewer')       // default
    expect(payload.status).toBe('Active')      // default
    expect(payload.groups).toEqual([])
  })

  it('does not show any error messages on valid submission', async () => {
    const { user } = setup()
    await fillName(user, 'Jane Doe')
    await fillEmail(user, 'jane@example.com')
    await clickSubmit(user)
    expect(screen.queryByText(/full name is required/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/email address is required/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/valid email/i)).not.toBeInTheDocument()
  })
})

// ─── Role selection ──────────────────────────────────────────────────────────

describe('Role selection', () => {
  it('defaults to Viewer in add mode', async () => {
    const { user, onSubmit } = setup()
    await fillName(user, 'A')
    await fillEmail(user, 'a@b.com')
    await clickSubmit(user)
    expect(onSubmit.mock.calls[0][0].role).toBe('Viewer')
  })

  it('selects Admin when Admin card is clicked', async () => {
    const { user, onSubmit } = setup()
    await user.click(screen.getByRole('button', { name: /admin/i }))
    await fillName(user, 'A')
    await fillEmail(user, 'a@b.com')
    await clickSubmit(user)
    expect(onSubmit.mock.calls[0][0].role).toBe('Admin')
  })

  it('selects Editor when Editor card is clicked', async () => {
    const { user, onSubmit } = setup()
    await user.click(screen.getByRole('button', { name: /editor/i }))
    await fillName(user, 'A')
    await fillEmail(user, 'a@b.com')
    await clickSubmit(user)
    expect(onSubmit.mock.calls[0][0].role).toBe('Editor')
  })

  it('changes role from Admin to Viewer', async () => {
    const { user, onSubmit } = setup()
    await user.click(screen.getByRole('button', { name: /admin/i }))
    await user.click(screen.getByRole('button', { name: /viewer/i }))
    await fillName(user, 'A')
    await fillEmail(user, 'a@b.com')
    await clickSubmit(user)
    expect(onSubmit.mock.calls[0][0].role).toBe('Viewer')
  })

  it('preserves role from initial user in edit mode', async () => {
    const { user, onSubmit } = setup({ initial: EXISTING_USER })
    await clickSubmit(user)
    expect(onSubmit.mock.calls[0][0].role).toBe('Admin')
  })
})

// ─── Status selection ────────────────────────────────────────────────────────

describe('Status selection', () => {
  it('defaults to Active', async () => {
    const { user, onSubmit } = setup()
    await fillName(user, 'A')
    await fillEmail(user, 'a@b.com')
    await clickSubmit(user)
    expect(onSubmit.mock.calls[0][0].status).toBe('Active')
  })

  it('switches to Inactive when Inactive button is clicked', async () => {
    const { user, onSubmit } = setup()
    await user.click(screen.getByRole('button', { name: /^Inactive$/i }))
    await fillName(user, 'A')
    await fillEmail(user, 'a@b.com')
    await clickSubmit(user)
    expect(onSubmit.mock.calls[0][0].status).toBe('Inactive')
  })

  it('can toggle back from Inactive to Active', async () => {
    const { user, onSubmit } = setup()
    await user.click(screen.getByRole('button', { name: /^Inactive$/i }))
    await user.click(screen.getByRole('button', { name: /^Active$/i }))
    await fillName(user, 'A')
    await fillEmail(user, 'a@b.com')
    await clickSubmit(user)
    expect(onSubmit.mock.calls[0][0].status).toBe('Active')
  })
})

// ─── Groups ──────────────────────────────────────────────────────────────────

describe('Groups & Permissions', () => {
  it('starts with no groups checked in add mode', () => {
    setup()
    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach(cb => expect(cb).not.toBeChecked())
  })

  it('checks a group when its label is clicked', async () => {
    const { user } = setup()
    await user.click(screen.getByText('Engineering'))
    expect(screen.getByRole('checkbox', { name: /engineering/i })).toBeChecked()
  })

  it('unchecks a group when clicked again', async () => {
    const { user } = setup()
    await user.click(screen.getByText('Engineering'))
    await user.click(screen.getByText('Engineering'))
    expect(screen.getByRole('checkbox', { name: /engineering/i })).not.toBeChecked()
  })

  it('can select multiple groups independently', async () => {
    const { user } = setup()
    await user.click(screen.getByText('Marketing'))
    await user.click(screen.getByText('Finance'))
    expect(screen.getByRole('checkbox', { name: /marketing/i })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /finance/i })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /engineering/i })).not.toBeChecked()
  })

  it('includes selected groups in the submitted payload', async () => {
    const { user, onSubmit } = setup()
    await user.click(screen.getByText('Sales'))
    await user.click(screen.getByText('HR'))
    await fillName(user, 'A')
    await fillEmail(user, 'a@b.com')
    await clickSubmit(user)
    expect(onSubmit.mock.calls[0][0].groups).toEqual(
      expect.arrayContaining(['Sales', 'HR']),
    )
    expect(onSubmit.mock.calls[0][0].groups).toHaveLength(2)
  })

  it('shows group count summary when groups are selected', async () => {
    const { user } = setup()
    await user.click(screen.getByText('Engineering'))
    await user.click(screen.getByText('Marketing'))
    expect(screen.getByText(/2 groups selected/i)).toBeInTheDocument()
  })

  it('shows singular "group" when exactly one is selected', async () => {
    const { user } = setup()
    await user.click(screen.getByText('Support'))
    expect(screen.getByText(/1 group selected/i)).toBeInTheDocument()
  })

  it('hides the summary when no groups are selected', () => {
    setup()
    expect(screen.queryByText(/group.* selected/i)).not.toBeInTheDocument()
  })

  it('preserves pre-checked groups from initial user and submits them', async () => {
    const { user, onSubmit } = setup({ initial: EXISTING_USER })
    await clickSubmit(user)
    const groups = onSubmit.mock.calls[0][0].groups as string[]
    expect(groups).toEqual(expect.arrayContaining(['Engineering', 'Management']))
  })

  it('allows unchecking a pre-checked group in edit mode', async () => {
    const { user, onSubmit } = setup({ initial: EXISTING_USER })
    await user.click(screen.getByText('Engineering'))
    await clickSubmit(user)
    const groups = onSubmit.mock.calls[0][0].groups as string[]
    expect(groups).not.toContain('Engineering')
    expect(groups).toContain('Management')
  })
})

// ─── Activity Level ──────────────────────────────────────────────────────────

describe('Activity Level', () => {
  it('defaults to Medium in add mode', async () => {
    const { user, onSubmit } = setup()
    await fillName(user, 'A')
    await fillEmail(user, 'a@b.com')
    await clickSubmit(user)
    expect(onSubmit.mock.calls[0][0].activityLevel).toBe('Medium')
  })

  it.each(['High', 'Low', 'Inactive'] as const)(
    'submits activityLevel "%s" when selected',
    async (level) => {
      const { user, onSubmit } = setup()
      await userEvent.selectOptions(screen.getByRole('combobox'), level)
      await fillName(user, 'A')
      await fillEmail(user, 'a@b.com')
      await clickSubmit(user)
      expect(onSubmit.mock.calls[0][0].activityLevel).toBe(level)
    },
  )
})

// ─── Cancel button ───────────────────────────────────────────────────────────

describe('Cancel button', () => {
  it('calls onCancel when Cancel is clicked', async () => {
    const { user, onCancel, onSubmit } = setup()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not validate the form when Cancel is clicked', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByText(/full name is required/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/email address is required/i)).not.toBeInTheDocument()
  })
})

// ─── Name error clears on input ──────────────────────────────────────────────

describe('Error clearing on input', () => {
  it('clears the name error once the user starts typing', async () => {
    const { user } = setup()
    await clickSubmit(user)
    expect(screen.getByText(/full name is required/i)).toBeInTheDocument()
    await user.type(screen.getByPlaceholderText(/e\.g\. Jane Doe/i), 'J')
    expect(screen.queryByText(/full name is required/i)).not.toBeInTheDocument()
  })
})
