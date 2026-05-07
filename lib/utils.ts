import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseDurationToMinutes(duration: string): number | null {
  const normalized = duration.trim().toLowerCase()
  const match = normalized.match(/([0-9]*\.?[0-9]+)\s*(hours?|hrs?|hr|minutes?|mins?|min)/)
  if (!match) return null

  const value = Number.parseFloat(match[1])
  if (!Number.isFinite(value)) return null

  const unit = match[2]
  if (unit.startsWith("hour") || unit.startsWith("hr")) {
    return Math.round(value * 60)
  }
  if (unit.startsWith("min")) {
    return Math.round(value)
  }
  return null
}

export function parseTimeToMinutes(time: string): number | null {
  const normalized = time.trim().toUpperCase()
  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/)
  if (!match) return null

  let hours = Number.parseInt(match[1], 10)
  const minutes = Number.parseInt(match[2] ?? "0", 10)
  const meridiem = match[3]
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null

  if (meridiem === "AM") {
    hours = hours % 12
  } else {
    hours = hours % 12
    hours += 12
  }

  return hours * 60 + minutes
}

export function getMasterclassEndAt(
  date: Date | string,
  time: string,
  duration: string
): Date | null {
  const start = new Date(date)
  if (Number.isNaN(start.getTime())) return null

  const minutesFromMidnight = parseTimeToMinutes(time)
  const durationMinutes = parseDurationToMinutes(duration)
  if (minutesFromMidnight == null || durationMinutes == null) return null

  const startAt = new Date(start)
  startAt.setHours(0, 0, 0, 0)
  startAt.setMinutes(minutesFromMidnight)

  const endAt = new Date(startAt)
  endAt.setMinutes(endAt.getMinutes() + durationMinutes)
  return endAt
}

export function isMasterclassCompleted(
  date: Date | string,
  time: string,
  duration: string,
  now: Date = new Date()
): boolean {
  const endAt = getMasterclassEndAt(date, time, duration)
  if (!endAt) return false
  return endAt.getTime() <= now.getTime()
}