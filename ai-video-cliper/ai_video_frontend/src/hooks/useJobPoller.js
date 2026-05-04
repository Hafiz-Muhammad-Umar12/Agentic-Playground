import { useEffect, useRef, useCallback } from 'react'
import { repurposeAPI } from '../services/api'
import { useJobStore } from '../store'

const TERMINAL_STATUSES = ['completed', 'failed']
const POLL_INTERVAL = 3000

export function useJobPoller(jobId) {
  const intervalRef = useRef(null)
  const updateJob = useJobStore((s) => s.updateJob)
  const setJobResults = useJobStore((s) => s.setJobResults)

  const poll = useCallback(async () => {
    if (!jobId) return
    try {
      const status = await repurposeAPI.getStatus(jobId)
      updateJob(jobId, status)

      if (TERMINAL_STATUSES.includes(status.status)) {
        clearInterval(intervalRef.current)
        if (status.status === 'completed') {
          const results = await repurposeAPI.getResults(jobId)
          setJobResults(jobId, results)
        }
      }
    } catch (e) {
      console.error('polling error', e)
    }
  }, [jobId, updateJob, setJobResults])

  useEffect(() => {
    if (!jobId) return
    poll()
    intervalRef.current = setInterval(poll, POLL_INTERVAL)
    return () => clearInterval(intervalRef.current)
  }, [jobId, poll])
}
