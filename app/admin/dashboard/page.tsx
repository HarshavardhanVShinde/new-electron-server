import { checkAuth } from '../actions';
import { DashboardUI, LoginForm } from './DashboardClient';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const isAuth = await checkAuth();

    if (!isAuth) {
        return <LoginForm />;
    }

    // Fetch licenses
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Note: Using service key here because RLS might block reading 'licenses' for anon
    const { data: licenses } = await supabase
        .from('licenses')
        .select('*')
        .order('created_at', { ascending: false });

    return <DashboardUI licenses={licenses || []} />;
}
