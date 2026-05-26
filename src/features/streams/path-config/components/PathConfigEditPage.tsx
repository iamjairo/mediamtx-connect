import { notFound } from 'next/navigation'

import { getPathConfig } from '../actions/getPathConfig'
import { PathConfigForm } from './PathConfigForm'

export async function PathConfigEditPage({ name }: { name: string }) {
  const path = await getPathConfig(name)
  if (!path) {
    notFound()
  }
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{name}</h2>
      <PathConfigForm mode="edit" defaultName={name} defaultValues={path} />
    </div>
  )
}
