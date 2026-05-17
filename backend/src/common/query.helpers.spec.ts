import { toArray, toFloat, toInt } from './query.helpers'

describe('toArray', () => {
  it('returns undefined for undefined input', () => {
    expect(toArray(undefined)).toBeUndefined()
  })

  it('returns undefined for empty string', () => {
    expect(toArray('')).toBeUndefined()
  })

  it('wraps a single string in an array', () => {
    expect(toArray('action')).toEqual(['action'])
  })

  it('returns an existing array unchanged', () => {
    expect(toArray(['action', 'drama'])).toEqual(['action', 'drama'])
  })

  it('returns an empty array as-is (truthy)', () => {
    expect(toArray([])).toEqual([])
  })
})

describe('toFloat', () => {
  it('returns undefined for undefined input', () => {
    expect(toFloat(undefined)).toBeUndefined()
  })

  it('returns undefined for empty string', () => {
    expect(toFloat('')).toBeUndefined()
  })

  it('parses a decimal string', () => {
    expect(toFloat('7.5')).toBe(7.5)
  })

  it('parses an integer string as float', () => {
    expect(toFloat('8')).toBe(8)
  })

  it('parses a string with leading zeros', () => {
    expect(toFloat('06.5')).toBe(6.5)
  })
})

describe('toInt', () => {
  it('returns undefined for undefined input', () => {
    expect(toInt(undefined)).toBeUndefined()
  })

  it('returns undefined for empty string', () => {
    expect(toInt('')).toBeUndefined()
  })

  it('parses a plain integer string', () => {
    expect(toInt('2020')).toBe(2020)
  })

  it('truncates the decimal part', () => {
    expect(toInt('7.9')).toBe(7)
  })

  it('parses zero', () => {
    expect(toInt('0')).toBe(0)
  })
})
