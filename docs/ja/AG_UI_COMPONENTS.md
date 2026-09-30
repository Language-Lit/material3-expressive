# AG-UIのコンポーネントとツールレンダラー

おなじみの会話レイアウトには組み立て済みのチャットを使い、アプリに合わせた構成には個々のコンポーネントを配置します。以下のコンポーネントは`@language-lit/material3-expressive-ag-ui`から提供されます。デモにあるカスタムの予報、プロジェクト、招待カードは、コアMaterialコンポーネントを使った例であり、AG-UIパッケージの追加エクスポートではありません。

まず[セットアップガイド](AG_UI_GETTING_STARTED.md)でパッケージをインストールし、両方のスタイルシートを読み込んで、エージェントを紐付けます。

## 会話コンポーネント {#conversation-components}

| コンポーネント | 説明 |
| --- | --- |
| `AgentChat` | スレッド、実行状態、入力欄を組み合わせます。`emptyState`と`composer`のオプションを受け取ります。 |
| `MessageThread` | 登録済みのツールレンダラーを含むタイムラインを表示します。読み手が末尾にいる間は、新しい内容に追従します。 |
| `UserMessage` | Materialサーフェス上にユーザーのターンを表示します。`UserNode`を受け取ります。 |
| `AssistantMessage` | アシスタントの返信と、ストリーミング中のキャレットを表示します。`AssistantTextNode`を受け取ります。 |
| `ReasoningDisclosure` | 読み手が推論テキストを開けるようにします。`ReasoningNode`を受け取り、`defaultExpanded`のデフォルトはfalseです。 |
| `ToolCallCard` | ツール名、進捗、引数、結果を表示します。`ToolCallNode`を受け取り、詳細は折りたたまれた状態で始まります。 |
| `ActivityRow` | バックエンドが定義したアクティビティの種類と構造化コンテンツを表示します。`ActivityNode`を受け取ります。 |
| `InterruptPrompt` | 承認の質問とApprove／Cancelアクションを表示します。`InterruptNode`と任意のアクションラベルを受け取ります。 |
| `RunStatus` | 実行中のステップまたは失敗を通知します。`workingLabel`を受け取ります。 |
| `Composer` | ラベル付きのメッセージフィールドと送信／停止コントロールを提供します。`label`、`placeholder`、`disabled`、アクションラベルを受け取ります。 |

`AgentProvider`はエージェントを紐付け、必要なコンポーネントに提供します。`MessageThread`はタイムラインの各項目に適切なコンポーネントを選ぶため、一般的なチャットで個々のノードを作成して渡す必要はありません。

## ツールをコンポーネントとして表示する {#render-a-tool-as-a-component}

`AgentProvider.toolRenderers`に、ツール名と完全に一致する名前で関数を登録します。この関数は`node`、現在のツール呼び出し、紐付け済みエージェントの状態とアクションを持つ`agent`を受け取ります。レンダラーがない名前には`ToolCallCard`が使われます。

```tsx
import { Surface, Text } from '@language-lit/material3-expressive'
import type { ToolRendererProps } from '@language-lit/material3-expressive-ag-ui'

export function WeatherResult({ node }: ToolRendererProps) {
  const city = typeof node.args?.city === 'string'
    ? node.args.city : 'Loading city'
  const temperature = typeof node.args?.temperature === 'number'
    ? `${node.args.temperature} °C` : 'Loading temperature'

  return (
    <Surface color="tertiary-container" shape="large" style={{ padding: 24 }}>
      <Text as="h3" variant="titleLarge">{city}</Text>
      <Text as="p" variant="headlineMedium">{temperature}</Text>
      <Text as="p" variant="bodySmall">
        {node.status === 'complete' ? 'Forecast received' : 'Receiving forecast'}
      </Text>
    </Surface>
  )
}
```

セットアップガイドのプロバイダーに登録します。

```tsx
<AgentProvider
  agent={agent}
  toolRenderers={{ show_weather: WeatherResult }}
>
  <AgentChat />
</AgentProvider>
```

引数の受信中にもレンダラーが実行されます。`node.args`は未定義または未完成の場合があり、JSONドキュメントの受信が完了したかどうかは`node.argsComplete`で分かります。値を表示したり別のコンポーネントに渡したりする前に確認してください。デモでは必須フィールドがそろってから予報の行を表示します。

## ツールの状態を読む {#read-tool-state}

