const { Client } = require('@notionhq/client')

class NotionApi {
  constructor (secret, databaseId) {
    this.client = new Client({ auth: secret })
    this.databaseId = databaseId
  }

  async insertRelease (releaseData) {
    const res = await this.client.pages.create({
      parent: {
        database_id: this.databaseId
      },
      properties: this.wrapProps(releaseData)
    })
    return res
  }

  // Wrap a simple key-value object into Notion's schema.
  // Hard to do dynamically; will need to update if schema changes.
  wrapProp (key, value) {
    /*
        URL: { id: '%3B%40Ee', name: 'URL', type: 'url', url: {} },
        Artist: { id: 'ozm%3D', name: 'Artist', type: 'rich_text', rich_text: {} },
        'Release Date': { id: 'tgkY', name: 'Release Date', type: 'date', date: {} },
        'Album Art': { id: 't%7DIy', name: 'Album Art', type: 'files', files: {} },
        Album: { id: 'title', name: 'Album', type: 'title', title: {} }
       */
    switch (key) {
      case 'Album':
        return { type: 'title', title: [{ type: 'text', text: { content: value } }] }
      case 'Artist':
        return { type: 'rich_text', rich_text: [{ type: 'text', text: { content: value } }] }
      case 'Release Date':
        return { type: 'date', date: { start: value } }
      case 'URL':
        return { type: 'url', url: value }
      case 'Album Art':
        return { type: 'files', files: [{ name: value, type: 'external', external: { url: value } }] }
      default:
        throw new Error(`Unknown key: ${key}`)
    }
  }

  wrapProps (releaseData) {
    const props = {}
    for (const key of Object.keys(releaseData)) {
      props[key] = this.wrapProp(key, releaseData[key])
    }
    return props
  }
}

module.exports = { NotionApi }
