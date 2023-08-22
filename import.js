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

async function parseSpotifyUrl (url) {
  const res = await fetch(url)
  const body = await res.text()
  const dom = new JSDOM(body)
  const readMetaTag = (tag) => dom.window.document.querySelector(`meta[${tag}]`).getAttribute('content')
  return {
    // TODO: ideally there'd be a better way but Spotify is clunky.
    // This will break for artist names with " · " in them (hopefully none??)
    Artist: readMetaTag('property="og:description"').split(' · ')[0],
    Album: readMetaTag('property="og:title"'),
    'Release Date': readMetaTag('name="music:release_date"'),
    URL: url,
    'Album Art': readMetaTag('property="og:image"')
  }
}

module.exports = { parseBandcampUrl, parseSpotifyUrl }