| フィールド | 意味 |
| --- | --- |
| `name`、`id` | ツール名と安定した呼び出しIDです。 |
| `rawArgs` | 未完了のJSON末尾も含め、受信したままの引数テキストです。 |
| `args` | 可能な範囲で解析したオブジェクト、またはundefinedです。 |
| `argsComplete` | 引数ドキュメントが完成しているかどうかを示します。 |
| `status` | `streaming`、`awaiting-result`、`complete`、`error`のいずれかです。 |
| `result`、`error` | 利用可能な場合、ツール応答の結果またはエラーテキストです。 |

実行とツール呼び出しではライフサイクルが異なります。引数の受信が完了していても、結果待ちの場合があります。ツール結果が確定した後に操作するコントロールでは、`status === 'complete'`を確認してください。

## 共有状態にコントロールを接続する {#connect-controls-to-shared-state}

紐付けたエージェントは`state`と`setState`を公開します。受信した`STATE_SNAPSHOT`イベントと`STATE_DELTA`イベントは、コンポーネントが読む同じ状態を更新します。プロジェクトのデモでは完了したタスクIDに使い、チェックリスト、スケジュール、進捗インジケーターの表示を一致させています。

```tsx
import { Checkbox, LinearProgress } from '@language-lit/material3-expressive'
import { useAgentContext } from '@language-lit/material3-expressive-ag-ui'

export function ReviewTask() {
  const { state, setState, isRunning } = useAgentContext()
  const complete = state?.reviewComplete === true

  return (
    <div>
      <label>
        <Checkbox
          checked={complete}
          disabled={isRunning}
          onCheckedChange={(checked) =>
            setState({ ...state, reviewComplete: checked })
          }
        />
        Review with the team
      </label>
      <LinearProgress
        aria-label="Review progress"
        value={complete ? 1 : 0}
      />
    </div>
  )
}
```

`setState`はローカルのエージェント状態を変更します。タスクをサーバーに保存したり、実行を開始したりはしません。更新した状態をエージェントに送信するワークフローでは`run()`を呼び出すか、アプリケーション独自のデータレイヤーを通じて保存してください。

## 承認のために一時停止する {#pause-for-approval}

AG-UIの実行は、interruptの結果で終了することで承認を要求します。`MessageThread`は保留中のinterruptごとに`InterruptPrompt`を表示します。デフォルトのアクションは応答し、SDKを通じて実行を再開します。

独自の承認コントロールを使う場合は、`useAgentContext()`の`resolveInterrupt`を使います。

```tsx
// Inside a component that reads useAgentContext().
await resolveInterrupt(interruptId, { status: 'resolved' })

// Or decline the action.
await resolveInterrupt(interruptId, { status: 'cancelled' })
```

承認の意味と操作を続行できるかどうかは、バックエンドが決めます。ブラウザーでボタンを有効にしても、サーバー操作の認可にはなりません。デモはローカルスクリプトを再開し、メッセージを送らずに招待のプレビューを更新します。

## 読み上げとキーボード操作 {#reading-and-keyboard-behavior}

`RunStatus`をスレッドの近くに配置してください。スレッド自体はライブリージョンではありません。テキストの断片ごとに会話全体を読み上げると、スクリーンリーダーで読みづらくなるためです。完了や承認を通知する必要があるレイアウトでは、その状態変化を簡潔に伝えるステータスメッセージを追加します。

受動的な[Card](components/Card.md)や[Surface](components/Surface.md)の中にラベル付きコントロールを配置してください。インタラクティブなCard自体がボタンなので、その中にボタンや入力欄を置かないでください。デモの[Tabs](components/Tabs.md)、[Checkboxes](components/Checkbox.md)、[segmented buttons](components/SegmentedButtonGroup.md)は、ツールレンダラー内でも通常のキーボード操作を維持します。

承認によってフォーカス中のコントロールがなくなる場合は、レイアウト内の適切な場所にフォーカスを戻してください。デモでは会話に戻します。モーションは任意にし、返信が届いている間もユーザーが過去にスクロールできるようにしてください。

## テキストの動作 {#text-behavior}

アシスタントとユーザーのテキストは改行を保ったプレーンテキストとして表示されます。Markdownレンダラーではありません。リッチテキストが必要な場合は独自のコンテンツレンダラーを用意し、信頼できないコンテンツを適切に処理してください。

[パッケージのソース](https://github.com/Language-Lit/material3-expressive-ag-ui/tree/main)には、公開されているTypeScript定義とテストの全体が含まれています。
