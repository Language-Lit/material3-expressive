import Page, { pageMetadata } from '../../../views/HomePage'

export const generateMetadata = () => pageMetadata('ja')

export default function Route() {
  return <Page locale="ja" />
}
