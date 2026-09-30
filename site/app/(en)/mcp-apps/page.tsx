import Page, { pageMetadata } from '../../../views/McpAppsPage'

export const generateMetadata = () => pageMetadata('en')

export default function Route() {
  return <Page locale="en" />
}
