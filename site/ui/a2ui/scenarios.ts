import type { A2uiMessage } from '@a2ui/web_core/v0_9'
import type { Locale } from '../../i18n/locales'

// Site-authored A2UI message streams. Each step is one batch the agent would
// send; the player feeds them to the published renderer one step at a time so
// placeholders, bindings, and live updates are visible. Nothing here opens a
// network connection.

const catalogId = 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json'
const version = 'v0.9.1' as const

export interface Step {
  readonly messages: readonly A2uiMessage[]
  /** Delay before the next step, in milliseconds. */
  readonly wait?: number
}

export interface Scenario {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly prompt: string
  readonly steps: readonly Step[]
}

const hero = `data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 240' role='img'>" +
    "<defs><linearGradient id='g' x1='0' x2='1'><stop offset='0' stop-color='#f6c177'/><stop offset='1' stop-color='#c1607a'/></linearGradient></defs>" +
    "<rect width='800' height='240' fill='url(#g)'/><circle cx='640' cy='72' r='36' fill='#fff4d6'/>" +
    "<path d='M0 190 90 150 150 175 230 130 300 165 380 140 470 170 560 135 640 160 720 145 800 170V240H0Z' fill='#3b2a46'/>" +
    '</svg>',
)}`

export const scenarios: readonly Scenario[] = [
  {
    id: 'streaming',
    title: 'Streaming a surface',
    description:
      'The agent names the card before it sends the content, so a placeholder appears first. Data bindings, formatting functions, and a later value update fill it in.',
    prompt: 'Show me my trip to Lisbon.',
    steps: [
      {
        messages: [
          {
            version,
            createSurface: {
              surfaceId: 'trip',
              catalogId,
              theme: { agentDisplayName: 'Trip agent', primaryColor: '#0b57d0' },
              sendDataModel: true,
            },
          },
        ],
      },
      {
        wait: 900,
        messages: [
          {
            version,
            updateComponents: {
              surfaceId: 'trip',
              components: [
                { id: 'root', component: 'Column', children: ['trip-title', 'trip-card'], align: 'stretch' },
                { id: 'trip-title', component: 'Text', text: 'Your trip to Lisbon', variant: 'h2' },
                { id: 'trip-card', component: 'Card', child: 'trip-body' },
              ],
            },
          },
        ],
      },
      {
        messages: [
          {
            version,
            updateDataModel: {
              surfaceId: 'trip',
              value: {
                trip: {
                  status: 'Confirmed. Seats 12A and 12B.',
                  legs: [
                    { route: 'Tokyo (HND) to Lisbon (LIS)', departs: '2026-10-02T10:40:00', price: 640 },
                    { route: 'Lisbon (LIS) to Tokyo (HND)', departs: '2026-10-07T13:15:00', price: 610 },
                  ],
                  note: 'Prices include taxes and one checked bag.',
                },
              },
            },
          },
        ],
      },
      {
        wait: 1400,
        messages: [
          {
            version,
            updateComponents: {
              surfaceId: 'trip',
              components: [
                {
                  id: 'trip-body',
                  component: 'Column',
                  children: ['trip-status', 'trip-divider', 'trip-legs', 'trip-note'],
                  align: 'stretch',
                },
                { id: 'trip-status', component: 'Row', children: ['status-icon', 'status-text'], align: 'center' },
                { id: 'status-icon', component: 'Icon', name: 'check' },
                { id: 'status-text', component: 'Text', text: { path: '/trip/status' }, variant: 'body' },
                { id: 'trip-divider', component: 'Divider' },
                {
                  id: 'trip-legs',
                  component: 'Column',
                  children: { path: '/trip/legs', componentId: 'leg-row' },
                  align: 'stretch',
                },
                {
                  id: 'leg-row',
                  component: 'Row',
                  children: ['leg-main', 'leg-price'],
                  justify: 'spaceBetween',
                  align: 'center',
                },
                { id: 'leg-main', component: 'Column', children: ['leg-route', 'leg-time'] },
                { id: 'leg-route', component: 'Text', text: { path: 'route' }, variant: 'body' },
                {
                  id: 'leg-time',
                  component: 'Text',
                  text: {
                    call: 'formatDate',
                    args: { value: { path: 'departs' }, format: "EEE, MMM d 'at' h:mm a" },
                    returnType: 'string',
                  },
                  variant: 'caption',
                },
                {
                  id: 'leg-price',
                  component: 'Text',
                  text: {
                    call: 'formatCurrency',
                    args: { value: { path: 'price' }, currency: 'EUR' },
                    returnType: 'string',
                  },
                  variant: 'h4',
                },
                { id: 'trip-note', component: 'Text', text: { path: '/trip/note' }, variant: 'caption' },
              ],
            },
          },
        ],
      },
      {
        messages: [
          {
            version,
            updateDataModel: {
              surfaceId: 'trip',
              path: '/trip/status',
              value: 'Gate changed to 34. Boarding starts at 10:05.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'form',
    title: 'Bind, validate, and act',
    description:
      'Inputs write into the surface data model. Checks keep the button disabled until the data is valid, and the action it sends carries the resolved values.',
    prompt: 'Book a table for Friday.',
    steps: [
      {
        messages: [
          {
            version,
            createSurface: {
              surfaceId: 'table',
              catalogId,
              theme: { agentDisplayName: 'Dining agent', primaryColor: '#7d5260' },
              sendDataModel: true,
            },
          },
        ],
      },
      {
        messages: [
          {
            version,
            updateComponents: {
              surfaceId: 'table',
              components: [
                { id: 'root', component: 'Card', child: 'form' },
                {
                  id: 'form',
                  component: 'Column',
                  children: [
                    'form-title',
                    'form-intro',
                    'name-field',
                    'email-field',
                    'time-field',
                    'seating',
                    'guests',
                    'confirm',
                    'reserve-button',
                  ],
                  align: 'stretch',
                },
                { id: 'form-title', component: 'Text', text: 'Reserve a table', variant: 'h2' },
                {
                  id: 'form-intro',
                  component: 'Text',
                  text: 'Fill in the details. The reservation reaches the agent as an action with these values.',
                  variant: 'body',
                },
                {
                  id: 'name-field',
                  component: 'TextField',
                  label: 'Name',
                  value: { path: '/reservation/name' },
                  checks: [
                    {
                      condition: { call: 'required', args: { value: { path: '/reservation/name' } } },
                      message: 'Enter a name for the reservation',
                    },
                  ],
                },
                {
                  id: 'email-field',
                  component: 'TextField',
                  label: 'Email',
                  value: { path: '/reservation/email' },
                  checks: [
                    {
                      condition: { call: 'email', args: { value: { path: '/reservation/email' } } },
                      message: 'Enter a valid email address',
                    },
                  ],
                },
                {
                  id: 'time-field',
                  component: 'DateTimeInput',
                  label: 'Date and time',
                  value: { path: '/reservation/time' },
                  enableDate: true,
                  enableTime: true,
                },
                {
                  id: 'seating',
                  component: 'ChoicePicker',
                  label: 'Seating',
                  options: [
                    { label: 'Inside', value: 'inside' },
                    { label: 'Terrace', value: 'terrace' },
                    { label: 'Counter', value: 'counter' },
                  ],
                  value: { path: '/reservation/seating' },
                  variant: 'mutuallyExclusive',
                  displayStyle: 'chips',
                },
                {
                  id: 'guests',
                  component: 'Slider',
                  label: 'Guests',
                  min: 1,
                  max: 8,
                  value: { path: '/reservation/guests' },
                },
                {
                  id: 'confirm',
                  component: 'CheckBox',
                  label: 'Email me a confirmation',
                  value: { path: '/reservation/confirm' },
                },
                {
                  id: 'reserve-button',
                  component: 'Button',
                  child: 'reserve-label',
                  variant: 'primary',
                  checks: [
                    {
                      condition: {
                        call: 'and',
                        args: {
                          values: [
                            { call: 'required', args: { value: { path: '/reservation/name' } } },
                            { call: 'email', args: { value: { path: '/reservation/email' } } },
                          ],
                        },
                      },
                      message: 'Add a name and a valid email to reserve',
                    },
                  ],
                  action: {
                    event: { name: 'reserve', context: { reservation: { path: '/reservation' } } },
                  },
                },
                { id: 'reserve-label', component: 'Text', text: 'Reserve' },
              ],
            },
          },
        ],
      },
      {
        messages: [
          {
            version,
            updateDataModel: {
              surfaceId: 'table',
              value: {
                reservation: {
                  name: '',
                  email: '',
                  time: '2026-09-18T19:30:00',
                  seating: ['terrace'],
                  guests: 2,
                  confirm: true,
                },
              },
            },
          },
        ],
      },
    ],
  },
  {
    id: 'layout',
    title: 'Cards, tabs, and a modal',
    description:
      'A header image, Markdown text, tabs, a nested card, a list, and a modal, all from catalog components rendered with Material 3 Expressive.',
    prompt: 'Plan my Saturday in Lisbon.',
    steps: [
      {
        messages: [
          {
            version,
            createSurface: {
              surfaceId: 'plan',
              catalogId,
              theme: { agentDisplayName: 'Trip agent', primaryColor: '#0b57d0' },
            },
          },
        ],
      },
      {
        messages: [
          {
            version,
            updateComponents: {
              surfaceId: 'plan',
              components: [
                {
                  id: 'root',
                  component: 'Column',
                  children: ['plan-hero', 'plan-title', 'plan-tabs', 'plan-modal'],
                  align: 'stretch',
                },
                {
                  id: 'plan-hero',
                  component: 'Image',
                  url: hero,
                  variant: 'header',
                  fit: 'cover',
                  description: 'Illustration of the Lisbon skyline at sunset',
                },
                { id: 'plan-title', component: 'Text', text: 'Saturday in Lisbon', variant: 'h2' },
                {
                  id: 'plan-tabs',
                  component: 'Tabs',
                  tabs: [
                    { title: 'Morning', child: 'morning' },
                    { title: 'Afternoon', child: 'afternoon' },
                    { title: 'Evening', child: 'evening' },
                  ],
                },
                { id: 'morning', component: 'Column', children: ['morning-text'], align: 'stretch' },
                {
                  id: 'morning-text',
                  component: 'Text',
                  text:
                    '**Alfama on foot.** Start at the *Miradouro de Santa Luzia* and wander downhill.\n\n' +
                    '- Tram 28 at 9:00\n' +
                    '- Coffee at the viewpoint\n' +
                    '- [Lisbon Cathedral](https://en.wikipedia.org/wiki/Lisbon_Cathedral) before the crowds',
                  variant: 'body',
                },
                { id: 'afternoon', component: 'Column', children: ['afternoon-card'], align: 'stretch' },
                { id: 'afternoon-card', component: 'Card', child: 'afternoon-body' },
                {
                  id: 'afternoon-body',
                  component: 'Column',
                  children: ['afternoon-row', 'afternoon-text'],
                  align: 'stretch',
                },
                { id: 'afternoon-row', component: 'Row', children: ['afternoon-icon', 'afternoon-title'], align: 'center' },
                { id: 'afternoon-icon', component: 'Icon', name: 'locationOn' },
                { id: 'afternoon-title', component: 'Text', text: 'Belém and the river', variant: 'h4' },
                {
                  id: 'afternoon-text',
                  component: 'Text',
                  text: 'Custard tarts first, then the monastery and the tower. Allow two hours and take the tram back along the water.',
                  variant: 'body',
                },
                { id: 'evening', component: 'Column', children: ['evening-list'], align: 'stretch' },
                {
                  id: 'evening-list',
                  component: 'List',
                  children: ['evening-1', 'evening-2', 'evening-3'],
                  direction: 'vertical',
                  listStyle: 'unordered',
                },
                { id: 'evening-1', component: 'Text', text: 'Fado show at 20:00 in Bairro Alto', variant: 'body' },
                { id: 'evening-2', component: 'Text', text: 'Dinner nearby at 21:30', variant: 'body' },
                { id: 'evening-3', component: 'Text', text: 'Night tram back to the hotel', variant: 'body' },
                { id: 'plan-modal', component: 'Modal', trigger: 'details-button', content: 'details' },
                {
                  id: 'details-button',
                  component: 'Button',
                  child: 'details-label',
                  variant: 'default',
                  action: { event: { name: 'show_booking', context: { show: 'fado' } } },
                },
                { id: 'details-label', component: 'Text', text: 'Show booking details' },
                {
                  id: 'details',
                  component: 'Column',
                  children: ['details-title', 'details-text', 'details-divider', 'details-note'],
                  align: 'stretch',
                },
                { id: 'details-title', component: 'Text', text: 'Booking details', variant: 'h3' },
                {
                  id: 'details-text',
                  component: 'Text',
                  text: 'Two seats for the fado show are held under your name until 18:00.',
                  variant: 'body',
                },
                { id: 'details-divider', component: 'Divider' },
                {
                  id: 'details-note',
                  component: 'Text',
                  text: 'Opening this dialog also sent the button action to the agent.',
                  variant: 'caption',
                },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'live',
    title: 'Live updates and a second surface',
    description:
      'Path updates change bound values in place and add rows to a template. A second surface arrives, then the agent deletes it.',
    prompt: 'Watch the deployment.',
    steps: [
      {
        messages: [
          {
            version,
            createSurface: {
              surfaceId: 'deploy',
              catalogId,
              theme: { agentDisplayName: 'Ops agent', primaryColor: '#386a20' },
            },
          },
          {
            version,
            updateComponents: {
              surfaceId: 'deploy',
              components: [
                {
                  id: 'root',
                  component: 'Column',
                  children: ['deploy-title', 'metrics', 'deploy-divider', 'log-title', 'log'],
                  align: 'stretch',
                },
                { id: 'deploy-title', component: 'Text', text: 'Deploying release 2.4', variant: 'h2' },
                { id: 'metrics', component: 'Row', children: ['metric-updated', 'metric-healthy', 'metric-errors'], align: 'stretch' },
                { id: 'metric-updated', component: 'Card', child: 'updated-body', weight: 1 },
                { id: 'metric-healthy', component: 'Card', child: 'healthy-body', weight: 1 },
                { id: 'metric-errors', component: 'Card', child: 'errors-body', weight: 1 },
                { id: 'updated-body', component: 'Column', children: ['updated-value', 'updated-label'], align: 'center' },
                { id: 'updated-value', component: 'Text', text: { path: '/deploy/updated' }, variant: 'h3' },
                { id: 'updated-label', component: 'Text', text: 'of 40 pods updated', variant: 'caption' },
                { id: 'healthy-body', component: 'Column', children: ['healthy-value', 'healthy-label'], align: 'center' },
                { id: 'healthy-value', component: 'Text', text: { path: '/deploy/healthy' }, variant: 'h3' },
                { id: 'healthy-label', component: 'Text', text: 'healthy', variant: 'caption' },
                { id: 'errors-body', component: 'Column', children: ['errors-value', 'errors-label'], align: 'center' },
                { id: 'errors-value', component: 'Text', text: { path: '/deploy/errors' }, variant: 'h3' },
                { id: 'errors-label', component: 'Text', text: 'restarts', variant: 'caption' },
                { id: 'deploy-divider', component: 'Divider' },
                { id: 'log-title', component: 'Text', text: 'Log', variant: 'h5' },
                { id: 'log', component: 'Column', children: { path: '/deploy/log', componentId: 'log-row' }, align: 'stretch' },
                { id: 'log-row', component: 'Row', children: ['log-icon', 'log-text'], align: 'center' },
                { id: 'log-icon', component: 'Icon', name: { path: 'icon' } },
                { id: 'log-text', component: 'Text', text: { path: 'message' }, variant: 'caption' },
              ],
            },
          },
          {
            version,
            updateDataModel: {
              surfaceId: 'deploy',
              value: {
                deploy: {
                  updated: 0,
                  healthy: 40,
                  errors: 0,
                  log: [{ icon: 'info', message: 'Rollout started.' }],
                },
              },
            },
          },
        ],
        wait: 900,
      },
      {
        wait: 900,
        messages: [
          { version, updateDataModel: { surfaceId: 'deploy', path: '/deploy/updated', value: 12 } },
          {
            version,
            updateDataModel: {
              surfaceId: 'deploy',
              path: '/deploy/log/1',
              value: { icon: 'info', message: '12 of 40 pods are on 2.4.' },
            },
          },
        ],
      },
      {
        wait: 900,
        messages: [
          { version, updateDataModel: { surfaceId: 'deploy', path: '/deploy/updated', value: 26 } },
          { version, updateDataModel: { surfaceId: 'deploy', path: '/deploy/healthy', value: 39 } },
          { version, updateDataModel: { surfaceId: 'deploy', path: '/deploy/errors', value: 1 } },
          {
            version,
            updateDataModel: {
              surfaceId: 'deploy',
              path: '/deploy/log/2',
              value: { icon: 'warning', message: 'One pod restarted after a health check.' },
            },
          },
        ],
      },
      {
        wait: 900,
        messages: [
          { version, updateDataModel: { surfaceId: 'deploy', path: '/deploy/updated', value: 40 } },
          { version, updateDataModel: { surfaceId: 'deploy', path: '/deploy/healthy', value: 40 } },
          {
            version,
            updateDataModel: {
              surfaceId: 'deploy',
              path: '/deploy/log/3',
              value: { icon: 'check', message: 'Rollout complete.' },
            },
          },
        ],
      },
      {
        wait: 2200,
        messages: [
          {
            version,
            createSurface: {
              surfaceId: 'notice',
              catalogId,
              theme: { agentDisplayName: 'Ops agent', primaryColor: '#386a20' },
            },
          },
          {
            version,
            updateComponents: {
              surfaceId: 'notice',
              components: [
                { id: 'root', component: 'Card', child: 'notice-row' },
                { id: 'notice-row', component: 'Row', children: ['notice-icon', 'notice-text'], align: 'center' },
                { id: 'notice-icon', component: 'Icon', name: 'check' },
                {
                  id: 'notice-text',
                  component: 'Text',
                  text: 'Release 2.4 is live. The agent deletes this surface in a moment.',
                  variant: 'body',
                },
              ],
            },
          },
        ],
      },
      {
        messages: [{ version, deleteSurface: { surfaceId: 'notice' } }],
      },
    ],
  },
]

const jaStrings: Record<string, string> = {
  'Streaming a surface': 'サーフェスをストリーミング',
  'The agent names the card before it sends the content, so a placeholder appears first. Data bindings, formatting functions, and a later value update fill it in.': 'エージェントはコンテンツを送る前にカード名を指定するため、まずプレースホルダーが表示されます。データバインディング、書式設定関数、後続の値の更新によって内容が表示されます。',
  'Show me my trip to Lisbon.': 'リスボン旅行の予定を見せてください。',
  'Trip agent': '旅行エージェント',
  'Your trip to Lisbon': 'リスボン旅行',
  'Confirmed. Seats 12A and 12B.': '予約が確定しました。座席は12Aと12Bです。',
  'Tokyo (HND) to Lisbon (LIS)': '東京（HND）からリスボン（LIS）',
  'Lisbon (LIS) to Tokyo (HND)': 'リスボン（LIS）から東京（HND）',
  'Prices include taxes and one checked bag.': '料金には税金と受託手荷物1個分が含まれます。',
  'Gate changed to 34. Boarding starts at 10:05.': '搭乗口が34番に変更されました。搭乗開始は10:05です。',
  'Bind, validate, and act': 'バインド、検証、アクション',
  'Inputs write into the surface data model. Checks keep the button disabled until the data is valid, and the action it sends carries the resolved values.': '入力値はサーフェスのデータモデルに書き込まれます。データが有効になるまでチェックによってボタンは無効になり、送信されるアクションには解決済みの値が含まれます。',
  'Book a table for Friday.': '金曜日にテーブルを予約してください。',
  'Dining agent': 'レストラン予約エージェント',
  'Reserve a table': 'テーブルを予約',
  'Fill in the details. The reservation reaches the agent as an action with these values.': '詳細を入力してください。入力した値を含むアクションとして、予約内容がエージェントに送信されます。',
  'Name': '名前',
  'Enter a name for the reservation': '予約者の名前を入力してください',
  'Email': 'メールアドレス',
  'Enter a valid email address': '有効なメールアドレスを入力してください',
  'Date and time': '日時',
  'Seating': '座席',
  'Inside': '店内',
  'Terrace': 'テラス',
  'Counter': 'カウンター',
  'Guests': '人数',
  'Email me a confirmation': '確認メールを受け取る',
  'Add a name and a valid email to reserve': '予約するには名前と有効なメールアドレスを入力してください',
  'Reserve': '予約する',
  'Cards, tabs, and a modal': 'カード、タブ、モーダル',
  'A header image, Markdown text, tabs, a nested card, a list, and a modal, all from catalog components rendered with Material 3 Expressive.': 'ヘッダー画像、Markdownテキスト、タブ、入れ子のカード、リスト、モーダルを、カタログのコンポーネントからMaterial 3 Expressiveで描画します。',
  'Plan my Saturday in Lisbon.': 'リスボンで過ごす土曜日の計画を立ててください。',
  'Illustration of the Lisbon skyline at sunset': '夕暮れのリスボンの街並みのイラスト',
  'Saturday in Lisbon': 'リスボンで過ごす土曜日',
  'Morning': '午前',
  'Afternoon': '午後',
  'Evening': '夜',
  '**Alfama on foot.** Start at the *Miradouro de Santa Luzia* and wander downhill.\n\n- Tram 28 at 9:00\n- Coffee at the viewpoint\n- [Lisbon Cathedral](https://en.wikipedia.org/wiki/Lisbon_Cathedral) before the crowds': '**徒歩でアルファマ地区を散策。** *Miradouro de Santa Luzia*から出発し、坂を下りながら歩きます。\n\n- 9:00にトラム28番に乗車\n- 展望台でコーヒーを飲む\n- 混雑する前に[リスボン大聖堂](https://en.wikipedia.org/wiki/Lisbon_Cathedral)へ',
  'Belém and the river': 'ベレン地区と川沿い',
  'Custard tarts first, then the monastery and the tower. Allow two hours and take the tram back along the water.': 'まずエッグタルトを味わい、その後、修道院と塔を訪れます。2時間ほど見込み、水辺を走るトラムで戻りましょう。',
  'Fado show at 20:00 in Bairro Alto': '20:00にバイロ・アルトでファド鑑賞',
  'Dinner nearby at 21:30': '21:30に近くで夕食',
  'Night tram back to the hotel': '夜のトラムでホテルへ戻る',
  'Show booking details': '予約の詳細を表示',
  'Booking details': '予約の詳細',
  'Two seats for the fado show are held under your name until 18:00.': 'ファド鑑賞の2席を、お名前で18:00まで確保しています。',
  'Opening this dialog also sent the button action to the agent.': 'このダイアログを開くと、ボタンのアクションもエージェントに送信されます。',
  'Live updates and a second surface': 'ライブ更新と2つ目のサーフェス',
  'Path updates change bound values in place and add rows to a template. A second surface arrives, then the agent deletes it.': 'パスの更新によってバインド済みの値がその場で変わり、テンプレートに行が追加されます。2つ目のサーフェスが届き、その後エージェントによって削除されます。',
  'Watch the deployment.': 'デプロイの状況を見せてください。',
  'Ops agent': '運用エージェント',
  'Deploying release 2.4': 'リリース2.4をデプロイ中',
  'of 40 pods updated': '40個中のPodを更新済み',
  'healthy': '正常',
  'restarts': '再起動',
  'Log': 'ログ',
  'Rollout started.': '段階的なデプロイを開始しました。',
  '12 of 40 pods are on 2.4.': '40個中12個のPodが2.4になりました。',
  'One pod restarted after a health check.': 'ヘルスチェック後に1つのPodが再起動しました。',
  'Rollout complete.': '段階的なデプロイが完了しました。',
  'Release 2.4 is live. The agent deletes this surface in a moment.': 'リリース2.4が稼働中です。このサーフェスはまもなくエージェントによって削除されます。',
}

function translateScenarioValue<T>(value: T): T {
  if (typeof value === 'string') return (jaStrings[value] ?? value) as T
  if (Array.isArray(value)) return value.map((item) => translateScenarioValue(item)) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, translateScenarioValue(item)])) as T
  }
  return value
}

export function getScenarios(locale: Locale): readonly Scenario[] {
  return locale === 'ja' ? translateScenarioValue(scenarios) : scenarios
}

export const messageCount = (scenario: Scenario) =>
  scenario.steps.reduce((total, step) => total + step.messages.length, 0)
