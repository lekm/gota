'use client'

import React, { useEffect, useRef } from 'react'
import { useCombatLogStore } from '@/store/combatLogStore'

function CombatLog () {
  const messages = useCombatLogStore((state) => state.messages)
  const logEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold mb-2">Combat Log</h2>
      <div className="flex-grow overflow-y-auto border rounded p-2 bg-gray-800 text-sm">
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
        {/* Empty div to target for scrolling */}
        <div ref={logEndRef} />
      </div>
    </div>
  )
}

export { CombatLog } 