# NavigationRail

`NavigationRail`は`NavigationBar`の縦型の兄弟コンポーネントです。固定サイズのアイコン、幅が広がるピル形のインジケーター、ラベルという同じ項目構成を、固定幅のサイドカラムに並べます。項目の上には任意の`header`領域を置けます。

```tsx
import { FloatingActionButton, Icon, NavigationRail } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<NavigationRail
  aria-label="Primary sections"
  header={<FloatingActionButton aria-label="Compose" icon={<Icon source="add" />} size="medium" />}
  items={[
    { value: 'home', label: 'Home', icon: <Icon source="home" /> },
    { value: 'favorites', label: 'Favorites', icon: <Icon source="favorite" /> },
  ]}
/>
```

## 仕様 {#contract}

- `items`と`value`／`defaultValue`／`onValueChange`の仕様は`NavigationBar`と同じです。`NavigationItem`の全形式とリンク対応の`href`動作はそちらの説明を参照してください。
- `header`は利用側が用意する領域で、通常は`FloatingActionButton`やメニューボタンを置きます。固定されたソースの`header`スロットに対応し、項目の上に表示されます。
- 選択状態でもアイコンを`24×24px`の枠内に保ちます。`NavigationBar`と同様、中央のインジケーター背景だけが幅0から`56×32px`に広がります。

## トークンと境界 {#tokens-and-boundaries}

色、形状、モーションの値は`--m3e-comp-navigation-rail-*`の1つの登録にまとめられています。テーマの上書きは`Material3Provider`のスコープ内で適用されます。`NavigationRail`は実行時スタイルを注入せず、Next.js、Vite、ルーター、アニメーションライブラリ、非公開のアプリケーションコードをインポートしません。
