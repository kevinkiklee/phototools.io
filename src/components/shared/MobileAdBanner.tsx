'use client'

import { useState, useEffect } from 'react'
import { isAdsEnabled } from '@/lib/ads'
import { AdUnit } from './AdUnit'
import styles from './MobileAdBanner.module.css'

const DISMISS_KEY = 'phototools-ad-dismissed'

export function MobileAdBanner() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!isAdsEnabled()) return
    if (sessionStorage.getItem(DISMISS_KEY) === '1') {
      setDismissed(true)
      return
    }
    const timer = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  if (!isAdsEnabled() || dismissed) return null

  function handleClose() {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className={`${styles.banner} ${!visible ? styles.hidden : ''}`}>
      <button
        className={styles.closeBtn}
        onClick={handleClose}
        aria-label="Close advertisement"
      >
        &times;
      </button>
      <AdUnit slot="" format="mobile-banner" channel="mobile_banner" />
    </div>
  )
}
