<template>
    <div class="award-overview-chart">
        <div v-if="loading" class="loading-container">
            <t-loading size="large" />
        </div>
        <div v-else-if="!data" class="empty-container">
            <t-empty description="暂无数据" />
        </div>
        <div v-else ref="chartRef" :style="{ height, width: '100%' }"></div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
    data: {
        type: Object,
        default: null
    },
    loading: {
        type: Boolean,
        default: false
    },
    height: {
        type: String,
        default: '300px'
    }
})

const chartRef = ref(null)
let chartInstance = null

const initChart = () => {
    if (!chartRef.value || !props.data) return

    if (chartInstance) {
        chartInstance.dispose()
    }

    chartInstance = echarts.init(chartRef.value)

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['总获奖数', '本月新增'],
            axisLine: {
                lineStyle: {
                    color: 'rgba(96, 165, 250, 0.3)'
                }
            },
            axisLabel: {
                color: '#e0e6ed',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                color: '#e0e6ed',
                fontSize: 12
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(96, 165, 250, 0.1)',
                    type: 'dashed'
                }
            }
        },
        series: [
            {
                name: '获奖数量',
                type: 'bar',
                barWidth: '50%',
                data: [
                    {
                        value: props.data.totalAwards,
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#fa709a' },
                                { offset: 1, color: '#fee140' }
                            ])
                        }
                    },
                    {
                        value: props.data.thisMonthAwards,
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#a18cd1' },
                                { offset: 1, color: '#fbc2eb' }
                            ])
                        }
                    }
                ],
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: '#e0e6ed',
                    textBorderColor: 'transparent',
                    textBorderWidth: 0,
                    textShadowColor: 'transparent',
                    textShadowBlur: 0
                },
                itemStyle: {
                    borderRadius: [8, 8, 0, 0]
                }
            }
        ]
    }

    chartInstance.setOption(option)
}

const resizeChart = () => {
    chartInstance?.resize()
}

watch(() => [props.data, props.loading], () => {
    if (!props.loading && props.data) {
        setTimeout(initChart, 100)
    }
}, { deep: true })

onMounted(() => {
    if (!props.loading && props.data) {
        initChart()
    }
    window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
    window.removeEventListener('resize', resizeChart)
    chartInstance?.dispose()
})
</script>

<style scoped lang="less">
.award-overview-chart {
    width: 100%;
    height: 100%;
    position: relative;
}

.loading-container,
.empty-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}
</style>
