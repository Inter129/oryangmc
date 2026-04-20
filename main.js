const BASE = location.origin + location.pathname.replace(/\/?$/, '/') + 'files/'

// ── 청크 다운로드 & 재조립 ───────────────────────────────────────────────────

async function downloadChunked(platform) {
  const res = await fetch(BASE + 'manifest.json')
  const manifest = await res.json()
  const info = manifest[platform]
  if (!info) return

  const btn = document.querySelector(`[data-platform="${platform}"]`)
  const label = btn?.querySelector('.btn-label')
  const progress = btn?.querySelector('.btn-progress')

  const chunks = info.chunks
  const total = chunks.length
  const buffers = []

  for (let i = 0; i < total; i++) {
    if (label) label.textContent = `다운로드 중... ${i + 1}/${total}`
    if (progress) progress.style.width = `${((i) / total) * 100}%`

    const r = await fetch(BASE + chunks[i])
    if (!r.ok) throw new Error(`청크 다운로드 실패: ${chunks[i]}`)
    buffers.push(await r.arrayBuffer())
  }

  if (progress) progress.style.width = '100%'
  if (label) label.textContent = '저장 중...'

  // 재조립
  const totalBytes = buffers.reduce((s, b) => s + b.byteLength, 0)
  const merged = new Uint8Array(totalBytes)
  let offset = 0
  for (const buf of buffers) {
    merged.set(new Uint8Array(buf), offset)
    offset += buf.byteLength
  }

  // 다운로드 트리거
  const blob = new Blob([merged])
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = info.filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)

  if (label) label.textContent = platform === 'mac' ? 'DMG 다운로드' : 'EXE 다운로드'
  if (progress) progress.style.width = '0%'
}

// ── 버튼 이벤트 연결 ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-platform]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault()
      const platform = btn.getAttribute('data-platform')
      btn.disabled = true
      try {
        await downloadChunked(platform)
      } catch (err) {
        const label = btn.querySelector('.btn-label')
        if (label) label.textContent = '다운로드 실패 — 다시 시도'
        console.error(err)
      } finally {
        btn.disabled = false
      }
    })
  })
})

// ── 헤더 스크롤 효과 ─────────────────────────────────────────────────────────

window.addEventListener('scroll', () => {
  document.querySelector('.header')?.classList.toggle('scrolled', window.scrollY > 10)
}, { passive: true })
