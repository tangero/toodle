// Enums
export type EnrollmentStatus = 'pending' | 'active' | 'paused' | 'stalled' | 'completed' | 'cancelled';
export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'overpaid' | 'underpaid';
export type DeliveryMode = 'on_click' | 'next_workday';
export type CourseStatus = 'draft' | 'published' | 'archived';

// DB Row types
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  verified_at: string | null;
  deleted_at: string | null;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  perex: string;
  description_md: string;
  author_name: string;
  price_czk: number;
  lesson_count: number;
  delivery_mode: DeliveryMode;
  status: CourseStatus;
  welcome_email_md: string;
  completion_email_md: string;
  created_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  position: number;
  title: string;
  content_md: string;
  reading_minutes: number;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: EnrollmentStatus;
  current_lesson: number;
  next_send_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  score: number | null;
}

export interface Order {
  id: string;
  user_id: string;
  course_id: string;
  enrollment_id: string | null;
  vs: string;
  amount_czk: number;
  status: OrderStatus;
  created_at: string;
  paid_at: string | null;
  expires_at: string | null;
}

export interface Payment {
  id: string;
  fio_transaction_id: string;
  vs: string;
  amount_czk: number;
  received_at: string;
  matched_order_id: string | null;
  note: string | null;
}

export interface EmailLog {
  id: string;
  enrollment_id: string | null;
  lesson_id: string | null;
  template: string;
  sent_at: string;
  resend_id: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
}

export interface Test {
  id: string;
  course_id: string;
  questions_json: string;
}

export interface TestQuestion {
  id: string;
  type: 'multiple_choice' | 'open_ended';
  question: string;
  options?: { id: string; text: string }[];
  correct_option_id?: string;
  max_points: number;
}

export interface TestAttempt {
  id: string;
  enrollment_id: string;
  answers_json: string;
  score: number | null;
  feedback_json: string | null;
  llm_evaluation_raw: string | null;
  completed_at: string;
}

export interface Certificate {
  id: string;
  enrollment_id: string;
  public_id: string;
  issued_at: string;
  pdf_r2_key: string;
}

export interface MagicLink {
  token: string;
  user_id: string;
  expires_at: string;
  used_at: string | null;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string | null;
  payload_json: string | null;
  created_at: string;
}
