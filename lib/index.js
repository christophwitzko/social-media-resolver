import request from 'request'
import urljoin from 'url-join'

function resolveInstagram (url, callback) {
  url = url.replace('?modal=true', '')
  request(url, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const foundUrl = /"og:video:secure_url" content="(.*?)"/.exec(body)
      if (foundUrl && foundUrl.length > 1) {
        return callback(null, 'video', foundUrl[1])
      }
      request(urljoin(url, 'media/?size=l'), function (error, response, body) {
        if (error) return callback(error)
        if (response.statusCode !== 200) return callback('invalid response')
        callback(null, 'img', response.request.href)
      })
    } else callback(error || 'error')
  })
}

function resolveVine (url, callback) {
  request(urljoin(url, '/embed/simple?related=0'), function (error, response, body) {
    if (!error && response.statusCode === 200) {
      const foundUrl = /videoUrl"?:\s*"(.*?)"/.exec(body)
      if (foundUrl && foundUrl.length > 1) {
        callback(null, 'video', foundUrl[1])
      } else callback('not found')
    } else callback(error || 'error')
  })
}

function resolveGif (url, callback) {
  request(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      const foundUrl = /video-src="(.*?)"/.exec(body)
      if (foundUrl && foundUrl.length > 1) {
        callback(null, 'video', foundUrl[1])
      } else callback('not found')
    } else callback(error || 'error')
  })
}

export default function (url, cb) {
  if (/^https?:\/\/instagram.com\/p\//.test(url)) return resolveInstagram(url, cb)
  if (/^https?:\/\/vine.co\/v\//.test(url)) return resolveVine(url, cb)
  if (/^https?:\/\/twitter.com\/.*\/photo\/\d/.test(url)) return resolveGif(url, cb)
  return cb('resolver not found')
}
