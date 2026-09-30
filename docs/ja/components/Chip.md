# Chip

`Chip`は、コンパクトなMaterialのアクションおよび選択コントロールです。用途に応じたAPIで、assist、filter、input、suggestionを表現し、ソースで無効なpropsの組み合わせを型で防ぎます。

```tsx
import { Chip, Icon } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<Chip
  kind="assist"
  variant="elevated"
  leadingIcon={<Icon source="translate" />}
>
  Translate
</Chip>

<Chip
  kind="filter"
  shape="expressive"
  selected={grammar}
  onSelectedChange={setGrammar}
  leadingIcon={grammar ? <Icon source="check" /> : null}
>
  Grammar
</Chip>

<Chip
  kind="input"
  avatar={<span>A</span>}
  trailingIcon={<Icon source="close" />}
>
  Aiko
</Chip>
```

## 契約 {#contract}

- `kind`は必須で、`assist`、`filter`、`input`、`suggestion`から選択します。
- assistとsuggestionのChipは単発のアクションです。通常のネイティブbutton propsを受け取りますが、選択状態のpropsはありません。
- filterとinputのChipは選択できます。制御する場合は`selected`／`onSelectedChange`、非制御の場合は`defaultSelected`を使います。
- `variant`の既定値は`flat`です。assist、filter、suggestionでは`elevated`も指定できます。ファーストパーティのソースにはelevatedなinput Chipはありません。
- `shape="expressive"`を指定すると、filterとinputで仕様の状態別シェイプ変化が有効になります。既定の`standard`では小さい角を保ちます。
- `leadingIcon`はすべての用途で使えます。`trailingIcon`はassist、filter、inputで使えます。suggestionでソースが公開するアイコンは先頭側のみです。
- `avatar`はinput専用です。両方を指定すると`leadingIcon`の代わりに使われます。

すべてのバリアントはネイティブの`<button type="button">`を描画します。フォーム送信には`type="submit"`を明示します。ネイティブ属性、フォーム所有者、name/value、イベントハンドラー、class/style、転送されたref、無効状態、`draggable`を保持します。選択可能なChipでは、利用側の`onClick`を先に実行し、`preventDefault()`によって状態変更を取り消せます。

## 構造と形状 {#anatomy-and-geometry}

ルート要素は、表示コンテナの高さ32pxを囲むテーマの最小48px操作対象を確保します。表示行は常に先頭スロット、ラベル、末尾スロットの3つの子要素を持ちます。スロットがない場合は幅を0にしますが、その前後の間隔は残します。これは、子要素が2つの行として扱うのではなく、固定されたソースに合わせた動作です。

standardの間隔は8pxです。Expressiveなfilter/inputでは、存在するスロットの隣の間隔が4pxになります。末尾アイコンだけの場合もこの規則を適用し、ラベルと末尾アイコンの間は4pxです。inputの端の余白は通常4pxで、先頭アイコンの前は8px、avatarの前は4px、末尾アイコンの後は8pxです。

アイコンは18×18pxです。inputのavatarは24×24pxの完全な角丸領域に収めてクリップします。選択可能なChipの最大幅はソースと同じ1000pxです。ラベルは折り返し可能で、大きな文字では表示コンテナを広げます。長いラベルに押しつぶされて末尾スロットが消えることはありません。

## バリアント、状態、モーション {#variants-state-and-motion}

flatのassist／suggestionと、選択されていないfilter／inputはアウトライン付きです。選択されたfilter／inputにはsecondary-containerを使い、アウトラインを取り除きます。elevatedなassist／suggestionと未選択のfilterにはsurface-container-lowを使います。filterのエレベーションは、flatでは通常時がLevel 0、hover時がLevel 1、elevatedでは通常時がLevel 1、hover時がLevel 2です。elevatedなassistとsuggestionはLevel 1／2、flatはLevel 0です。ドラッグ可能なChipはドラッグ中にLevel 4を使います。無効状態のエレベーションはLevel 0です。

hover、フォーカス、押下時にはMaterialのステートレイヤーを描画します。キーボードフォーカスにはトークンに基づくsecondaryリングを追加します。standardのChipは小さいシェイプを保ちます。Expressiveのfilter／inputは未選択時にmedium、選択時にfull、押下時にsmallを使います。

選択可能なChipのスロット追加・削除は、ソースの`AnimatedVisibility`に合わせて、退出アニメーションの完了まで削除中の要素を保持します。standardのスロットは、表示時にslow-effectsとfast-spatial、退出時にfast-effectsとdefault-effectsを組み合わせます。Expressiveのオーバーロードでは、default-effectsの不透明度とfast-spatialのサイズを使います。モーションを減らす設定では、シェイプ、エレベーション、色、スロットの変化をすべて即時に適用します。

## アクセシビリティ {#accessibility}

ネイティブボタンが名前付け、ポインター、Enter、Space、フォーカス、無効状態、フォームの動作を提供します。filterとinputは`aria-pressed`で選択状態を公開し、assistとsuggestionは不要なトグル状態を公開しません。これは、ソースの選択可能な`Role.Checkbox`をWebネイティブに置き換えたものです。

スロットのラッパーは装飾用として`aria-hidden`になっており、アイコンの名前がボタン名に混ざることはありません。表示ラベル、`aria-label`、`aria-labelledby`のいずれかを指定してください。Chipの内側にリンク、コントロール、その他のインタラクティブ要素を入れないでください。

論理方向の余白はRTLで反転しますが、DOM順は変わりません。強制カラー表示では明示的な境界線、選択状態とフォーカスにHighlight、選択済みコンテンツにHighlightText、無効状態にGrayTextを使います。半透明のステートレイヤーと作者指定のshadowは取り除きます。

## トークンとソースの境界 {#tokens-and-source-boundary}

Chipは検索可能な`--m3e-comp-chip-*`変数を次の用途に登録します。

- 表示高さ32px、最小操作対象、最大幅、スロットのサイズとシェイプ。
- standard／compactの間隔とinput専用の論理端余白。
- standardおよびExpressiveの未選択、選択、押下時のシェイプ。
- 各用途の有効、選択、無効、アウトライン、elevated時の色。
- 通常、hover、フォーカス、押下、ドラッグ、無効状態のshadow。
- フォーカスリングの形状と色。

登録ではAndroidXのリビジョン`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`を固定しています。`Chip.kt`が読み取らない生成ロールは、実在しないコンポーネント状態として登録せず、未使用として記録します。ソースが別ファミリーのelevated suggestion無効状態を参照する点も明記しています。そのアイコンとコンテナの不透明度は、現行値が同じassist-chipロールを使用し、flat suggestionはsuggestionアイコンのロールを保ちます。

Composeのインスタンス単位の色、エレベーション、borderオブジェクトはReact propsではありません。カスタマイズには`Material3Provider`でスコープされたコンポーネントトークンを使います。非推奨のAndroid互換オーバーロードと、Compose専用の`Modifier`、`InteractionSource`、`Arrangement`、計測ポリシー処理は対象外ですが、そこで外部から観察できる出力は実装しています。対応関係の全体はChipの準拠記録と実行可能なソース台帳テストに記録されています。
