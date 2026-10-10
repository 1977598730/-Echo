import * as echarts from 'echarts'

export type EChartsOption = echarts.EChartsOption

export { echarts }

export function initChart(
  el: HTMLElement,
  option?: echarts.EChartsOption,
): echarts.ECharts {
  const instance = echarts.init(el)
  if (option) instance.setOption(option)
  return instance
}
