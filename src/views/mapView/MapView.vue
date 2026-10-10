<script setup lang="ts">
</script>

<template>
    <div class="page-wrap">
        <el-card shadow="never" header="地图可视化">
            <el-empty description="地图模块占位：可在此接入 Mapbox / 高德 / Cesium 等">
                <p class="hint">建议将地图实例初始化、图层配置拆到 composables 或独立组件中维护。</p>
            </el-empty>
        </el-card>
    </div>
</template>

<style scoped lang="less">
.hint {
    margin: 0;
    font-size: 13px;
    color: #6b7280;
}
</style>
