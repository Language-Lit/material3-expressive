# Carousel

`Carousel`は、コンテナ内を移動するとサイズが変わる、主に視覚的な項目のスクロール可能な一覧を表示します。Materialが定める6種類のレイアウトを1つのコンポーネントで扱います。

```tsx
import { Button, Carousel } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

// Multi-browse: many items at once, for quick browsing.
<Carousel
  aria-label="Recent photos"
  preferredItemWidth={186}
  items={photos.map((photo) => ({
    key: photo.id,
    label: photo.title,
    content: <img src={photo.src} alt="" />,
    onActivate: () => open(photo),
  }))}
/>

// Hero: one large item with a preview of what is next.
<Carousel aria-label="Featured" layout="centeredHero" items={featured} />

// Uncontained: same-size items that flow past the edge.
<Carousel aria-label="Articles" layout="uncontained" itemWidth={240} items={articles} />

// Multi-aspect ratio: each item keeps its own shape.
<Carousel
  aria-label="Clips"
  layout="multiAspect"
  items={clips.map((clip) => ({ key: clip.id, content: <video src={clip.src} />, aspectRatio: clip.ratio }))}
/>
```

## 契約 {#contract}

項目一覧は`items`で渡します。各項目には`key`と表示用の`content`を指定し、任意で`label`、`onActivate`、`href`、`disabled`を指定できます。`onActivate`がある項目は実際の`button`、`href`がある項目は実際の`a`として描画します。Space／Enterによるアクティベーションと、フォーカス時にブラウザーが項目をスクロール領域へ表示する動作は、キー処理を独自実装せずプラットフォームに任せます。

`layout`で配置方法を選択します。既定値は`"multiBrowse"`です。

| レイアウト | 用途 | 必須のprop |
| --- | --- | --- |
| `multiBrowse` | 多数の視覚的な項目を一度に見る | `preferredItemWidth` |
| `uncontained` | テキスト主体、または高度にカスタマイズした項目 | `itemWidth` |
| `multiAspect` | 形状が実際に異なる項目 | 各項目の`aspectRatio` |
| `hero` | 非常に大きな項目を目立たせる | — |
| `centeredHero` | 2つのプレビューの中央に同じ項目を配置する | — |
| `fullScreen` | 没入型の縦方向フィード | — |

`preferredItemWidth`は目標幅であり、保証値ではありません。配置処理はまず小項目、次に中項目を調整し、最後に大項目の幅を調整して、整数個の項目がコンテナに収まるようにします。`minSmallItemWidth`と`maxSmallItemWidth`で小項目の幅を制限します。既定範囲は仕様に基づく40〜56pxです。

これはレイアウトで使える唯一のレスポンシブ調整手段で、値は利用側が変更します。コンテナが広がると項目数は増えます。たとえば幅を`186`に固定すると、狭い幅では3項目、1440pxでは8項目が収まりますが、項目そのものは大きくなりません。Materialのガイドラインでは、ウィンドウ幅600dp未満をcompactとし、その幅では最大3項目を想定します。また、ウィンドウが広がると項目数だけでなく項目も大きくすることを求めています。このアルゴリズムで自動的に得られるのは前者だけなので、後者も必要なら広いブレークポイントで`preferredItemWidth`を増やしてください。このpropは数値なので、ウィンドウサイズクラス用のフックや`ResizeObserver`で変更できます。参照すべき規定の拡大率はありません。ファーストパーティのComposeサンプルはすべてのウィンドウ幅で186dpを固定使用しているため、ここでの例も同じ値にしています。

配置に大項目が複数入る場合に起きる動作を知っておくと、問題と誤解せずに済みます。大項目のキ―ラインが複数あるとサイズが同じになるため、項目はサイズを変えずにその間を移動し、末尾側の端で初めてフレームに収まります。これは仕様どおりです。ブラウズ領域は安定し、端でサイズが変わるため、幅の広いmulti-browseは狭い場合と異なるアニメーションになります。

`scroll`は仕様に記載された2つの動作から選択し、既定ではレイアウトに推奨されるものを使います。2種類のuncontained以外は`"snap"`です。uncontainedの2種類は`"free"`になります。full-screenレイアウトではスナップが必須なので、変更しないでください。

`currentItem`、`defaultCurrentItem`、`onCurrentItemChange`で焦点位置にある項目を管理します。`currentItem`を設定するとその項目までスクロールし、スクロールすると最寄りの項目が通知されます。`itemSpacing`で間隔を上書きできます。

Carouselにはアクセシブルな名前が必要なので、`aria-label`または`aria-labelledby`を指定します。`div`のほかの属性はそのまま渡され、refはスクロールコンテナを参照します。

## 項目の適応型コンテンツ {#adaptive-item-content}

項目の現在幅が通知されるため、再レンダーせずにコンテンツを適応させられます。各項目の`data-m3e-size`は`large`、`medium`、`small`のいずれかです。`data-m3e-carousel-hide`を付けたコンテンツは、項目幅がそのコンテンツに必要な幅より狭くなるにつれて**フェードアウト**します。

```tsx
<Carousel
  aria-label="Albums"
  preferredItemWidth={186}
  items={albums.map((album) => ({
    key: album.id,
    label: album.title,
    content: (
      <>
        <img src={album.cover} alt="" />
        <figcaption>
          <span data-m3e-carousel-hide="medium">{album.title}</span>
          <span data-m3e-carousel-hide="small">{album.year}</span>
        </figcaption>
      </>
    ),
  }))}
/>
```

