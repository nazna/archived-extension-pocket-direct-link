const s = document.createElement('script')

s.src = chrome.runtime.getURL('main.js')

document.documentElement.appendChild(s)
