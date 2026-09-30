# A2UIのコンポーネントとレンダリング規則

`@language-lit/material3-expressive-a2ui`はA2UI v0.9.1 basic catalog全体を実装しています。カタログの各コンポーネントはMaterial 3 Expressiveのコンポーネントとしてレンダリングされます。また、すべての色、タイプスタイル、角、モーションの値はデザインシステムのトークンに解決されるため、サーフェスはライトモードとダークモードでテーマに従います。

最初に[セットアップガイド](A2UI_GETTING_STARTED.md)でパッケージをインストールし、両方のスタイルシートを読み込んで、サーフェスをレンダリングしてください。

## どのようにレンダリングされるか {#what-renders-as-what}

| A2UIコンポーネント | Material 3 Expressive | 備考 |
| --- | --- | --- |
| `Text` | [Text](components/Text.md) | `h1`から`h5`はheadlineとtitleのロールに対応し、`caption`は小さく控えめに、`body`は読みやすいサイズで表示します。Markdownの対応範囲は、太字、斜体、コード、リンク、見出し、リストです。 |
| `Image` | バリアントに応じたサイズの画像 | `icon`、`avatar`（円形）、`smallFeature`、`mediumFeature`、`largeFeature`、`header`（全幅）に対応します。`fit`はobject-fitに対応します。 |
| `Icon` | [Icon](components/Icon.md) | カタログ名はフォントなしで埋め込みグリフとして表示されます。`svgPath`はインラインで表示されます。 |
| `Video` | ネイティブの動画プレーヤー | コントロールを有効にします。 |
| `AudioPlayer` | ネイティブの音声プレーヤー | コントロールを有効にします。 |
| `Row` | Flex行 | `justify`、`align`、子要素の`weight`を使います。 |
| `Column` | Flex列 | `justify`、`align`、子要素の`weight`を使います。 |
| `List` | リスト | 縦向きまたは横向きです。 |
| `Card` | アウトライン付き[Card](components/Card.md) | 受動的なコンテナです。 |
| `Tabs` | [Tabs](components/Tabs.md) | 項目ごとにタブを1つ表示し、キーボードで操作できます。 |
| `Modal` | [Dialog](components/Dialog.md) | トリガーでダイアログを開き、トリガー自身のアクションも送信します。 |
| `Divider` | [Divider](components/Divider.md) | 水平または垂直です。 |
| `Button` | [Button](components/Button.md) | `primary`はfilled、`default`はtonal、`borderless`はtextです。`checks`が失敗すると無効になります。 |
| `TextField` | [TextField](components/TextField.md)または[TextArea](components/TextArea.md) | `shortText`、`longText`、`obscured`、`number`のバリアントがあります。 |
| `CheckBox` | [Checkbox](components/Checkbox.md) | ラベル付きです。 |
| `ChoicePicker` | [Radio](components/Radio.md)、[Checkbox](components/Checkbox.md)、またはフィルター用[Chip](components/Chip.md) | `mutuallyExclusive`または`multipleChoice`に対応し、任意でフィルターフィールドも使えます。 |
| `Slider` | [Slider](components/Slider.md) | 小数点以下の精度は範囲に従います。 |
| `DateTimeInput` | `DatePicker`、`TimePicker`、または`DateTimePicker` | 1.3.0-rc.1のMaterial picker機能を使います。宣言済みの1.2 peer系列でも、ネイティブ入力にフォールバックする互換性機能を通じて読み込み可能です。明示的にタイムゾーンを指定した日時はローカルの暦時刻で表示され、UTCの瞬間として書き戻されます。 |

## ストリーミングとプレースホルダー {#streaming-and-placeholders}

エージェントは、子要素のデータを送る前にその名前を指定できます。`children`にまだ届いていないIDが含まれる`Column`は、それぞれにプレースホルダーを表示し、一致する`updateComponents`メッセージが届くとすぐに置き換えます。デモの最初のシナリオでは、内容が届く前のカードの形を確認できます。

各コンポーネントは自身のモデルを購読するため、あるコンポーネントへの更新で再レンダリングされるのはそのコンポーネントだけです。

## データバインディング {#data-binding}

プロパティにはリテラル、`{ "path": "/some/value" }`形式のバインディング、`formatCurrency`や`formatDate`のような関数呼び出しを指定できます。バインディングは、`updateDataModel`メッセージで更新されるサーフェスのデータモデルを読み取ります。

入力値は同じモデルに書き戻されます。`/name`にバインドした`TextField`は入力に合わせて`/name`を更新し、同じパスにバインドした`Text`も一緒に更新されます。`sendDataModel`を指定して作成したサーフェスでは、`getClientDataModel()`でモデルをエージェントに送信します。

テンプレートを使うと、リストの各項目についてコンポーネントを繰り返し表示できます。

```json
{
  "id": "flights",
  "component": "Column",
  "children": { "path": "/flights", "componentId": "flight-row" }
}
```

`flight-row`の内側では、`{ "path": "airline" }`などの相対パスは各項目を基準に解決されます。後続の`updateDataModel`で`/flights`に項目を追加すると、行も追加されます。

## 検証とアクション {#validation-and-actions}

