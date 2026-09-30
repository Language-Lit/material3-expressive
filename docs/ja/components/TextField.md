# TextField

`TextField`は、Materialのラベル、インジケーター／アウトライン、アイコンスロット、補足／エラーテキストを備えたネイティブの`input`です。`filled`と`outlined`のバリアントを使えます。ラベル、境界線、アイコン、補足テキストの装飾は`TextArea`と共有します。固定されたソースでも単一行と複数行のフィールドで同じ装飾レイヤーを使っています。

```tsx
import { TextField } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<TextField
  label="Email"
  variant="outlined"
  type="email"
  value={email}
  onChange={(event) => setEmail(event.currentTarget.value)}
/>
```

## 仕様 {#contract}

- レンダーされるのはネイティブの`input`1つで、`htmlFor`／`id`でネイティブの`label`に関連付けられます（呼び出し側がIDを渡さない場合は`useId()`で生成します）。ref、`name`、`value`／`defaultValue`、`form`、`required`、ARIA／data属性、ネイティブのイベントハンドラーはこの入力に渡されます。
- `className`と`style`はフィールドのルートに適用されます。
- 値の状態管理はネイティブの制御／非制御`input`動作に任せます。このコンポーネントは派生値を管理しないため、`value`と`defaultValue`の競合に対するReactの開発時警告もそのまま働きます。
- `type`にはテキスト形式の値（`text`、`email`、`password`、`search`、`tel`、`url`、`number`）を指定できます。ブラウザー固有の表示と両立しない型は型定義で除外されています。
- `error`を指定すると（呼び出し側がすでに独自の値を設定している場合を除いて）`aria-invalid`が設定され、ラベル、インジケーター／アウトライン、補足テキストの色が変わります。`supportingText`の内容は変更されないため、メッセージは呼び出し側で用意します。

## フローティングラベル {#floating-label}

ラベルは大きな通常位置／文字サイズと、小さく上揃えの位置／文字サイズの間を移動します。この状態判定にはReactのレンダー状態ではなく、入力自身のネイティブな`:focus`／`:placeholder-shown`疑似クラスを使います。そのため、ブラウザーの自動入力、フォームリセット、refを使った直接書き込みなど、通常の入力イベント外で値が変わってもラベルが正しく移動します。これはRadioのチェック状態に使われているネイティブ状態優先の方法と同じです。

呼び出し側が指定した`placeholder`は、ラベルが入力の初期位置から離れたときだけ表示されます。固定されたソースのplaceholderスロットに合わせた動作です。`placeholder`を指定しない場合でも、`:placeholder-shown`を機能させるため内部ではネイティブ属性に空白1文字を設定します。画面には表示されません。

## バリアント {#variants}

| バリアント | コンテナー | 境界線の見え方 |
| --- | --- | --- |
| `filled`（既定） | surface-container-highest、上側のみ角丸 | 下側インジケーター1px、フォーカス時2px |
| `outlined` | 透明、全体を角丸 | ラベル幅の切れ込みがある境界線1px、フォーカス時2px |

outlinedの切れ込みは3つのCSS flexパネルで構成します。非表示のbody-smallラベル複製から中央パネルの固有幅を取得し、表示中のラベルが浮いたときに中央パネルの上辺の線を縮小します。これによりJSで測定せずにラベル幅の隙間を作り、アウトラインとラベルを同じborder-box座標系に保ちます。

## アイコンと補足テキスト {#icons-and-supporting-text}

```tsx
<TextField
  variant="outlined"
  label="Search"
  leadingIcon={<Icon source="search" />}
  supportingText="Press enter to search"
/>
```

`leadingIcon`／`trailingIcon`はフィールド端にある48pxのタッチ領域に表示されます。フィールドは論理方向の先頭、ネイティブ入力、末尾の各領域を個別に管理します。通常の端には16px、アイコンのある端には48pxの操作領域とコンテンツ間隔4pxを確保します。入力要素は中央領域だけを占めるため、利用側のCSSがネイティブ入力の余白をリセットしても、カーソル、placeholder、文字、ブラウザー標準の表示がアイコンの下に入りません。透明なネイティブラベルにより入力自体をその領域の下まで広げずに、フィールド全体をクリック可能にします。`supportingText`はフィールドの下に表示し、`aria-describedby`で関連付けます。呼び出し側の`aria-describedby`がある場合は置き換えずに組み合わせます。

縦方向の配置にも、ネイティブコントロールのブロック余白ではなく、上、入力内容、下の各行を明示的に使います。filledでは24／24／8pxです。最初の24pxに上余白8pxと縮小時のラベル16pxを配置し、次の24pxを入力行、下の8pxを余白にします。outlinedでは16／24／16pxです。そのため、レイヤー外からネイティブコントロールの余白をリセットしても、入力済みの値やカーソルがラベル領域に入りません。

## トークンと境界 {#tokens-and-boundaries}

`TextField`と`TextArea`は共通の`--m3e-comp-text-field-*`登録を使います。固定されたソースではfilledとoutlinedのトークンファイルで、入力、placeholder、ラベル、アイコン、補足テキストのコンテンツ色ロールがすべて同じです。そのため重複させず、接頭辞なしの1組だけを登録します。コンテナーの塗りとシェイプ、インジケーター／アウトラインの境界線だけをバリアントごとに登録します。

テーマの上書きは`Material3Provider`のスコープ内で適用されます。`TextField`は実行時スタイルを注入せず、Next.js、Vite、ルーター、アニメーションライブラリ、非公開のアプリケーションコードをインポートしません。
