/* ─── TypeScript Interfaces for TaskFlow ─── */

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'ADMIN' | 'MEMBER';
  avatar: string | null;
  phone?: string;
  bio?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: AuthTokens;
  };
}

export interface Team {
  id: string;
  name: string;
  description: string;
  owner: User;
  avatar: string | null;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface TeamDetail extends Team {
  members: TeamMembership[];
  task_count: number;
}

export interface TeamMembership {
  id: string;
  user: User;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joined_at: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  title: string;
  description: string;
  team: string;
  team_name: string;
  assignee: User | null;
  assignee_id?: string | null;
  creator: User;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string | null;
  tags: string;
  tag_list: string[];
  order: number;
  is_overdue: boolean;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface TaskDetail extends Task {
  comments: Comment[];
}

export interface Comment {
  id: string;
  task: string;
  author: User;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user: User;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, string>;
  timestamp: string;
}

export interface DashboardStats {
  total_tasks: number;
  completed_tasks: number;
  in_progress: number;
  todo: number;
  in_review: number;
  overdue: number;
  my_tasks: number;
  my_completed: number;
  completion_rate: number;
  total_teams: number;
}

export interface StatusDistribution {
  status: TaskStatus;
  count: number;
}

export interface PriorityDistribution {
  priority: TaskPriority;
  count: number;
}

export interface ProductivityData {
  completed: { date: string; count: number }[];
  created: { date: string; count: number }[];
}

export interface TeamProductivity {
  id: string;
  name: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  member_count: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
