import Page, { pageMetadata } from '../../../../views/AgUiPage'

export const generateMetadata = () => pageMetadata('ja')

export default function Route() {
  return <Page locale="ja" />
}
