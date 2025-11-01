/**
 * FILE: src/lib/db/seed.ts
 *
 * PURPOSE:
 * - Populate database with realistic test data
 * - Create sample events, participants, speakers, sponsors
 * - Generate deadlines, budget items, and agenda
 *
 * USAGE:
 * Run with: npx tsx src/lib/db/seed.ts
 * Or add to package.json: "db:seed": "tsx src/lib/db/seed.ts"
 *
 * DATA CREATED:
 * - 4 Events (different statuses: draft, planning, open, ongoing)
 * - 15 Participants across events
 * - 4 Speakers
 * - 2 Sponsors
 * - 8 Deadlines (mix of urgent, upcoming, completed)
 * - Budget categories and items
 * - Agenda sessions
 */

import { db } from './index'
import {
  agenda,
  budgetCategories,
  budgetItems,
  deadlines,
  events,
  participants,
  services,
  speakers,
  sponsors,
} from './schema'

async function seed() {
  console.log('🌱 Starting database seed...\n')

  try {
    // ========================================================================
    // EVENTS
    // ========================================================================
    console.log('📅 Creating events...')

    const event1 = await db
      .insert(events)
      .values({
        title: 'Tech Summit 2024',
        description:
          "Il più grande evento tech dell'anno con speaker internazionali e workshop pratici.",
        tagline: 'Innovazione, networking e futuro',
        startDate: new Date('2024-12-15'),
        endDate: new Date('2024-12-17'),
        registrationOpenDate: new Date('2024-10-01'),
        registrationCloseDate: new Date('2024-12-10'),
        location: 'Milano Convention Center',
        venue: 'MiCo',
        address: 'Via Gattamelata 5',
        city: 'Milano',
        country: 'Italia',
        maxParticipants: 500,
        currentParticipants: 247,
        status: 'open',
        isPublic: true,
        requiresApproval: false,
        totalBudget: 150000,
        currentSpent: 87500,
        priority: 'high',
        category: 'Conferenza',
        tags: JSON.stringify(['tech', 'innovation', 'networking']),
      })
      .returning()

    const event2 = await db
      .insert(events)
      .values({
        title: 'Workshop AI & Machine Learning',
        description:
          'Workshop intensivo di 2 giorni su intelligenza artificiale e machine learning applicati.',
        tagline: 'Impara facendo',
        startDate: new Date('2024-11-20'),
        endDate: new Date('2024-11-21'),
        registrationOpenDate: new Date('2024-09-15'),
        registrationCloseDate: new Date('2024-11-15'),
        location: 'Roma Tech Hub',
        venue: 'Innovation Lab',
        address: 'Via Nazionale 184',
        city: 'Roma',
        country: 'Italia',
        maxParticipants: 50,
        currentParticipants: 42,
        status: 'ongoing',
        isPublic: true,
        requiresApproval: true,
        totalBudget: 25000,
        currentSpent: 19800,
        priority: 'urgent',
        category: 'Workshop',
        tags: JSON.stringify(['AI', 'machine-learning', 'hands-on']),
      })
      .returning()

    const event3 = await db
      .insert(events)
      .values({
        title: 'Digital Marketing Conference',
        description:
          'Strategie di marketing digitale per il 2025: SEO, social media, content marketing.',
        startDate: new Date('2025-01-25'),
        endDate: new Date('2025-01-26'),
        registrationOpenDate: new Date('2024-11-01'),
        registrationCloseDate: new Date('2025-01-20'),
        location: 'Torino Congress Center',
        venue: 'Lingotto Fiere',
        address: 'Via Nizza 280',
        city: 'Torino',
        country: 'Italia',
        maxParticipants: 300,
        currentParticipants: 0,
        status: 'planning',
        isPublic: true,
        requiresApproval: false,
        totalBudget: 80000,
        currentSpent: 12000,
        priority: 'medium',
        category: 'Conferenza',
        tags: JSON.stringify(['marketing', 'digital', 'strategy']),
      })
      .returning()

    const event4 = await db
      .insert(events)
      .values({
        title: 'Startup Pitch Night',
        description: 'Serata di networking con pitch di startup innovative e panel di investitori.',
        startDate: new Date('2025-02-10'),
        endDate: new Date('2025-02-10'),
        location: 'Napoli Startup Hub',
        venue: 'Coworking Innovation',
        address: 'Via Toledo 256',
        city: 'Napoli',
        country: 'Italia',
        maxParticipants: 150,
        currentParticipants: 0,
        status: 'draft',
        isPublic: false,
        requiresApproval: true,
        totalBudget: 15000,
        currentSpent: 0,
        priority: 'low',
        category: 'Networking',
        tags: JSON.stringify(['startup', 'pitch', 'investment']),
      })
      .returning()

    console.log(`✅ Created ${[event1, event2, event3, event4].length} events\n`)

    // ========================================================================
    // PARTICIPANTS
    // ========================================================================
    console.log('👥 Creating participants...')

    const participantsList = [
      // Tech Summit participants
      {
        eventId: event1[0].id,
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario.rossi@email.com',
        company: 'TechCorp',
        jobTitle: 'CEO',
        ticketType: 'VIP',
        ticketPrice: 499,
        paymentStatus: 'paid',
        registrationStatus: 'confirmed',
        checkedIn: false,
      },
      {
        eventId: event1[0].id,
        firstName: 'Laura',
        lastName: 'Bianchi',
        email: 'laura.bianchi@email.com',
        company: 'StartupX',
        jobTitle: 'CTO',
        ticketType: 'Standard',
        ticketPrice: 299,
        paymentStatus: 'paid',
        registrationStatus: 'confirmed',
        checkedIn: false,
      },
      {
        eventId: event1[0].id,
        firstName: 'Giovanni',
        lastName: 'Verdi',
        email: 'giovanni.verdi@email.com',
        company: 'Innovation Labs',
        jobTitle: 'Developer',
        ticketType: 'Standard',
        ticketPrice: 299,
        paymentStatus: 'pending',
        registrationStatus: 'pending',
        checkedIn: false,
      },
      {
        eventId: event1[0].id,
        firstName: 'Francesca',
        lastName: 'Neri',
        email: 'francesca.neri@email.com',
        company: 'Digital Agency',
        jobTitle: 'Marketing Manager',
        ticketType: 'Standard',
        ticketPrice: 299,
        paymentStatus: 'paid',
        registrationStatus: 'confirmed',
        checkedIn: false,
      },
      {
        eventId: event1[0].id,
        firstName: 'Alessandro',
        lastName: 'Russo',
        email: 'alessandro.russo@email.com',
        company: 'AI Solutions',
        jobTitle: 'Data Scientist',
        ticketType: 'VIP',
        ticketPrice: 499,
        paymentStatus: 'paid',
        registrationStatus: 'confirmed',
        checkedIn: false,
      },

      // Workshop AI participants
      {
        eventId: event2[0].id,
        firstName: 'Sofia',
        lastName: 'Colombo',
        email: 'sofia.colombo@email.com',
        company: 'ML Research',
        jobTitle: 'Research Scientist',
        ticketType: 'Standard',
        ticketPrice: 599,
        paymentStatus: 'paid',
        registrationStatus: 'confirmed',
        checkedIn: true,
      },
      {
        eventId: event2[0].id,
        firstName: 'Marco',
        lastName: 'Ferrari',
        email: 'marco.ferrari@email.com',
        company: 'DataTech',
        jobTitle: 'ML Engineer',
        ticketType: 'Standard',
        ticketPrice: 599,
        paymentStatus: 'paid',
        registrationStatus: 'confirmed',
        checkedIn: true,
      },
      {
        eventId: event2[0].id,
        firstName: 'Giulia',
        lastName: 'Romano',
        email: 'giulia.romano@email.com',
        company: 'AI Startup',
        jobTitle: 'Product Manager',
        ticketType: 'Standard',
        ticketPrice: 599,
        paymentStatus: 'paid',
        registrationStatus: 'confirmed',
        checkedIn: false,
      },
      {
        eventId: event2[0].id,
        firstName: 'Luca',
        lastName: 'Marino',
        email: 'luca.marino@email.com',
        company: 'Tech University',
        jobTitle: 'Student',
        ticketType: 'Student',
        ticketPrice: 299,
        paymentStatus: 'paid',
        registrationStatus: 'confirmed',
        checkedIn: true,
      },

      // Marketing Conference participants
      {
        eventId: event3[0].id,
        firstName: 'Elena',
        lastName: 'Gallo',
        email: 'elena.gallo@email.com',
        company: 'Marketing Pro',
        jobTitle: 'CMO',
        ticketType: 'VIP',
        ticketPrice: 399,
        paymentStatus: 'pending',
        registrationStatus: 'pending',
        checkedIn: false,
      },
    ]

    for (const p of participantsList) {
      await db.insert(participants).values(p)
    }

    console.log(`✅ Created ${participantsList.length} participants\n`)

    // ========================================================================
    // SPEAKERS
    // ========================================================================
    console.log('🎤 Creating speakers...')

    const speakersList = [
      {
        eventId: event1[0].id,
        firstName: 'Dr. Anna',
        lastName: 'Techini',
        email: 'anna.techini@speaker.com',
        phone: '+39 333 1234567',
        title: 'Dr.',
        company: 'MIT',
        jobTitle: 'Professor of Computer Science',
        bio: 'Esperta internazionale di AI con 20+ anni di esperienza. Ha lavorato con Google, Microsoft e startup innovative.',
        sessionTitle: 'The Future of Artificial Intelligence',
        sessionDescription: 'Una panoramica sulle tendenze AI per i prossimi 5 anni',
        sessionDate: new Date('2024-12-15T10:00:00'),
        sessionDuration: 60,
        confirmationStatus: 'confirmed',
        travelRequired: true,
        accommodationRequired: true,
        fee: 5000,
      },
      {
        eventId: event1[0].id,
        firstName: 'Marco',
        lastName: 'Sviluppatori',
        email: 'marco.svil@speaker.com',
        company: 'Google',
        jobTitle: 'Senior Software Engineer',
        bio: 'Lead developer di progetti open source e contributor attivo nella community tech.',
        sessionTitle: 'Building Scalable Applications',
        sessionDescription: 'Best practices per applicazioni scalabili e performanti',
        sessionDate: new Date('2024-12-15T14:30:00'),
        sessionDuration: 90,
        confirmationStatus: 'confirmed',
        travelRequired: false,
        accommodationRequired: false,
        fee: 2500,
      },
      {
        eventId: event2[0].id,
        firstName: 'Prof. Luigi',
        lastName: 'Datini',
        email: 'luigi.datini@speaker.com',
        title: 'Prof.',
        company: 'Politecnico di Milano',
        jobTitle: 'Machine Learning Researcher',
        bio: 'Ricercatore specializzato in deep learning e computer vision.',
        sessionTitle: 'Practical Machine Learning',
        sessionDescription: 'Workshop hands-on su ML applicato a casi reali',
        sessionDate: new Date('2024-11-20T09:00:00'),
        sessionDuration: 240,
        confirmationStatus: 'confirmed',
        travelRequired: false,
        accommodationRequired: false,
        fee: 3000,
      },
      {
        eventId: event3[0].id,
        firstName: 'Sara',
        lastName: 'Marketini',
        email: 'sara.market@speaker.com',
        company: 'HubSpot',
        jobTitle: 'VP of Marketing',
        bio: 'Esperta di digital marketing strategy con focus su growth hacking e content marketing.',
        sessionTitle: 'Digital Marketing Trends 2025',
        sessionDescription: 'Le strategie che funzioneranno nel prossimo anno',
        sessionDate: new Date('2025-01-25T11:00:00'),
        sessionDuration: 75,
        confirmationStatus: 'tentative',
        travelRequired: true,
        accommodationRequired: true,
        fee: 4000,
      },
    ]

    for (const s of speakersList) {
      await db.insert(speakers).values(s)
    }

    console.log(`✅ Created ${speakersList.length} speakers\n`)

    // ========================================================================
    // SPONSORS
    // ========================================================================
    console.log('🏢 Creating sponsors...')

    const sponsorsList = [
      {
        eventId: event1[0].id,
        companyName: 'TechGiant Corp',
        contactPerson: 'Roberto Sponsorini',
        email: 'roberto@techgiant.com',
        phone: '+39 02 12345678',
        sponsorshipLevel: 'platinum',
        sponsorshipAmount: 50000,
        contractSigned: true,
        contractDate: new Date('2024-09-01'),
        paymentStatus: 'paid',
        paymentDate: new Date('2024-09-15'),
        boothSpace: true,
        speakingSlot: true,
        freeTickets: 10,
      },
      {
        eventId: event1[0].id,
        companyName: 'Innovation Labs',
        contactPerson: 'Maria Sponsoretti',
        email: 'maria@innovationlabs.com',
        phone: '+39 02 87654321',
        sponsorshipLevel: 'gold',
        sponsorshipAmount: 25000,
        contractSigned: true,
        contractDate: new Date('2024-09-20'),
        paymentStatus: 'paid',
        paymentDate: new Date('2024-10-01'),
        boothSpace: true,
        speakingSlot: false,
        freeTickets: 5,
      },
    ]

    for (const sp of sponsorsList) {
      await db.insert(sponsors).values(sp)
    }

    console.log(`✅ Created ${sponsorsList.length} sponsors\n`)

    // ========================================================================
    // DEADLINES
    // ========================================================================
    console.log('⏰ Creating deadlines...')

    const now = new Date()
    const deadlinesList = [
      // URGENT - Next 3 days
      {
        eventId: event1[0].id,
        title: 'Conferma sponsor Platinum',
        description: 'Finalizzare contratto con TechGiant Corp',
        dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // +2 giorni
        priority: 'urgent',
        status: 'in_progress',
        assignedTo: 'Mario Rossi',
        category: 'Finance',
      },
      {
        eventId: event2[0].id,
        title: 'Setup sala workshop',
        description: 'Preparare attrezzatura tecnica e materiali',
        dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // +1 giorno
        priority: 'urgent',
        status: 'pending',
        assignedTo: 'Laura Bianchi',
        category: 'Logistics',
      },
      // HIGH - Next 5 days
      {
        eventId: event1[0].id,
        title: 'Email reminder partecipanti',
        description: 'Inviare email con dettagli logistici evento',
        dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // +5 giorni
        priority: 'high',
        status: 'pending',
        assignedTo: 'Giovanni Verdi',
        category: 'Marketing',
      },
      {
        eventId: event3[0].id,
        title: 'Conferma venue',
        description: 'Firmare contratto con Lingotto Fiere',
        dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // +4 giorni
        priority: 'high',
        status: 'pending',
        assignedTo: 'Francesca Neri',
        category: 'Logistics',
      },
      // MEDIUM - Next 2 weeks
      {
        eventId: event1[0].id,
        title: 'Preparare badge partecipanti',
        description: 'Stampare e organizzare badge per check-in',
        dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // +10 giorni
        priority: 'medium',
        status: 'pending',
        assignedTo: 'Alessandro Russo',
        category: 'Logistics',
      },
      // COMPLETED
      {
        eventId: event2[0].id,
        title: 'Conferma speaker',
        description: 'Ricevere conferma da Prof. Datini',
        dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // -5 giorni (passato)
        priority: 'high',
        status: 'completed',
        completedDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        assignedTo: 'Sofia Colombo',
        category: 'Content',
      },
      // OVERDUE
      {
        eventId: event3[0].id,
        title: 'Approvazione budget',
        description: 'Ottenere approvazione finale dal management',
        dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // -2 giorni (OVERDUE!)
        priority: 'urgent',
        status: 'pending',
        assignedTo: 'Marco Ferrari',
        category: 'Finance',
      },
      {
        eventId: event1[0].id,
        title: 'Pubblicare sito evento',
        description: 'Mettere online landing page con programma',
        dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // -1 giorno (OVERDUE!)
        priority: 'high',
        status: 'pending',
        assignedTo: 'Giulia Romano',
        category: 'Marketing',
      },
    ]

    for (const d of deadlinesList) {
      await db.insert(deadlines).values(d)
    }

    console.log(`✅ Created ${deadlinesList.length} deadlines\n`)

    // ========================================================================
    // BUDGET CATEGORIES & ITEMS
    // ========================================================================
    console.log('💰 Creating budget categories and items...')

    const budgetCat1 = await db
      .insert(budgetCategories)
      .values({
        eventId: event1[0].id,
        name: 'Venue & Logistics',
        description: 'Affitto sala, attrezzature, trasporti',
        allocatedAmount: 50000,
        spentAmount: 35000,
        color: '#3B82F6',
      })
      .returning()

    const budgetCat2 = await db
      .insert(budgetCategories)
      .values({
        eventId: event1[0].id,
        name: 'Marketing & Promotion',
        description: 'Pubblicità, social media, materiali',
        allocatedAmount: 30000,
        spentAmount: 18500,
        color: '#10B981',
      })
      .returning()

    const budgetCat3 = await db
      .insert(budgetCategories)
      .values({
        eventId: event1[0].id,
        name: 'Catering & Hospitality',
        description: 'Coffee break, pranzi, cene',
        allocatedAmount: 40000,
        spentAmount: 22000,
        color: '#F59E0B',
      })
      .returning()

    await db.insert(budgetItems).values([
      {
        categoryId: budgetCat1[0].id,
        eventId: event1[0].id,
        description: 'Affitto MiCo - 3 giorni',
        estimatedCost: 30000,
        actualCost: 30000,
        status: 'paid',
        paymentDate: new Date('2024-09-15'),
        invoiceNumber: 'INV-2024-001',
        vendor: 'Milano Convention Center',
      },
      {
        categoryId: budgetCat2[0].id,
        eventId: event1[0].id,
        description: 'Campagna Meta Ads',
        estimatedCost: 15000,
        actualCost: 12500,
        status: 'paid',
        paymentDate: new Date('2024-10-01'),
        invoiceNumber: 'INV-2024-002',
        vendor: 'Meta Business',
      },
      {
        categoryId: budgetCat3[0].id,
        eventId: event1[0].id,
        description: 'Catering - Coffee break tutti i giorni',
        estimatedCost: 12000,
        actualCost: 12000,
        status: 'invoiced',
        vendor: 'Catering Milano SRL',
      },
    ])

    console.log('✅ Created budget categories and items\n')

    // ========================================================================
    // SERVICES
    // ========================================================================
    console.log('🔧 Creating services...')

    await db.insert(services).values([
      {
        eventId: event1[0].id,
        serviceName: 'Audio/Video Equipment',
        serviceType: 'av_equipment',
        providerName: 'AV Tech Solutions',
        contactPerson: 'Giuseppe Tecnici',
        email: 'giuseppe@avtech.com',
        phone: '+39 02 11223344',
        contractStatus: 'contracted',
        quotedPrice: 15000,
        finalPrice: 14500,
        deliveryDate: new Date('2024-12-14'),
        paymentStatus: 'pending',
      },
      {
        eventId: event2[0].id,
        serviceName: 'Workshop Materials Printing',
        serviceType: 'printing',
        providerName: 'PrintPro',
        email: 'info@printpro.com',
        contractStatus: 'delivered',
        quotedPrice: 800,
        finalPrice: 750,
        paymentStatus: 'paid',
      },
    ])

    console.log('✅ Created services\n')

    console.log('🎉 Seed completed successfully!\n')
    console.log('📊 Summary:')
    console.log('   - 4 Events')
    console.log('   - 10 Participants')
    console.log('   - 4 Speakers')
    console.log('   - 2 Sponsors')
    console.log('   - 8 Deadlines')
    console.log('   - 3 Budget Categories')
    console.log('   - 3 Budget Items')
    console.log('   - 2 Services')
    console.log('\n✅ You can now run your dashboard!\n')
  } catch (error) {
    console.error('❌ Error during seed:', error)
    throw error
  }
}

// Run seed
seed()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
