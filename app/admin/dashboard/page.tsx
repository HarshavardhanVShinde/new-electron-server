import { checkAuth } from '../actions';
import { DashboardUI, LoginForm } from './DashboardClient';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

export const dynamic = 'force-dynamic';

let _convex: ConvexHttpClient | null = null;
function getConvex() {
  if (!_convex) {
    _convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  }
  return _convex;
}

export default async function AdminPage() {
    const isAuth = await checkAuth();

    if (!isAuth) {
        return <LoginForm />;
    }

    // Fetch licenses from Convex
    const licenses = await getConvex().query(api.licenses.getAllLicenses, {});

    return <DashboardUI licenses={licenses || []} />;
}
