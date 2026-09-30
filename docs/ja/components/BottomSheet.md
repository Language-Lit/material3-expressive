# BottomSheet

`BottomSheet`は画面下端からせり上がり、補足コンテンツやアクションを表示するシートです。`variant`でMaterialの2種類のシートを1つのコンポーネントから選べます。**modal**シートはスクリーンと背後のページ操作を遮るネイティブの`<dialog>`を描画し、**standard**シートはページ内に配置され、背後のページも操作できます。

```tsx
import { BottomSheet, Button } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

// A modal sheet, opened from a button.
const [value, setValue] = useState<BottomSheetState>('hidden')

<Button onClick={() => setValue('partiallyExpanded')}>Share</Button>
<BottomSheet aria-label="Share" value={value} onValueChange={setValue}>
  <p>Sheet content</p>
</BottomSheet>

// A standard sheet docked at the bottom of a positioned container.
<BottomSheet
  aria-label="Now playing"
  variant="standard"
  defaultValue="partiallyExpanded"
  peekHeight={72}
>
  <p>Track details</p>
</BottomSheet>

// A sheet that refuses to be dismissed until a choice is made.
<BottomSheet
  aria-label="Choose a plan"
  value={value}
  onValueChange={setValue}
  confirmValueChange={(next) => next !== 'hidden' || hasChosen}
>
  {/* … */}
</BottomSheet>
```

## 契約 {#contract}

`variant`でシートを選択します。既定値は`"modal"`です。

`value`、`defaultValue`、`onValueChange`で、シートの位置を`"hidden" | "partiallyExpanded" | "expanded"`から指定します。これはMaterialの`SheetValue`に対応します。`onValueChange`は、Escape、スクリーン、ドラッグなどネイティブの動作による位置変更も含め、停止した位置をすべて通知します。制御コンポーネントでコールバックを無視しても、シートを強制的に元へ戻すことはありません。`<dialog>`の開閉状態をReact側で再調整できないため、これは`Dialog`で説明しているネイティブの状態を正とする規則と同じです。

`partiallyExpanded`の高さはバリアントごとに異なり、Materialのソースが定める位置に合わせます。modalシートではコンテナの半分とシート自身のコンテンツ高さのうち小さい方を表示します。standardシートでは`peekHeight`分を表示します。既定値は56pxです。ソースにはmodal用のpeek位置がないため、modalシートでは指定できません。

`confirmValueChange`は遷移先を拒否できます。`false`を返すとシートは現在位置に留まり、ドラッグ、クリック、キーボード、Escape、スクリーンのいずれの操作でも新しい位置への遷移を制限します。

`dragHandle`（既定値`true`）はハンドルを描画します。`gesturesEnabled`（既定値`true`）はポインターによるドラッグを許可します。`dismissOnEscape`と`dismissOnScrimClick`（どちらも既定値`true`）は、それぞれソースの`shouldDismissOnBackPress`と`shouldDismissOnClickOutside`に対応します。standardシートはトップレイヤーに属さずスクリーンもないため、この2つはmodal専用です。

シートにはアクセシブルな名前が必要です。`aria-label`または`aria-labelledby`を指定してください。`className`はライブラリのクラスの後に結合され、`style`とその他のネイティブ属性はそのまま渡されます。`ref`はルート要素を参照します。

## アクセシビリティ {#accessibility}

modalシートのルートはネイティブの`<dialog>`で、`showModal()`を使って開きます。そのため、バックドロップ、フォーカストラップ、背景の不活性化、閉じたときのフォーカス復帰はすべてブラウザー標準の動作です。アクセシブルな名前は内側のボックスではなくこの要素に設定され、ダイアログが無名になることはありません。standardシートはダイアログではなく、ページ内に配置されてページ操作を妨げません。ソースのペインタイトルに対応するWeb上の意味として、名前付き`region`で公開します。

ドラッグハンドルは実際の`<button>`です。Materialのアクセシビリティガイダンスでは、ドラッグには単一ポインターで使える代替操作を用意し、キーボードではTabでハンドルに移動してSpaceまたはEnterで高さを切り替えることを求めています。ハンドルがネイティブボタンなので、この操作も標準で利用できます。アクティベートするとソース独自の順序で切り替わります。modalシートは展開状態から閉じ、standardシートは展開状態からpeek位置へ戻り、部分展開状態からは完全に展開します。ハンドルのラベルは実行される操作を示し、`aria-expanded`はシートが展開状態かを示します。

