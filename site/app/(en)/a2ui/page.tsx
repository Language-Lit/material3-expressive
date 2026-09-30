import Page, { pageMetadata } from '../../../views/A2uiPage'

export const generateMetadata = () => pageMetadata('en')

export default function Route() {
  return <Page locale="en" />
}
