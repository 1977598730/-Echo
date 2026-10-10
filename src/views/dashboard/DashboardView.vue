<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { User, Document, TrendCharts, Bell } from '@element-plus/icons-vue'
import { echarts, type EChartsOption } from '../../utils/echarts'

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: ReturnType<typeof echarts.init> | null = null

const stats = [
  { label: '今日访问', value: '1,284', icon: TrendCharts, color: '#7c3aed' },
  { label: '新增用户', value: '86', icon: User, color: '#2563eb' },
  { label: '待办事项', value: '12', icon: Bell, color: '#db2777' },
  { label: '文档数量', value: '328', icon: Document, color: '#059669' },
]

const chartOption: EChartsOption = {
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 16, top: 24, bottom: 32 },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    axisLine: { lineStyle: { color: '#e5e7eb' } },
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: '#f3f4f6' } },
  },
  series: [
    {
      name: '访问量',
      type: 'line',
      smooth: true,
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      areaStyle: { color: 'rgba(124, 58, 237, 0.12)' },
      lineStyle: { color: '#7c3aed', width: 3 },
      itemStyle: { color: '#7c3aed' },
    },
  ],
}

function resizeChart() {
  chartInstance?.resize()
}

onMounted(() => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(chartOption)
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<template>
  <div class="page-wrap">
    <el-row :gutter="16" class="mb-4">
      <el-col v-for="item in stats" :key="item.label" :xs="24" :sm="12" :lg="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-inner">
            <div>
              <p class="stat-label">{{ item.label }}</p>
              <p class="stat-value">{{ item.value }}</p>
            </div>
            <div class="stat-icon" :style="{ background: item.color }">
              <el-icon :size="22"><component :is="item.icon" /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" header="近 7 日访问趋势">
      <div ref="chartRef" class="chart" />
    </el-card>
  </div>
</template>

<style scoped lang="less">
@import '../../styles/admin.less';

.mb-4 {
  margin-bottom: 16px;
}

.stat-card {
  margin-bottom: 16px;
  border-radius: 12px;
}

.stat-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-label {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.stat-value {
  margin: 6px 0 0;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: #fff;
}

.chart {
  width: 100%;
  height: 320px;
}
</style>
