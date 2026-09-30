# MCP Appsのホスティングとテーマ設定

`McpAppFrame`は、接続済みのMCPサーバーからUIリソースを埋め込みます。iframeとSDKブリッジを管理し、周囲のMaterialプロバイダーからホストコンテキストを取得して、アプリの初期化後にツール呼び出しを渡します。

## 接続してレンダリングする {#connect-and-render}

MCPクライアントを作成するときに拡張機能を提示します。

```ts
import { Client } from '@modelcontextprotocol/client'
import { mcpAppsClientCapabilities } from '@language-lit/material3-expressive-mcp-apps'

const client = new Client({ name: 'my-host', version: '1.0.0' }, {
  capabilities: mcpAppsClientCapabilities,
})
// Await client.connect(yourTransport) before rendering the frame.
```

リソースフックは、`resources/list`に公開され読み込み結果に含まれていないUIメタデータも含め、読み込みとエラーを処理します。

```tsx
import { Material3Provider } from '@language-lit/material3-expressive'
import { McpAppFrame, useMcpAppResource } from '@language-lit/material3-expressive-mcp-apps'
import type { Client, CallToolResult } from '@modelcontextprotocol/client'

export function ToolPanel({ client, uri, result }: {
  client: Client; uri: string; result: CallToolResult
}) {
  const { resource, loading, error } = useMcpAppResource(client, uri)
  if (error) return <p role="alert">{error.message}</p>
  if (loading || !resource) return <p>Loading app…</p>
  return <Material3Provider>
    <McpAppFrame client={client} resource={resource} title="Tool result"
      sandboxUrl={sandboxUrl}
      onAuthorizeToolCall={async ({ name, arguments: args }) =>
        name === 'refresh_result' && await mayRefresh(args)}
      toolResult={result} maxHeight={600}
      availableDisplayModes={['inline', 'fullscreen', 'pip']} />
  </Material3Provider>
}
```

利用可能な場合は`toolInfo={{ id, tool }}`と`toolInput={arguments}`を渡します。`toolCancelled={{ reason }}`でキャンセルを伝えます。値は初期化後に送信され、参照が変わると再度送信されます。新しい通知には新しいオブジェクトを使ってください。サーバーアクセスが不要な場合に限り、clientに`null`を渡します。

## ホストアクションを明示的に有効にする {#enable-host-actions-deliberately}

| Prop | ホストの動作 |
| --- | --- |
| `onMessage` | ユーザーターンの追加リクエストを受け取ります。falseを返すと拒否します。 |
| `onUpdateModelContext` | モデル向けのコンテキストを受け取ります。 |
| `onDownloadFile` | ダウンロードリクエストを処理します。falseを返すと拒否します。 |
| `onOpenLink` | URLを処理します。falseを返すと拒否します。 |
| `onLog` | アプリのログを受け取ります。 |
| `onBridge` | 高度なプロトコル操作のためのSDKブリッジを公開します。 |
| `onStatusChange`、`onError` | ライフサイクルと失敗を報告します。 |
| `onTeardownRequest` | アプリが終了を要求します。アンマウントするタイミングはホストが決めます。 |

メッセージ、コンテキスト更新、ダウンロードのcapabilityは、該当するコールバックがある場合のみ提示されます。独自のリンクハンドラーがない場合、HTTP(S)リンクは`noopener`付きで新しいタブに開き、その他のスキームは拒否されます。デモではリンクリクエストをローカルに記録します。SDKは接続済みクライアントを通じてサーバーのツールとリソースをプロキシします。`onAuthorizeToolCall`がtrueを返さない限り、アプリからのツール呼び出しは拒否されます。MCPサーバーでも同じ呼び出しを認証、認可してください。ブラウザーのコールバックはバックエンドのセキュリティ境界ではありません。

## テーマとスタイルの反映 {#theme-and-style-projection}

