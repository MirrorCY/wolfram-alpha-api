import { Context, Schema, h } from 'koishi'

export const name = 'alpha-simple'

export interface Config {
  endpoint: string
  appid: string
  layout?: 'divider' | 'labelbar'
  background?: string
  foreground?: string
  fontsize?: number
  width?: number
  units?: 'metric' | 'imperial'
  timeout?: number
}

export const Config: Schema<Config> = Schema.object({
  endpoint: Schema.string().description('endpoint').default('https://api.wolframalpha.com/v1/simple').role('url'),
  appid: Schema.string().required().description('[Wolfram Alpha API appid](https://developer.wolframalpha.com/)'),
  layout: Schema.union(['divider', 'labelbar']).description('layout of the result').default('divider'),
  background: Schema.string().description('background color').role('color').default('rgba(245, 245, 245, 1)'),
  foreground: Schema.string().description('foreground color').role('color').default('rgba(0, 0, 0, 1)'),
  fontsize: Schema.number().default(14).description('fontsize'),
  width: Schema.number().description('width (in pixels) for output images').default(500).min(1).max(15000),
  units: Schema.union(['metric', 'imperial']).default('metric'),
  timeout: Schema.number().description('might affect the number or types of results. in seconds').default(5).step(1),
})

export function apply(ctx: Context, config: Config) {
  const colorConverter = (rgba: string) =>
    rgba.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/,
      (_, r, g, b, a) => `${r},${g},${b},${Math.round(a * 255)}`)

  ctx
    .command('alpha-simple <expr:text>')
    .action(async ({ session }, expr) => {
      if (!expr) session.execute('help alpha-simple')
      const { endpoint, ...settings } = config
      const params = new URLSearchParams({
        ...settings,
        i: expr,
        background: colorConverter(config.background),
        foreground: colorConverter(config.foreground),
        fontsize: config.fontsize.toString(),
        width: config.width.toString(),
        timeout: config.timeout.toString(),
      })
      const res = await ctx.http.get(endpoint + '?' + params.toString())
      return h.img(res, 'image/gif')
    })
}
