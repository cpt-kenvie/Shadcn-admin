const URL_SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*:/

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function sanitizeUrl(rawUrl: string) {
  const url = rawUrl.trim().replace(/^<|>$/g, '')
  if (!url) return '#'
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) return url
  if (url.startsWith('//')) return url
  if (!URL_SCHEME_RE.test(url)) return url

  const scheme = url.slice(0, url.indexOf(':')).toLowerCase()
  if (scheme === 'http' || scheme === 'https') return url
  return '#'
}

function renderInline(text: string) {
  const codeTokens: string[] = []
  let escaped = text.replace(/`([^`]+)`/g, (_m, code: string) => {
    const idx = codeTokens.length
    codeTokens.push(escapeHtml(code))
    return `\x00CODE_${idx}\x00`
  })

  escaped = escapeHtml(escaped)

  escaped = escaped.replace(
    /!\[([^\]]*)]\(([^)]+)\)/g,
    (_m, alt: string, raw: string) => {
      const parts = raw.trim().split(/\s+/)
      const url = sanitizeUrl(parts[0] || '')
      const titleMatch = raw.match(/"([^"]+)"/)
      const titleAttr = titleMatch ? ` title="${escapeHtml(titleMatch[1])}"` : ''
      return `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}"${titleAttr} />`
    }
  )

  escaped = escaped.replace(
    /\[([^\]]+)]\(([^)]+)\)/g,
    (_m, label: string, raw: string) => {
      const parts = raw.trim().split(/\s+/)
      const url = sanitizeUrl(parts[0] || '')
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`
    }
  )

  escaped = escaped
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')

  escaped = escaped.replace(/\x00CODE_(\d+)\x00/g, (_m, idx: string) => {
    const code = codeTokens[Number(idx)] ?? ''
    return `<code>${code}</code>`
  })

  return escaped
}

export function renderMarkdown(markdown: string) {
  const normalized = (markdown || '').replace(/\r\n/g, '\n')
  const lines = normalized.split('\n')

  const parts: string[] = []
  let inCodeBlock = false
  let codeLang = ''
  let codeLines: string[] = []
  let inUl = false
  let inOl = false
  let inBlockquote = false

  const closeLists = () => {
    if (inUl) {
      parts.push('</ul>')
      inUl = false
    }
    if (inOl) {
      parts.push('</ol>')
      inOl = false
    }
  }

  const closeBlockquote = () => {
    if (inBlockquote) {
      parts.push('</blockquote>')
      inBlockquote = false
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, '')

    const fenceMatch = line.match(/^```(\w+)?\s*$/)
    if (fenceMatch) {
      if (!inCodeBlock) {
        closeLists()
        closeBlockquote()
        inCodeBlock = true
        codeLang = fenceMatch[1] || ''
        codeLines = []
      } else {
        const langClass = codeLang ? ` class="language-${escapeHtml(codeLang)}"` : ''
        parts.push(`<pre><code${langClass}>${escapeHtml(codeLines.join('\n'))}</code></pre>`)
        inCodeBlock = false
        codeLang = ''
        codeLines = []
      }
      continue
    }

    if (inCodeBlock) {
      codeLines.push(rawLine)
      continue
    }

    if (!line.trim()) {
      closeLists()
      closeBlockquote()
      continue
    }

    const hrMatch = line.match(/^\s{0,3}(-{3,}|\*{3,}|_{3,})\s*$/)
    if (hrMatch) {
      closeLists()
      closeBlockquote()
      parts.push('<hr />')
      continue
    }

    const blockquote = line.match(/^\s{0,3}>\s?(.*)$/)
    if (blockquote) {
      closeLists()
      if (!inBlockquote) {
        parts.push('<blockquote>')
        inBlockquote = true
      }
      const text = blockquote[1] || ''
      parts.push(`<p>${renderInline(text)}</p>`)
      continue
    }

    closeBlockquote()

    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      closeLists()
      const level = heading[1].length
      parts.push(`<h${level}>${renderInline(heading[2])}</h${level}>`)
      continue
    }

    const ulItem = line.match(/^\s*[-*]\s+(.*)$/)
    if (ulItem) {
      if (inOl) {
        parts.push('</ol>')
        inOl = false
      }
      if (!inUl) {
        parts.push('<ul>')
        inUl = true
      }
      parts.push(`<li>${renderInline(ulItem[1])}</li>`)
      continue
    }

    const olItem = line.match(/^\s*\d+\.\s+(.*)$/)
    if (olItem) {
      if (inUl) {
        parts.push('</ul>')
        inUl = false
      }
      if (!inOl) {
        parts.push('<ol>')
        inOl = true
      }
      parts.push(`<li>${renderInline(olItem[1])}</li>`)
      continue
    }

    closeLists()
    parts.push(`<p>${renderInline(line)}</p>`)
  }

  if (inCodeBlock) {
    const langClass = codeLang ? ` class="language-${escapeHtml(codeLang)}"` : ''
    parts.push(`<pre><code${langClass}>${escapeHtml(codeLines.join('\n'))}</code></pre>`)
  }

  closeLists()
  closeBlockquote()
  return parts.join('\n')
}

