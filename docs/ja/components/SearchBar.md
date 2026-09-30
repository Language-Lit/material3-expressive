# SearchBar

`SearchBar`はMaterialの検索開始点で、候補や検索結果を表示するために展開するフィールドです。検索が製品全体の主な機能である場合は、対応するアプリバー版の`SearchAppBar`を使います。

```tsx
import { Icon, IconButton, ListItem, SearchAppBar, SearchBar } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

// A search bar that expands into results, full-screen on phones and docked
// on anything larger.
<SearchBar placeholder="Search your messages" onSearch={runSearch}>
  {results.map((result) => (
    <ListItem key={result.id} headline={result.title} onClick={() => open(result)} />
  ))}
</SearchBar>

// The baseline treatment: a divider between the field and the results.
<SearchBar placeholder="Search" appearance="divided" layout="docked">
  {suggestions}
</SearchBar>

// The search app bar, pinned so it stays put as the page scrolls.
<SearchAppBar
  scrollBehavior="pinned"
  navigationIcon={<IconButton aria-label="Open navigation"><Icon source="menu" /></IconButton>}
  actions={<IconButton aria-label="Account"><Icon source="account_circle" /></IconButton>}
>
  <SearchBar placeholder="Search mail" onSearch={runSearch}>
    {results}
  </SearchBar>
</SearchAppBar>
```

## 仕様 {#contract}

`placeholder`は検索テキストのヒントです。Materialのアクセシビリティガイダンスに従い、`aria-label`で上書きしない限りフィールドのアクセシブルネームにもなります。

`query`／`defaultQuery`／`onQueryChange`でテキストを制御します。`expanded`／`defaultExpanded`／`onExpandedChange`では検索結果の表示状態を制御します。`onSearch`はEnterで検索語を送信したときに呼び出されます。これはソースの検索IMEアクションに相当するWeb上の操作です。仕様では検索後も入力テキストを見せるため、結果表示は維持します。

`appearance`はMaterialのスタイルを選び、既定値は`"contained"`です。デザインサイトが推奨するExpressiveな表示で、どの状態でも入力フィールドの塗りつぶしコンテナーを維持し、結果は独自のSurfaceに表示します。`"divided"`は標準的な表示で、フィールドと結果を区切り線で分けます。

`layout`は結果の配置先を選び、既定値はガイダンスと同じ`"adaptive"`です。幅の狭いウィンドウでは全画面表示、それより広いウィンドウではドッキング表示となり、600pxの境界でその場で切り替わります。`"docked"`または`"fullScreen"`を指定すると固定できます。

`leadingIcon`、`trailingIcon`、`avatar`は仕様で定められたスロットです。末尾アイコンは最大2個まで指定できます。アバターは仕様どおり30pxで、全角を丸く表示します。

`children`には候補または検索結果を渡します。既定では空で、独自の意味付けは追加しません。`ListItem`を組み合わせたり、カテゴリラベルを追加したり、フィルターチップを入れたり、間隔を空けてグループ分けしたりできます。これはソースの「リストコンポーネントを使って内容を追加する」という指示に沿うもので、個別のAPIにはしません。

`SearchAppBar`は検索バーを1つ囲み、`navigationIcon`と`actions`のスロット、および`"none"`（既定値）、`"pinned"`、`"enterAlways"`の`scrollBehavior`を提供します。ガイダンスにあるのは、上部に固定する動作と、コンテンツとともにスクロールして上方向へのスクロールで再表示する動作です。文書全体ではなく別の要素をスクロールする場合は、`scrollContainer`でその要素を指定します。

`className`はライブラリのクラスに追加され、ほかのネイティブ属性はすべて入力フィールドに渡されます。refは`<input>`を参照します。`SearchAppBar`のrefは`<header>`を参照します。

## 動作 {#behavior}

ポインターで有効化したとき、文字入力したとき、または下矢印キーを押したときに検索を展開します。単にフォーカスしただけでは展開しないため、Tabキーで通過しただけで画面全体を占有しません。文字を削除しても折りたたまれたバーは展開しません。展開中に下矢印キーを押すと、結果にフォーカスを移動します。

展開後のどちらのサーフェスにも入力フィールドを独自に表示します。これはMaterialソースと同じ動作です。開いている間、ページ内のバーはinertになり、フォーカス可能なフィールドは常に1つだけになります。queryは親状態として維持されるため、引き継ぎ後も検索語とカーソル位置は保たれます。

全画面表示には実際のモーダル`<dialog>`を使います。トップレイヤー、フォーカストラップ、背景のinert化、閉じたときのフォーカス復帰はプラットフォームが処理します。ドッキング表示では折りたたまれたバーの上にポータルパネルを配置し、Escapeまたは外側クリックで閉じます。contained表示では、ドロップダウンの背後をソース由来のスクラムで暗くします。

