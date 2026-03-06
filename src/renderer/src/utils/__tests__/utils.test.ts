import { describe, it, expect } from 'vitest'
import { sortSlides, toFileUrl, basename, formatRelativeTime } from '../index'

describe('sortSlides', () => {
  it('sorts numeric filenames in natural order', () => {
    const slides = ['/path/10.html', '/path/2.html', '/path/1.html']
    expect(sortSlides(slides).map(basename)).toEqual(['1.html', '2.html', '10.html'])
  })

  it('sorts zero-padded filenames correctly', () => {
    const slides = ['/path/02.html', '/path/11.html', '/path/01.html', '/path/10.html']
    expect(sortSlides(slides).map(basename)).toEqual(['01.html', '02.html', '10.html', '11.html'])
  })

  it('does not mutate the original array', () => {
    const slides = ['/path/2.html', '/path/1.html']
    const original = [...slides]
    sortSlides(slides)
    expect(slides).toEqual(original)
  })
})

describe('toFileUrl', () => {
  it('converts Mac absolute path to file:// URL', () => {
    expect(toFileUrl('/Users/john/slides/01.html')).toBe('file:///Users/john/slides/01.html')
  })

  it('converts Windows path to file:// URL', () => {
    expect(toFileUrl('C:\\Users\\john\\slides\\01.html')).toBe('file:///C:/Users/john/slides/01.html')
  })
})

describe('basename', () => {
  it('extracts filename from Mac path', () => {
    expect(basename('/Users/john/slides/01.html')).toBe('01.html')
  })

  it('extracts filename from Windows path', () => {
    expect(basename('C:\\Users\\john\\01.html')).toBe('01.html')
  })
})

describe('formatRelativeTime', () => {
  it('returns "just now" for less than 1 minute', () => {
    expect(formatRelativeTime(Date.now() - 30000)).toBe('just now')
  })

  it('returns minutes ago for less than 1 hour', () => {
    expect(formatRelativeTime(Date.now() - 5 * 60000)).toBe('5m ago')
  })

  it('returns hours ago for less than 24 hours', () => {
    expect(formatRelativeTime(Date.now() - 3 * 3600000)).toBe('3h ago')
  })

  it('returns days ago for 24 hours or more', () => {
    expect(formatRelativeTime(Date.now() - 2 * 86400000)).toBe('2d ago')
  })
})
