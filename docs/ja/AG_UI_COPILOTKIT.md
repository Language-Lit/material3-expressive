# CopilotKitでAG-UIを使う

Materialアダプターがサポートするのは**CopilotKit 1.71.x v1のみ**です。1.71.0でテストされています。CopilotKitのv2 スロット APIは`@language-lit/material3-expressive-ag-ui`ではサポートされていません。

CopilotKitがすでに会話を管理している場合にこのアダプターを使います。ネイティブのAG-UIエージェントには[はじめ方ガイド](AG_UI_GETTING_STARTED.md)を使ってください。

## 任意のpeer依存関係をインストールする {#install-the-optional-peers}

[ネイティブセットアップ](AG_UI_GETTING_STARTED.md#install)のパッケージをインストールし、サポート対象のCopilotKit peer依存関係を追加します。

```bash
npm install @copilotkit/react-core@~1.71.0 @copilotkit/react-ui@~1.71.0
```

アプリケーションのルートで、両方のMaterialスタイルシートを読み込んでください。

```tsx
import '@language-lit/material3-expressive/styles.css'
import '@language-lit/material3-expressive-ag-ui/styles.css'
```

## プリセットを適用する {#apply-the-preset}

既存の`CopilotKit`と`Material3Provider`プロバイダーの内側で、`copilotKitComponents`をチャットに展開します。

```tsx
'use client'

import { CopilotChat } from '@copilotkit/react-ui'
import { copilotKitComponents } from
  '@language-lit/material3-expressive-ag-ui/copilotkit'

export function MaterialChat() {
  return <CopilotChat {...copilotKitComponents} />
}
```

同じプリセットは`CopilotPopup`と`CopilotSidebar`でも使えます。Materialのメッセージ表示、入力コントロール、およびこれらのコンテナーで使われるヘッダー、ランチャー、ダイアログが含まれています。`className`を追加する場合は、プリセットのクラスも残してください。

```tsx
<CopilotChat
  {...copilotKitComponents}
  className={`${copilotKitComponents.className} support-chat`}
/>
```

候補や添付ファイルなど、他の機能には引き続きCopilotKitのスタイルが必要な場合があります。アダプターのコントロールにはMaterialスタイルが使われます。

## 会話の管理はCopilotKitに任せる {#keep-copilotkit-in-charge-of-the-conversation}

このパッケージの`AgentProvider`でアダプターを囲まないでください。エージェント接続、メッセージ、ツールアクション、interruptはCopilotKitが管理します。既存のCopilotKit設定で構成してください。

ツールと承認のレンダラーは、通常どおりCopilotKitを通じて登録します。アダプターはそのUIと応答コールバックを維持します。ネイティブの`AgentProvider.toolRenderers`レジストリはネイティブAG-UI構成用であり、アダプターの設定には使いません。

登録されていないツールに対して、CopilotKitが空のgenerative UIラッパーを提供することがあります。その場合、ツールの表示フォールバックがないことがあります。すべての呼び出しを表示するには、CopilotKitの`useDefaultTool`でcatch-allを登録してください。[アダプターの例](https://github.com/Language-Lit/material3-expressive-ag-ui/blob/main/playground/CopilotDemo.tsx)では、`ToolCallCard`との連携を示しています。

## エクスポートされるスロット {#exported-スロット}

プリセットには`AssistantMessage`、`UserMessage`、`Messages`、`Input`、`RenderMessage`、`Window`、`Button`、`Header`が含まれています。`/copilotkit`エントリから個別に読み込むこともできます。それぞれprops型がエクスポートされています。

このエントリは、従来の`RenderTextMessage`、`RenderActionExecutionMessage`、`RenderAgentStateMessage`、`RenderResultMessage` スロットもエクスポートします。それらのpropsはAG-UI形式のCopilotKit 1.71.xメッセージpropsであり、旧式のGraphQLメッセージインスタンスではありません。

テキストは引き続きプレーンテキストです。アダプターはMarkdown表示を追加しません。連携先をアップグレードする前に[リリースノート](https://github.com/Language-Lit/material3-expressive-ag-ui/releases)を確認してください。
