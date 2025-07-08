"use client";
import React, { useState } from 'react'
import { GlassFilter } from "@/components/ui/liquid-radio";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface RoleSelectorProps {
  onRoleSelect: (role: string) => void;
  selectedRole?: string;
}

export default function RoleSelector({ onRoleSelect, selectedRole = 'car-owner' }: RoleSelectorProps) {
  const [role, setRole] = useState(selectedRole)

  const handleRoleChange = (newRole: string) => {
    setRole(newRole)
    onRoleSelect(newRole)
  }

  return (
    <div className="inline-flex h-12 rounded-xl bg-input/50 p-1">
      <RadioGroup
        value={role}
        onValueChange={handleRoleChange}
        className="group relative inline-grid grid-cols-[1fr_1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/3 after:rounded-lg after:bg-background/80 after:shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)] after:transition-transform after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] has-[:focus-visible]:after:outline has-[:focus-visible]:after:outline-2 has-[:focus-visible]:after:outline-ring/70 data-[state=car-owner]:after:translate-x-0 data-[state=mechanic]:after:translate-x-full data-[state=dealer]:after:translate-x-[200%] dark:after:shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)]"
        data-state={role}
      >
        <div
          className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-lg"
          style={{ filter: 'url("#radio-glass")' }}
        />
        <label className="relative z-10 inline-flex h-full min-w-16 cursor-pointer select-none items-center justify-center whitespace-nowrap px-4 transition-colors text-muted-foreground/70 group-data-[state=car-owner]:text-foreground group-data-[state=mechanic]:text-muted-foreground/70 group-data-[state=dealer]:text-muted-foreground/70">
          Car Owner
          <RadioGroupItem id="role-car-owner" value="car-owner" className="sr-only" />
        </label>
        <label className="relative z-10 inline-flex h-full min-w-16 cursor-pointer select-none items-center justify-center whitespace-nowrap px-4 transition-colors text-muted-foreground/70 group-data-[state=car-owner]:text-muted-foreground/70 group-data-[state=mechanic]:text-foreground group-data-[state=dealer]:text-muted-foreground/70">
          Mechanic
          <RadioGroupItem id="role-mechanic" value="mechanic" className="sr-only" />
        </label>
        <label className="relative z-10 inline-flex h-full min-w-16 cursor-pointer select-none items-center justify-center whitespace-nowrap px-4 transition-colors text-muted-foreground/70 group-data-[state=car-owner]:text-muted-foreground/70 group-data-[state=mechanic]:text-muted-foreground/70 group-data-[state=dealer]:text-foreground">
          Dealer
          <RadioGroupItem id="role-dealer" value="dealer" className="sr-only" />
        </label>
        <GlassFilter />
      </RadioGroup>
    </div>
  );
}