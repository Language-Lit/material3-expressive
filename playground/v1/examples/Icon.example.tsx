import {
  Icon,
  Surface,
  Text,
  type IconSourceProps,
} from '@language-lit/material3-expressive/v1'

function SparkSource(props: IconSourceProps) {
  return (
    <svg {...props} viewBox="0 0 24 24">
      <path d="m12 1 2.15 7.35L21.5 10.5l-7.35 2.15L12 20l-2.15-7.35L2.5 10.5l7.35-2.15L12 1Z" />
      <path d="m19 16 .85 2.65 2.65.85-2.65.85L19 23l-.85-2.65-2.65-.85 2.65-.85L19 16Z" />
    </svg>
  )
}

function ArrowSource(props: IconSourceProps) {
  return (
    <svg {...props} viewBox="0 0 24 24">
      <path d="m13 5 7 7-7 7-1.4-1.4 4.6-4.6H4v-2h12.2l-4.6-4.6L13 5Z" />
    </svg>
  )
}

export function IconExample() {
  return (
    <Surface
      as="section"
      aria-labelledby="icon-example-title"
      color="tertiary-container"
      shape="extra-large"
      className="icon-example"
    >
      <Icon
        source={SparkSource}
        decorative={false}
        label="Expressive"
        size={40}
      />
      <div>
        <Text as="h2" id="icon-example-title" variant="titleLarge" emphasis="emphasized">
          Icon sources
        </Text>
        <Text as="p" variant="bodyMedium">
          Accessible SVG sources inherit content color without a framework adapter.
        </Text>
      </div>
      <Icon source={ArrowSource} mirrored aria-describedby="icon-rtl-note" />
      <Text as="small" id="icon-rtl-note" variant="labelSmall">
        Directional artwork mirrors only when requested.
      </Text>
    </Surface>
  )
}
