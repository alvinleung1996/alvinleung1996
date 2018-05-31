declare module 'pwa-helpers/router' {
  export function installRouter(locationUpdatedCallback: (location: Location, event: MouseEvent | null) => void): void
}
