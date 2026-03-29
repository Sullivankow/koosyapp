

import type { Bien } from '../models/mocks'

interface BienCardProps {
  bien: Bien
  onOpen: (bien: Bien) => void
}

export function BienCard({ bien, onOpen }: BienCardProps) {
  return (
    <article className="flex flex-col rounded-2xl border border-[#E0E6ED] bg-white shadow-sm overflow-hidden">
      {/* Image placeholder */}
      <div className="h-32 bg-gradient-to-br from-[#E0F7F4] via-[#F9FBFF] to-[#E0F2FE]" />
      <div className="flex-1 p-4 space-y-2 text-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <h3 className="font-semibold text-[#1F2933] line-clamp-2">
              {bien.name}
            </h3>
            <p className="text-xs text-[#6E7B8B]">
              {bien.city}, {bien.country}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                bien.status === 'disponible'
                  ? 'bg-[#ECFDF3] text-[#166534]'
                  : bien.status === 'occupé'
                    ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                    : 'bg-[#FFFBEB] text-[#92400E]'
              }`}
            >
              {bien.status === 'disponible' && 'Disponible'}
              {bien.status === 'occupé' && 'Occupé'}
              {bien.status === 'travaux' && 'En travaux'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-[#0F172A]/5 flex items-center justify-center text-[10px] font-semibold text-[#0F172A]">
              {bien.owner.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-[#1F2933]">{bien.owner.name}</p>
              <p className="text-[11px] text-[#6E7B8B]">{bien.owner.email}</p>
            </div>
          </div>
          {/* Champs purement métier (taux d'occupation, capacité détaillée, prix nuit)
              seront ajoutés plus tard si exposés par le backend. */}
        </div>
      </div>

      <footer className="flex flex-col gap-2 border-t border-[#E0E6ED] bg-[#F9FBFF] px-4 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onOpen(bien)}
            className="rounded-full border border-transparent px-2 py-0.5 text-[#00A896] hover:bg-[#D1FAF5]"
          >
            Voir la fiche bien
          </button>
          <button
            type="button"
            className="rounded-full border border-transparent px-2 py-0.5 text-[#9EABB8] hover:bg-[#F4F7FA]"
          >
            Voir la conciergerie
          </button>
          <span className="hidden text-[10px] text-[#9EABB8] md:inline">
            Actions back office simulées, à connecter à ton API.
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <button
            type="button"
            className="rounded-full border border-[#E0E6ED] bg-white px-2 py-0.5 text-[11px] text-[#6E7B8B] hover:bg-[#F4F7FA]"
          >
            Valider le bien (mock)
          </button>
          <button
            type="button"
            className="rounded-full border border-transparent px-2 py-0.5 text-[11px] text-[#B91C1C] hover:bg-[#FEE2E2]"
          >
            Suspendre (mock)
          </button>
        </div>
      </footer>
    </article>
  )
}

export default BienCard