## アクセシビリティ {#accessibility}

フィールドは`combobox`で、`aria-expanded`、`aria-autocomplete="list"`を持ち、結果がある間は`aria-controls`で結果領域を参照します。Materialソースの「候補があります」という状態説明をWebの方法で伝えるため、ライブリージョンは不要です。

Escapeで折りたたみます。サーフェス内の操作で閉じた場合はフィールドにフォーカスを戻し、外側クリックで閉じた場合はクリック先のフォーカスを維持します。先頭／末尾のアイコンボタンには、ガイダンスに従って呼び出し側がラベルを付けます。

`SearchAppBar`は`banner`ランドマークです。`enterAlways`のバーは内部にフォーカスが当たると再表示されるため、Tab移動で画面外のコントロールに到達することはありません。

`prefers-reduced-motion`では遷移をなくします。強制カラーではすべてのサーフェスに`CanvasText`の境界線を残し、区切り線も見える状態にします。

## トークンとソースの境界 {#tokens-and-source-boundary}

トークンは合計30個です。Materialソースが読み取る生成済みロール10個、宣言されているものの解決に使われないアバター／フォーカスリング用ロール、およびソース内で直接読む測定値で構成されます。

| トークン | 既定値 |
| --- | --- |
| `--m3e-comp-search-bar-container-color` | `sys.color.surfaceContainerHigh` |
| `--m3e-comp-search-bar-scrolled-container-color` | `sys.color.surfaceContainerHighest` |
| `--m3e-comp-search-bar-container-height` | `56px` |
| `--m3e-comp-search-bar-container-shape` | `sys.shape.corners.cornerFull` |
| `--m3e-comp-search-bar-input-text-color` | `sys.color.onSurface` |
| `--m3e-comp-search-bar-leading-icon-color` | `sys.color.onSurface` |
| `--m3e-comp-search-bar-supporting-text-color` | `sys.color.onSurfaceVariant` |
| `--m3e-comp-search-bar-trailing-icon-color` | `sys.color.onSurfaceVariant` |
| `--m3e-comp-search-bar-avatar-shape` | `sys.shape.corners.cornerFull` |
| `--m3e-comp-search-bar-avatar-size` | `30px` |
| `--m3e-comp-search-bar-focus-ring-width` | `2px` |
| `--m3e-comp-search-bar-focus-ring-offset` | `-2px` |
| `--m3e-comp-search-bar-focus-ring-color` | `sys.color.secondary` |
| `--m3e-comp-search-bar-min-width` | `360px` |
| `--m3e-comp-search-bar-max-width` | `720px` |
| `--m3e-comp-search-bar-input-horizontal-padding` | `12px` |
| `--m3e-comp-search-bar-icon-horizontal-padding` | `4px` |
| `--m3e-comp-search-bar-vertical-padding` | `8px` |
| `--m3e-comp-search-bar-app-bar-horizontal-padding` | `4px` |
| `--m3e-comp-search-bar-app-bar-vertical-padding` | `4px` |
| `--m3e-comp-search-bar-app-bar-search-padding` | `8px` |
| `--m3e-comp-search-bar-view-divider-color` | `sys.color.outline` |
| `--m3e-comp-search-bar-view-docked-container-shape` | `sys.shape.corners.cornerExtraLarge` |
| `--m3e-comp-search-bar-view-full-screen-container-shape` | `sys.shape.corners.cornerNone` |
| `--m3e-comp-search-bar-view-full-screen-contained-container-color` | `sys.color.surfaceContainerLow` |
| `--m3e-comp-search-bar-view-docked-dropdown-shape` | `12px` |
| `--m3e-comp-search-bar-view-docked-dropdown-gap` | `2px` |
| `--m3e-comp-search-bar-view-docked-min-height` | `240px` |
| `--m3e-comp-search-bar-view-scrim-color` | `sys.color.scrim` |
| `--m3e-comp-search-bar-view-scrim-opacity` | `0.32` |

入力テキストはベースラインのbody-largeロールで、タイプスケールから直接取得します。`SearchAppBar`は独自の色を登録しません。Materialソースではアプリバーのコンテナー、スクロール時、ナビゲーション、アクションの色にアプリバーファミリーのトークンを使うため、`--m3e-comp-app-bar-*`を使用します。無効時の色も、ソースがfilledテキストフィールドのロールから解決するため`--m3e-comp-text-field-disabled-*`を使います。

検索バーはフラットな表示です。生成された`ContainerElevation`はレベル3ですが、ソースにある両方のエレベーション既定値がレベル0のため、トークンの参照先がなく登録しません。予測型戻る操作はAndroidシステムのジェスチャーであり、ブラウザーには独自の戻る操作があるため対象外です。ウィンドウインセット、ソフトウェアキーボードの横取り、バイナリー互換性用シムも対象外です。全項目は準拠記録に記載しています。
