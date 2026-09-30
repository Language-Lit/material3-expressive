import type { Locale } from '../locales'
import type { ComponentKind } from '../../content/inventory'

/**
 * Strings for the frame every page shares — layout, navigation, search groups,
 * breadcrumbs — and for the guide and component routes. Page-specific copy
 * lives in its own module beside this one.
 */
const en = {
  siteName: 'Material 3 Expressive for React',
  // Kept under the ~155 characters a search result shows before truncating, and
  // led by the words people search with rather than by the tagline.
  siteDescription:
    'Material 3 Expressive components for React 18 and 19. TypeScript, SSR-ready, accessible, themeable. Independent, MIT licensed, zero runtime dependencies.',
  // "React" is in every title because it is in every query: a page named only
  // "Button · Material 3 Expressive" never matches "react material 3 button".
  titleTemplate: '%s · Material 3 Expressive for React',
  skipToContent: 'Skip to content',
  footerNotice:
    'MIT licensed. Material 3 Expressive is a Google design system; this is an independent implementation.',
  footerLabel: 'Footer',
  footerRepository: 'Repository',
  home: 'Home',
  guides: 'Guides',
  components: 'Components',
  overview: 'Overview',
  allComponents: 'All components',
  interactiveDemo: 'Interactive demo',
  demos: 'Demos',
  documentationNav: 'Documentation',
  siteNav: 'Site',
  languageSwitch: 'Language',
  openRepository: 'Open the repository on GitHub',
  kinds: {
    foundation: 'Foundations',
    action: 'Actions',
    containment: 'Containment',
    input: 'Input and selection',
    overlay: 'Overlays',
    feedback: 'Feedback',
    navigation: 'Navigation',
  } satisfies Record<ComponentKind, string>,

  // /docs/
  docsIndexDescription:
    'Guides to Material 3 Expressive and its AG-UI, A2UI, and MCP Apps companions: installation, theming, agent conversations, agent-generated surfaces, and component composition.',
  docsIndexListName: 'Material 3 Expressive for React guides',
  docsIndexLede:
    'Set up Material 3 Expressive, customize your theme, add an agent conversation with the AG-UI companion, or render agent-generated surfaces with A2UI, or embed interactive tools with MCP Apps.',
  docsIndexAgUi: 'Build agent conversations with the Material 3 Expressive companion.',
  docsIndexA2ui: 'Render Google A2UI surfaces with the Material 3 Expressive companion.',
  docsIndexMcpApps: 'Host interactive tools and build apps with Material components.',
  sitemapGuidesSummary: 'Installation, theming, server rendering, and migration guides.',

  // /docs/<slug>/
  guide: 'Guide',
  sectionGuide: (section: string) => `${section} guide`,

  // /components/
  componentsDescription:
    'Every conformant component in the package, grouped by role. Only components that pass the release gates appear here.',
  componentsListName: 'Material 3 Expressive React components',
  componentsTitle: (count: number) => `${count} conformant components`,
  componentsLede:
    "A component appears here only after it passes the package's release gates. The list is generated from the same inventory that produces the supported-component matrix, so it cannot claim more than the library delivers.",
  exportsCount: (count: number) => `${count} exports`,
  buildsOn: (names: string) => ` · builds on ${names}`,
  componentsSummary: (count: number) => `All ${count} conformant components, grouped by role.`,

  // /components/<name>/
  conformant: 'conformant',
  componentHeadline: (name: string) => `${name} — Material 3 Expressive for React`,
  componentFallback: (name: string) =>
    `${name} — anatomy, variants, states, accessibility, and tokens in the Material 3 Expressive React package.`,

  // Shared interactive chrome.
  mobileNavigationOpen: 'Open navigation',
  mobileNavigationTitle: 'Navigation',
  searchButton: 'Search documentation',
  searchTitle: 'Search',
  searchField: 'Search components and guides',
  searchEmpty: (query: string) => `Nothing matches “${query}”. Try a component name such as Button, or a topic such as theming.`,
  themeButton: 'Theme',
  themeButtonCustomized: 'Theme, customized',
  themeTitle: 'Theme',
  themeReset: 'Reset',
  themeDone: 'Done',
  sourceColor: 'Source color',
  sourceColorDescription: 'Every color on this site is generated from one source color, then validated by the library before it is applied.',
  generatedPalettes: 'Generated palettes',
  colorMode: 'Color mode',
  sourceColorInvalidTheme: (error: string) => `The library rejected this theme: ${error}`,
  light: 'Light',
  dark: 'Dark',
  system: 'System',
  customSourceColor: 'Custom source color',
  cancel: 'Cancel',
  apply: 'Apply',
  saturationBrightness: 'Saturation and brightness',
  saturationBrightnessHint: 'Left and right adjust saturation. Up and down adjust brightness. Hold Shift for larger changes.',
  hue: 'Hue',
  hexColor: 'Hex color',
  hexColorHint: 'Use six hex digits, for example #6750a4.',
  hexColorInvalid: 'Enter a valid six-digit hex color.',
  copyCommand: 'Copy install command',
  commandCopied: 'Command copied',
  showCode: 'Show code',
  hideCode: 'Hide code',
  copied: 'Copied',
  copy: 'Copy',
  primary: 'Primary',
  secondary: 'Secondary',
  tertiary: 'Tertiary',
  neutralVariant: 'Neutral variant',
  tonalPaletteDescription: (color: string) => `Tonal palettes generated from the source color ${color}.`,
  shapeFieldDescription: (color: string) => `Material 3 Expressive shapes filled from the tonal palettes generated by the source color ${color}.`,
  codeExamplePath: (component: string) => `playground/examples/${component}.example.tsx`,
  presetColors: ['Baseline', 'Cobalt', 'Viridian', 'Amber', 'Crimson', 'Slate'],
  saturationBrightnessValue: (saturation: number, brightness: number) => `${saturation}% saturation, ${brightness}% brightness`,
  hueValue: (degrees: number) => `${degrees} degrees`,
}