これはMaterial独自のルールです。大項目にはタイトル全体、中項目ではタイトルを隠し、小項目ではラベルを短縮表示します。参照実装にならって、単純に表示を切り替えるのではなくフェードさせます。タイトルはマスクの端に沿って配置され、項目の幅が不足してくると薄くなります。

属性値は、コンテンツが残る時間を指定するものであり、表示／非表示の境界ではありません。`"medium"`のコンテンツは焦点位置では不透明で、サイズ範囲の中間までに消えます。`"small"`は中間位置までに不透明になり、最も狭い表示項目では消えます。そのためタイトルから先に薄くなり、各変化を切り替えではなくフェードとして確認できます。

フェード中のテキストを切り抜かずに定位置へ保つには、参照実装と同様に`--m3e-carousel-item-inset-start`で移動します。余白の追加より移動を使ってください。余白はコンテンツ自体の幅を変えます。配置アルゴリズムが処理できる項目幅を超えるコンテンツは配置できません。

正確なピクセル幅は`--m3e-carousel-item-current-size`、`--m3e-carousel-item-min-size`、`--m3e-carousel-item-max-size`からも取得できます。

これらの値を直接使う場合は注意してください。`--m3e-carousel-item-min-size`はComposeの値をそのまま表し、画面外に少しだけ見える、約10pxのアンカーキ―ラインも含みます。表示される項目の最小幅ではないため、これを使ってサイズを正規化すると、ほとんどすべての項目がmediumに分類されます。サイズ判定には小キ―ラインを使う`data-m3e-size`を推奨します。

コンテンツは項目に合わせて調整されず、項目によってクリップされます。スナップ位置は項目幅から導かれるため、項目の幅は配置時の幅そのものです。幅が狭くなっても読みやすさを保つ必要があるテキストには、マスクのインセットである`--m3e-carousel-item-inset-start`と`--m3e-carousel-item-inset-end`を適用します。そうしない場合、テキストは移動せず、字形の途中で切り取られます。

## すべて表示 — アクセシビリティ要件 {#show-all-the-accessibility-requirement}

縦方向にスクロールするページ上の横方向Carouselでは、横スクロール以外の方法でも全項目へ移動できるようにします。MaterialはCarouselの下に**すべて表示**ボタンを置くか、見出しの横に矢印を置くよう求めています。これはpropではなく、次のように組み合わせます。

```tsx
<section aria-labelledby="recent-heading">
  <h2 id="recent-heading">Recent</h2>
  <Carousel aria-labelledby="recent-heading" preferredItemWidth={186} items={photos} />
  <Button variant="text" onClick={() => router.push('/photos')}>
    Show all
  </Button>
</section>
```

full-screenレイアウトではページと同じ軸にスクロールするため、この要件は適用されません。

## 動作 {#behavior}

Carouselは実際のスクロールコンテナです。ジェスチャー、ホイール、慣性スクロール、キーボードスクロール、RTLへの対応はブラウザーが担います。スナップにはMaterial独自のキ―ラインに合わせたCSS Scroll Snapを使うため、ジェスチャーを離すと配置仕様に従った位置で停止します。フリング距離はブラウザーが決めます。Materialの「1回のフリングで1項目だけ進む」動作に、Web上の相当機能はありません。

項目のマスキングはスクロール位置から計算します。これにより項目が大、中、小の幅に変化し、マスク内の画像に視差効果が生じます。

`prefers-reduced-motion: reduce`ではマスキングを解除します。各項目は最大幅のままとなり、拡大縮小せず、コンテナ端まで届きます。これはMaterialが定めるモーションを減らした場合の表示です。

## トークン {#tokens}

Carouselは、トークンが見た目だけでなくレイアウトも変える唯一のコンポーネントです。4つのトークンは配置アルゴリズムに直接使われます。

| トークン | 既定値 | 効果 |
| --- | --- | --- |
| `--m3e-comp-carousel-min-small-item-size` | `40px` | 小項目の最小幅 |
| `--m3e-comp-carousel-max-small-item-size` | `56px` | 小項目の最大幅 |
| `--m3e-comp-carousel-anchor-size` | `10px` | 項目が両端を越えて移動する距離 |
| `--m3e-comp-carousel-medium-large-item-diff-threshold` | `0.85` | medium項目がlarge項目に近づきすぎたと判断する境界 |

そのほかは通常の見た目に関するトークンです。`container-color`、`item-shape`、`item-container-color`、`item-content-color`、`item-spacing`、`leading-padding`、`trailing-padding`、`block-padding`、`uncontained-trailing-padding`、`full-screen-padding`、`full-screen-item-spacing`、フォーカスリングの3値、state-layerの色、無効状態の不透明度2種類です。テーマまたはインスタンス単位で上書きできます。

```tsx
<Carousel
  aria-label="Covers"
  preferredItemWidth={186}
  items={covers}
  style={{ '--m3e-comp-carousel-item-shape': '12px' }}
/>
```

## レイアウト上の注意 {#layout-notes}

Carouselには高さを指定してください。項目はコンテナいっぱいに広がり、multi-aspectレイアウトでは高さと項目の比率から幅を求めます。

項目のコンテンツはマスク前の項目サイズでレイアウトされ、クリップされます。画像は項目いっぱいに広げてください。子要素が`img`、`video`、`picture`、`svg`、`canvas`の場合は適切なサイズと切り抜きを適用します。
