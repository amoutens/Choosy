import { cn } from '../../lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('ignores falsy values', () => {
    expect(cn('a', false, undefined, null, '')).toBe('a')
  })

  it('merges conflicting Tailwind classes, keeping the last one', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8')
  })

  it('handles conditional object classes', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active')
  })

  it('returns empty string with no arguments', () => {
    expect(cn()).toBe('')
  })
})
