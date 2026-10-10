<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

interface UserRow {
  id: number
  username: string
  nickname: string
  role: string
  status: '启用' | '禁用'
  createdAt: string
}

const keyword = ref('')
const loading = ref(false)

const tableData = ref<UserRow[]>([
  {
    id: 1,
    username: 'admin',
    nickname: '系统管理员',
    role: '超级管理员',
    status: '启用',
    createdAt: '2026-01-08',
  },
  {
    id: 2,
    username: 'editor',
    nickname: '内容编辑',
    role: '编辑',
    status: '启用',
    createdAt: '2026-02-14',
  },
])

const page = reactive({ current: 1, size: 10, total: 2 })

function handleSearch() {
  loading.value = true
  window.setTimeout(() => {
    loading.value = false
    ElMessage.success(keyword.value ? `已搜索：${keyword.value}` : '已刷新列表')
  }, 400)
}
</script>

<template>
  <div class="page-wrap">
    <el-card shadow="never" class="block-card">
      <el-form inline @submit.prevent="handleSearch">
        <el-form-item label="关键词">
          <el-input
            v-model="keyword"
            placeholder="用户名 / 昵称"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSearch">
            查询
          </el-button>
          <el-button>新增用户</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="block-card">
      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="role" label="角色" min-width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '启用' ? 'success' : 'info'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="140" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default>
            <el-button link type="primary">编辑</el-button>
            <el-button link type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          :total="page.total"
          layout="total, prev, pager, next"
          background
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="less">
@import '../../styles/admin.less';

.block-card {
  border-radius: 12px;
  margin-bottom: 16px;
}

.pager {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
