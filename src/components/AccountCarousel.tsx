import { useEffect, useRef, useState } from 'react'
import { useAccounts } from '../hooks/useAccounts'
import { useTransactions } from '../hooks/useTransactions'
import { calculateAccountBalance } from '../lib/balance'
import { getInitialCarouselIndex, sortAccountsForCarousel } from '../lib/accountOrder'
import { formatKopecks } from '../lib/money'
import { card, moneyText } from '../lib/ui'

export function AccountCarousel() {
  const accounts = useAccounts()
  const transactions = useTransactions()
  const trackRef = useRef<HTMLDivElement>(null)
  const hasScrolledToInitial = useRef(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const sortedAccounts = sortAccountsForCarousel(accounts ?? [])

  useEffect(() => {
    const track = trackRef.current
    if (hasScrolledToInitial.current || sortedAccounts.length === 0 || !track) return

    hasScrolledToInitial.current = true
    const index = getInitialCarouselIndex(sortedAccounts)
    setActiveIndex(index)
    track.scrollTo({ left: index * track.clientWidth, behavior: 'auto' })
  }, [sortedAccounts])

  function handleScroll() {
    const track = trackRef.current
    if (!track || track.clientWidth === 0) return
    setActiveIndex(Math.round(track.scrollLeft / track.clientWidth))
  }

  if (sortedAccounts.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <div ref={trackRef} onScroll={handleScroll} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
        {sortedAccounts.map((a) => {
          const balance = calculateAccountBalance(a, transactions ?? [])
          return (
            <div key={a.id} className="w-full shrink-0 snap-center px-1">
              <div className={`flex flex-col gap-1 ${card}`}>
                <span className="flex items-center gap-2 text-sm text-text-muted">
                  <span className="truncate">{a.name}</span>
                  {a.isPrimary && <span className="shrink-0 text-xs text-accent">★ Основной</span>}
                </span>
                <span className={`text-2xl font-semibold ${moneyText} ${balance < 0 ? 'text-expense' : 'text-text'}`}>
                  {formatKopecks(balance)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {sortedAccounts.length > 1 && (
        <div className="flex justify-center gap-1.5" aria-hidden="true">
          {sortedAccounts.map((a, i) => (
            <span
              key={a.id}
              className={`h-1.5 rounded-full transition-all ${i === activeIndex ? 'w-4 bg-accent' : 'w-1.5 bg-border'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
