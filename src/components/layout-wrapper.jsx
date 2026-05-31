"use client";

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from './navbar';
import Footer from './footer';
import { prefetchPortfolioData } from '@/lib/dataCache';

export function LayoutWrapper({ children }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    // Kick off parallel data fetch immediately on page load (non-admin only)
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
