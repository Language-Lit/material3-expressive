# テーマ

スタイルシート全体を一度だけ読み込み、Material 3トークンを適用する範囲をプロバイダーで囲みます。

```tsx
import { Material3Provider } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

export function App() {
  return <Material3Provider colorMode="system">...</Material3Provider>
}
```

プロバイダーは、完全で不変なデフォルトテーマとシステムカラーモードをデフォルトで適用します。`.m3e-theme`クラスを持つ`div`をレンダリングし、`className`、`style`、その他のdiv属性をその要素に転送します。

## テーマを作成、拡張する {#create-and-extend-themes}

テーマユーティリティは部分的な上書きを受け取り、完成したテーマ全体を検証して、新しいディープフリーズ済みの値を返します。

```tsx
import { Material3Provider } from '@language-lit/material3-expressive'
import { createTheme } from '@language-lit/material3-expressive/theme'

const compactTheme = createTheme({
  density: { scale: -1 },
  reference: {
    typeface: {
      brand: ['Roboto Flex', 'sans-serif'],
    },
  },
})

export function App() {
  return <Material3Provider theme={compactTheme}>...</Material3Provider>
}
```

`./theme`と`./tokens`のサブパスにはReactランタイムが含まれず、サーバーのデータモジュールで安全に使えます。ルートエントリはプロバイダーとフックも公開しているため、便利なReactクライアント向けAPIです。

カラースキームはテーマの`reference.palette`パスを参照します。ロールの色調マッピングを維持する場合はパレット値を上書きし、別のパレットトーンを使う場合はロールの`$ref`を上書きします。無効な参照やコントラストを損なうスキームは拒否されます。

## ネストしたスコープ {#nested-scopes}

各プロバイダーは完全なデフォルトスコープから始め、そのテーマの差分を適用します。ネストしたプロバイダーは親から独立しています。

```tsx
<Material3Provider theme={brandTheme}>
  <MainContent />
  <Material3Provider theme={editorTheme} colorMode="dark">
    <Editor />
  </Material3Provider>
</Material3Provider>
```

## Portalで表示するオーバーレイ {#portaled-overlays}

`Menu`、`Select`のポップアップリストボックス、`Tooltip`、`Snackbar`は`document.body`にレンダリングされるため、祖先要素の`overflow`やスタッキングコンテキストの外に表示されます。これらはプロバイダー要素の外側に置かれ、継承だけではスコープが届きません。そのため、各オーバーレイはPortalのルートに、囲んでいるスコープ（`.m3e-theme`クラス、カラーモード属性、プロバイダーのインラインテーマ差分）を再適用します。

利用側での追加対応は不要です。ネストしたプロバイダー内で開いたオーバーレイにはそのネストしたスコープが引き継がれ、上位にプロバイダーがない場合はスコープを出力しません。そのため、アプリケーションが`.m3e-theme`と`data-m3e-color-mode`を`<html>`自体に設定している場合、その設定が引き続き`document.body`を制御します。

```tsx
<Material3Provider theme={editorTheme} colorMode="dark">
  <Editor /> {/* a Menu opened here paints editorTheme's dark scheme */}
</Material3Provider>
```

## SSRと解決済みモード {#ssr-and-resolved-mode}

`systemModeFallback`は、`useResolvedColorMode`がサーバーとハイドレーション時に使う決定的なスナップショットを制御します。静的CSSはハイドレーション前から、ブラウザーのシステムカラースキームを選択します。

```tsx
const mode = useResolvedColorMode() // "light" or "dark"
const theme = useMaterial3Theme()
```

これらのフックは別々のコンテキストを使うため、解決済みモードだけを読むコンポーネントはテーマオブジェクト全体を購読しません。

ハイドレーション前に`data-m3e-resolved-color-mode`を調べるアプリケーションでは、`preventColorSchemeFlash`を指定して任意の静的初期化スクリプトを出力できます。リクエストのCSP nonceは`nonce`で渡します。このスクリプトはデフォルトでは出力されず、ドキュメントルートも変更しません。
