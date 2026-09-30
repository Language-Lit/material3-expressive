# Divider

`Divider`はリストやレイアウトの内容をグループ化する細い線です。既定ではネイティブの`<hr>`を描画します。`orientation`で横向きと縦向きを切り替え、色と太さはpropsではなくコンポーネントトークンから取得します。

```tsx
import { Divider, ListItem } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

// A full-width rule between sections.
<Divider />

// Between list items, where `hr` would be invalid HTML.
<ul>
  <ListItem as="li" headline="Inbox" />
  <Divider as="li" />
  <ListItem as="li" headline="Archive" />
</ul>

// Between controls in a flex row.
<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
  <span>Draft</span>
  <Divider orientation="vertical" />
  <span>Edited 2m ago</span>
</div>

// A rule the grouping already conveys, hidden from assistive technology.
<Divider decorative />
```

## 契約 {#contract}

`orientation`で軸を選びます。既定値は`"horizontal"`です。横向きのDividerはインライン方向いっぱいに広がり、ブロック方向の太さを持ちます。縦向きではこの関係が入れ替わります。

どちらの向きもstretchで広がるため、インライン余白を付けると親要素からはみ出すのではなく線が短くなります。これはインセットの指定方法です。横向きのDividerはblock、flex-column、gridの親要素いっぱいに広がります。縦向きは、**サイズが制約された**親要素の交差軸に沿って`align-self: stretch`で広がるため、flexまたはgridの親要素か、明示的なブロックサイズが必要です。高さが自動のblockコンテナでは縮みます。これはMaterialソースの`fillMaxHeight()`と同じ制約です。

`as`で要素を選びます。既定値は`"hr"`です。`<ul>`や`<ol>`内では`"li"`を使ってください。これらの要素内に許可されるのは`li`とスクリプト対応要素なので、リスト項目の間に`hr`を置くのは無効なマークアップです。どちらも受け付けないレイアウトでは`"div"`を使います。

純粋に視覚的な線をアクセシビリティツリーから隠すには`decorative`を指定します。MaterialのDividerは装飾だけでなくコンテンツのグループ化も担うため、既定ではセマンティックです。

コンポーネントは子要素を描画しません。Dividerは空の線で、既定要素はvoid要素です。`className`はライブラリのクラスの後に結合され、`style`とその他のネイティブ属性はそのまま渡されます。refは描画された要素を参照します。

## アクセシビリティ {#accessibility}

既定の`<hr>`には暗黙の`separator`ロールがあるため、コンポーネントは重ねて明示せずブラウザーに任せます。`div`と`li`には`role="separator"`を明示します。縦向きの区切りには`aria-orientation="vertical"`を付けます。横向きの場合はロールの暗黙値と同じなので指定しません。

`decorative`を指定すると、暗黙ロールを除く必要がある`hr`と`li`には`role="none"`を出力し、暗黙ロールがない`div`には何も指定しません。装飾用のDividerはロールを公開しないため、その方向を示す`aria-orientation`も持ちません。

Dividerにフォーカスは当たらず、キーボード操作もありません。強制カラー表示では作者指定の背景色が上書きされるため、線が消えないよう`CanvasText`で再描画します。

## トークンとソースの境界 {#tokens-and-source-boundary}

Materialソースの生成`DividerTokens`が宣言し、実際に読み取る2つのロールに対応します。

| トークン | 既定値 |
| --- | --- |
| `--m3e-comp-divider-color` | `sys.color.outlineVariant` |
| `--m3e-comp-divider-thickness` | `1px` |

Materialのソースでは、太さと色を呼び出しごとのパラメーターとして受け取ります。このライブラリでは代わりにトークンとして公開します。インスタンスごとの任意の値を出力するにはインラインスタイルが必要ですが、スコープ付きのカスタムプロパティならテーマと合成でき、`Material3Provider`の入れ子やサーバーレンダリングにも対応します。

インデントはpropではなく組み合わせによって指定します。Dividerにインライン余白を付けるか、コンテナにpaddingを設定してください。これは、Dividerの外側にpadding修飾子を付けて、サイズを変えずにインデント内部で線が短くなることを確認するソースのテストに沿っています。背景色はpadding領域いっぱいに描画されるため、Divider自体のpaddingではインセットを表現できません。

`Dp.Hairline`は再現しません。これは密度スケーリングを避け、物理ピクセル1つ分を描画するためのものです。CSSピクセルはすでに密度に依存せず、ソース自身のhairlineテストでも現行のコンポーザブルは高さ0でレイアウトされます。

`Tabs`では、tablistの子要素に`role="tab"`だけを持たせるため、`Divider`を使わずtablist下端のborderとして線を描画します。`--m3e-comp-tabs-divider-*`トークンは同じ仕様値を持つため、片方のタブ行の見た目を変更しても、両者に異なる値を適用せずに済みます。
