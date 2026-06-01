"use client";

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from './navbar';
import Footer from './footer';
import { prefetchPortfolioData } from '@/lib/dataCache';

// Fire prefetch at MODULE LOAD TIME — before React even renders the first frame.
// This means data fetch starts the instant this bundle is parsed, not after mount.
if (typeof window !== 'undefined') {
  prefetchPortfolioData();
}

export function LayoutWrapper({ children }) {
    const pathname = usePathname();
    const isAdmin  = pathname?.startsWith('/admin');

    // Secondary trigger: re-fire if navigating to a non-admin page in the same session
    useEffect(() => {
        if (!isAdmin) prefetchPortfolioData();
    }, [isAdmin]);

    return (
        <>
            {!isAdmin && <Navbar />}
            <div className={isAdmin ? "" : ""}>
                {children}
            </div>
            {!isAdmin && <Footer />}
        </>
    );
}
