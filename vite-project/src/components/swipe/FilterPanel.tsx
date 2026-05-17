import { FC } from 'react'
import { Button } from '../ui/Button'
import { GENRE_OPTIONS, TYPE_OPTIONS } from './swipeConfig'

const activeChipStyle = {
  background: 'linear-gradient(to bottom, #CE9FFC, #A582F7, #7367F0)',
  color: '#fff',
}
const inactiveChipStyle = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: 'rgba(255,255,255,0.65)',
}
const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: 'rgba(255,255,255,0.85)',
}

const Chip: FC<{ label: string; active: boolean; onClick: () => void }> = ({
  label,
  active,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="font-[Poppins] text-[13px] font-semibold px-4 py-1.5 rounded-full transition-all"
    style={active ? activeChipStyle : inactiveChipStyle}
  >
    {label}
  </button>
)

const SectionLabel: FC<{ children: string }> = ({ children }) => (
  <p
    className="font-[Poppins] text-[12px] font-semibold uppercase tracking-widest mb-2"
    style={{ color: 'rgba(255,255,255,0.35)' }}
  >
    {children}
  </p>
)

const TextInput: FC<{
  value: string
  onChange: (v: string) => void
  placeholder: string
  type?: string
}> = ({ value, onChange, placeholder, type = 'text' }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="flex-1 min-w-0 font-[Poppins] text-[13px] px-3 py-2 rounded-xl outline-none placeholder:text-white/25"
    style={inputStyle}
  />
)

const RangeInput: FC<{
  label: string
  minValue: string
  maxValue: string
  minPlaceholder: string
  maxPlaceholder: string
  onSetMin: (v: string) => void
  onSetMax: (v: string) => void
}> = ({ label, minValue, maxValue, minPlaceholder, maxPlaceholder, onSetMin, onSetMax }) => (
  <div>
    <SectionLabel>{label}</SectionLabel>
    <div className="flex gap-3">
      <TextInput value={minValue} onChange={onSetMin} placeholder={minPlaceholder} type="number" />
      <TextInput value={maxValue} onChange={onSetMax} placeholder={maxPlaceholder} type="number" />
    </div>
  </div>
)

interface FilterPanelProps {
  isLoading: boolean
  selectedTypes: string[]
  selectedGenres: string[]
  minYear: string
  maxYear: string
  minRating: string
  maxRating: string
  onToggleType: (t: string) => void
  onToggleGenre: (g: string) => void
  onSetMinYear: (v: string) => void
  onSetMaxYear: (v: string) => void
  onSetMinRating: (v: string) => void
  onSetMaxRating: (v: string) => void
  onStartSwiping: () => void
  onResetFilters: () => void
}

export const FilterPanel: FC<FilterPanelProps> = ({
  isLoading,
  selectedTypes,
  selectedGenres,
  minYear,
  maxYear,
  minRating,
  maxRating,
  onToggleType,
  onToggleGenre,
  onSetMinYear,
  onSetMaxYear,
  onSetMinRating,
  onSetMaxRating,
  onStartSwiping,
  onResetFilters,
}) => {
  const hasFilters =
    selectedTypes.length > 0 ||
    selectedGenres.length > 0 ||
    minYear !== '' ||
    maxYear !== '' ||
    minRating !== '' ||
    maxRating !== ''

  return (
    <div
      className="w-full max-w-lg rounded-3xl p-7 flex flex-col gap-6"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div>
        <SectionLabel>Content Type</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((o) => (
            <Chip
              key={o.value}
              label={o.label}
              active={selectedTypes.includes(o.value)}
              onClick={() => onToggleType(o.value)}
            />
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Genre</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {GENRE_OPTIONS.map((g) => (
            <Chip
              key={g}
              label={g}
              active={selectedGenres.includes(g)}
              onClick={() => onToggleGenre(g)}
            />
          ))}
        </div>
      </div>

      <RangeInput
        label="Year"
        minValue={minYear}
        maxValue={maxYear}
        minPlaceholder="From"
        maxPlaceholder="To"
        onSetMin={onSetMinYear}
        onSetMax={onSetMaxYear}
      />

      <RangeInput
        label="IMDb Rating"
        minValue={minRating}
        maxValue={maxRating}
        minPlaceholder="Min (1–10)"
        maxPlaceholder="Max (1–10)"
        onSetMin={onSetMinRating}
        onSetMax={onSetMaxRating}
      />

      <div className="flex items-center justify-between gap-4 pt-1">
        <p className="font-[Poppins] text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Movies load as you swipe
        </p>
        <Button
          size="md"
          disabled={isLoading}
          onClick={onStartSwiping}
          style={{ paddingLeft: 28, paddingRight: 28 }}
        >
          {isLoading ? 'Loading…' : 'Start Swiping →'}
        </Button>
      </div>

      {hasFilters && (
        <button
          className="font-[Poppins] text-[12px] text-center"
          style={{ color: 'rgba(255,255,255,0.3)' }}
          onClick={onResetFilters}
        >
          Reset filters
        </button>
      )}
    </div>
  )
}