フレームは周囲のプロバイダーから現在のMaterial CSSトークンを読み取り、色、タイポグラフィ、角、影のMCPスタイル変数に反映します。`styleVariables`を使うとこの反映を上書きできます。`fonts`にはfont-face CSSを指定できます。`collectFontFaceCss`はアクセス可能な同一オリジンのスタイルシートを読み取ります。不透明なiframeからクロスオリジンのフォントをリクエストする場合、適切なCORSとCSPの許可が必要です。プレビューはローカルのフォールバックフォントを使うため、アプリ内でフォントを取得する必要はありません。

Materialにsuccess／warningのロールはないため、プロトコルのsuccess／warningはtertiary／secondaryに対応づけられます。等幅フォントにはシステムスタック、通常の境界線には1pxを使い、semiboldはMaterialのmediumに対応づけます。これらは変換上の選択であり、新しいMaterialトークンではありません。

`McpAppProvider`はホストのライト／ダークモードに従い、ルートにホスト変数を公開し、指定されたフォントを適用して安全領域に余白を追加します。ホストのカスタムパレットは、プロトコルの変数から完全なMaterialテーマとして再構築されません。両側を管理し同じカスタムカラーを使う必要がある場合は、共有の`theme`を明示的に渡してください。`colorMode`でホストのモードを上書きできます。propsを使うと、プロバイダーのドキュメントテーマへの作用とホストスタイルへの作用を無効にできます。

## レイアウトとライフサイクル {#layout-and-lifecycle}

インライン表示の高さは、`minHeight`と`maxHeight`の範囲でアプリのサイズ通知に従います。fullscreenとpipでは、同じiframeを維持したままサーフェスの位置を変更するため、アプリの状態は保持されます。`displayMode`と`onDisplayModeChange`でモードを制御するか、`defaultDisplayMode`を使います。アプリは`useDisplayMode`でモードを要求できますが、許可されるのはホストが提示したモードのみです。

FullscreenはCSSによるレイアウトであり、モーダルダイアログでもブラウザーのFullscreen APIでもありません。フレームには終了コントロールがあります。ホスト側のコントロールでEscapeを押すとインライン表示に戻ります。iframe内のキーボードイベントは親にバブルしないため、必要に応じてアプリ側にもキーボードで終了する操作を実装してください。モーダルのフォーカストラップは保証されません。

アンマウントするとブリッジが閉じます。リソースを変更した場合、またはハンドシェイクcapabilityの有無が変わった場合は再接続します。コールバックのidentityが変わっても再接続しません。接続の作成時に読み込まれるカスタムトランスポートは、アクティブなセッション中に切り替わりません。

## リソースの信頼性とサンドボックスポリシー {#resource-trust-and-sandbox-policy}

ブラウザーで埋め込むには、ホストとは別オリジンのHTTP(S)プロキシである`sandboxUrl`が必要です。このプロキシはSDKのサンドボックスハンドシェイクを実行し、内側のiframeでアプリを配信して、リソースのCSPと権限を適用します。リソースからのポリシー要求をホストの方針に照らして検証してから許可してください。

連携パッケージのリポジトリには、`deploy/sandbox`に独立してビルドされるサービスが含まれています。起動URLには、認証済みのホストバックエンドが発行する署名付きの短時間有効なチケットが必要です。サービスには正確な公開オリジン、許可する正確なホストオリジン、32個以上のランダムバイトからなるサーバーサイドシークレットを設定してください。そのシークレットをブラウザーコードに入れないでください。このサービスでは一度だけ使えるビューをメモリー内で管理するため、1つのインスタンスでデプロイするか、スティッキールーティングを有効にしてください。

サーバー登録については[はじめ方ガイド](MCP_APPS_GETTING_STARTED.md)、サンドボックスの責任範囲については[公式プロトコル](https://apps.extensions.modelcontextprotocol.io/api/)をご覧ください。この連携パッケージは任意のHTMLの安全性を認定せず、ホストの認可レイヤーも置き換えません。
