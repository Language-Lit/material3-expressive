# AppBar

`AppBar`は画面上部に配置し、ページ名やナビゲーション、アクションを表示する領域です。`size`、`flexible`、`titleAlignment`、`subtitle`を使ってMaterialの6種類のトップバーを1つのコンポーネントで表現します。また、ピン留め、スクロール時に隠れて上スクロールで戻る動作、小サイズへの折りたたみという3つの仕様に基づく動作をスクロールに連動させます。

```tsx
import { AppBar, IconButton } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

// A small pinned bar that fills with color once content scrolls under it.
<AppBar
  title="Inbox"
  scrollBehavior="pinned"
  navigationIcon={<IconButton aria-label="Open navigation">…</IconButton>}
  actions={<IconButton aria-label="Search">…</IconButton>}
/>

// A centered small bar with a subtitle.
<AppBar title="Inbox" subtitle="All accounts" titleAlignment="center" />

// A large flexible bar that collapses to a small bar as the page scrolls.
<AppBar
  size="large"
  flexible
  title={<h1>Inbox</h1>}
  subtitle="All accounts"
  scrollBehavior="exitUntilCollapsed"
/>

// A bar that hides on scroll and returns the moment the user scrolls up.
<AppBar title="Inbox" scrollBehavior="enterAlways" />
```

## 仕様 {#contract}

`size`はサイズ階層を選択し、既定値は`"small"`です。小サイズのバーは高さ64pxの1段構成です。中サイズと大サイズは2段構成で、折りたたみ時の段が64px、展開時のタイトル領域を含めると仕様値は中サイズ112px、大サイズ152pxです。`flexible`の場合は、中サイズが112px（サブタイトルなし）または136px（あり）、大サイズが120pxまたは152pxです。

`flexible`は中サイズと大サイズでExpressive表現を選びます。タイプスケールが変わり、サブタイトルとタイトル配置を指定できます。小サイズの`flexible`はありません。現行のMaterialカタログでは、以前の中央揃えの例が小サイズのバーに統合されているため、`titleAlignment`は小サイズとフレキシブル版の両方で使えます。通常の中サイズと大サイズも、ソースで安定版として維持されているため提供します。デザインガイダンスがフレキシブル版を推奨していることはドキュメント上の情報であり、除外理由ではありません。

`title`は必須のスロットで、見出し要素ではありません。このバーがページ見出しを担う場合は`<h1>`を渡し、そうでなければプレーンテキストを渡します。`subtitle`を使えるのはサブタイトルに対応したバリアント（小サイズまたはフレキシブル版）です。`navigationIcon`と`actions`は通常のスロットなので、中に`IconButton`を配置します。

`scrollBehavior`の既定値は`"none"`です。連動動作は次の3種類です。

- `"pinned"` — バーを上部に固定し、その下でスクロールが発生するとコンテナー色をスクロール時のロールに切り替えます。
- `"enterAlways"` — 下へスクロールするとバーがスライドして隠れ、上へスクロールするとすぐに戻ります。スクロールが止まると、完全に表示または非表示の状態に落ち着きます。
- `"exitUntilCollapsed"` — 2段構成のバーを折りたたみ段まで縮め、ページが先頭に戻るまでその状態を保ちます。折りたたむ段がない小サイズのバーでは指定できません。

ページ全体ではなく特定の要素がスクロールする場合は、`scrollContainer`でその要素を指定します。既定値はwindowです。折りたたみ率はスクロール位置の計測値であり、propsから制御できません。制御可能にすると、ユーザーのスクロール自体を制御することになるためです。

`className`はライブラリのクラスの後に結合されます。`style`とその他のネイティブ属性はそのまま渡され、`ref`は`<header>`を参照します。

## アクセシビリティ {#accessibility}

ルート要素はネイティブの`<header>`です。body内では`banner`ランドマークになります。タイトルを見出し要素に変換しないのは、文書構造を文書側で決めるためです。

2段構成のバーはMaterialのソースと同じくタイトルを2回描画しますが、支援技術に公開するのは一度に片方だけです。バーが開いている間は展開側のタイトルを読み上げ、折りたたみが半分を超えるとソースが定める境界で折りたたみ側に切り替わります。

