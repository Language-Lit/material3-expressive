# Switch

`Switch`は`input type="checkbox" role="switch"`に、Materialの最新のトラック、つまみ、ステートレイヤー、押下時のシェイプモーションを適用します。ラベルは内部に持たないため、通常のHTMLラベルと組み合わせられます。

```tsx
import { Switch } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<label>
  <Switch name="notifications" defaultChecked />
  Notifications
</label>
```

## 仕様 {#contract}

- レンダーされるのはネイティブのチェックボックス入力1つで、switchとして公開します。ref、`name`、`value`、`form`、`required`、`id`、ARIA／data属性、ネイティブのイベントハンドラーはこの入力に渡されます。`role`と`type`は固定で上書きできません。
- `className`と`style`はSwitchのルートに適用されます。ルートはソース由来の`52×32px`トラックの周囲に`48px`の操作領域を確保します。
- `checked`と`onCheckedChange`を使うと制御されます。`defaultChecked`を使うと非制御となり、フォームのネイティブリセットを含め、チェック状態をDOMに任せます。
- ライブラリが状態を更新する前に`onChange`が実行されます。`preventDefault()`を呼び出すと更新を取り消せます。
- `onCheckedChange`はブラウザーが解決した値を通知するため、別途トグル値を計算する必要はありません。

## つまみのアイコン {#thumb-icon}

`thumbIcon`は固定されたソースの`thumbContent`スロットに対応し、つまみの内側に装飾コンテンツを表示します。スロットはソース由来の`16×16px`の枠内にコンテンツを中央配置します。`Icon`、SVG、画像は自動的にそのサイズに制限されます。ほかのカスタムコンテンツも同じ枠に収めてください。コンテンツがあると、未選択時もつまみは選択時のサイズを保ちます。これはソースの`hasContent || checked`によるサイズ決定と同じです。

```tsx
<Switch
  aria-label="Wi-Fi"
  checked={wifiOn}
  onCheckedChange={setWifiOn}
  thumbIcon={<Icon source={wifiOn ? 'check' : 'close'} />}
/>
```

## 状態とモーション {#states-and-motion}

| 状態 | トラック | つまみ | つまみのサイズ |
| --- | --- | --- | --- |
| 未選択 | surface-container-highest、アウトライン境界線 | outline | 16px |
| 選択済み | primary、境界線なし | on-primary | 24px |
| 無効、未選択 | surface-container-highest / on-surface at 0.12 | on-surface at 0.38 | 16px |
| 無効、選択済み | on-surface at 0.12、境界線なし | surface | 24px |

ホバー、フォーカス、押下時は、つまみの位置を中心とする直径`40px`のステートレイヤーを使います。つまみとともに移動するため、トラックの中央に固定されません。押している間はつまみが即座に28pxまで拡大します。離すとExpressive fast-spatialモーションで通常サイズに戻ります。これは押下中はスナップさせるソース独自のアニメーション仕様と同じ非対称性です。トラックとつまみの色はExpressive default-effectsモーションで遷移します。モーション低減時はすべての変化が直ちに反映されます。

静止時のつまみの外枠開始位置は、アイコンなしで8px、アイコンありで4px、選択時に24pxです。押下時は2pxと22pxになります。これらの論理オフセットはRTLで反転します。

現行のAndroidX Switchにはサイズ、バリアント、エラー用のパラメーターがありません。そのため、この実装は1種類のみを提供し、固定されたソースにないExpressiveな形状は追加しません。

## アクセシビリティ {#accessibility}

ネイティブのチェックボックス入力に付けた`role="switch"`では、ブラウザーがネイティブの`checked`プロパティからチェック状態を決めるため、明示的な`aria-checked`は不要です。Spaceキーで切り替わり、Enterキーでは切り替わりません。ラベルはラッパーの`label`、`label for`、`aria-label`、`aria-labelledby`で指定します。

高さ`32px`のトラックは`48px`の操作領域に収まります。`:focus-visible`ではトークンに基づくフォーカスリングをトラックに描画します。強制カラーではトラックのアウトラインを保ち、選択中のトラック／つまみとフォーカスリングにHighlight、無効状態にGrayTextを使います。レイアウトは論理方向に対応しているため、RTLでも正しく動作します。

## トークンと境界 {#tokens-and-boundaries}

Switchは検索可能な`--m3e-comp-switch-*`変数を登録します。対象は次のとおりです。

- 最小操作領域、トラックの幅／高さとアウトライン幅、未選択／選択／押下時のつまみサイズ、アイコンサイズ、ステートレイヤーのサイズ。
- 選択／未選択時のトラック、つまみ、アイコンの色。
- それぞれ異なる不透明度を持つ、無効かつ選択済み／未選択のつまみ／アイコン色、および無効トラックと無効時の未選択境界線ロールで共有する不透明度。
- フォーカスリング。

テーマの上書きは`Material3Provider`のスコープ内で適用されます。Switchは実行時スタイルを注入せず、Next.js、Vite、ルーター、アニメーションライブラリ、非公開のアプリケーションコードをインポートしません。
