import Page, { pageMetadata, staticParams } from '../../../../views/ComponentPage'

interface Props {
  params: Promise<{ component: string }>
}

export const generateStaticParams = staticParams

export async function generateMetadata({ params }: Props) {
  return pageMetadata('en', (await params).component)
}

export default async function Route({ params }: Props) {
  return <Page locale="en" param={(await params).component} />
}
