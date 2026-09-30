# FloatingActionButton

`FloatingActionButton`は、Material 3 Expressiveで最も重要なアクションを示すネイティブコントロールです。標準、中、大サイズ、拡張、トグル、エレベーションの各動作に対応し、ルーター、フレームワーク、アイコンパッケージ、配置ライブラリには依存しません。

```tsx
import {
  FloatingActionButton,
  Icon,
} from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<FloatingActionButton
  aria-label="Create"
  icon={<Icon source="add" />}
/>
```

## 仕様 {#contract}

- ルートは常にネイティブの`<button>`で、refは`HTMLButtonElement`です。既定の`type`は`"button"`です。submit/reset、フォーム所有者、name、value、無効状態、ネイティブのイベントハンドラーは引き続き機能します。
- `size`は`standard`（既定値）、`medium`、`large`から選択します。
- 通常のFABとextended FABでは、`elevation`に`default`、`lowered`、`none`を指定します。
- `icon`は必須の装飾用コンテンツで、通常は`Icon`またはSVGを渡します。
- `label`を追加すると、サイズに応じたextended FABになります。`expanded`の既定値はtrueです。アクセシブルな名前を変えずに、ラベルを視覚的に折りたたむこともできます。
- `toggle={true}`はアイコンだけのトグルFABになります。このとき`label`、`expanded`、独自のエレベーションは型で指定できません。

画面で最も重要なアクションにFABを使います。配置、安全領域、スクロール時の表示、ツールチップ、今後の`FabMenu`との組み合わせは、利用側または専用コンポーネントが管理します。

## Extended FAB {#extended-fabs}

```tsx
<FloatingActionButton
  icon={<Icon source="edit" />}
  label="Compose"
  size="medium"
  expanded={isExpanded}
  elevation="lowered"
/>
```

表示ラベルはネイティブのアクセシブルな名前になります。折りたたまれてもアクセシビリティツリーには残り、視覚上は幅と不透明度を0にする遷移を行います。`label`内にインタラクティブなコンテンツを置かないでください。

| サイズ | 高さ | アイコン | 角 | タイポグラフィ | 先頭／末尾 | アイコンとラベルの間隔 |
| --- | ---: | ---: | ---: | --- | ---: | ---: |
| `standard` | 56px | 24px | 16px | title medium | 16 / 16px | 8px |
| `medium` | 80px | 28px | 20px | title large | 26 / 26px | 12px |
| `large` | 96px | 36px | 28px | headline small | 28 / 28px | 16px |

mediumとlargeのラベル間隔12px、16pxは、生成トークンファイルに保留値が残る間に適用された現行AndroidXソースの修正に従います。

## トグルFAB {#toggle-fabs}

トグルモードは、FABメニューで使う現行Expressiveの閉じるボタンへの遷移を実装します。`FabMenu`の公開前でも独立して利用できます。

```tsx
const [open, setOpen] = useState(false)

<FloatingActionButton
  aria-label="Creation actions"
  icon={<Icon source="add" />}
  selectedIcon={<Icon source="close" />}
  size="large"
  toggle
  selected={open}
  onSelectedChange={setOpen}
/>
```

制御状態には`selected`と`onSelectedChange`を使い、非制御状態には`defaultSelected`を使います。単発のFABは`aria-pressed`を省略し、トグルFABは真偽値を公開します。利用側の`onClick`を先に実行し、`preventDefault()`で内部の状態変更を取り消せます。

選択時は、色がprimary-container／on-primary-containerからprimary／on-primaryへ変わります。サイズを問わず、すべてのボタンでコンテナーを56pxの完全な円形、アイコンを20pxにします。mediumとlargeは元の占有領域である80pxまたは96pxを保ちながら、選択時の表示を論理方向の右上に合わせます。これによりレイアウトを維持し、RTLでは水平方向の端が自動で反転します。

## エレベーションと状態 {#elevation-and-state}

| モード | 通常時 | hover時 | フォーカス時 | 押下時 |
| --- | ---: | ---: | ---: | ---: |
| `default` | Level 3 | Level 4 | Level 3 | Level 3 |
| `lowered` | Level 1 | Level 2 | Level 1 | Level 1 |
| `none` | Level 0 | Level 0 | Level 0 | Level 0 |
| toggle | Level 3 | Level 3 | Level 3 | Level 3 |

hover、フォーカス、押下時のステートレイヤーはシステムの不透明度トークンを使います。ネイティブの無効状態はアクティベートを防ぎ、shadowを取り除き、ソースに基づくon-surfaceの不透明度ロールを適用します。

## アクセシビリティ {#accessibility}

アイコンだけのFABには、利用者の言語に合った`aria-label`または`aria-labelledby`が必要です。どちらもない場合は開発ビルドで警告します。extended FABはラベルのコンテンツがアクセシブルな名前になります。アイコンの各スロットは支援技術から隠されるため、内側の`Icon`が重複した名前を付けることはありません。

ポインター、Enter、Space、無効状態、フォーカス、フォームの動作はブラウザーが担います。フォーカスにはトークンに基づく`:focus-visible`リングを使います。強制カラー表示ではButtonFace／ButtonText、選択状態にHighlight／HighlightText、無効状態にGrayTextと明示的なアウトラインを使います。モーションを減らす設定では遷移をなくしますが、状態の変化は維持します。

## トークンとモーション {#tokens-and-motion}

コンポーネント変数は、次のリテラルなグループに分けています。

- `--m3e-comp-floating-action-button-{size}-container-{size|shape}`
- `--m3e-comp-floating-action-button-{size}-icon-size`
- `--m3e-comp-floating-action-button-{size}-extended-{leading-space|trailing-space|icon-label-space}`
- 通常、選択されたトグル、無効状態の色変数
- default／lowered時のステートshadow変数とLevel 0のshadow
- 選択されたトグル用のコンテナーサイズ／シェイプとアイコンサイズ
- 最小ターゲットとフォーカスリングの変数

extended FABのサイズにはExpressive fast-spatialモーションを、ラベルの不透明度にはfast-effectsを使います。トグル時のサイズ、角、アイコンにはfast-spatial、色にはfast-effectsを使います。エレベーションにはdefault-effects投影を使います。テーマの上書きは`Material3Provider`内に限定され、描画時にCSSは挿入されません。

## SSRと境界 {#ssr-and-boundaries}

サーバーのマークアップ、初期の展開状態、非制御選択状態の初期値は一貫します。`FloatingActionButton`が読み込むのはReactと公開・内部プリミティブだけです。Next.js、Vite、アプリケーション独自のコード、アニメーションランタイム、配置ライブラリは読み込みません。
