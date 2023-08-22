require('dotenv/config')

const { NotionApi } = require('./api')
const { parseBandcampUrl } = require('./import')

// eslint-disable-next-line no-unused-expressions
require('yargs')
  .scriptName('notion-record-import')
  .usage('$0 <cmd> [args]')
  .command('bandcamp [url]', 'Import a URL from Bandcamp', (yargs) => {
    yargs.positional('url', {
      type: 'url',
      describe: 'A link to the record in Bandcamp'
    })
    yargs.option('key', {
      alias: 'K',
      default: process.env.NOTION_API_KEY,
      describe: 'API key for accessing Notion. Defaults to `NOTION_API_KEY` env var',
      type: 'string'
    })
    yargs.option('dbid', {
      alias: 'd',
      default: process.env.DATABASE_ID,
      describe: 'The UUID of the database. Defaults to `DATABASE_ID` env var',
      type: 'string'
    })
  }, async ({ url, key, dbid }) => {
    const info = await parseBandcampUrl(url)
    const api = new NotionApi(key, dbid)
    const res = await api.insertRelease(info)
    console.log(`Uploaded "${info.Album}" by ${info.Artist} (${info['Release Date']}): ${res.id}`)
    console.log(res.url)
  })
  .help()
  .argv
