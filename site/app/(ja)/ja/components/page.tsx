import Page, { pageMetadata } from '../../../../views/ComponentsPage'

export const generateMetadata = () => pageMetadata('ja')

export default function Route() {
  return <Page locale="ja" />
}
