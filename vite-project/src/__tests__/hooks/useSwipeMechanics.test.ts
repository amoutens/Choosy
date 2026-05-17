import { renderHook, act } from '@testing-library/react'
import { useSwipeMechanics } from '../../hooks/useSwipeMechanics'
import { Movie } from '../../api/movies.types'

const makeMovie = (id: string): Movie => ({
  imdbID: id,
  Title: `Movie ${id}`,
  Year: '2021',
  Genre: 'Drama',
  Director: 'N/A',
  Actors: 'N/A',
  Plot: 'Some plot.',
  Poster: 'https://example.com/poster.jpg',
  imdbRating: '7.5',
  Runtime: '100 min',
})

const movie = makeMovie('tt001')

describe('useSwipeMechanics', () => {
  let onLike: jest.Mock
  let onDislike: jest.Mock
  let onRemoveTop: jest.Mock

  beforeEach(() => {
    onLike = jest.fn()
    onDislike = jest.fn()
    onRemoveTop = jest.fn()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const render = (movies: Movie[] = [movie]) =>
    renderHook(() => useSwipeMechanics({ movies, onLike, onDislike, onRemoveTop }))

  it('starts with null dismissed, no showPlot, zero transform values', () => {
    const { result } = render()
    expect(result.current.dismissed).toBeNull()
    expect(result.current.showPlot).toBe(false)
    expect(result.current.rotation).toBe(0)
    expect(result.current.translateX).toBe(0)
    expect(result.current.likeOpacity).toBe(0)
    expect(result.current.nopeOpacity).toBe(0)
  })

  it('dismiss right calls onLike with the top movie id', () => {
    const { result } = render()
    act(() => { result.current.dismiss('right') })
    expect(onLike).toHaveBeenCalledWith('tt001')
    expect(onDislike).not.toHaveBeenCalled()
  })

  it('dismiss left calls onDislike with the top movie id', () => {
    const { result } = render()
    act(() => { result.current.dismiss('left') })
    expect(onDislike).toHaveBeenCalledWith('tt001')
    expect(onLike).not.toHaveBeenCalled()
  })

  it('sets dismissed direction immediately', () => {
    const { result } = render()
    act(() => { result.current.dismiss('right') })
    expect(result.current.dismissed).toBe('right')
  })

  it('translateX is 900 after dismiss right', () => {
    const { result } = render()
    act(() => { result.current.dismiss('right') })
    expect(result.current.translateX).toBe(900)
  })

  it('translateX is -900 after dismiss left', () => {
    const { result } = render()
    act(() => { result.current.dismiss('left') })
    expect(result.current.translateX).toBe(-900)
  })

  it('calls onRemoveTop and clears dismissed after 360ms', () => {
    const { result } = render()
    act(() => { result.current.dismiss('right') })
    expect(onRemoveTop).not.toHaveBeenCalled()

    act(() => { jest.advanceTimersByTime(360) })

    expect(onRemoveTop).toHaveBeenCalledTimes(1)
    expect(result.current.dismissed).toBeNull()
  })

  it('does nothing when movies list is empty', () => {
    const { result } = render([])
    act(() => { result.current.dismiss('right') })
    expect(onLike).not.toHaveBeenCalled()
    expect(result.current.dismissed).toBeNull()
  })

  it('ignores second dismiss while one is in progress', () => {
    const { result } = render()
    act(() => { result.current.dismiss('right') })
    act(() => { result.current.dismiss('left') })
    expect(onLike).toHaveBeenCalledTimes(1)
    expect(onDislike).not.toHaveBeenCalled()
  })

  it('reset clears dismissed and showPlot', () => {
    const { result } = render()
    act(() => { result.current.dismiss('left') })
    expect(result.current.dismissed).toBe('left')

    act(() => { result.current.reset() })
    expect(result.current.dismissed).toBeNull()
    expect(result.current.showPlot).toBe(false)
  })
})
