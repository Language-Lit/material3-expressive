import Page, { pageMetadata } from '../../../../views/McpAppsPage'

export const generateMetadata = () => pageMetadata('ja')

export default function Route() {
  return <Page locale="ja" />
}
