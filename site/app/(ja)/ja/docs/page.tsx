import Page, { pageMetadata } from '../../../../views/DocsIndexPage'

export const generateMetadata = () => pageMetadata('ja')

export default function Route() {
  return <Page locale="ja" />
}
