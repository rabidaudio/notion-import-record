const { JSDOM } = require('jsdom')
const dayjs = require('dayjs')

async function parseBandcampUrl (url) {
  const res = await fetch(url)
  const body = await res.text()
  const dom = new JSDOM(body)
  const el = dom.window.document.querySelector('script[type="application/ld+json"]')
  const data = JSON.parse(el.innerHTML)
  return {
    Artist: data.byArtist.name,
    Album: data.name,
    'Release Date': dayjs(data.datePublished).format('YYYY-MM-DD'),
    URL: url,
    'Album Art': data.image
  }
}

module.exports = { parseBandcampUrl }
