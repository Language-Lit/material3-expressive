import Page, { pageMetadata, staticParams } from '../../../../../views/DocPage'

interface Props {
  params: Promise<{ slug: string }>
}

export const generateStaticParams = staticParams

export async function generateMetadata({ params }: Props) {
  return pageMetadata('ja', (await params).slug)
}

export default async function Route({ params }: Props) {
  return <Page locale="ja" param={(await params).slug} />
}
