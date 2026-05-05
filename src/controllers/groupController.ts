// src/controllers/groupController.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache' // Needed to refresh pages after actions
import { StudyGroup } from '@/models/group'
import { Course } from '@/models/course'

export async function getCourseDetails(courseId: string): Promise<Course | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single();
  return error ? null : data as Course;
}

export async function getGroupsByCourse(courseId: string): Promise<StudyGroup[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.from('study_groups').select('*').eq('course_id', courseId).order('created_at', { ascending: false });
  return error ? [] : data as StudyGroup[];
}

export async function joinGroup(groupId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase.from('group_members').insert({ group_id: groupId, user_id: user.id });
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function checkMembership(groupId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { isMember: false, isPending: false };

  const { data: member } = await supabase.from('group_members').select('*').eq('group_id', groupId).eq('user_id', user.id).single();
  const { data: request } = await supabase.from('group_requests').select('*').eq('group_id', groupId).eq('user_id', user.id).single();

  return { isMember: !!member, isPending: !!request };
}

export async function getUserGroups() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from('group_members').select(`group_id, study_groups (name, location_preference, courses (code))`).eq('user_id', user.id);
  return data || [];
}

// UPGRADED: Now fetches Resources and Pending Requests too!
export async function getGroupWorkspaceData(groupId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // SPEED FIX: Fetch the Group, Members, Resources, and Requests at the EXACT SAME TIME
  const [
    { data: group },
    { data: members },
    { data: resources },
    { data: requests }
  ] = await Promise.all([
    supabase.from('study_groups').select(`*, courses (code, name)`).eq('id', groupId).single(),
    supabase.from('group_members').select('user_id').eq('group_id', groupId),
    supabase.from('group_resources').select('*').eq('group_id', groupId).order('created_at', { ascending: false }),
    supabase.from('group_requests').select('id, user_id').eq('group_id', groupId)
  ]);

  if (!group) return null;

  // Now fetch profiles for the members and requesters
  const userIds = members?.map(m => m.user_id) || [];
  const reqUserIds = requests?.map(r => r.user_id) || [];
  
  const [ { data: profiles }, { data: reqProfiles } ] = await Promise.all([
    supabase.from('profiles').select('id, name, department, skill_level').in('id', userIds),
    supabase.from('profiles').select('id, name, department').in('id', reqUserIds)
  ]);

  const resourcesWithUploaders = resources?.map(res => {
    const uploader = profiles?.find(p => p.id === res.user_id);
    return { ...res, uploaderName: uploader?.name || 'Unknown Student' };
  }) || [];

  const pendingRequests = requests?.map(req => ({
    requestId: req.id, userId: req.user_id, profile: reqProfiles?.find(p => p.id === req.user_id)
  })) || [];

  return { 
    ...group, 
    memberProfiles: profiles || [], 
    resources: resourcesWithUploaders, 
    pendingRequests, 
    currentUserId: currentUser?.id 
  };
}

// ... keep addResource, resolveRequest, reportUser as they are ...

// NEW: Delete a resource and the physical file
export async function deleteResource(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const resourceId = formData.get('resourceId') as string;
  const fileUrl = formData.get('fileUrl') as string;
  const groupId = formData.get('groupId') as string;

  // 1. Extract the file path from the URL so we can delete the physical file
  const urlParts = fileUrl.split('/resources/');
  if (urlParts.length > 1) {
    const filePath = urlParts[1];
    await supabase.storage.from('resources').remove([filePath]);
  }

  // 2. Delete the record from the database
  await supabase.from('group_resources').delete().eq('id', resourceId);
  
  // 3. Refresh the page
  revalidatePath(`/workspace/${groupId}`);
}