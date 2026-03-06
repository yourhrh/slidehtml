import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { readConfig, writeConfig, hasConfig, setupProject } from '../fileManager'

describe('fileManager', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slidehtml-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  describe('readConfig', () => {
    it('config.json이 없으면 기본값 {width:1280, height:720}을 반환한다', () => {
      const config = readConfig(tmpDir)
      expect(config).toEqual({ width: 1280, height: 720 })
    })

    it('저장된 config.json을 읽는다', () => {
      writeConfig(tmpDir, { width: 1920, height: 1080 })
      const config = readConfig(tmpDir)
      expect(config).toEqual({ width: 1920, height: 1080 })
    })
  })

  describe('writeConfig', () => {
    it('config.json을 저장하면 다시 읽을 수 있다', () => {
      writeConfig(tmpDir, { width: 1024, height: 768 })
      const raw = fs.readFileSync(path.join(tmpDir, '.slidehtml', 'config.json'), 'utf-8')
      expect(JSON.parse(raw)).toEqual({ width: 1024, height: 768 })
    })
  })

  describe('hasConfig', () => {
    it('config.json이 없으면 false를 반환한다', () => {
      expect(hasConfig(tmpDir)).toBe(false)
    })

    it('config.json이 있으면 true를 반환한다', () => {
      writeConfig(tmpDir, { width: 1280, height: 720 })
      expect(hasConfig(tmpDir)).toBe(true)
    })
  })

  describe('setupProject', () => {
    it('slides/ 폴더를 생성한다', () => {
      setupProject(tmpDir, { width: 1280, height: 720 })
      expect(fs.existsSync(path.join(tmpDir, 'slides'))).toBe(true)
    })

    it('CLAUDE.md를 생성한다', () => {
      setupProject(tmpDir, { width: 1280, height: 720 })
      expect(fs.existsSync(path.join(tmpDir, 'CLAUDE.md'))).toBe(true)
    })

    it('GEMINI.md를 생성한다', () => {
      setupProject(tmpDir, { width: 1280, height: 720 })
      expect(fs.existsSync(path.join(tmpDir, 'GEMINI.md'))).toBe(true)
    })

    it('CLAUDE.md에 해상도 정보가 포함된다', () => {
      setupProject(tmpDir, { width: 1920, height: 1080 })
      const content = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8')
      expect(content).toContain('1920')
      expect(content).toContain('1080')
    })
  })
})