ハンドルの操作領域は高さ48pxです。これは仕様の4pxバーの上下に22pxずつの余白を設けたサイズであり、ソースの`DragHandleVerticalPadding`とガイダンスが要求するターゲットサイズの両方に一致します。

`prefers-reduced-motion`では停止位置への遷移をなくし、シートの高さをすぐに変更します。これにより状態を把握できます。強制カラー表示では、コンテナに`CanvasText`の境界線を付けてハンドルも再描画します。作者指定の背景色が上書きされるためです。

## トークンとソースの境界 {#tokens-and-source-boundary}

トークンは13個です。そのうち7個はMaterialソースで宣言され、実際に読み取られる`SheetBottomTokens`のロールです。残りは`BottomSheetDefaults`の定数と、`ScrimTokens`を基にソースが組み立てるスクリーンです。

| トークン | 既定値 |
| --- | --- |
| `--m3e-comp-bottom-sheet-container-color` | `sys.color.surfaceContainerLow` |
| `--m3e-comp-bottom-sheet-container-shape` | `sys.shape.corners.cornerExtraLargeTop` |
| `--m3e-comp-bottom-sheet-hidden-container-shape` | `sys.shape.corners.cornerNone` |
| `--m3e-comp-bottom-sheet-container-shadow` | `sys.elevation.level1.shadow` |
| `--m3e-comp-bottom-sheet-container-max-width` | `640px` |
| `--m3e-comp-bottom-sheet-peek-height` | `56px` |
| `--m3e-comp-bottom-sheet-drag-handle-color` | `sys.color.onSurfaceVariant` |
| `--m3e-comp-bottom-sheet-drag-handle-width` | `32px` |
| `--m3e-comp-bottom-sheet-drag-handle-height` | `4px` |
| `--m3e-comp-bottom-sheet-drag-handle-shape` | `sys.shape.corners.cornerExtraLarge` |
| `--m3e-comp-bottom-sheet-drag-handle-spacing` | `22px` |
| `--m3e-comp-bottom-sheet-scrim-color` | `sys.color.scrim` |
| `--m3e-comp-bottom-sheet-scrim-opacity` | `0.32` |

宣言されている2つのロールは、意図的に登録していません。`DockedStandardContainerElevation`は一度も解決されません。どちらのバリアントも`BottomSheetDefaults.Elevation`からエレベーションを取得し、そこで`DockedModalContainerElevation`を読み取るため、登録は実際に描画される経路に合わせます。固定されたシートのソースには`FocusIndicatorColor`の解決経路がなく、このライブラリのフォーカス表示は共通の`sys.state`処理を使います。

Materialカタログでは、このファミリーは3つのコンポーザブルで構成されています。`BottomSheet`と`ModalBottomSheet`はここで2つのバリアントになります。`BottomSheetScaffold`はエクスポートしません。シート以外に`topBar`、`snackbarHost`、余白付きコンテンツスロットを持つアプリシェルのレイアウトですが、これらは隠れた動作を追加せず、既存の公開コンポーネントで組み合わせられます。シートの動作は失われません。peek高さへの固定を`variant="standard"`で再現します。

ドラッグできるのはハンドルだけです。ソースではネストスクロール接続によってシート全体もドラッグでき、シートのコンテンツからスクロール操作を奪います。ハンドルだけのドラッグなら、スクロール可能なコンテンツ領域との操作調停は不要です。また、ガイダンスはドラッグ以外の操作も求めています。リリース後はソース独自の`PositionalThreshold`（移動距離56px）と`VelocityThreshold`（125px/s）に従って停止します。

予測型バック操作は再現しません。これはAndroidシステムのジェスチャーであり、Webには相当する機能がありません。また、固定されたソースのスクリーンショット項目はすべてこの動作を対象にしています。ソースの`securePolicy`ウィンドウフラグとKotlinのバイナリー互換シムにもWeb上の相当機能はありません。一方、ソースの下端ウィンドウインセットは省略せず、`standardWindowInsets`を`env(safe-area-inset-bottom)`に対応させています。
