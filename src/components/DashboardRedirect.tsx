'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Check if this is a page refresh
        const isPageRefresh = sessionStorage.getItem('dashboardVisited');

        if (isPageRefresh) {
            // If user has visited before in this session and refreshed, redirect to home
            router.push('/');
        } else {
            // Mark that user has visited the dashboard in this session
            sessionStorage.setItem('dashboardVisited', 'true');
        }

        // Cleanup on unmount
        return () => {
            // Clear the flag when navigating away
            sessionStorage.removeItem('dashboardVisited');
        };
    }, [router]);

    return null;
}
