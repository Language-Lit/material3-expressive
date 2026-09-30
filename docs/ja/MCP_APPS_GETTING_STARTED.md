# MCP Appsを使い始める

MCP Apps連携パッケージは、Material 3 Expressiveを公式のMCP Apps SDKに接続します。アプリを埋め込むホストフレームと、Materialコンポーネントでアプリの内容を構築するためのアプリプロバイダーを提供します。このガイドは公開バージョン0.2.1を対象とします。

## インストール {#install}

連携パッケージとpeer依存関係をインストールします。

```sh
npm install @language-lit/material3-expressive-mcp-apps@0.2.1
npm install @language-lit/material3-expressive @modelcontextprotocol/client@^2.0.0 @modelcontextprotocol/ext-apps@^2.0.0 react react-dom
```

ホストのドキュメントとアプリのドキュメントの両方で、次の順にスタイルシートを読み込む必要があります。

```tsx
import '@language-lit/material3-expressive/styles.css'
import '@language-lit/material3-expressive-mcp-apps/styles.css'
```

このパッケージはMaterial 1.2.xと1.3 prerelease系列、ext-apps ^2.0.0、分割されたclient ^2.0.0、React／React DOM 18または19のpeer依存関係をサポートします。このデモではMaterial 1.3.0-rc.1、ext-apps/client/server 2.0.0、React 19をテストしています。外部ホストとの相互運用性を認定するものではありません。コアMaterialパッケージにはMCP依存関係は追加されません。

## アプリを構築する {#build-the-app}

iframe内で`./app`エントリを使います。親ホストに接続し、ホストのライト／ダークモードに従って、最新のツール呼び出しを公開します。

```tsx
import { McpAppProvider, useToolCall, useMcpApp } from
  '@language-lit/material3-expressive-mcp-apps/app'
import { Button, Text } from '@language-lit/material3-expressive'

function ToolContent() {
  const { result } = useToolCall()
  const { app, isConnected, hostCapabilities } = useMcpApp()
  return <>
    <Text as="p" variant="bodyMedium">
      {result ? 'Result received' : 'Waiting for a tool result'}
    </Text>
    <Button disabled={!isConnected || !hostCapabilities?.message}
      onClick={() => void app?.sendMessage({
        role: 'user', content: [{ type: 'text', text: 'Use this result.' }],
      })}>Add to chat</Button>
  </>
}

export function App() {
  return <McpAppProvider appInfo={{ name: 'my-tool-app', version: '1.0.0' }}>
    <ToolContent />
  </McpAppProvider>
}
```

リクエストが拒否された場合はUIで処理し、アクションを提示する前に該当するホストの対応機能を確認してください。`useToolCall<TArgs>()`は完全な入力、部分入力、結果、キャンセル状態を公開します。ホストフレームのpropsが渡すのは完全な入力、結果、キャンセル状態です。高度なホストは、`onBridge`で公開されるSDKブリッジを通じて部分入力を送信できます。

アプリのJavaScriptとCSSを1つのHTMLドキュメントにまとめます。このパッケージのplaygroundとサイトのビルドスクリプトでは、esbuildを使った方法を確認できます。本番リソースからViteの開発専用エントリを読み込むことはできません。

## リソースとツールを登録する {#register-a-resource-and-tool}

MCPサーバーでは、分割されたserver SDKとZodもインストールします。公式の拡張ヘルパーを使ってツールをHTMLリソースに接続します。

```ts
import { McpServer } from '@modelcontextprotocol/server'
import { RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps'
import { registerAppResource, registerAppTool } from '@modelcontextprotocol/ext-apps/server'
import { z } from 'zod'

export function createServer(html: string) {
  const server = new McpServer({ name: 'my-tools', version: '1.0.0' })
  const uri = 'ui://my-tools/result.html'
  registerAppResource(server, 'result-app', uri, {}, async () => ({
    contents: [{ uri, mimeType: RESOURCE_MIME_TYPE, text: html }],
  }))
  registerAppTool(server, 'show_result', {
    inputSchema: z.object({ query: z.string() }),
    _meta: { ui: { resourceUri: uri } },
  }, async ({ query }) => ({
    content: [{ type: 'text', text: query }],
    structuredContent: { query },
  }))
  return server
}
```

サーバーは、アプリケーションで選んだMCPトランスポートに接続します。このライブラリはバックエンドを選択せず、認証を設定せず、エージェントも実行しません。静的デモでは、メモリー内トランスポートでクライアントとサーバーを接続します。

## アプリをホストする {#host-the-app}

`mcpAppsClientCapabilities`を使ってクライアントを作成し、接続完了を待ちます。ツールの`_meta.ui.resourceUri`を読み取り、リソース、ツール結果、別オリジンの`sandboxUrl`、`onAuthorizeToolCall`ポリシーを`McpAppFrame`に渡します。型付きの例、対応機能、サンドボックスポリシーについては[「MCP Appsのホスティングとテーマ設定」](MCP_APPS_HOSTING.md)をご覧ください。

アプリ側にMaterialホストは不要です。公式SDKを通じてMCP Appsと通信します。同様に、ホストフレームには他のUIフレームワークで構築されたアプリも埋め込めます。ホストの実装によって、サポートする任意の機能は異なる場合があります。安定したプロトコル、SDK API、ホストの責任については[公式MCP Appsドキュメント](https://apps.extensions.modelcontextprotocol.io/api/)をご覧ください。
