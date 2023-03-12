import { useState, useEffect } from "react"
import { Subject } from "rxjs";

const PERIOD_KEY = 'editingSession:period'

export const period$ = new Subject<string | null>();

export function setPeriod(period: string) {
  window.sessionStorage.setItem(PERIOD_KEY, period)
  period$.next(period)
}

export function clearPeriod() {
  window.sessionStorage.removeItem(PERIOD_KEY)
  period$.next(null)
}

export function getPeriod(): string | null {
  return window.sessionStorage.getItem(PERIOD_KEY)
}

export function usePeriod(): string | null {
  // TODO: consider replacing with useSyncExternalStore
  const [periodState, setPeriodState] = useState(getPeriod())
  useEffect(() => {
    const subscription = period$.subscribe(p => setPeriodState(p))
    return () => subscription.unsubscribe()
  }, [])
  return periodState
}
