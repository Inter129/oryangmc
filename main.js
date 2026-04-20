// GitHub Releases에서 최신 버전 정보를 가져와 다운로드 링크를 업데이트합니다.
// REPO를 실제 릴리스 레포지토리로 변경하세요.
const REPO = 'inter129/oryangmc'

async function fetchLatestRelease() {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`)
    if (!res.ok) return
    const data = await res.json()

    const version = data.tag_name?.replace(/^v/, '') ?? '1.0.0'

    // 버전 뱃지 업데이트
    const badge = document.querySelector('.hero-badge')
    if (badge) badge.textContent = `v${version} 출시`

    // 에셋에서 DMG / EXE 찾기
    const assets = data.assets ?? []
    const dmg = assets.find(a => a.name.endsWith('.dmg'))
    const exe = assets.find(a => a.name.endsWith('.exe'))

    if (dmg) {
      document.querySelectorAll('a[href*="arm64.dmg"]').forEach(el => {
        el.href = dmg.browser_download_url
        const info = el.nextElementSibling
        const size = formatBytes(dmg.size)
        if (info && size) info.textContent = `${dmg.name} · ${size}`
      })
    }
    if (exe) {
      document.querySelectorAll('a[href*="setup.exe"]').forEach(el => {
        el.href = exe.browser_download_url
        const info = el.nextElementSibling
        const size = formatBytes(exe.size)
        if (info && size) info.textContent = `${exe.name} · ${size}`
      })
    }
  } catch {
    // 실패 시 하드코딩된 링크 유지
  }
}

function formatBytes(bytes) {
  if (!bytes || isNaN(bytes)) return null
  return `${Math.round(bytes / 1024 / 1024)} MB`
}

// 헤더 스크롤 효과
window.addEventListener('scroll', () => {
  document.querySelector('.header')?.classList.toggle('scrolled', window.scrollY > 10)
}, { passive: true })

fetchLatestRelease()
