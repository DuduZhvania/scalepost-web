import { NextResponse } from 'next/server';
import { db } from '@/db';
import { accounts } from '@/db/schema/media';

export async function GET() {
  try {
    console.log('Fetching accounts from database...');
    
    const allAccounts = await db
      .select()
      .from(accounts);
    
    console.log('Found accounts:', allAccounts.length);
    
    // Transform database accounts to match the frontend Account interface
    const transformedAccounts = allAccounts.map((account) => ({
      id: account.id,
      platform: account.platform as 'tiktok' | 'youtube' | 'instagram' | 'x',
      handle: account.accountHandle || `@${account.accountName}`,
      status: account.isActive ? 'active' as const : 'error' as const,
      group: 'Connected',
      tags: ['connected'],
      lastSync: account.updatedAt.toISOString(),
    }));
    
    return NextResponse.json({
      success: true,
      accounts: transformedAccounts
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}
