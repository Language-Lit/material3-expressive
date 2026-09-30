# ListItem

`ListItem`と`SegmentedListItem`は、受動的なコンテンツ、アクション、ラジオ選択、チェックボックス選択をWeb標準の意味付けで扱うMaterialのリスト行を表示します。

```tsx
import {
  ListItem,
  SegmentedListItem,
} from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<ListItem
  interaction="action"
  headline="Grammar review"
  supportingText="12 exercises"
  trailingContent="18 min"
  onClick={openLesson}
/>

<SegmentedListItem
  interaction="single"
  index={0}
  count={3}
  name="level"
  value="beginner"
  headline="Beginner"
  selected={level === 'beginner'}
  onSelectedChange={() => setLevel('beginner')}
/>
```

## 仕様と構造 {#contract-and-anatomy}

各項目には`headline`が必須です。任意の`leadingContent`、`trailingContent`、`overline`、`supportingText`スロットでソースの構造を構成できます。

- 受動的なコンテンツでは`interaction`を省略します。既定の`as="div"`のほか、セマンティックなリスト内では`as="li"`を使えます。
- `interaction="action"`はネイティブのボタンをレンダーし、`type="button"`を既定値にします。
- `interaction="single"`はネイティブのラジオをレンダーします。`name`と`value`が必須です。制御する場合は`selected`／`onSelectedChange`、非制御の場合は`defaultSelected`を使います。
- `interaction="multiple"`はネイティブのチェックボックスをレンダーします。制御する場合は`checked`／`onCheckedChange`、非制御の場合は`defaultChecked`を使います。
- `SegmentedListItem`はすべてのモードを共有し、先頭・中間・末尾・単独項目の角を決めるために`index`と`count`が必須です。

ネイティブ属性とフォームの所属情報は、意味を持つボタンまたは入力要素に渡されます。`className`と`style`は視覚上のルートに適用されます。refは選択した操作モードに応じて、受動的なルート、ボタン、ラジオ、チェックボックスを参照します。

## 形状、バリアント、状態 {#geometry-variants-and-states}

1行、2行、3行の最低高はそれぞれ56、72、88pxです。見出しと補足テキストの組み合わせは2行になります。上付きテキストまたは複数行の補足テキストがあると3行になります。短い行ではスロットを縦中央に配置し、3行では上揃えにします。論理端の余白は16px、通常のブロック方向の余白は10px、精密ポインターでは12px、スロット間の間隔は12pxです。

セグメント行の間隔は2pxです。最初の行は上側の角、最後の行は下側の角を大きくし、単独行は四隅すべてを大きくします。中間の角には極小の基本シェイプを使います。

基本のコンテンツはsurface上のon-surface／on-surface-variantです。チェック済みラジオまたはチェックボックスではsecondary-container上にon-secondary-containerのコンテンツを表示します。無効状態のコンテンツ色は不透明度0.38のon-surfaceで、選択時のシェイプは維持します。ネイティブのドラッグイベントでは、並べ替えリスト用のtertiary-container／on-tertiary-container色、大きなシェイプ、Level 4の影を使います。

ホバー時は中サイズの角を使います。フォーカス、選択、押下、ドラッグ時は大きな角を使います。状態が重なるときのシェイプの優先順位は、押下、ドラッグ、選択、フォーカス、ホバー、基本状態です。色の優先順位は、無効、ドラッグ、選択、基本状態です。ステートレイヤーと色のモーションにはExpressive default-effectsを、シェイプとエレベーションにはfast-spatialを使います。モーション低減時は即座に反映します。

## アクセシビリティ {#accessibility}

ボタン、ラジオ、チェックボックスは、ポインター、Enter／Space、フォーカス、無効化、アクセシブルネーム／状態、フォーム送信、リセット、イベントのキャンセルをそれぞれネイティブに処理します。ラジオのグループ化は`name`によるネイティブ機能で実現し、ARIAロールで再現しません。

表示されるすべてのスロット内容がネイティブコントロールのアクセシブルネームに含まれます。行の表示内容が適切な名前にならない場合は`aria-label`または`aria-labelledby`を使ってください。操作可能な項目の中にリンク、コントロール、ラベルなど、フォーカス可能な内容を置かないでください。スロットごとに個別の操作が必要な場合は受動的な行を使います。

論理グリッド順はDOMの読み上げ順を変えずにRTLで視覚的に反転します。強制カラーでもフォーカスを見える状態に保ちます。選択中の行にはシステムのHighlight／HighlightText、無効な行にはGrayTextを使います。

## トークンとソースの境界 {#tokens-and-source-boundary}

このファミリーは高さ、余白、間隔、セグメント間隔、シェイプ、色、無効時の不透明度、通常／ドラッグ時のエレベーション、フォーカスリングに`--m3e-comp-list-item-*`トークンを使います。headlineにはbody-large、supporting textにはbody-medium、overline／末尾のラベルにはlabel-small、leading contentにはtitle-mediumを適用します。

既定値はAndroidXリビジョン`a90df2fc27e026b9ad2ed569f203a260c1041fab`に固定されています。生成された`ListTokens`／`ReorderListTokens`の使用済み／未使用の分類は準拠台帳に記録し、生成トークン名を実在しない実行時状態に結び付けないようにしています。プロバイダーのスコープ内でのコンポーネントトークン上書きにより、任意のCompose色／シェイプ／エレベーションオブジェクトを置き換えられます。

Webには同等のネイティブなキーボード操作がないため、長押しは公開しません。Composeの`Modifier`、`InteractionSource`、semantics DSL、測定ポリシーはプラットフォーム固有の仕組みですが、観測できる意味、形状、状態、モーションの出力は網羅しています。
