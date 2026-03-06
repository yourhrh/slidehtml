import { describe, it, expect } from 'vitest'
import { sortSlides, toFileUrl, basename, formatRelativeTime } from '../index'

describe('sortSlides', () => {
  it('숫자 파일명을 자연어 순서로 정렬한다', () => {
    const slides = ['/path/10.html', '/path/2.html', '/path/1.html']
    expect(sortSlides(slides).map(basename)).toEqual(['1.html', '2.html', '10.html'])
  })

  it('두 자리 숫자 파일명을 올바르게 정렬한다', () => {
    const slides = ['/path/02.html', '/path/11.html', '/path/01.html', '/path/10.html']
    expect(sortSlides(slides).map(basename)).toEqual(['01.html', '02.html', '10.html', '11.html'])
  })

  it('원본 배열을 변경하지 않는다', () => {
    const slides = ['/path/2.html', '/path/1.html']
    const original = [...slides]
    sortSlides(slides)
    expect(slides).toEqual(original)
  })
})

describe('toFileUrl', () => {
  it('Mac 절대경로를 file:// URL로 변환한다', () => {
    expect(toFileUrl('/Users/john/slides/01.html')).toBe('file:///Users/john/slides/01.html')
  })

  it('Windows 경로를 file:// URL로 변환한다', () => {
    expect(toFileUrl('C:\\Users\\john\\slides\\01.html')).toBe('file:///C:/Users/john/slides/01.html')
  })
})

describe('basename', () => {
  it('Mac 경로에서 파일명을 추출한다', () => {
    expect(basename('/Users/john/slides/01.html')).toBe('01.html')
  })

  it('Windows 경로에서 파일명을 추출한다', () => {
    expect(basename('C:\\Users\\john\\01.html')).toBe('01.html')
  })
})

describe('formatRelativeTime', () => {
  it('방금 전 (1분 미만)', () => {
    expect(formatRelativeTime(Date.now() - 30000)).toBe('방금 전')
  })

  it('N분 전 (1시간 미만)', () => {
    expect(formatRelativeTime(Date.now() - 5 * 60000)).toBe('5분 전')
  })

  it('N시간 전 (24시간 미만)', () => {
    expect(formatRelativeTime(Date.now() - 3 * 3600000)).toBe('3시간 전')
  })

  it('N일 전 (24시간 이상)', () => {
    expect(formatRelativeTime(Date.now() - 2 * 86400000)).toBe('2일 전')
  })
})
