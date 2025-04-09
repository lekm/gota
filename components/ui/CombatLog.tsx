'use client'

import React, { useEffect, useRef } from 'react'
import { useCombatLogStore } from '@/store/combatLogStore'

function CombatLog () {
  const messages = useCombatLogStore((state) => state.messages)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold mb-2 flex-shrink-0">Combat Log</h2>
      <div
        ref={scrollContainerRef}
        className="flex-grow overflow-y-auto border rounded p-2 bg-gray-800 text-sm"
      >
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export { CombatLog } 