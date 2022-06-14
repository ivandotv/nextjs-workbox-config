/**
 *  Modified webpack + workbox script
 *  from: https://github.com/cansin/next-with-workbox
 * */
import glob from 'glob'
import crypto from 'node:crypto'
import path from 'node:path'
import WorkboxPlugin from 'workbox-webpack-plugin'

const getRevision = (file: string) =>
  crypto.createHash('md5').update(Buffer.from(file)).digest('hex')

export function withWorkbox(
  nextConfig: {
    webpack?: (...args: any[]) => Record<string, any>
    workbox?: {
      additionalManifestEntries?: { url: string; revision: string }[]
      dest?: string
      dontCacheBustURLsMatching?: false
      exclude?: string[]
      disable?: boolean
      modifyURLPrefix?: Record<string, string>
      swDest?: string
      swSrc?: string
    }
  } = {}
) {
  return {
    ...nextConfig,
    webpack(config: Record<string, any>, options: Record<string, any>) {
      if (typeof nextConfig.webpack === 'function') {
        config = nextConfig.webpack(config, options)
      }

      const wbConfig = {
        additionalManifestEntries: [],
        dest: 'public',
        dontCacheBustURLsMatching: false,
        exclude: [],
        disable: false,
        modifyURLPrefix: {},
        swDest: 'sw.js',
        swSrc: false,
        ...(options.config.workbox || {})
      }

      if (options.isServer) {
        return config
      }
      if (!wbConfig.swSrc) {
        throw new Error('Workbox: service worker "path" is missing')
      }

      if (wbConfig.disable) {
        console.log('Workbox: service worker is disabled')

        return config
      }

      const swSrcPath = path.join(options.dir, wbConfig.swSrc)

      console.log(`Workbox: service worker source path: "${swSrcPath}"`)

      const swDestPath = path.join(options.dir, wbConfig.dest, wbConfig.swDest)

      console.log(`Workbox: service worker destination path: "${swDestPath}"`)

      const defaultDontCacheBustURLsMatching = /^\/_next\/static\/.*/iu

      const defaultWorkboxOptions = {
        swDest: swDestPath,
        dontCacheBustURLsMatching: wbConfig.dontCacheBustURLsMatching
          ? new RegExp(
              `${wbConfig.dontCacheBustURLsMatching.source}|${defaultDontCacheBustURLsMatching.source}`,
              'iu'
            )
          : defaultDontCacheBustURLsMatching,
        additionalManifestEntries: glob
          .sync('**/*', {
            cwd: wbConfig.dest,
            nodir: true
          })
          .filter((f: string) => f.indexOf(wbConfig.swDest) !== 0)
          .map((f: string) => ({
            url: `/${f}`,
            revision: getRevision(`public/${f}`)
          }))
          .concat(wbConfig.additionalManifestEntries),
        exclude: [
          /_next\/server\/.*/i,
          /middleware-.+(js|json)/i,
          /^build-manifest\.(js|json)$/i,
          /^react-loadable-manifest\.(js|json)$/i,
          /\/_error\.js$/i,
          /\.js\.map$/i,
          ...wbConfig.exclude
        ],
        modifyURLPrefix: {
          [`${config.output.publicPath || ''}static/`]: '/_next/static/',
          ...wbConfig.modifyURLPrefix
        }
      }

      config.plugins.push(
        new WorkboxPlugin.InjectManifest({
          swSrc: swSrcPath,
          ...defaultWorkboxOptions
        })
      )

      return config
    }
  }
}
