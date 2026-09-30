# AG-UIをはじめる

`@language-lit/material3-expressive-ag-ui`は、Material 3 Expressiveを使ってエージェントとの会話を表示します。AG-UIはエージェントとインターフェースの間で、メッセージ、ツール呼び出し、実行イベントを受け渡します。このライブラリはReact UIを提供します。

このガイドはReact 18または19と`@language-lit/material3-expressive` 1.2.xを対象とします。WebサイトのデモではAG-UI clientとcore 0.0.59を使います。パッケージが宣言するAG-UIのpeer依存関係は、どちらも>=0.0.50です。

## エージェントに接続する前に試す {#try-it-before-connecting-an-agent}

[インタラクティブデモ](https://m3e.language-lit.com/ag-ui/)はすべてブラウザー内で動作します。返信、天気予報、プロジェクト計画はスクリプトで用意されています。APIキーなしで予報の単位を変更したり、プロジェクトのタスクを完了したり、招待を承認したりできます。招待は送信されず、LLMも呼び出されません。

## インストール {#install}

既存のReactアプリにcompanionと必須peer依存関係をインストールします。

```bash
npm install @language-lit/material3-expressive-ag-ui @language-lit/material3-expressive @ag-ui/client @ag-ui/core
```

ネイティブのAG-UI構成にCopilotKitは不要です。アプリですでにCopilotKit 1.71.xを使っている場合は、[アダプターガイド](AG_UI_COPILOTKIT.md)をご覧ください。

## スタイルを読み込む {#load-the-styles}

アプリケーションのルートで、次の順に両方のスタイルシートを一度だけ読み込みます。

```tsx
import '@language-lit/material3-expressive/styles.css'
import '@language-lit/material3-expressive-ag-ui/styles.css'
```

両パッケージは同じMaterialテーマを使います。既存の`Material3Provider`で、アプリの残りの部分とエージェントインターフェースをまとめて囲めます。カスタムカラーとネストしたスコープについては[テーマガイド](THEMING.md)をご覧ください。

## エージェントに接続する {#connect-an-agent}

AG-UIエンドポイント用の`HttpAgent`を作成し、`AgentProvider`に紐付けて`AgentChat`をレンダリングします。レンダリング間でエージェントのインスタンスを維持してください。

```tsx
'use client'

import { useMemo } from 'react'
import { HttpAgent } from '@ag-ui/client'
import { Material3Provider } from '@language-lit/material3-expressive'
import {
  AgentChat,
  AgentProvider,
} from '@language-lit/material3-expressive-ag-ui'

export function AgentPanel() {
  const agent = useMemo(() => new HttpAgent({ url: '/api/agent' }), [])

  return (
    <Material3Provider>
      <AgentProvider agent={agent}>
        <AgentChat
          emptyState={<p>What would you like to work on?</p>}
          composer={{ label: 'Message your agent' }}
        />
      </AgentProvider>
    </Material3Provider>
  )
}
```

`/api/agent`はURLの例です。アプリケーション側でそのURLにAG-UIエンドポイントを用意するか、エージェントのアドレスに置き換えてください。このライブラリはバックエンド、モデル、認証サービスを提供しません。モデルの認証情報はサーバー側で管理してください。公開デモでは`HttpAgent`の代わりにローカルの`AbstractAgent`を使います。

チャットパネルを高さいっぱいに表示するには、親要素に`height: 40rem`などの明示的な高さを設定します。`AgentChat`はその高さを使い、会話スレッドをスクロールします。

## レイアウトを選ぶ {#choose-a-layout}

`AgentChat`は`MessageThread`、`RunStatus`、`Composer`を組み合わせます。別のレイアウトが必要な場合は、これらのコンポーネントを自分で配置できます。

```tsx
import {
  Composer,
  MessageThread,
  RunStatus,
} from '@language-lit/material3-expressive-ag-ui'

// Render inside the AgentProvider from the previous example.
export function Conversation() {
  return (
    <section aria-label="Agent conversation">
      <MessageThread emptyState={<p>Start a conversation.</p>} />
      <RunStatus />
      <Composer label="Message your agent" />
    </section>
  )
}
```

各エージェントは一度だけ紐付けます。`AgentProvider`の子コンポーネントでは、`useAgentContext()`を使って状態を読み取ったりメッセージを送信したりします。`AgentProvider`を使わずに紐付けを管理する場合に限り、`useAgent(agent)`を直接使います。

## 次のステップ {#next-steps}

- [コンポーネントとツールレンダラー](AG_UI_COMPONENTS.md)：ツールをカードとして表示し、コントロールと状態を共有し、承認を処理します。
- [CopilotKitアダプター](AG_UI_COPILOTKIT.md)：CopilotKit 1.71.x v1のアプリケーションでMaterial UIを使います。
