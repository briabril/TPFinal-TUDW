import { Home } from "lucide-react"

export interface NavItem {
  id: string
  label: string
  icon: typeof Home
  onClick?: () => void
  expandable?: boolean
  section?: string
  roles?: string[]
  path?: string 
}