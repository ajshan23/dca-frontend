export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    tourPath: string
    locale: string
    enableMock: boolean
}

const appConfig: AppConfig = {
    apiPrefix: 'https://dcab.igniteway.in/api',
    // apiPrefix: 'http://localhost:4001/api',
    authenticatedEntryPath: '/home',
    unAuthenticatedEntryPath: '/sign-in',
    tourPath: '/',
    locale: 'en',
    enableMock: true,
}

export default appConfig
//