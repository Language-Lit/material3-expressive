import Page, { pageMetadata } from '../../views/HomePage'

export const generateMetadata = () => pageMetadata('en')

export default function Route() {
  return <Page locale="en" />
}
