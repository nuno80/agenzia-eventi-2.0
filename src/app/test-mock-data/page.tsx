'use client'

import React, { useEffect, useState } from 'react'
import { mockEvents } from '@/components/dashboard/mock-data'

export default function TestMockData() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    console.log('Mock events:', mockEvents)
  }, [])

  if (!isClient) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Mock Data</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Mock Events Count: {mockEvents.length}</h2>
        {mockEvents.length > 0 ? (
          <div className="space-y-4">
            {mockEvents.map((event) => (
              <div key={event.id} className="border-b pb-4 last:border-b-0">
                <h3 className="text-lg font-semibold">{event.name}</h3>
                <p className="text-gray-600">
                  {event.type} - {event.location}
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    <span className="font-medium">Status:</span> {event.status}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {event.startDate} to {event.endDate}
                  </div>
                  <div>
                    <span className="font-medium">Capacity:</span> {event.registered}/
                    {event.capacity}
                  </div>
                  <div>
                    <span className="font-medium">Budget:</span> €{event.spent.toLocaleString()}/€
                    {event.budget.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-red-500">No mock events found!</p>
        )}
      </div>
    </div>
  )
}
