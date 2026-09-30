# はじめに

## インストール {#install}

パッケージとReactのpeer依存関係をインストールします。

```bash
npm install @language-lit/material3-expressive react react-dom
```

Tailwindは必須ではなく、peer依存関係でもありません。パッケージにはコンパイル済みのCSSが含まれています。

## スタイルシート全体を読み込む {#import-the-complete-stylesheet}

アプリケーションレベルのエントリから、スタイルシート全体を一度だけ読み込みます。

```tsx
import '@language-lit/material3-expressive/styles.css'
```

このスタイルシートには、デフォルトの参照トークン、システムトークン、コンポーネントトークンと、準拠しているすべてのコンポーネントのスタイルが含まれています。パッケージをTailwindのcontent globに追加しないでください。

## プロバイダーをレンダリングする {#render-a-provider}

`Material3Provider`は1つのテーマスコープを管理します。propsを指定しない場合は完全なデフォルトテーマを適用し、オペレーティングシステムのカラーモード設定に従います。

```tsx
import {
  Button,
  Material3Provider,
  Text,
} from '@language-lit/material3-expressive'

export function App() {
  return (
    <Material3Provider>
      <main>
        <Text as="h1" variant="headlineLarge">
          Welcome
        </Text>
        <Button variant="filled">Get started</Button>
      </main>
    </Material3Provider>
  )
}
```

プロバイダーは`.m3e-theme`クラスを持つ`div`をレンダリングし、通常のdiv属性、`className`、`style`を転送します。ネイティブのドキュメント構造はアプリケーション側で管理します。

## カスタムテーマまたはネストしたテーマを使う {#use-custom-or-nested-themes}

サーバーでも安全に使えるthemeエントリからテーマデータを作成し、検証済みの不変値をプロバイダーに渡します。

```tsx
import { Material3Provider } from '@language-lit/material3-expressive'
import { createTheme } from '@language-lit/material3-expressive/theme'

const brandTheme = createTheme({
  reference: {
    typeface: {
      brand: ['Roboto Flex', 'sans-serif'],
    },
  },
})

export function BrandedArea({ children }) {
  return (
    <Material3Provider theme={brandTheme} colorMode="system">
      {children}
    </Material3Provider>
  )
}
```

テーマの拡張、パレットの参照、ネストしたスコープ、解決済みモードのフックについては[THEMING.md](THEMING.md)をご覧ください。

## コンポーネントを選ぶ {#choose-a-component}

[サポート対象コンポーネントの一覧](SUPPORTED_COMPONENTS.md)は公開インベントリから生成されます。リンク先の各ページでは、構造、バリアントと状態、アクセシビリティの動作、トークン、使用例を説明しています。

各ページの説明に従って、ネイティブのラベルとアクセシブルな名前を使ってください。アイコンのみのコントロール、進捗インジケーター、ナビゲーション領域、ダイアログ、一時的なフィードバックでは、記載されている箇所でアプリケーション側からラベルや関連付けを指定する必要があります。

## サーバーレンダリング {#server-rendering}

ルートエントリには、クライアントで利用できるReact APIが含まれています。テーマとトークンのデータは、サーバーモジュールから`/theme`と`/tokens`を通じて作成できます。システムモードのハイドレーションを一貫させる方法とフレームワークの例については[SSR.md](SSR.md)をご覧ください。
