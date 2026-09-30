# NavigationSuite

`NavigationSuite`はビューポート幅に応じて最適なナビゲーションレイアウトを自動選択します。固定されたMaterialのブレークポイントに従い、600px未満では`NavigationBar`、600〜839pxでは`NavigationRail`、840px以上では常設の`NavigationDrawer`を表示します。

```tsx
import { Icon, NavigationSuite } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<NavigationSuite
  aria-label="Primary sections"
  items={[
    { value: 'home', label: 'Home', icon: <Icon source="home" /> },
    { value: 'favorites', label: 'Favorites', icon: <Icon source="favorite" /> },
  ]}
/>
```

## 仕様 {#contract}

- `items`と`value`／`defaultValue`／`onValueChange`には`NavigationBar`と同じ`NavigationItem`形式を使います。`header`は`NavigationRail`にだけ渡され、ほかの2つの表示幅では無視されます。
- 独自のコンポーネントトークンは登録しません。表示中の`NavigationBar`／`NavigationRail`／`NavigationDrawer`が色、形状、モーションの値をすべて提供します。
- 実際のビューポート幅を測定できないため、サーバーレンダリング時とハイドレーション前のマークアップは常にコンパクト表示（`NavigationBar`）になります。マウント直後のクライアントエフェクトで実際の幅を測り、表示を調整します。

## 構造、バリアント、状態、アクセシビリティ {#anatomy-variants-states-and-accessibility}

一度にレンダーされる公開ナビゲーションコンポーネントは1つだけです。コンパクト幅ではバー、中程度の幅ではレール、広い幅では常設ドロワーになります。選択、無効項目、任意のリンク、アイコンの形状、値の制御／非制御状態は、そのコンポーネントの公開仕様に委ねられます。

`aria-label`などでアクセシブルネームを指定し、ナビゲーション領域を識別できるようにします。表示されるバー、レール、ドロワーはネイティブのナビゲーションリンク／ボタンと`aria-current`を使い、タブリストの矢印キー動作は採用しません。ビューポートに応じた調整が行われる前でも、サーバーのマークアップはコンパクトなバーとして完全に操作できます。

## トークンと境界 {#tokens-and-boundaries}

テーマの上書きは`Material3Provider`のスコープ内で適用されます。`NavigationSuite`は実行時スタイルを注入せず、Next.js、Vite、ルーター、アニメーションライブラリ、非公開のアプリケーションコードをインポートしません。
