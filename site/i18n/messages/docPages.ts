import type { Locale } from '../locales'

/**
 * Guide titles and summaries for each non-English locale, keyed by slug. The
 * English copy is the `docPages` registry in `content/docs.ts`.
 */
export const docPageText: Partial<Record<Locale, Record<string, { title: string; summary: string }>>> = {
  ja: {
    'ag-ui-getting-started': {
      title: 'AG-UIを使い始める',
      summary: '連携パッケージをインストールしてエージェントに接続し、アプリに会話機能を追加します。',
    },
    'ag-ui-components': {
      title: 'AG-UIコンポーネントとツールレンダラー',
      summary: 'スレッドを構成し、ツールをコンポーネントとして表示し、状態を共有して承認を処理します。',
    },
    'ag-ui-copilotkit': {
      title: 'CopilotKitでAG-UIを使う',
      summary: 'CopilotKit 1.71.x v1でMaterialアダプターを使用します。',
    },
    'a2ui-getting-started': {
      title: 'A2UIを使い始める',
      summary: 'レンダラーをインストールし、A2UIメッセージをサーフェスにストリーム配信して、アクションをエージェントに返します。',
    },
    'a2ui-components': {
      title: 'A2UIコンポーネントとレンダリング規則',
      summary: '基本カタログの各コンポーネントのレンダリング方法に加え、バインディング、検証、テンプレート、テーマ設定、カタログの拡張方法を説明します。',
    },
    'mcp-apps-getting-started': {
      title: 'MCP Appsを使い始める',
      summary: '連携パッケージをインストールし、アプリリソースを登録して、Materialアプリをホストに接続します。',
    },
    'mcp-apps-hosting': {
      title: 'MCP Appsのホスティングとテーマ設定',
      summary: 'アプリを埋め込み、ツールの結果を渡し、機能とサンドボックスポリシーを設定して、ホストのスタイルを共有します。',
    },
    'getting-started': {
      title: '使い始める',
      summary: 'パッケージをインストールし、プロバイダーをレンダリングして、スタイルシートを読み込みます。',
    },
    'theming': {
      title: 'テーマ設定',
      summary: 'テーマを作成し、トークンを上書きして、テーマのスコープを入れ子にします。',
    },
    'ssr': {
      title: 'SSRとカラーモード',
      summary: 'サーバーレンダリング、ハイドレーション、システムカラーモードの仕組みを説明します。',
    },
    'web-deviations': {
      title: 'Webでの逸脱',
      summary: 'この実装がプラットフォームAPIから逸脱する箇所と、その理由を説明します。',
    },
    'migration': {
      title: '0.3からの移行',
      summary: '0.3から1.0へのAPI、トークン、スタイルシートの変更点を説明します。',
    },
    'release-notes': {
      title: 'リリースノート',
      summary: 'バージョンごとの変更点と破壊的変更を記載します。',
    },
  },
}
