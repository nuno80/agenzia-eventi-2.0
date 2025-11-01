src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx                           ✅ CREATO (Client)
│   │   ├── page.tsx                             ✅ CREATO (Server + Suspense)
│   │   │
│   │   ├── eventi/
│   │   │   ├── page.tsx                         ✅ CREATO (Server)
│   │   │   ├── EventsListClient.tsx             ✅ CREATO (Client)
│   │   │   ├── nuovo/
│   │   │   │   └── page.tsx                     ✅ CREATO (Server)
│   │   │   └── [id]/
│   │   │       ├── edit/
│   │   │       │   └── page.tsx                 ✅ CREATO (Server)
│   │   │       └── [tab]/
│   │   │           └── page.tsx                 ✅ CREATO (Server + Suspense)
│   │   │
│   │   ├── personale/
│   │   │   ├── page.tsx                         🟡 DA FARE (Server) - FACILE
│   │   │   ├── StaffListClient.tsx              🟡 DA FARE (Client) - MEDIO
│   │   │   ├── nuovo/
│   │   │   │   └── page.tsx                     🟡 DA FARE (Server) - FACILE
│   │   │   └── [id]/
│   │   │       ├── page.tsx                     🟡 DA FARE (Server) - MEDIO
│   │   │       └── edit/
│   │   │           └── page.tsx                 🟡 DA FARE (Server) - FACILE
│   │   │
│   │   ├── persone/
│   │   │   ├── partecipanti/
│   │   │   │   └── page.tsx                     🔴 DA FARE (Server) - MEDIO
│   │   │   ├── relatori/
│   │   │   │   └── page.tsx                     🔴 DA FARE (Server) - MEDIO
│   │   │   ├── sponsor/
│   │   │   │   └── page.tsx                     🔴 DA FARE (Server) - MEDIO
│   │   │   └── staff/
│   │   │       └── page.tsx                     🔴 DA FARE (Server) - MEDIO
│   │   │
│   │   ├── finance/
│   │   │   ├── page.tsx                         🔴 DA FARE (Server) - DIFFICILE
│   │   │   └── report/
│   │   │       └── page.tsx                     🔴 DA FARE (Server) - DIFFICILE
│   │   │
│   │   └── impostazioni/
│   │       └── page.tsx                         🔴 DA FARE (Server) - MEDIO
│   │
│   └── actions/
│       ├── events.ts                            ✅ CREATO (Server Actions)
│       ├── staff.ts                             🟡 DA FARE (Server Actions) - FACILE
│       ├── staffAssignments.ts                  🟡 DA FARE (Server Actions) - MEDIO
│       ├── participants.ts                      🔴 DA FARE (Server Actions) - MEDIO
│       ├── speakers.ts                          🔴 DA FARE (Server Actions) - MEDIO
│       └── sponsors.ts                          🔴 DA FARE (Server Actions) - MEDIO
│
├── components/
│   │
│   └── ui/
│   │   ├── Button.tsx                       ⚪ shadcn/ui
│   │   ├── Card.tsx                         ⚪ shadcn/ui
│   │   ├── Badge.tsx                        ⚪ shadcn/ui
│   │   ├── Table.tsx                        ⚪ shadcn/ui
│   │   └── ...                              ⚪ shadcn/ui (altri componenti)
│   │ 
│   └── dashboard/
│       ├── layout/
│       │   ├── Sidebar.tsx                      ✅ CREATO (Client)
│       │   ├── Header.tsx                       ✅ CREATO (Client)
│       │   └── index.ts                         🟢 DA FARE - FACILE (exports)
│       │
│       ├── home/
│       │   ├── UrgentDeadlines.tsx              ✅ CREATO (Server)
│       │   ├── StatsOverview.tsx                ✅ CREATO (Server)
│       │   ├── UpcomingEvents.tsx               ✅ CREATO (Server)
│       │   └── index.ts                         🟢 DA FARE - FACILE (exports)
│       │
│       ├── events/
│       │   ├── EventCard.tsx                    ✅ CREATO (Server)
│       │   ├── EventForm.tsx                    ✅ CREATO (Client)
│       │   ├── EventHeader.tsx                  ✅ CREATO (Server)
│       │   ├── EventTabs.tsx                    ✅ CREATO (Client)
│       │   ├── EventsFilters.tsx                ✅ CREATO (Client)
│       │   ├── EventsTable.tsx                  🟢 DA FARE (Server) - FACILE
│       │   ├── ParticipantsTable.tsx            ✅ CREATO (Client)
│       │   ├── DuplicateEventButton.tsx         ✅ CREATO (Client)
│       │   ├── index.ts                         🟢 DA FARE - FACILE (exports)
│       │   └── tabs/
│       │       ├── OverviewTab.tsx              ✅ CREATO (Server)
│       │       ├── ParticipantsTab.tsx          ✅ CREATO (Server)
│       │       ├── SpeakersTab.tsx              🔴 DA FARE (Server) - MEDIO
│       │       ├── SponsorsTab.tsx              🔴 DA FARE (Server) - MEDIO
│       │       ├── AgendaTab.tsx                🔴 DA FARE (Server/Client) - DIFFICILE
│       │       ├── ServicesTab.tsx              🔴 DA FARE (Server) - MEDIO
│       │       ├── BudgetTab.tsx                🔴 DA FARE (Server/Client) - DIFFICILE
│       │       ├── CommunicationsTab.tsx        🔴 DA FARE (Server/Client) - DIFFICILE
│       │       ├── SurveysTab.tsx               🔴 DA FARE (Server/Client) - DIFFICILE
│       │       ├── CheckinTab.tsx               🔴 DA FARE (Server/Client) - DIFFICILE
│       │       └── StaffTab.tsx                 🟡 DA FARE (Server) - MEDIO
│       │
│       ├── staff/
│       │   ├── StaffCard.tsx                    🟡 DA FARE (Server) - FACILE
│       │   ├── StaffForm.tsx                    🟡 DA FARE (Client) - MEDIO
│       │   ├── StaffHeader.tsx                  🟡 DA FARE (Server) - FACILE
│       │   ├── StaffFilters.tsx                 🟡 DA FARE (Client) - FACILE
│       │   ├── StaffAssignmentModal.tsx         🟡 DA FARE (Client) - MEDIO
│       │   ├── PaymentStatusBadge.tsx           🟡 DA FARE (Server) - FACILE
│       │   └── index.ts                         🟢 DA FARE - FACILE (exports)

