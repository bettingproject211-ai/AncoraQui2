import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nzavyailzuzwrqyxhxwf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ql47psAg8RhzNSMmCrIfKA_34kvA9ZO';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);