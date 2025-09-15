import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('merges class names and removes duplicates', () => {
    const result = cn('px-2', 'py-2', 'px-2', { hidden: false, block: true })
    expect(result).toContain('px-2')
    expect(result).toContain('py-2')
    expect(result).toContain('block')
    // should not contain duplicated classes multiple times
    const occurrences = result.split(' ').filter(c => c === 'px-2').length
    expect(occurrences).toBe(1)
  })
})