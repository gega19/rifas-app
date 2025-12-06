/**
 * Migration script: KV Store to Prisma
 * 
 * This script migrates data from the old KV store (kv_store_6e73431f table)
 * to the new Prisma schema (Reference, Participant, Ticket models)
 * 
 * Usage: npx tsx prisma/migrate-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import prisma from '../src/lib/prisma';

// Supabase configuration - adjust these values
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface KVStoreData {
  key: string;
  value: any;
}

interface ReferenceData {
  ticketCount: number;
  used: boolean;
  usedAt?: string;
}

interface ParticipantData {
  reference: string;
  name: string;
  phone: string;
  email: string;
  cedula: string;
  tickets: string[];
  generatedAt: string;
}

async function migrateData() {
  console.log('🚀 Starting data migration from KV Store to Prisma...\n');

  try {
    // Step 1: Read all data from KV store
    console.log('📖 Reading data from KV store...');
    const { data: kvData, error: kvError } = await supabase
      .from('kv_store_6e73431f')
      .select('key, value');

    if (kvError) {
      throw new Error(`Error reading KV store: ${kvError.message}`);
    }

    if (!kvData || kvData.length === 0) {
      console.log('⚠️  No data found in KV store. Nothing to migrate.');
      return;
    }

    console.log(`✅ Found ${kvData.length} entries in KV store\n`);

    // Step 2: Process references
    console.log('🔄 Processing references...');
    const references: Array<{ ref: string; data: ReferenceData }> = [];
    const participants: Array<{ ref: string; data: ParticipantData }> = [];
    const usedTickets: Set<string> = new Set();

    for (const item of kvData) {
      const key = item.key;
      const value = item.value;

      if (key.startsWith('ref:')) {
        const ref = key.replace('ref:', '');
        references.push({ ref, data: value as ReferenceData });
      } else if (key.startsWith('participant:')) {
        const ref = key.replace('participant:', '');
        participants.push({ ref, data: value as ParticipantData });
      } else if (key === 'used_tickets' && value.tickets) {
        value.tickets.forEach((ticket: string) => usedTickets.add(ticket));
      }
    }

    console.log(`   Found ${references.length} references`);
    console.log(`   Found ${participants.length} participants`);
    console.log(`   Found ${usedTickets.size} used tickets\n`);

    // Step 3: Migrate references
    console.log('💾 Migrating references to Prisma...');
    let referencesMigrated = 0;
    let referencesSkipped = 0;

    for (const { ref, data } of references) {
      try {
        await prisma.reference.upsert({
          where: { reference: ref },
          update: {
            ticketCount: data.ticketCount || 5,
            used: data.used || false,
            usedAt: data.usedAt ? new Date(data.usedAt) : null,
          },
          create: {
            reference: ref,
            ticketCount: data.ticketCount || 5,
            used: data.used || false,
            usedAt: data.usedAt ? new Date(data.usedAt) : null,
          },
        });
        referencesMigrated++;
      } catch (error) {
        console.error(`   ⚠️  Error migrating reference ${ref}:`, error);
        referencesSkipped++;
      }
    }

    console.log(`   ✅ Migrated ${referencesMigrated} references`);
    if (referencesSkipped > 0) {
      console.log(`   ⚠️  Skipped ${referencesSkipped} references due to errors\n`);
    }

    // Step 4: Migrate participants
    console.log('💾 Migrating participants to Prisma...');
    let participantsMigrated = 0;
    let participantsSkipped = 0;

    for (const { ref, data } of participants) {
      try {
        // Ensure reference exists first
        await prisma.reference.upsert({
          where: { reference: ref },
          update: {},
          create: {
            reference: ref,
            ticketCount: 5,
            used: true,
            usedAt: data.generatedAt ? new Date(data.generatedAt) : new Date(),
          },
        });

        await prisma.participant.upsert({
          where: { referenceId: ref },
          update: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            cedula: data.cedula,
            tickets: data.tickets || [],
            generatedAt: data.generatedAt ? new Date(data.generatedAt) : new Date(),
          },
          create: {
            referenceId: ref,
            name: data.name,
            email: data.email,
            phone: data.phone,
            cedula: data.cedula,
            tickets: data.tickets || [],
            generatedAt: data.generatedAt ? new Date(data.generatedAt) : new Date(),
          },
        });
        participantsMigrated++;
      } catch (error) {
        console.error(`   ⚠️  Error migrating participant ${ref}:`, error);
        participantsSkipped++;
      }
    }

    console.log(`   ✅ Migrated ${participantsMigrated} participants`);
    if (participantsSkipped > 0) {
      console.log(`   ⚠️  Skipped ${participantsSkipped} participants due to errors\n`);
    }

    // Step 5: Migrate tickets
    console.log('💾 Migrating tickets to Prisma...');
    let ticketsMigrated = 0;
    let ticketsSkipped = 0;

    for (const ticketNumber of usedTickets) {
      try {
        await prisma.ticket.upsert({
          where: { number: ticketNumber },
          update: { used: true },
          create: {
            number: ticketNumber,
            used: true,
          },
        });
        ticketsMigrated++;
      } catch (error) {
        console.error(`   ⚠️  Error migrating ticket ${ticketNumber}:`, error);
        ticketsSkipped++;
      }
    }

    console.log(`   ✅ Migrated ${ticketsMigrated} tickets`);
    if (ticketsSkipped > 0) {
      console.log(`   ⚠️  Skipped ${ticketsSkipped} tickets due to errors\n`);
    }

    // Step 6: Verification
    console.log('🔍 Verifying migration...');
    const refCount = await prisma.reference.count();
    const participantCount = await prisma.participant.count();
    const ticketCount = await prisma.ticket.count();

    console.log(`   References in Prisma: ${refCount}`);
    console.log(`   Participants in Prisma: ${participantCount}`);
    console.log(`   Tickets in Prisma: ${ticketCount}\n`);

    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - References: ${referencesMigrated} migrated`);
    console.log(`   - Participants: ${participantsMigrated} migrated`);
    console.log(`   - Tickets: ${ticketsMigrated} migrated`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateData()
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });




