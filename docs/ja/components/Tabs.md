# Tabs

`Tabs`は、フォーカスを順送りする`role="tablist"`とスライドする選択インジケーターを表示します。データ駆動型のため、内容、パネル、リンクによるナビゲーションタブもすべて`items`で定義します。

```tsx
import { Icon, Tabs } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<Tabs
  aria-label="Library sections"
  items={[
    { value: 'photos', label: 'Photos', icon: <Icon source="photo" />, panel: <PhotoGrid /> },
    { value: 'shared', label: 'Shared', icon: <Icon source="folder_shared" />, panel: <SharedList /> },
  ]}
/>
```

## 仕様 {#contract}

- `items: readonly TabItem[]`でタブリストの内容を指定します。形式は`{ value, label?, icon?, disabled?, href?, panel? }`です。
- `role="tablist"`領域の名前として`aria-label`または`aria-labelledby`が必須です。これはグループロールを持つほかのコンポーネントと同じ命名要件です。
- `value`／`defaultValue`／`onValueChange`は、ほかの状態を持つコンポーネントと同じ制御／非制御の形式です。`defaultValue`を省略すると最初の項目の値が使われます。
- `variant`の既定値は`'primary'`です。短く丸いインジケーターが選択タブのコンテンツ幅に沿って表示され、`primary`で色付けされます。`'secondary'`では全幅の下線になり、ブランドカラーではなく通常の`onSurface`で色付けされます。こちらは意図的に控えめな表示です。
- `scrollable`（既定値`false`）を指定すると、均等配置の固定行から横スクロール可能な行に切り替わります。スクロール範囲内に収まる場合、選択中のタブを中央に保ちます。これはソースの`ScrollableTabRow`が独自のスクロール状態で行う動作と同じです。スクロールするのはタブ行だけで、選択時に祖先のスクロールコンテナーは移動しません。

## リンク対応のナビゲーションタブ {#link-safe-navigation-tabs}

`href`付きの項目は`<button role="tab">`ではなく`<a role="tab" href>`をレンダーします。矢印キーでローカルの選択とインジケーターの状態は更新されますが、実際のナビゲーションはブラウザー標準のアンカー動作に完全に任せます。キー入力を受けて`Tabs`がナビゲーションを合成することはありません。これによりルーターの現在のルートを使って`Tabs`を制御できます。

```tsx
<Tabs
  aria-label="Settings"
  value={router.pathname}
  items={[
    { value: '/settings/profile', label: 'Profile', href: '/settings/profile' },
    { value: '/settings/billing', label: 'Billing', href: '/settings/billing' },
  ]}
/>
```

## パネル {#panels}

`panel`を持つ項目については、選択中の項目だけに`role="tabpanel"`領域を1つ表示し、`id`／`aria-controls`／`aria-labelledby`で正しく関連付けます。リンクのみの用途など、どの項目にも`panel`がない場合は、tabpanel領域を出力しません。

## キーボード操作 {#keyboard}

| キー | 動作 |
| --- | --- |
| ArrowLeft / ArrowRight | フォーカスと選択を移動し、無効なタブを飛ばして循環 |
| Home / End | 有効な最初／最後のタブに移動して選択 |

## トークンと境界 {#tokens-and-boundaries}

色、形状、モーションの値は`--m3e-comp-tabs-*`の1つの登録にまとめられています。テーマの上書きは`Material3Provider`のスコープ内で適用されます。`Tabs`は実行時スタイルを注入せず、Next.js、Vite、ルーター、アニメーションライブラリ、非公開のアプリケーションコードをインポートしません。
