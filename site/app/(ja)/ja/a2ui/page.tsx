import Page, { pageMetadata } from '../../../../views/A2uiPage'

export const generateMetadata = () => pageMetadata('ja')

export default function Route() {
  return <Page locale="ja" />
}
