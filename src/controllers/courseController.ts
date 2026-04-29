// src/controllers/courseController.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { Course } from '@/models/course'

export async function getAvailableCourses(): Promise<Course[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('code'); // Alphabetical order by course code

  if (error) {
    console.error("Error fetching courses:", error.message);
    return [];
  }

  return data as Course[];
}