Materialのアクセシビリティガイダンスでは、コンテンツをスクロールしている間もアプリバーのアクションに到達できることが求められます。ピン留めと折りたたみ動作ではバーの一部が常に画面上にあるため、この要件を満たします。`enterAlways`のバーでは、内部にキーボードフォーカスが移るとすぐに再表示します。これにより、バー内のコントロールへTab移動したときに画面外の要素を操作することがありません。

`prefers-reduced-motion`では色と停止位置への遷移をなくします。折りたたみは装飾ではなく状態を示すため、スクロールには引き続き追従します。強制カラー表示では、帯の境界に`CanvasText`を使います。

## トークンとソースの境界 {#tokens-and-source-boundary}

トークンは17個です。ソースの`topAppBarColors()`が読み取る6つの色ロール、7つのサイズ別高さ、そしてソースの読み取り経路にある手動調整済みの4つの定数です。

| トークン | 既定値 |
| --- | --- |
| `--m3e-comp-app-bar-container-color` | `sys.color.surface` |
| `--m3e-comp-app-bar-on-scroll-container-color` | `sys.color.surfaceContainer` |
| `--m3e-comp-app-bar-leading-icon-color` | `sys.color.onSurface` |
| `--m3e-comp-app-bar-title-color` | `sys.color.onSurface` |
| `--m3e-comp-app-bar-trailing-icon-color` | `sys.color.onSurfaceVariant` |
| `--m3e-comp-app-bar-subtitle-color` | `sys.color.onSurfaceVariant` |
| `--m3e-comp-app-bar-container-height` | `64px` |
| `--m3e-comp-app-bar-medium-container-height` | `112px` |
| `--m3e-comp-app-bar-medium-flexible-container-height` | `112px` |
| `--m3e-comp-app-bar-medium-flexible-subtitle-container-height` | `136px` |
| `--m3e-comp-app-bar-large-container-height` | `152px` |
| `--m3e-comp-app-bar-large-flexible-container-height` | `120px` |
| `--m3e-comp-app-bar-large-flexible-subtitle-container-height` | `152px` |
| `--m3e-comp-app-bar-horizontal-padding` | `4px` |
| `--m3e-comp-app-bar-title-inset` | `12px` |
| `--m3e-comp-app-bar-medium-title-bottom-padding` | `24px` |
| `--m3e-comp-app-bar-large-title-bottom-padding` | `28px` |

タイポグラフィはサイズ階層ごとに通常のタイプスケールをそのまま使います。小サイズと折りたたみ段はtitle-large、中サイズはheadline-small、中サイズのフレキシブル版と大サイズはheadline-medium、大サイズのフレキシブル版はdisplay-smallです。サブタイトルにはlabel-medium、label-large、title-mediumを使います。

Materialカタログの対象範囲はこのコンポーネントより広く、その境界を明確にしています。ボトムアプリバーは同じMaterialソースファイルにありますが、現行デザインカタログではToolbarsに分類されています（「推奨対象ではなくなり、ドッキングツールバーに置き換え」）。そのためToolbarsファミリーの再整理に含まれます。「検索アプリバー」の例はSearchファミリーの`AppBarWithSearch`がソースです。また、末尾のアクションがスペース不足時にメニューへまとまるオーバーフロー機能は、上流の`AppBarRow`が項目を計測して移動する動作を担います。レシピで近似せず、専用タスクに委ねています。実装されるまでは、App barsのカタログ項目は意図的にPartialのままです。

ピン留めにはネイティブの`position: sticky`を使います。折りたたみバーのスクロール時の色の変化は、折りたたみ率を不透明度にしたオーバーレイで表現します。不透明色のアルファ合成は、ソースのlerpと同じ結果になります。折りたたみ側のタイトルは、ソース独自のcubic-bezier(.8, 0, .8, .15)でフェードインします。バーのドラッグによるサイズ変更と、速度に応じたフリング後の停止は意図的に対象外としており、ほかの項目とともに準拠記録に記載しています。
