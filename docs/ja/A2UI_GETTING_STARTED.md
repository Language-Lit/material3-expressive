# A2UIをはじめる

`@language-lit/material3-expressive-a2ui`は、Google A2UIのサーフェスをMaterial 3 Expressiveで表示します。A2UIは、エージェントがデータバインディングを持つカタログコンポーネントのツリーとしてUIを記述し、それをJSONメッセージとしてストリーミングするプロトコルです。このcompanionはA2UI basic catalogのすべてのコンポーネントをMaterial 3 Expressiveのコンポーネントに対応づけるため、エージェントが生成したUIもアプリの他の部分と同じテーマを使います。

このガイドはReact 18または19、`@language-lit/material3-expressive` 1.2.x、`@a2ui/web_core` 0.10.xを通じたA2UIプロトコルv0.9.1を対象とします。このcompanionは独立したコミュニティ実装であり、Googleとは提携していません。

## エージェントに接続する前に試す {#try-it-before-connecting-an-agent}

[インタラクティブデモ](https://m3e.language-lit.com/a2ui/)はすべてブラウザー内で動作します。スクリプトで用意したA2UIメッセージを一つずつレンダラーにストリーミングするため、プレースホルダーが埋まる様子、バインドしたフィールドの編集、検証の通過、エージェントに返されるアクションを確認できます。LLMは呼び出されず、APIキーも必要ありません。

## インストール {#install}

既存のReactアプリにcompanionと必須peer依存関係をインストールします。

```bash
npm install @language-lit/material3-expressive-a2ui @language-lit/material3-expressive @a2ui/web_core
```

`@a2ui/web_core`はGoogleのプロトコルランタイムです。メッセージを検証し、サーフェスとデータモデルを管理して、バインディングとカタログ関数を評価します。companion自体にランタイム依存関係はありません。

## スタイルを読み込む {#load-the-styles}

アプリケーションのルートで、次の順に両方のスタイルシートを一度だけ読み込みます。

```tsx
import '@language-lit/material3-expressive/styles.css'
import '@language-lit/material3-expressive-a2ui/styles.css'
```

両パッケージは同じMaterialテーマを使います。既存の`Material3Provider`で、アプリの他の部分とエージェントのサーフェスをまとめて囲めます。カスタムカラーとネストしたスコープについては[テーマガイド](THEMING.md)をご覧ください。

## サーフェスをレンダリングする {#render-a-surface}

`useA2ui`でメッセージプロセッサを管理し、エージェントから届くメッセージを渡して、各サーフェスを`A2uiSurface`でレンダリングします。

```tsx
'use client'

import { Material3Provider } from '@language-lit/material3-expressive'
import { A2uiSurface, useA2ui } from '@language-lit/material3-expressive-a2ui'
import type { A2uiClientAction, A2uiMessage } from '@a2ui/web_core/v0_9'

export function AgentPanel({ send }: { send: (action: A2uiClientAction) => void }) {
  const { surfaces, processMessages } = useA2ui({
    onAction: (action) => send(action),
    onError: (error, surfaceId) => console.warn(surfaceId, error),
  })

  // Call this with each batch your transport delivers.
  const receive = (messages: A2uiMessage[]) => processMessages(messages)

  return (
    <Material3Provider>
      {surfaces.map((surface) => (
        <A2uiSurface key={surface.id} surface={surface} />
      ))}
    </Material3Provider>
  )
}
```

companionはトランスポートを提供しません。エージェントのフレームワークからA2A、HTTP、WebSocketなどの経路でA2UIメッセージを届けてください。JSONの各行を解析し、1件ずつ、またはまとめて`processMessages`に渡します。`createSurface`メッセージの到着時にサーフェスが表示され、`deleteSurface`で削除されます。

`useA2ui`は安定した関数と、サーフェスに変更があるたびに変わる`surfaces`配列を返します。結果オブジェクト全体ではなく、関数をエフェクトの依存関係にしてください。

## レンダリング可能な内容をエージェントに伝える {#tell-the-agent-what-you-can-render}

最初のリクエストとともにクライアントのcapabilitiesを送信し、エージェントがbasic catalogを選べるようにします。

```ts
const { getClientCapabilities, getClientDataModel } = useA2ui()

const capabilities = getClientCapabilities()
// { 'v0.9.1': { supportedCatalogIds: ['https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json'] } }

const dataModel = getClientDataModel()
// The data model of every surface created with sendDataModel, or undefined.
```

## アクションを返す {#send-actions-back}

`action`を持つ`Button`を押すと、クライアントアクションが送信されます。アクションには、サーフェス、送信元コンポーネント、タイムスタンプ、エージェントが要求した解決済みの`context`が含まれます。これをエージェントに送信します。

```json
{
  "name": "reserve",
  "surfaceId": "table",
  "sourceComponentId": "reserve-button",
  "timestamp": "2026-09-11T10:00:00.000Z",
  "context": { "name": "Ada", "guests": 2 }
}
```

`checks`を持つボタンは、すべてのチェックに合格するまで無効です。そのため、アクションは有効なデータでのみ送信されます。デモには送信される各アクションが表示されます。

## 表示されるエラー {#errors-you-will-see}

`onError`は2種類の報告を受け取ります。検証に失敗したメッセージはプロセッサエラーであり、エージェントがプロトコルで許可されていない内容を送信したことを示します。サーフェスからの`EXPRESSION_ERROR`は、`formatCurrency`や`required`などのカタログ関数が、必要な値がまだない状態で実行されたことを示します。サーフェスのストリーミング中や必須フィールドが未入力の間に起きる通常の現象で、データが届くと解消されます。2つ目は診断情報として扱ってください。`onError`がない場合、プロセッサエラーは`processMessages`からスローされます。

## 次のステップ {#next-steps}

- [コンポーネントとレンダリング規則](A2UI_COMPONENTS.md)：各カタログコンポーネントの表示、バインディングと検証、テンプレート、テーマ設定、カタログの拡張方法、Google独自のReactサーフェスでの利用方法を説明します。
- [A2UI仕様](https://a2ui.org)：プロトコル、basic catalog、メッセージ形式を確認できます。
