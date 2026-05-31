import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const response = await fetch('https://dummyjson.com/quotes/random', {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data && data.quote) {
            return NextResponse.json(data);
        } else {
            throw new Error("Invalid response format");
        }
    } catch (error) {
        console.error("Quotes API Error:", error);
        return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 });
    }
}
