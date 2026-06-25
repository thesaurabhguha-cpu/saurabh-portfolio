export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  industry: string;
  plan: "Free" | "Pro" | "Enterprise";
  health_score: number;
  last_login_date: string;
  mrr: number;
  arr: number;
  churn_risk: "High" | "Medium" | "Low";
  login_frequency_drop: boolean;
  feature_usage_drop: boolean;
  support_ticket_spike: boolean;
  payment_delay: boolean;
  nps_score: number;
  manual_override: boolean;
  created_at: string;
}