export const shellMessages: Record<Locale, typeof en> = {
  en,
  ja: {
    siteName: 'React向けMaterial 3 Expressive',
    siteDescription:
      'React 18・19向けのMaterial 3 Expressiveコンポーネントです。TypeScript、SSR対応、アクセシブル、テーマ設定可能。独立実装、MITライセンス、ランタイム依存なし。',
    titleTemplate: '%s · React向けMaterial 3 Expressive',
    skipToContent: '本文へスキップ',
    footerNotice:
      'MITライセンスです。Material 3 ExpressiveはGoogleのデザインシステムであり、これは独立した実装です。',
    footerLabel: 'フッター',
    footerRepository: 'リポジトリ',
    home: 'ホーム',
    guides: 'ガイド',
    components: 'コンポーネント',
    overview: '概要',
    allComponents: 'すべてのコンポーネント',
    interactiveDemo: 'インタラクティブデモ',
    demos: 'デモ',
    documentationNav: 'ドキュメント',
    siteNav: 'サイト',
    languageSwitch: '言語',
    openRepository: 'GitHubでリポジトリを開く',
    kinds: {
      foundation: '基礎',
      action: 'アクション',
      containment: 'コンテナー',
      input: '入力と選択',
      overlay: 'オーバーレイ',
      feedback: 'フィードバック',
      navigation: 'ナビゲーション',
    },
    docsIndexDescription:
      'Material 3 ExpressiveとAG-UI、A2UI、MCP Appsの各連携パッケージに関するガイドです。インストール、テーマ設定、エージェントとの会話、エージェントが生成するサーフェス、コンポーネントの合成方法を紹介します。',
    docsIndexListName: 'Material 3 Expressive for Reactのガイド',
    docsIndexLede:
      'Material 3 Expressiveをセットアップしてテーマをカスタマイズできます。AG-UI連携パッケージでエージェントとの会話を追加したり、A2UIでエージェント生成サーフェスを表示したり、MCP Appsでインタラクティブなツールを埋め込んだりできます。',
    docsIndexAgUi: 'Material 3 Expressive連携パッケージでエージェントとの会話を構築します。',
    docsIndexA2ui: 'Material 3 Expressive連携パッケージでGoogle A2UIサーフェスを表示します。',
    docsIndexMcpApps: 'インタラクティブなツールをホストし、Materialコンポーネントでアプリを構築します。',
    sitemapGuidesSummary: 'インストール、テーマ設定、サーバーレンダリング、移行に関するガイドです。',
    guide: 'ガイド',
    sectionGuide: (section) => `${section}のガイド`,
    componentsDescription:
      'パッケージ内の準拠済みコンポーネントを役割ごとに掲載します。リリースゲートに合格したコンポーネントのみ表示されます。',
    componentsListName: 'Material 3 ExpressiveのReactコンポーネント',
    componentsTitle: (count) => `準拠済みコンポーネント${count}件`,
    componentsLede:
      'コンポーネントは、パッケージのリリースゲートに合格してから掲載されます。この一覧はサポート対象コンポーネント表と同じインベントリから生成されるため、ライブラリが提供する範囲を超えて紹介することはありません。',
    exportsCount: (count) => `エクスポート${count}件`,
    buildsOn: (names) => ` · 使用するコンポーネント: ${names}`,
    componentsSummary: (count) => `準拠済みコンポーネント${count}件を役割ごとに掲載しています。`,
    conformant: '準拠済み',
    componentHeadline: (name) => `${name} — Material 3 Expressive for React`,
    componentFallback: (name) =>
      `${name} — Material 3 Expressive Reactパッケージにおける構造、バリアント、状態、アクセシビリティ、トークン。`,

    mobileNavigationOpen: 'ナビゲーションを開く',
    mobileNavigationTitle: 'ナビゲーション',
    searchButton: 'ドキュメントを検索',
    searchTitle: '検索',
    searchField: 'コンポーネントとガイドを検索',
    searchEmpty: (query) => `「${query}」に一致する項目はありません。Buttonなどのコンポーネント名、またはテーマ設定などのトピックをお試しください。`,
    themeButton: 'テーマ',
    themeButtonCustomized: 'テーマ（カスタマイズ済み）',
    themeTitle: 'テーマ',
    themeReset: 'リセット',
    themeDone: '完了',
    sourceColor: 'ソースカラー',
    sourceColorDescription: 'このサイトの色はすべて1つのソースカラーから生成し、適用前にライブラリで検証しています。',
    generatedPalettes: '生成されたパレット',
    colorMode: 'カラーモード',
    sourceColorInvalidTheme: (error) => `ライブラリでテーマを検証できませんでした: ${error}`,
    light: 'ライト',
    dark: 'ダーク',
    system: 'システム',
    customSourceColor: 'カスタムソースカラー',
    cancel: 'キャンセル',
    apply: '適用',
    saturationBrightness: '彩度と明るさ',
    saturationBrightnessHint: '左右キーで彩度、上下キーで明るさを調整します。Shiftキーを押すと大きく変化します。',
    hue: '色相',
    hexColor: '16進カラーコード',
    hexColorHint: '例: #6750a4のように、16進数6桁を入力します。',
    hexColorInvalid: '6桁の有効な16進カラーコードを入力してください。',
    copyCommand: 'インストールコマンドをコピー',
    commandCopied: 'コマンドをコピーしました',
    showCode: 'コードを表示',
    hideCode: 'コードを隠す',
    copied: 'コピーしました',
    copy: 'コピー',
    primary: 'プライマリ',
    secondary: 'セカンダリ',
    tertiary: 'ターシャリ',
    neutralVariant: 'ニュートラルバリアント',
    tonalPaletteDescription: (color) => `ソースカラー${color}から生成したトーンパレットです。`,
    shapeFieldDescription: (color) => `ソースカラー${color}から生成したトーンパレットで塗ったMaterial 3 Expressiveのシェイプです。`,
    codeExamplePath: (component) => `playground/examples/${component}.example.tsx`,
    presetColors: ['標準', 'コバルト', 'ビリジアン', 'アンバー', 'クリムゾン', 'スレート'],
    saturationBrightnessValue: (saturation, brightness) => `彩度${saturation}%、明るさ${brightness}%`,
    hueValue: (degrees) => `${degrees}度`,
  },
}

/**
 * Translations of `componentsWithoutExample` in `content/examples.ts`, which
 * stays the English source because `check-site` reads it.
 */
export const componentsWithoutExampleText: Partial<Record<Locale, Record<string, string>>> = {
  ja: {
    Material3Provider:
      'プロバイダー単独のデモはありません。プロバイダー自体はマークアップを出力せず、このサイトのすべてのコンポーネントがすでにプロバイダー内にあるためです。ヘッダーのテーマコントロールが実際の動作を示します。',
  },
}
