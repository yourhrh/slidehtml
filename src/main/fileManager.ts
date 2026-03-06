import * as fs from 'fs'
import * as path from 'path'

export interface ProjectConfig {
  width: number
  height: number
}

const DEFAULT_CONFIG: ProjectConfig = {
  width: 1280,
  height: 720
}

export function readConfig(folderPath: string): ProjectConfig {
  const configPath = path.join(folderPath, '.slidehtml', 'config.json')
  try {
    const raw = fs.readFileSync(configPath, 'utf-8')
    const parsed = JSON.parse(raw)
    return {
      width: typeof parsed.width === 'number' && parsed.width > 0 ? parsed.width : DEFAULT_CONFIG.width,
      height: typeof parsed.height === 'number' && parsed.height > 0 ? parsed.height : DEFAULT_CONFIG.height
    }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export function writeConfig(folderPath: string, config: ProjectConfig): void {
  const slidehtmlDir = path.join(folderPath, '.slidehtml')
  if (!fs.existsSync(slidehtmlDir)) {
    fs.mkdirSync(slidehtmlDir, { recursive: true })
  }
  fs.writeFileSync(path.join(slidehtmlDir, 'config.json'), JSON.stringify(config, null, 2))
}

export function hasConfig(folderPath: string): boolean {
  return fs.existsSync(path.join(folderPath, '.slidehtml', 'config.json'))
}

function getSlideCount(slidesDir: string): number {
  if (!fs.existsSync(slidesDir)) return 0
  return fs.readdirSync(slidesDir).filter((f) => f.toLowerCase().endsWith('.html')).length
}

function getNextFilename(count: number): string {
  return `${String(count + 1).padStart(2, '0')}.html`
}

function generateInstructionContent(config: ProjectConfig, slideCount: number): string {
  const nextFile = getNextFilename(slideCount)
  return `# SlideHTML

slides/ 폴더에 HTML 슬라이드를 순서대로 저장합니다.

## 파일 규칙
- 파일명: 01.html, 02.html, 03.html ... (숫자 2자리 권장)
- 각 슬라이드 body: width: ${config.width}px; height: ${config.height}px; overflow: hidden;
- 외부 CDN, 라이브러리, 이미지 URL 전부 사용 가능

## 현재 상태
- 슬라이드 수: ${slideCount}개
- 다음 파일명: ${nextFile}
`
}

export function setupProject(folderPath: string, config: ProjectConfig): void {
  const slidehtmlDir = path.join(folderPath, '.slidehtml')
  if (!fs.existsSync(slidehtmlDir)) {
    fs.mkdirSync(slidehtmlDir, { recursive: true })
  }

  writeConfig(folderPath, config)

  const slidesDir = path.join(folderPath, 'slides')
  if (!fs.existsSync(slidesDir)) {
    fs.mkdirSync(slidesDir, { recursive: true })
  }

  updateInstructionFiles(folderPath, config)
}

export function updateInstructionFiles(folderPath: string, config: ProjectConfig): void {
  const slidesDir = path.join(folderPath, 'slides')
  const slideCount = getSlideCount(slidesDir)
  const content = generateInstructionContent(config, slideCount)

  try {
    fs.writeFileSync(path.join(folderPath, 'CLAUDE.md'), content)
    fs.writeFileSync(path.join(folderPath, 'GEMINI.md'), content)
  } catch (err) {
    console.error('Failed to write instruction files:', err)
  }
}
