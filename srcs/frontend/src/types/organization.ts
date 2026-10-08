export interface Organization {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  joined_at: string;
}
