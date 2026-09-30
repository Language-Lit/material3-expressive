# 0.3から1.0への移行

このガイドでは公開パッケージの契約を対応づけます。アプリケーション固有のimport、ルート、データモデル、依存関係のリビジョン、ギャップ分析、移行状況は含みません。

## 変更点 {#what-changed}

`1.0.0`は追加リリースではなく、全面的な置き換えです。0.3の実装、Tailwindプリセット、スタイルシート、およびすべてのサブパスエクスポートはパッケージから削除されました。`1.0.0`内に互換性のための経路はありません。アプリケーションは意図的にアップグレードするか、引き続き公開・インストール可能な`0.3.x`を使います。

| 0.3の契約 | 1.0の契約 |
| --- | --- |
| `@language-lit/material3-expressive`（0.3 API） | `@language-lit/material3-expressive`（新API） |
| `@language-lit/material3-expressive/styles` | `@language-lit/material3-expressive/styles.css` |
| コンポーネントグループのサブパス（`/components/*`） | パッケージルートから名前付きエクスポート |
| `tailwind-preset`とパッケージのcontent glob | 削除。代替はなく、追加も不要 |
| リンク／画像アダプター用プロバイダー | テーマをスコープする`Material3Provider` |
| hooksとutilitiesのサブパス | 削除。公開されたtheme／token／component APIを使用 |
| — | `@language-lit/material3-expressive/theme`（Reactを含まない） |
| — | `@language-lit/material3-expressive/tokens`（Reactを含まない） |

両リリースが同じimportパスを使うため、1つのインストール済みバージョンから0.3と1.0を同時にレンダリングすることはできません。本番コードを段階的に変更するのではなく、ブランチを作ってアップグレードしてください。

## セットアップの変更 {#setup-changes}

1. 独立した移行ブランチに`1.0.0`をインストールします。
2. Tailwindプリセットのimport、パッケージのcontent glob、`./styles`のimportを削除します。
3. アプリケーションレベルのエントリで`@language-lit/material3-expressive/styles.css`を一度だけ読み込みます。
4. `Material3Provider`をレンダリングし、`light`、`dark`、`system`からモードを選びます。
5. カスタムデザイン値をCSSやTailwind設定ではなく、`createTheme`／`extendTheme`のデータに移します。
6. コンポーネントをセマンティックな領域ごとに置き換え、フォーム、キーボード操作、フォーカス、RTL、強制カラー、モーションの軽減、SSR、本番CSSを確認します。

## よくある公開概念の対応 {#common-public-concept-mappings}

| 0.3の概念 | 1.0での方針 |
| --- | --- |
| `Button`、`IconButton` | 同じ名前付き概念を使い、ネイティブのボタン／フォームセマンティクスと新しいバリアント／サイズの契約に従います。 |
| `FAB` | `FloatingActionButton`を使います。一時的な操作、拡張、トグルの各モードには明示的なprops形式があります。 |
| 名前で参照する`Icon`レジストリ | Material SymbolsのリガチャまたはSVGソースを`Icon`に渡します。フォント配信は利用側で管理します。 |
| `Input` | `TextField`を使い、公開バリアントでfilled／outlinedのスタイルを選びます。 |
| `TextArea` | `TextArea`を使います。TextFieldと外観を共有し、ネイティブの縦方向のサイズ変更を維持します。 |
| `SegmentedButtons` | 単一または複数選択モードのデータ駆動型`SegmentedButtonGroup`を使います。 |
| `Modal` | `Dialog`を使い、modal／non-modalの動作を選んで、制御式のopenライフサイクルに従います。 |
| Menu／selectコンポーネント | APGのmenuセマンティクスには`Menu`を、combobox／listboxセマンティクスには`Select`を使います。 |
| `Tabs`、`TabItem`、`TabsContainer` | リンクとして使える項目と任意のパネルを備えた、データ駆動型の`Tabs`コンポーネントを1つ使います。 |
| Navigation bar／rail／drawer | 共通の`NavigationItem`形式か、アダプティブな切り替え用の`NavigationSuite`を使います。 |
| Linear／circular progress | `LinearProgress`／`CircularProgress`を使います。不確定モードでは`value`を省略します。`WavyProgress`はExpressiveな表現です。 |
| Theme／font loaderフック | `/theme`でシリアライズ可能なテーマデータを作成します。フォントの読み込みは引き続きアプリケーション側で管理します。 |

正確なpropsについては[サポート対象コンポーネントの一覧](SUPPORTED_COMPONENTS.md)と各リンク先をご覧ください。名前が似ていても、propsレベルの互換性は保証されません。

## 1.0に対応するプリミティブがない0.3 API {#03-apis-without-a-10-primitive}

0.3パッケージには、1.0の一覧にあるMaterialプリミティブではないユーティリティや、アプリケーションレベルの表示パターンが含まれていました。データ表示レシピ、フレームワークアダプターのコンテキスト、アプリケーションのフォントやテーマを読み込むフックなどです。これらはアプリケーション側の組み立てで置き換えるか、公開タスクの手順に従って将来の汎用コンポーネントを提案してください。以前存在したことを理由に、提供範囲が広がることはありません。

## 破壊的変更 {#breaking-changes}

- `/theme`、`/tokens`、`/styles.css`以外のすべてのサブパスが削除されました。
- Tailwindプリセット、パッケージのcontent glob、`./styles`エントリはなくなりました。
- CSSは`m3e`名前空間を使い、Tailwindトークンを消費しません。0.3の`--md-*`カスタムプロパティは削除されました。
- `Material3Provider`は実際の`div`でテーマをスコープ化します。フレームワークのリンク／画像アダプターは管理しません。
- コンポーネントでは、移植したアプリケーションやComposeのロールより、ネイティブ要素とAPGのセマンティクスを優先します。
- 状態を持つ複合コンポーネントでは、子要素やルーターに結びつけず、明示的な制御／非制御の値コールバックとデータ配列を使います。
- アイコン用のレジストリやフォントローダーは同梱されません。
- パッケージにランタイム依存関係はありません。peer依存関係はReactとReact DOMのみです。
- サポートの保証対象は生成された準拠コンポーネント一覧のみです。

## 検証とロールバック {#validation-and-rollback}

移行した領域ごとに、アプリケーションの型チェック、テスト、アクセシビリティチェック、SSRビルド、本番バンドルを実行します。公開パッケージの検証には、このリポジトリの`npm run verify`を使います。

ロールバックでは、利用側の変更で`0.3.x`依存関係、import、スタイルを復元します。利用側固有の展開／ロールバック手順は、この公開リポジトリの対象外です。