`checks`を使って、入力またはボタンに条件とメッセージを関連付けます。チェックに失敗したフィールドは、ユーザーが操作した後にメッセージを表示します。チェックに失敗したボタンは無効になり、有効なデータの場合だけアクションを送信できます。条件では`required`、`email`、`regex`、`and`、`or`、`not`など、カタログの関数を使います。

`Button`を押すと`action.event`が送信されます。イベントの`context`にあるすべての`{ "path" }`は、アクションが`onAction`コールバックに届く前に解決されます。エージェントに送信するアクションオブジェクトは次のとおりです。

| フィールド | 意味 |
| --- | --- |
| `name` | ボタンのイベント名です。 |
| `surfaceId` | ボタンが属するサーフェスです。 |
| `sourceComponentId` | ボタンのコンポーネントIDです。 |
| `timestamp` | ユーザーが押した時刻を示すISO 8601文字列です。 |
| `context` | 解決済みのコンテキストオブジェクトです。 |

## テーマと表示元の明示 {#theming-and-attribution}

サーフェスは、最も近い`Material3Provider`のテーマを継承します。ライト、ダーク、システムのカラーモード、カスタムのソースカラー、ネストしたテーマスコープは、設定なしで適用されます。

`createSurface`の`theme`フィールドには`agentDisplayName`、`iconUrl`、`primaryColor`を指定できます。どちらかが設定されている場合、`A2uiSurface`はサーフェスの内容の上に名前とアイコンを表示します。非表示にするには`attribution={false}`を渡します。`primaryColor`はサーフェス要素の`--m3e-a2ui-agent-color`カスタムプロパティとして公開され、表示元の明示に使われます。エージェントが選んだ色はMaterialテーマではないため、サーフェスのテーマ全体は変更しません。

インスタンスごとのスタイルを変更するには、所有する祖先要素にデザインシステムの公開コンポーネントエイリアスを設定します。非公開の`.m3e-`クラス名を対象にしないでください。

## カタログを拡張する {#extend-the-catalog}

`createMaterial3Component`と`createMaterial3Catalog`を使うと、独自のコンポーネントを追加したり既存のコンポーネントを置き換えたりできます。実装は解決済みのpropsと`buildChild`関数を受け取る表示専用コンポーネントです。

```tsx
import { Text } from '@language-lit/material3-expressive'
import { TextApi } from '@a2ui/web_core/v0_9/basic_catalog'
import {
  createMaterial3Catalog,
  createMaterial3Component,
  useA2ui,
} from '@language-lit/material3-expressive-a2ui'

const ShoutingText = createMaterial3Component(TextApi, ({ props }) => (
  <Text as="p" variant="bodyLarge">{String(props.text).toUpperCase()}</Text>
))

const catalog = createMaterial3Catalog({
  components: [ShoutingText],
  locale: 'pt-BR',
})

// Inside a component:
const a2ui = useA2ui({ catalogs: [catalog] })
```

後から登録した同名の項目が優先されるため、1つの上書きでデフォルト実装を置き換えられます。`locale`は`formatCurrency`、`formatDate`などの書式関数にロケールを設定します。独自のカタログIDで公開する場合は`id`を、関数セットを置き換える場合は`functions`を渡してください。

## GoogleのReactサーフェスでカタログを使う {#use-the-catalog-under-google39s-react-surface}

`material3Catalog`は`@a2ui/web_core`のカタログで、Googleの`@a2ui/react`サーフェスが利用する表示専用の形式で実装されています。すでにそのサーフェスで表示しているホストは、Materialカタログを登録したうえで、独自のサーフェス、トランスポート、フォールバック方針を維持できます。この場合に必要なのは、このパッケージのスタイルシートだけです。

```tsx
import { A2uiSurface } from '@a2ui/react/v0_9'
import { MessageProcessor } from '@a2ui/web_core/v0_9'
import { material3Catalog } from '@language-lit/material3-expressive-a2ui'

const processor = new MessageProcessor([material3Catalog], onAction)
// processor.processMessages(messages)
// <A2uiSurface surface={processor.model.surfacesMap.get(surfaceId)!} />
```

companionのテストスイートでは、`@a2ui/react` 0.11.0上でカタログをレンダリングしています。このパッケージはcompanionの依存関係ではなく、それ自体がReact 19を必要とします。

## 制限事項 {#limits}

- デフォルトで使えるのはbasic catalogのみです。その他のカタログには、`createMaterial3Catalog`を通じて実装を登録する必要があります。
- カタログ一覧にないアイコン名はMaterial Symbolsのリガチャにフォールバックします。アプリでそのフォントを読み込んでいる場合のみ表示されます。
- Markdownの対応範囲にテーブル、画像、生HTML、入れ子のリストは含まれません。リンクで開けるのは`http`、`https`、`mailto`、`tel`のみです。
- `DateTimeInput`は1.3.0-rc.1のMaterial pickerエクスポートを使い、互換性のある1.2 peer系列がインストールされている場合はプラットフォームの入力にフォールバックします。
- トランスポート、認証、永続化、エージェントのオーケストレーションはアプリケーション側の責任です。

[パッケージのソース](https://github.com/Language-Lit/material3-expressive-a2ui/tree/main)には、公開されているTypeScript定義とテストの全体が含まれています。
