import Page, { pageMetadata } from '../../../views/DocsIndexPage'

export const generateMetadata = () => pageMetadata('en')

export default function Route() {
  return <Page locale="en" />
}