│
├── lib/
│   ├── db/
│   │   ├── index.ts                             ✅ CREATO (Torso connection)
│   │   ├── schema.ts                            ✅ CREATO (10 tables + staff/assignments)
│   │   └── seed.ts                              ✅ CREATO (Seed data)
│   │
│   ├── dal/
│   │   ├── events.ts                            ✅ CREATO (50+ queries)
│   │   ├── participants.ts                      ✅ CREATO (20+ queries)
│   │   ├── staff.ts                             ✅ CREATO (25+ queries)
│   │   ├── staffAssignments.ts                  ✅ CREATO (20+ queries)
│   │   ├── speakers.ts                          🔴 DA FARE - MEDIO
│   │   ├── sponsors.ts                          🔴 DA FARE - MEDIO
│   │   ├── services.ts                          🔴 DA FARE - MEDIO
│   │   ├── budget.ts                            🔴 DA FARE - MEDIO
│   │   ├── deadlines.ts                         🟢 DA FARE - FACILE (simile a staff)
│   │   └── agenda.ts                            🔴 DA FARE - MEDIO
│   │
│   ├── validations/
│   │   ├── events.ts                            ✅ CREATO (Zod schemas)
│   │   ├── staff.ts                             🟡 DA FARE - FACILE
│   │   ├── staffAssignments.ts                  🟡 DA FARE - FACILE
│   │   ├── participants.ts                      🔴 DA FARE - FACILE
│   │   ├── speakers.ts                          🔴 DA FARE - FACILE
│   │   └── sponsors.ts                          🔴 DA FARE - FACILE
│   │
│   └── utils.ts                                 ✅ CREATO (Utilities + Payment helpers)
│
└── ...
