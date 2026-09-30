import Page, { pageMetadata } from '../../../views/AgUiPage'

export const generateMetadata = () => pageMetadata('en')

export default function Route() {
  return <Page locale="en" />
}
