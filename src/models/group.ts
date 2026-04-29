// src/models/group.ts

export type GroupType = 'Open' | 'Private';
export type LocationPreference = 'Library' | 'Cafeteria' | 'Study Room' | 'Online';

export interface StudyGroup {
  id: string;
  course_id: string;
  name: string;
  type: GroupType;
  location_preference: LocationPreference;
  created_at?: string;
}