// src/controllers/groupController.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { StudyGroup } from '@/models/group'
import { Course } from '@/models/course'

// 1. Fetches specific course details
export async function getCourseDetails(courseId: string): Promise<Course | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();
    
  if (error) return null;
  return data as Course;
}

// 2. Fetches all study groups linked to a specific course
export async function getGroupsByCourse(courseId: string): Promise<StudyGroup[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data, error } = await supabase
    .from('study_groups')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching groups:", error.message);
    return [];
  }
  
  return data as StudyGroup[];
}

// 3. Allows the current user to join a group
export async function joinGroup(groupId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, user_id: user.id });

  if (error) throw new Error(error.message);
  return { success: true };
}

// 4. Checks if the current user is already in a specific group
export async function checkMembership(groupId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single();

  return !!data;
}

// 5. Fetches all groups the current user has joined (for the Dashboard)
export async function getUserGroups() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('group_members')
    .select(`
      group_id,
      study_groups (
        name,
        location_preference,
        courses (
          code
        )
      )
    `)
    .eq('user_id', user.id);

  if (error) {
    console.error("Failed to fetch user groups:", error.message);
    return [];
  }

  return data;
}

// 6. Fetches everything needed for the Workspace (Group details + Member profiles)
export async function getGroupWorkspaceData(groupId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get the Group and Course Info
  const { data: group, error: groupError } = await supabase
    .from('study_groups')
    .select(`*, courses (code, name)`)
    .eq('id', groupId)
    .single();

  if (groupError || !group) return null;

  // Get the IDs of everyone who joined this group
  const { data: members } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId);

  const userIds = members?.map(m => m.user_id) || [];

  // Fetch the public profiles of those specific users
  const { data: profiles } = await supabase
    .from('profiles')
    .select('name, department, skill_level')
    .in('id', userIds);

  // Combine it all together
  return {
    ...group,
    memberProfiles: profiles || []
  };
}