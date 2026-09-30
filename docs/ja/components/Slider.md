# Slider

`Slider`は1つの値を選び、`RangeSlider`は順序付きの値の組を選びます。どちらもアクセシブルな値の意味付け、フォーカス、フォーム、ラベル、無効状態にはネイティブのrange入力を使い、Materialのトラック、つまみ、目盛り、停止位置の表示は装飾として描画します。

```tsx
import {
  RangeSlider,
  Slider,
} from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<label>
  Volume
  <Slider name="volume" defaultValue={0.4} />
</label>

<Slider
  aria-label="Reading speed"
  min={0.5}
  max={2}
  steps={5}
  defaultValue={1}
/>

<RangeSlider
  aria-label="Price range"
  startAriaLabel="Minimum price"
  endAriaLabel="Maximum price"
  min={0}
  max={100}
  defaultValue={[20, 80]}
  startInputProps={{ name: 'minimum' }}
  endInputProps={{ name: 'maximum' }}
/>
```

## 値の仕様 {#value-contract}

- 制御する場合は`value`と`onValueChange`を使います。非制御の場合は`defaultValue`を指定し、必要に応じてコールバックを渡します。
- `min`と`max`の既定値はそれぞれ`0`と`1`です。値はこの範囲内に制限されます。
- `steps`は両端の間にある選択可能な値の数です。たとえば`0…10`の範囲で`steps={4}`を指定すると、`0, 2, 4, 6, 8, 10`を選べます。ポインター操作では最も近い目盛りに合わせ、ちょうど中間の場合は固定されたソースに従って小さい側を選びます。ネイティブのアクセシビリティ値操作ではソースのsemanticsループにある別の同点処理を維持し、大きい側を選びます。
- 操作が完了したタップ、ドラッグ、処理済みキーの解放、またはアクセシビリティ値操作の後に`onValueChangeFinished`が1回呼び出されます。値の保存には完了コールバックではなく`onValueChange`を使ってください。
- `RangeSlider`は順序が逆の初期値を並べ替え、2つのつまみが交差しないようにします。ポインターは近い方のつまみを選びます。つまみが完全に重なっている場合、その前方を押すと開始側、それ以外を押すと終了側を選びます。これはソースと同じです。

`id`、`name`、`form`、`required`、ARIA関連付け、ネイティブの変更／フォーカスイベントなどの入力属性は`Slider`に渡せます。refは入力を参照し、`className`と`style`は視覚上のルートに適用されます。`RangeSlider`では通常のDOM propsとrefは`role="group"`のルートに適用されます。`startInputProps`／`endInputProps`および`startInputRef`／`endInputRef`で2つの入力を個別に指定できます。

## 向き、方向、キーボード {#orientation-direction-and-keyboard}

`Slider`の既定の向きは横です。`orientation="vertical"`はソースの現行`VerticalSlider`経路に対応します。`topToBottom`の既定値は`true`で、最小値が上になります。下から上へ増やすには`false`にします。固定されたソースには縦方向の範囲スライダーAPIがないため、`RangeSlider`は常に横向きです。

横方向の値の順序は論理方向に従い、最小値はインライン開始側にあります。そのためRTLでは物理的なトラックとLeft／Rightキーによる増減が反転します。Homeで最小値、Endで最大値を選びます。連続スライダーの矢印キー増分はソースに従い1%、段階式スライダーでは1目盛りです。Page Up／Downでは最大10目盛り移動します。ソースはRTLでも横方向のPageキーを反転しないため、この非対称な動作を維持しています。縦方向のUp／DownとPageキーは`topToBottom`に従います。

ポインター操作ではソースのスロップ動作を維持します。タップでは離した時に最初の押下座標を確定します。同じ軸に動かすとドラッグになり、タッチを直交方向に動かした場合はページスクロールに任せます。無効な入力にはフォーカスも変更もできません。

## トラック、つまみ、状態 {#track-handles-and-states}

横方向のルートは親のインライン幅いっぱいに広がり、最低48pxの操作領域を確保します。縦方向のルートは既定で`200×48px`で、通常のCSSでサイズを変更できます。この領域内の寸法は次のとおりです。

- トラックの厚さは16pxで、外側の角は8px、つまみ側の角は2pxです。
- 横方向の既定のつまみは`4×44px`です（縦方向では`44×4px`）。
- フォーカス、押下、ドラッグ時はつまみの主軸方向の厚さを2pxに半減します。
- つまみの端からトラックまでは6px空けます。
- 内側のフォーカス表示では隣の隙間に4px加えますが、どちらのつまみも移動しません。
- 目盛りと両端の停止インジケーターは直径4pxの円です。

単一スライダーに`centered`を指定すると、幾何学的な中心から値までをアクティブな進捗として描画します。範囲のアクティブ部分は2つのつまみの間です。AndroidXと同じく、離散値の中間目盛りとつまみは外側の角丸の内側に配置し、端点はトラックの全幅を使います。通常の単一スライダーでは非アクティブな遠端だけに停止位置を描画します。中央基準と範囲表示では、該当するセグメントがある場合に非アクティブな両端を描画します。

`thumb`、`startThumb`、`endThumb`、`trackContent`、`renderTick`、`renderStopIndicator`はトラック内に配置される受動的な視覚スロットで、`aria-hidden`の配下に置かれます。ネイティブ入力を置き換えたり、別の操作を追加したりすることはできません。`showStopIndicator={false}`はソースで停止インジケーターのレンダラーがnullの場合に対応します。

## アクセシビリティ、フォーム、SSR {#accessibility-forms-and-ssr}

意味を持つ各つまみは`<input type="range" role="slider">`です。ラベルの関連付け、数値のmin／max／now状態、フォーム送信、リセット、無効動作、独立したTab位置はブラウザーが提供します。`Slider`ではラッパーのラベル、`label for`、`aria-label`、`aria-labelledby`を使えます。`RangeSlider`ではローカライズされた`startAriaLabel`と`endAriaLabel`が必須で、動的なアクセシブル上限／下限はもう一方のつまみ位置までに制限されます。

装飾用トラックには`aria-hidden`を設定します。`:focus-visible`では各つまみの周囲にトークン由来のリングを描画し、強制カラーにも対応します。SSRとハイドレーションで決定的なマークアップを生成し、実行時スタイルは注入しません。

## トークンとソースの境界 {#tokens-and-source-boundary}

視覚的な値にはすべて`Material3Provider`のスコープ内で設定される`--m3e-comp-slider-*`カスタムプロパティを使います。既定値は、ソースで目盛り色が交差する仕様、無効時のつまみ色を`surface`上に事前合成する仕様、無効トラックの不透明度がそれぞれ異なる仕様を保ちます。

実装はAndroidX Material 3リビジョン`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`に固定されています。生成された`SliderTokens`のうち`Slider.kt`が文字どおり参照する15個だけをソースに基づく解決経路として扱います。未参照の36個も実行可能な台帳に記録し、定義されていない動作を作りません。Composeのmodifier、interaction source、canvas scope、state holder、非推奨の互換オーバーロードはプラットフォーム上の仕組みとして適応または対象外とし、観測可能な出力はコンポーネント準拠記録とADR 0031で扱います。
