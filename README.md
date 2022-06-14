# Next.js Workbox Configuration

Wrapper script around [`workbox-webpack-plugin`](https://developer.chrome.com/docs/workbox/modules/workbox-webpack-plugin/) that generates service worker for use with Next.js. This is a modified script from the https://github.com/cansin/next-with-workbox.


## Installation

```sh
npm i -D nextjs-workbox-config
```


## Usage

Setup [Next.js configuration](https://nextjs.org/docs/api-reference/next.config.js/introduction).

```js
import withPlugins from 'next-compose-plugins'
import { withWorkbox } from 'nextjs-workbox-config'

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  workbox: {
    //enable only in production
    enable: process.env.NODE_ENV === 'production',
    swSrc: 'src/sw.ts', // path to your service worker file
    swDest: 'sw.js' // inside public dir path
    dest:'public' // default destination for compiled service worker
  }
}

export default withPlugins([withWorkbox], nextConfig)
```

Minimal service worker setup:

```ts
/// <reference lib="es2017" />
/// <reference lib="WebWorker" />
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'

declare const self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)

export {}

```

If you want to to see a more complex service worker setup, take a look at [Next.js Material PWA Template repository](https://github.com/ivandotv/nextjs-material-pwa).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
