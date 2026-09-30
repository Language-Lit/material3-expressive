import Page, { pageMetadata } from '../../../views/ComponentsPage'

export const generateMetadata = () => pageMetadata('en')

export default function Route() {
  return <Page locale="en" />
}
