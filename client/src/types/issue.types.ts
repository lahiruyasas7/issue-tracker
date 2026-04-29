export type IssueStatus   = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type IssueSeverity = 'MINOR' | 'MAJOR' | 'CRITICAL'

export interface IssueUser {
  id:    number
  name:  string
  email: string
}

export interface Issue {
  id:          number
  title:       string
  description: string
  status:      IssueStatus
  priority:    IssuePriority
  severity:    IssueSeverity | null
  createdAt:   string
  updatedAt:   string
  createdBy:   IssueUser
  assignedTo:  IssueUser | null
}

export interface Pagination {
  total:       number
  page:        number
  limit:       number
  totalPages:  number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface StatusCounts {
  OPEN:        number
  IN_PROGRESS: number
  RESOLVED:    number
  CLOSED:      number
}

export interface GetIssuesResponse {
  success:      boolean
  data:         Issue[]
  pagination:   Pagination
  statusCounts: StatusCounts
}

export interface IssueFilters {
  page?:         number
  limit?:        number
  status?:       IssueStatus | ''
  priority?:     IssuePriority | ''
  severity?:     IssueSeverity | ''
  search?:       string
  sortBy?:       'createdAt' | 'updatedAt' | 'priority' | 'status'
  sortOrder?:    'asc' | 'desc'
  assignedToMe?: boolean
}