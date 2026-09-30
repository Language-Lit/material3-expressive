# Badge

`Badge`はアイコンに付ける小さな通知マーカーです。「新着あり」を示す点、または短い件数を表示します。`BadgeAnchor`は対象コンテンツにバッジを配置します。

```tsx
import { Badge, BadgeAnchor, NavigationBar, Tabs } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

// A dot: no content, so it is the small variant.
<Badge label="New notifications" />

// A count: any content makes it the large variant.
<Badge label="3 unread messages">3</Badge>

// Anchored to an icon.
<BadgeAnchor badge={<Badge label="3 unread">3</Badge>}>
  <Icon name="mail" />
</BadgeAnchor>

// On a navigation destination, where badges are most often used.
<NavigationBar
  items={[
    { value: 'inbox', label: 'Inbox', icon: <Icon name="inbox" />, badge: <Badge label="3 unread">3</Badge> },
    { value: 'sent', label: 'Sent', icon: <Icon name="send" /> },
  ]}
/>

// On a tab.
<Tabs
  items={[
    { value: 'all', label: 'All', icon: <Icon name="list" />, badge: <Badge label="2 new">2</Badge> },
    { value: 'archive', label: 'Archive' },
  ]}
/>
```

## 契約 {#contract}

`variant`や`size`のpropsはありません。Materialのソースと同じく、`content != null`に相当する子要素の有無でバリアントを選びます。子要素がない場合は6pxの点になり、何らかのコンテンツがあれば16pxのピルになります。0件もコンテンツとして扱うため、`<Badge>{0}</Badge>`は大きいバリアントのままです。

Materialではバッジのテキストは`+`を含めて4文字までを想定しています。そのため`999+`が想定上の最大幅です。それより長いテキストも表示でき、ピルは先頭側を基準に外へ広がりますが、仕様どおりの表示ではなくなります。

`BadgeAnchor`では`badge`にバッジを、`children`に装飾対象のコンテンツを渡します。バッジは通常のレイアウトフローから外れるため、子要素のサイズだけを計測します。バッジを追加しても周囲のレイアウトは変わりません。バッジは上端の末尾側に配置され、右から左へ記述する言語では自動的に反転します。

両コンポーネントは`<span>`を描画し、`className`をライブラリのクラスの後に結合します。ほかのネイティブ属性はそのまま渡され、`ref`も転送されます。

## アクセシビリティ {#accessibility}

支援技術に読み上げさせる内容を`label`に指定します。バッジに表示する`3`だけでなく、`label="3 unread messages"`のように意味が伝わる文言を渡します。バッジはその名前を持つ画像として公開され、表示上の文字はアクセシビリティツリーから除かれるため、件数が重複して読み上げられません。

バッジに意味がある場合は必ず`label`を指定してください。指定しない場合、バッジにはロールが設定されません。名前付きバッジのテキスト自体は通常のコンテンツとして読まれますが、点だけのバッジは読み上げられません。ほかの要素が同じ情報を伝える場合に限り、これは適切な既定動作です。

バッジは対象のナビゲーション先の後に読み上げられます。`NavigationBar`、`NavigationRail`、`Tabs`では追加のマークアップは不要です。これらのコンポーネントはアイコンスロットを支援技術から隠し、バッジはその非表示サブツリーの外側に描画します。

強制カラー表示では、バッジを`Canvas`上の`CanvasText`で描画し、`Canvas`色の輪郭を付けます。作者指定の背景色が無効化されたとき、アイコン上に文字だけが浮いて見えるのを防ぎます。

## ナビゲーションとタブでのバッジ {#badges-on-navigation-and-tabs}

`NavigationBar`、`NavigationRail`、`NavigationDrawer`、`NavigationSuite`、`Tabs`は、各項目の`badge`を受け取ります。これは、Materialのソースでバッジ用の領域を設けているコンポーネントと一致します。

Drawerには知っておくべき例外があります。MaterialではDrawer項目のバッジは**別の表現**です。アイコンに付けるエラーカラーのピルではなく、行の末尾に項目の文字色で単純な件数を表示します。そのためDrawerには文字列を渡し、ほかのコンポーネントには`Badge`を渡します。

```tsx
<NavigationDrawer
  variant="permanent"
  items={[
    { value: 'inbox', label: 'Inbox', icon: <Icon name="inbox" />, badge: '24' },
    { value: 'spam', label: 'Spam', icon: <Icon name="report" />, badge: '99+' },
  ]}
/>
```

## トークンとソースの境界 {#tokens-and-source-boundary}

| トークン | 既定値 |
| --- | --- |
| `--m3e-comp-badge-color` | `sys.color.error` |
| `--m3e-comp-badge-label-color` | `sys.color.onError` |
| `--m3e-comp-badge-shape` | `sys.shape.corners.cornerFull` |
| `--m3e-comp-badge-size` | `6px` |
| `--m3e-comp-badge-large-size` | `16px` |
| `--m3e-comp-badge-large-horizontal-padding` | `4px` |
| `--m3e-comp-badge-offset` | `6px` |
| `--m3e-comp-badge-large-horizontal-offset` | `12px` |
| `--m3e-comp-badge-large-vertical-offset` | `14px` |

Materialのソースでは、コンテナ色とコンテンツ色を呼び出しごとのパラメーターとして受け取ります。このライブラリでは代わりにトークンとして公開します。インスタンスごとに任意の値を指定するにはインラインスタイルで出力する必要がありますが、スコープ付きカスタムプロパティの上書きならテーマと合成でき、`Material3Provider`の入れ子やサーバーレンダリングにも対応します。

ソースではどちらのバリアントも`CornerFull`を使うため、両方で1つの`shape`トークンを共有します。デザイン仕様にある「3dp」と「8dp」の別々の角丸は、6pxの点と16pxのピルで同じ形状を示しています。

サイズはソースの`defaultMinSize`に合わせて最小値として設定します。バッジをその最小値より小さくするには、サイズだけでなく最小サイズも上書きしてください。サイズだけを変更しても下限が残ります。

ラベルのタイポグラフィはバッジ用トークンに登録せず、ほかのすべてのコンポーネントと同様にタイプスケールの`label-small`を直接参照します。
