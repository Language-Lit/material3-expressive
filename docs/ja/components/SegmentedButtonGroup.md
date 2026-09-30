# SegmentedButtonGroup

`SegmentedButtonGroup`は宣言的な`segments`配列からMaterialのセグメントボタンを並べます。相互排他的な選択にはネイティブのラジオグループを、複数選択には独立したネイティブのチェックボックスを使います。複合的な子要素APIはなく、内容、順序、項目数はすべて`segments`で指定します。

```tsx
import { SegmentedButtonGroup } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<SegmentedButtonGroup
  segments={[
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ]}
  aria-label="View"
  value={view}
  onValueChange={setView}
/>
```

## 仕様 {#contract}

- 各セグメントはネイティブの`<input type="radio">`（単一選択、既定）または`<input type="checkbox">`（`multiple: true`）を1つずつ出力し、ネイティブの`<label>`で囲みます。表示テキストがそのコントロールのアクセシブルネームになるため、個別に`id`を設定する必要はありません。
- グループのルートには`role="radiogroup"`または`role="group"`が付きます。`aria-label`／`aria-labelledby`でアクセシブルネームを指定します。
- `value`／`defaultValue`／`onValueChange`は、単一選択モードでは`string`、複数選択モードでは`readonly string[]`です。`multiple`のリテラル値で判別するため、型レベルで2つの形式を混同できません。
- `name`の既定値は生成されたIDで、すべてのセグメントのコントロールに共通です。フォームの送信フィールド名を指定するには独自の`name`を渡します。
- グループの`disabled`はすべてのセグメントを無効にします。個々のセグメントに指定した`disabled`はその項目だけを無効にします。
- `className`と`style`はグループのルートに適用されます。refも同じルート要素を参照します。

## 選択モード {#selection-mode}

| `multiple` | コントロール | 選択 |
| --- | --- | --- |
| `false`（既定） | `<input type="radio">`、共通の`name` | 相互排他的。独自のキー処理を追加せず、ネイティブのフォーカス移動キーボード動作を使用 |
| `true` | `<input type="checkbox">`、共通の`name` | 個別に選択。各コントロールに順番にフォーカスできる |

選択はすべてネイティブのため、非制御の単一選択グループは、コンポーネントが再レンダーしなくてもブラウザーが排他選択を保ちます。これは、このライブラリの`Radio`がすでに利用している保証と同じです。ネイティブフォームのリセットでは、ライブラリ独自の状態管理に関係なく、各コントロールの既定選択に戻ります。

```tsx
<SegmentedButtonGroup
  multiple
  segments={travelModes}
  aria-label="Travel modes"
  value={filters}
  onValueChange={setFilters}
/>
```

単一選択は共通の`name`で1つの値を送信します。複数選択では、選択された値を`FormData.getAll(name)`で取得できます。

## シェイプ {#shape}

最初のセグメントは論理方向の開始側だけ、最後のセグメントは終了側だけを角丸にし、中間のセグメントは四角形のままにします。1つだけの場合は全角を丸めます。物理方向ではなく論理コーナーのプロパティを使うため、RTLでも正しく反転します。隣り合うセグメントは境界線幅分だけ重なり、共有辺が二重にならないようにします。選択中または操作中のセグメントの境界線は隣の項目より前面に表示されます。

## アイコン {#icons}

```tsx
<SegmentedButtonGroup
  segments={[
    { value: 'left', label: 'Left', icon: <Icon source="format_align_left" /> },
    { value: 'center', label: 'Center', icon: <Icon source="format_align_center" /> },
  ]}
  aria-label="Alignment"
  value={align}
  onValueChange={setAlign}
/>
```

`icon`を指定しないセグメントは、組み込みのチェックマークだけを表示します。選択時にフェードインしながら拡大し、選択解除時はすぐに消えます。`icon`を指定すると、未選択時にはそのアイコンを表示し、選択時にはチェックマークへクロスフェードします。切り替えはどちらの方向でも行います。

## トークンと境界 {#tokens-and-boundaries}

色、形状、モーションの値は`--m3e-comp-segmented-button-group-*`の1つの登録にまとめられています。テーマの上書きは`Material3Provider`のスコープ内で適用されます。`SegmentedButtonGroup`は実行時スタイルを注入せず、Next.js、Vite、ルーター、アニメーションライブラリ、非公開のアプリケーションコードをインポートしません。
