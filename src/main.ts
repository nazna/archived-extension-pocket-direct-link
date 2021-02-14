interface PocketGetArticlesResponse {
  list: Record<string, PocketGetArticlesResponseItem>
}

interface PocketGetArticlesResponseItem {
  item_id: string
  given_url: string
  resolved_url: string
}

let articles = new Map<string, string>()

const originalFetch = window.fetch

window.fetch = async function (...args) {
  const input = args[0] as string

  if (input.includes('get?annotations')) {
    const res = await originalFetch.apply(window, args)
    const json = (await res.json()) as PocketGetArticlesResponse
    const additions = new Map(Object.values(json.list).map((item) => [item.item_id, item.resolved_url]))
    articles = new Map([...articles, ...additions])
  }

  return await originalFetch.apply(window, args)
}

const observer = new MutationObserver((mutations) => {
  const targets = mutations
    .filter((mutation) => mutation.addedNodes.length && mutation.addedNodes[0].nodeName === 'ARTICLE')
    .map((mutation) => mutation.addedNodes[0])

  for (const target of targets) {
    const anchor = (target as HTMLElement).querySelector('a')

    if (anchor === null) {
      continue
    }

    const href = anchor.getAttribute('href') ?? ''
    const match = href.match(/^\/read\/(?<id>\d+)$/)

    if (match && match.groups) {
      const resolvedUrl = articles.get(match.groups.id)

      if (resolvedUrl) {
        anchor.setAttribute('href', resolvedUrl)
      }
    }
  }
})

const config: MutationObserverInit = {
  childList: true,
  subtree: true,
}

observer.observe(document, config)
