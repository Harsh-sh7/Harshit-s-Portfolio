"use client";

import { usePathname } from 'next/navigation';
import Navbar from './navbar';
import Footer from './footer';

export function LayoutWrapper({ children }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

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
