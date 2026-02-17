import { describe, it, expect } from 'vitest'
import { parseIntent } from '../intent-parser'

describe('parseIntent', () => {
  describe('status intent', () => {
    it('parses "@claude status" as status intent', () => {
      const result = parseIntent('@claude status')
      expect(result.type).toBe('status')
      expect(result.agentMention).toBe('@claude')
      expect(result.remainingText).toBe('status')
    })

    it('parses "@claude what is the status?" as status intent', () => {
      const result = parseIntent('@claude what is the status?')
      expect(result.type).toBe('status')
    })

    it('parses "@claude give me an update" as status intent', () => {
      const result = parseIntent('@claude give me an update')
      expect(result.type).toBe('status')
    })
  })

  describe('expand intent', () => {
    it('parses "@claude expand this" as expand intent', () => {
      const result = parseIntent('@claude expand this')
      expect(result.type).toBe('expand')
      expect(result.agentMention).toBe('@claude')
      expect(result.remainingText).toBe('expand this')
    })

    it('parses "@claude write a spec for this" as expand intent', () => {
      const result = parseIntent('@claude write a spec for this')
      expect(result.type).toBe('expand')
    })

    it('parses "@claude flesh this out" as expand intent', () => {
      const result = parseIntent('@claude flesh this out')
      expect(result.type).toBe('expand')
    })

    it('parses "@claude elaborate on the requirements" as expand intent', () => {
      const result = parseIntent('@claude elaborate on the requirements')
      expect(result.type).toBe('expand')
    })
  })

  describe('help intent', () => {
    it('parses "@claude help" as help intent', () => {
      const result = parseIntent('@claude help')
      expect(result.type).toBe('help')
      expect(result.agentMention).toBe('@claude')
    })

    it('parses "@claude what can you do?" as help intent', () => {
      const result = parseIntent('@claude what can you do?')
      expect(result.type).toBe('help')
    })
  })

  describe('unknown intent', () => {
    it('parses "@claude do something random" as unknown', () => {
      const result = parseIntent('@claude do something random')
      expect(result.type).toBe('unknown')
      expect(result.remainingText).toBe('do something random')
    })

    it('preserves the full raw text', () => {
      const raw = '@claude do something random'
      const result = parseIntent(raw)
      expect(result.rawText).toBe(raw)
    })
  })

  describe('mention extraction', () => {
    it('handles mentions with surrounding whitespace', () => {
      const result = parseIntent('  @claude   status  ')
      expect(result.type).toBe('status')
      expect(result.agentMention).toBe('@claude')
    })

    it('is case-insensitive for the agent mention', () => {
      const result = parseIntent('@Claude Status')
      expect(result.type).toBe('status')
      expect(result.agentMention).toBe('@Claude')
    })

    it('extracts the correct mention for non-claude agents', () => {
      const result = parseIntent('@cursor fix this bug')
      expect(result.agentMention).toBe('@cursor')
      expect(result.remainingText).toBe('fix this bug')
    })
  })

  describe('promptContext-based parsing', () => {
    it('extracts the mention text from Linear promptContext XML', () => {
      const comment = '@claude expand this issue with acceptance criteria'
      const result = parseIntent(comment)
      expect(result.type).toBe('expand')
      expect(result.agentMention).toBe('@claude')
    })
  })
})
