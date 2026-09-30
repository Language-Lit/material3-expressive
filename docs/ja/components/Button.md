# Button

`Button`は、現行のMaterial 3 Expressiveのサイズ、シェイプ、押下時のモーションを備えた、フォームで使えるネイティブのReactボタンです。ルーティングや特定のフレームワークには依存しません。

```tsx
import {
  Button,
  Icon,
} from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<Button
  variant="filled"
  size="medium"
  leadingIcon={<Icon source="add" />}
  onClick={createProject}
>
  New project
</Button>
```

## 仕様 {#contract}

- ルートは常にネイティブの`<button>`で、refは`HTMLButtonElement`です。既定の`type`は`"button"`なので、意図しないフォーム送信を防ぎます。`submit`と`reset`を明示すると、ネイティブの動作を利用できます。
- `variant`は`filled`（既定値）、`tonal`、`elevated`、`outlined`、`text`から選択します。
- `size`は`extra-small`、`small`（既定値）、`medium`、`large`、`extra-large`から選択します。
- `shape`は`round`（既定値）または`square`です。どちらの通常時のシェイプも、現在のサイズ階層に対応する押下時のシェイプへ変化します。
- `width="fit"`は内容に合わせた幅で、既定値です。`width="full"`は包含ブロックの幅いっぱいに広がります。
- `leadingIcon`と`trailingIcon`は、読み上げ順に並ぶ装飾用の表示スロットです。`Icon`、SVG、または同程度のサイズの非インタラクティブな図を渡してください。ラベルが重複して読み上げられないよう、これらのスロットは支援技術から隠されます。
- `Button`はネイティブのフォーム属性、ID、ARIAの説明、data属性、クラス、スタイル、イベントハンドラーを保持します。アクティベートの処理はReactで再実装せず、ブラウザーに任せます。

`Button`はリンクを描画しません。ナビゲーションにはネイティブリンクまたはルーターのリンクAPIを使ってください。リンクをボタンの中に入れず、リンクという意味を保ったままスタイルを適用する専用アダプターを設計できます。アイコンのみの操作やトグル操作には`IconButton`を使います。

## バリアント {#variants}

| バリアント | コンテナー | コンテンツ | エレベーション |
| --- | --- | --- | --- |
| `filled` | primary | on-primary | level 0、hover時はlevel 1 |
| `tonal` | secondary-container | on-secondary-container | level 0、hover時はlevel 1 |
| `elevated` | surface-container-low | primary | level 1、hover時はlevel 2 |
| `outlined` | 透明、outline-variantの境界線 | on-surface-variant | level 0 |
| `text` | 透明 | on-surface-variant | level 0 |

各ロールは、現在のAndroidX生成Buttonトークンに従います。hover、フォーカス、押下時のステートレイヤーにはテーマの不透明度を使います。ネイティブの`disabled`はアクティベートを防ぎ、各バリアントの仕様に沿ったロールと不透明度を適用します。

## Expressiveのサイズ {#expressive-sizes}

| サイズ | 表示上の最小高さ | インライン／ブロックの余白 | アイコン | 間隔 | ラベルロール | 押下時の角 |
| --- | ---: | ---: | ---: | ---: | --- | ---: |
| `extra-small` | 32px | 12px / 6px | 20px | 4px | label large | small |
| `small` | 40px | 16px / 10px | 20px | 8px | label large | small |
| `medium` | 56px | 24px / 16px | 24px | 8px | title medium | medium |
| `large` | 96px | 48px / 32px | 32px | 12px | headline small | large |
| `extra-large` | 136px | 64px / 48px | 40px | 16px | headline large | large |

表示コンテナーには`min-block-size`を使うため、拡大表示や折り返しによってテキストが切り取られず、ボタンの高さが増えます。意味上のルート要素は別に設け、どのサイズ階層でも操作対象を48×48 CSSピクセル以上に保ちます。これにより、表示部分を32pxや40pxに保ちながら、操作対象を縮小せずに済みます。

大サイズと特大サイズは目立たせるためのアクションです。通常のボタンを密に配置するためのサイズではありません。

## アクセシビリティとフォーム {#accessibility-and-forms}

簡潔で利用者の言語に合ったラベルを指定します。通常はネイティブのテキストがアクセシブルな名前になります。ラベルがテキストでない場合は`aria-label`または`aria-labelledby`を使えます。開発ビルドでは、3つの名前付け方法がすべて空の場合に警告します。

Enter、Space、フォーカス、無効状態、フォーム送信とリセット、name/value、フォームの所有関係はネイティブHTMLの動作です。`Button`はキーイベントを合成せず、`role="button"`、`tabIndex`、`aria-pressed`、`aria-busy`も追加しません。無効なボタンはブラウザーによってTab順から除外されます。利用側の`onClick`やフォームハンドラーは、通常のReactおよびネイティブのイベント処理を通じて1回実行されます。

キーボードフォーカスにはトークンに基づく`:focus-visible`リングを使います。強制カラー表示ではシステムのButtonFace、ButtonText、GrayText、Highlight色を使い、半透明のステートレイヤーを表示しません。作者指定の色を強制することもありません。

## シェイプとモーション {#shape-and-motion}

ソースのButton APIでは、跳ね返りを避けるため`DefaultEffects`を使って通常時と押下時の角のシェイプを変化させます。Web向けのトークンシリアライザーは、テーマの各スプリングから追加のCSS変数を2つ生成します。

- `--m3e-sys-motion-*-duration`
- `--m3e-sys-motion-*-easing`

durationはスプリングが停止するまでの計算時間で、easingは決定的にサンプリングされた`linear()`カーブです。`Button`はExpressiveのdefault-effectsペアを使うため、入れ子になったカスタムテーマにもスコープ付きのモーションが適用されます。`prefers-reduced-motion: reduce`では遷移をなくしますが、押下時のシェイプとステートレイヤーはすぐに変化します。

## トークン {#tokens}

Buttonのコンポーネント変数は、次の規則に沿ってグループ化しています。

- `--m3e-comp-button-{size}-container-height`
- `--m3e-comp-button-{size}-padding-{block|inline}`
- `--m3e-comp-button-{size}-icon-{size|spacing}`
- `--m3e-comp-button-{size}-container-shape-{round|square}`
- `--m3e-comp-button-{size}-pressed-container-shape`
- `--m3e-comp-button-{size}-outline-width`
- `--m3e-comp-button-{variant}-container-color`
- `--m3e-comp-button-{variant}-content-color`
- バリアントごとの無効状態の色／不透明度とコンテナーのshadow変数
- `--m3e-comp-button-minimum-{interactive-target|width}`
- `--m3e-comp-button-focus-ring-{color|offset|width}`

システムの色、タイポグラフィ、シェイプ、ステート、密度、エレベーション、モーションは、これらのコンポーネント別名の基盤として引き続き使われます。テーマの上書きは`Material3Provider`内に限定されます。`Button`を描画してもstyle要素は挿入されません。

## 双方向テキストとSSR {#bidirectionality-and-ssr}

間隔とサイズには論理CSSを使います。RTLではDOMやアクセシブルな読み上げ順を変えずに、leadingスロットは論理的な先頭、trailingスロットは末尾に表示されます。方向性のあるアイコン画像は`Icon`で個別に反転できます。

Reactのサーバーレンダリングとハイドレーションで、`Button`のマークアップは一貫します。このコンポーネントが読み込むのはReactと公開コンポーネントだけです。Next.js、Vite、ルーター、アプリケーション独自の型は公開しません。
