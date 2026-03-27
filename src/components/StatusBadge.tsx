import type { Status } from '../types/user'

interface Props {
  status: Status
}

export default function StatusBadge({ status }: Props) {
  const styles =
    status === 'Active'
      ? 'bg-green-100 text-green-700 ring-green-200'
      : 'bg-red-100 text-red-600 ring-red-200'

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-green-500' : 'bg-red-400'}`} />
      {status}
    </span>
  )
}
