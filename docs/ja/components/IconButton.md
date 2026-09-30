# IconButton

`IconButton`は、現行Material 3 Expressiveのサイズ、幅、シェイプ、トグル動作に対応するネイティブのアイコン専用アクションです。フレームワーク、ルーター、ツールチップ、アイコンパッケージには依存しません。

```tsx
import {
  Icon,
  IconButton,
} from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<IconButton aria-label="Search">
  <Icon source="search" />
</IconButton>
```

## 契約 {#contract}

- ルートは常にネイティブの`<button>`で、refは`HTMLButtonElement`です。既定の`type`は`"button"`です。明示的なsubmit/reset、フォーム所有者、name、valueはネイティブの動作を維持します。
- `variant`は`standard`（既定値）、`filled`、`tonal`、`outlined`から選択します。
- `size`は`extra-small`、`small`（既定値）、`medium`、`large`、`extra-large`から選択します。
- `width`は`narrow`、`uniform`（既定値）、`wide`から選びます。これは仕様に基づく表示コンテナの幅で、ページレイアウトや全幅表示の指定ではありません。
- `shape`は`round`（既定値）または`square`です。押下時と選択時には、現在のサイズ階層に対応する仕様のシェイプに変わります。
- `children`は既定では装飾用の表示スロットです。`Icon`、SVG、同等の非インタラクティブな図を渡します。トグルでは、選択時に表示を変える`selectedIcon`を指定できます。

`IconButton`はリンクやツールチップを描画しません。ナビゲーションにはリンクを使い、ツールチップはアクセシブルな説明として別途関連付けてください。

## トグルボタン {#toggle-buttons}

トグルモードは明示して指定し、ネイティブのARIAトグルボタンの意味を使います。

```tsx
const [favorite, setFavorite] = useState(false)

<IconButton
  aria-label="Favorite"
  variant="filled"
  toggle
  selected={favorite}
  onSelectedChange={setFavorite}
  selectedIcon={<Icon source="favorite" fill={1} />}
>
  <Icon source="favorite" />
</IconButton>
```

制御状態には`selected`と`onSelectedChange`を、非制御状態には`defaultSelected`を使います。ボタンは真偽値の`aria-pressed`を出力し、単発のボタンでは省略します。内部の状態処理より先に`onClick`を実行します。`event.preventDefault()`を呼ぶとトグルを取り消せます。Enter、Space、ポインター操作、無効状態、フォーカスはブラウザーが担います。

「Favorite」のように、アクセシブルな名前は常に同じにします。押下状態がアクションの有効／無効を示すため、名前を「Favorite」と「Unfavorite」の間で変えると`aria-pressed`の意味が曖昧になります。視覚状態を色だけに依存させないため、別状態のアイコンを指定することを推奨します。

## Expressiveの寸法 {#expressive-dimensions}

| サイズ | 高さ | アイコン | Narrow | Uniform | Wide | アウトライン |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `extra-small` | 32px | 20px | 28px | 32px | 40px | 1px |
| `small` | 40px | 24px | 32px | 40px | 52px | 1px |
| `medium` | 56px | 24px | 48px | 56px | 72px | 1px |
| `large` | 96px | 32px | 64px | 96px | 128px | 2px |
| `extra-large` | 136px | 40px | 104px | 136px | 184px | 3px |

表示コンテナが小さい場合や幅が狭い場合でも、意味上のルート要素は48×48 CSSピクセル以上を保ちます。大きいサイズ階層は目立たせるアクション向けであり、密度を上げる目的には使いません。

## シェイプと色 {#shape-and-color}

通常時のroundシェイプでは、高さのちょうど半分の角丸を使います。squareの通常時のロールはmediumからlarge、extra-largeへ進みます。押下時の角はサイズ階層に応じてsmall、medium、largeに変わります。現行Expressiveのトークンペアに従い、トグルの選択時にはroundボタンの角をより四角く、squareボタンの角を完全な円形にします。

| バリアント | 単発／既定 | トグルの選択時 |
| --- | --- | --- |
| `standard` | 透明／on-surface-variant | 透明／primary |
| `filled` | primary／on-primary | primary／on-primary |
| `tonal` | secondary-container／on-secondary-container | secondary／on-secondary |
| `outlined` | 透明／on-surface-variant、outline-variantの枠線 | inverse-surface／inverse-on-surface、枠線なし |

filledのトグルは未選択時にsurface-container／on-surface-variant、選択時には選択済みfilledの色ペアを使います。無効状態のロールと不透明度は、固定されたAndroidXの既定値に従います。

## アクセシビリティ {#accessibility}

アイコン専用ボタンには、利用者の言語に合った`aria-label`または`aria-labelledby`が必要です。どちらも空の場合は開発ビルドで警告します。表示コンテナは`aria-hidden`なので、内側の`Icon`が誤って意味を持っていても、名前が重複することはありません。表示スロットにテキストや別のインタラクティブ要素を入れないでください。

キーボードフォーカスにはトークンに基づく`:focus-visible`リングを使います。強制カラー表示ではButtonFace／ButtonText、選択状態にHighlight／HighlightText、無効状態にGrayTextを使い、すべてのバリアントに見える境界線を設けます。モーションを減らす設定ではシェイプ、色、ステートレイヤーの遷移をなくし、状態はすぐに切り替えます。

## トークン {#tokens}

IconButtonのコンポーネント変数は、次のリテラルなグループに分けています。

- `--m3e-comp-icon-button-{size}-container-height`
- `--m3e-comp-icon-button-{size}-container-width-{narrow|uniform|wide}`
- `--m3e-comp-icon-button-{size}-icon-size`
- `--m3e-comp-icon-button-{size}-container-shape-{round|square}`
- `--m3e-comp-icon-button-{size}-pressed-container-shape`
- `--m3e-comp-icon-button-{size}-selected-container-shape-{round|square}`
- `--m3e-comp-icon-button-{size}-outline-width`
- バリアントごとのコンテナ、コンテンツ、選択、無効状態の色変数
- 共通の無効状態の不透明度とフォーカスリング変数

このコンポーネントはトークンシリアライザーが投影したExpressive default-effectsスプリングを使います。テーマの上書きは`Material3Provider`内に限定され、描画時にスタイルシートは挿入されません。

## 双方向テキストとSSR {#bidirectionality-and-ssr}

すべての寸法には論理方向のインライン／ブロックプロパティを使います。アイコンのRTL反転は`Icon`で指定します。IconButtonは画像が方向性を持つか推測しません。Reactサーバーレンダリングとハイドレーションでは、マークアップと非制御時の選択初期値が一貫します。
