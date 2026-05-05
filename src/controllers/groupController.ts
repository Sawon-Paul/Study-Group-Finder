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

  const { data: group } = await supabase.from('study_groups').select(`*, courses (code, name)`).eq('id', groupId).single();
  if (!group) return null;

  const { data: members } = await supabase.from('group_members').select('user_id').eq('group_id', groupId);
  const userIds = members?.map(m => m.user_id) || [];
  const { data: profiles } = await supabase.from('profiles').select('id, name, department, skill_level').in('id', userIds);

  const { data: resources } = await supabase.from('group_resources').select('*').eq('group_id', groupId).order('created_at', { ascending: false });

  // Match the resource to the profile of the person who uploaded it!
  const resourcesWithUploaders = resources?.map(res => {
    const uploader = profiles?.find(p => p.id === res.user_id);
    return { ...res, uploaderName: uploader?.name || 'Unknown Student' };
  }) || [];

  const { data: requests } = await supabase.from('group_requests').select('id, user_id').eq('group_id', groupId);
  const reqUserIds = requests?.map(r => r.user_id) || [];
  const { data: reqProfiles } = await supabase.from('profiles').select('id, name, department').in('id', reqUserIds);

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

// --- NEW SERVER ACTIONS ---

export async function sendJoinRequest(groupId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    const { error } = await supabase.from('group_requests').insert({ 
      group_id: groupId, 
      user_id: user.id 
    });
    if (error) throw new Error(error.message);
  }
  
  // THIS IS THE FIX: Tells Next.js to throw away the old cached page
  revalidatePath(`/workspace/${groupId}`);
}

export async function resolveRequest(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const requestId = formData.get('requestId') as string;
  const userId = formData.get('userId') as string;
  const groupId = formData.get('groupId') as string;
  const action = formData.get('action') as string;

  if (action === 'approve') await supabase.from('group_members').insert({ group_id: groupId, user_id: userId });
  await supabase.from('group_requests').delete().eq('id', requestId);
  revalidatePath(`/workspace/${groupId}`); // Refreshes the page instantly
}

export async function addResource(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  const groupId = formData.get('groupId') as string;
  
  // Grab the physical file from the form
  const file = formData.get('file') as File;
  
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${groupId}/${fileName}`;

    // Upload the file to our new Supabase bucket
    const { error: uploadError } = await supabase.storage.from('resources').upload(filePath, file);
    
    if (!uploadError) {
      // Get the public URL for the file
      const { data } = supabase.storage.from('resources').getPublicUrl(filePath);
      
      // Save the record to the database
      await supabase.from('group_resources').insert({
        group_id: groupId, 
        user_id: user?.id, 
        title: file.name, // Use the actual file name
        url: data.publicUrl
      });
    }
  }
  revalidatePath(`/workspace/${groupId}`);
}
export async function reportUser(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('user_reports').insert({
    reporter_id: user?.id, reported_user_id: formData.get('reportedId'), group_id: formData.get('groupId')
  });
  revalidatePath(`/workspace/${formData.get('groupId')}`);
}