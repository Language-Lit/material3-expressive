# Icon

`Icon`はReactのSVGソースコンポーネントまたは利用側が用意したMaterial Symbolsフォントから、単色の装飾アイコンを描画します。周囲の文字色を継承し、予測可能なアクセシビリティ境界を持ちます。

```tsx
import {
  Icon,
  type IconSourceProps,
} from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

function SearchIcon(props: IconSourceProps) {
  return (
    <svg {...props} viewBox="0 0 24 24">
      <path d="M9 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm4 11 6 6" />
    </svg>
  )
}

<Icon source={SearchIcon} decorative={false} label="Search results" />
```

## 契約 {#contract}

- `source={SvgComponent}`は、SVGを1つ描画するReactコンポーネントを適合させます。ソースは渡された`className`、`aria-hidden`、`focusable` propsをルートの`<svg>`に転送する必要があります。
- `source="search"`はMaterial Symbolsのリガチャを描画します。`symbolStyle`で`outlined`（既定値）、`rounded`、`sharp`を選択します。
- `size`は正のCSSピクセル値です。既定値は仕様に基づく24です。ルートは常に装飾用の`span`で、refは`HTMLSpanElement`です。
- `mirrored`を指定すると、RTL時に方向性のある画像を左右反転します。アイコンは名前や形状を基に自動では反転しません。
- ネイティブのID、data属性、ARIA説明属性、クラス、スタイル、装飾用イベントハンドラーは保持されます。`children`、`role`、アクセシブルな名前の属性、`tabIndex`、生HTMLはコンポーネントの契約で管理します。

Iconにクリック、トグル、選択、無効状態、キーボード操作はありません。装飾用Iconを適切な名前の`IconButton`などのネイティブコントロールに配置してください。Iconのspanにコントロールの意味を持たせないでください。

## アクセシビリティ {#accessibility}

Iconは既定では装飾用です。

```tsx
<button type="button" aria-label="Search">
  <Icon source={SearchIcon} />
</button>
```

Iconのルートとソース画像は支援技術から隠されるため、コントロール名が1回だけ読み上げられます。アイコン単体で情報を伝える場合は`decorative={false}`を指定し、空でない利用者の言語による`label`を付けてください。ルートがその名前を持つ`img`ロールを公開し、ソース画像は引き続き隠されます。

塗り、grade、weight、色、アニメーションだけでアクセシブルな状態を示さないでください。インタラクティブコンポーネントが`aria-pressed`、`aria-selected`、チェック状態、ラベル、説明、フォーカス動作を管理します。

## Material SymbolsとExpressiveの軸 {#material-symbols-and-expressive-axes}

```tsx
<Icon
  source="favorite"
  symbolStyle="rounded"
  size={32}
  fill={1}
  weight={575}
  grade={100}
  opticalSize={32}
  roundness={100}
/>
```

グリフアダプターは現行Material Symbolsの軸に対応します。

- `fill`: `FILL`、仕様範囲0–1
- `weight`: `wght`、仕様範囲100–700
- `grade`: `GRAD`、仕様範囲-50–200
- `opticalSize`: `opsz`、仕様範囲20–48
- `roundness`: Expressiveの`ROND`、仕様範囲0–100

`opticalSize`を省略し、視覚サイズの`size`を明示した場合は、その値から光学サイズも選びます。フォントの設計範囲20–48内に収めます。軸の値は連続数値なので、可変フォントで使える値を少数の名前付きインスタンスに制限しません。開発ビルドでは仕様範囲外の値に警告します。

ライブラリはMaterial Symbolsフォントをダウンロード、サブセット化、宣言しません。アプリケーション側で必要なグリフと軸だけをセルフホストまたはリクエストし、グリフソースを描画する前に対応する`Material Symbols Outlined`、`Rounded`、`Sharp`ファミリーを読み込んでください。SVGソースにフォントは必要ありません。

通常のReactサーバーレンダリングでは、どちらのソースも一貫して描画されます。ライブラリのルートエントリーはテーマプロバイダーとフックもエクスポートするため、React Server Componentsではクライアント境界になります。Next.jsのServer Componentからはシリアライズ可能な文字列ソースを渡せます。SVGコンポーネントソースを呼び出す場合はクライアントモジュールに置いてください。このパッケージ上の制約によってIconにNext.jsのコードや型が加わることはありません。

## トークンと色 {#tokens-and-color}

コンポーネントの既定変数は次のとおりです。

- `--m3e-comp-icon-size`
- `--m3e-comp-icon-symbol-family-{outlined|rounded|sharp}`
- `--m3e-comp-icon-symbol-{fill|weight|grade|optical-size|roundness}`

明示的なpropsは、ルートに安定した`--m3e-icon-*`インスタンス変数を設定します。意図的に表示を上書きする通常の利用側インラインスタイルも使用できます。Iconは継承した`currentColor`を使います。対応するMaterialのコンテンツロールは`Surface`が提供します。複数色の図や任意の画像には、この色付け用アイコンプリミティブではなく画像コンポーネントを使います。

## 双方向テキスト、モーション、強制カラー {#bidirectionality-motion-and-forced-colors}

Material Symbolのリガチャ文字列は常にLTRとして配置され、RTLのページでもソース名の文字順が入れ替わりません。`mirrored`が影響するのはRTL時の画像だけです。コンポーネント自身に遷移やアニメーションはないため、モーションを減らす設定用の処理は不要です。`currentColor`を維持し、ブラウザーの強制カラー調整も無効化しません。
