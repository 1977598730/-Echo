---
trigger: model_decision
description: Vue 3 + Composition API + TypeScript 生产级规范，包括组件结构、Props/Emits/Model 泛型用法、函数声明风格、响应式、Pinia、Hooks、路由与测试等约束
---

# Vue 3 + Composition API — 生产级规则

## 角色定位

你是资深 Vue 3 开发者，精通 Composition API、TypeScript 和现代前端工程化。

---

## 组件规范

### 基础结构

- 每个组件必须是 `<script setup lang="ts">` 的单文件组件。
- **禁止 Options API**：禁止 `data()`、`methods`、`computed`、`watch` 块。
- **禁止 mixins**：用 composables 替代。
- **禁止 `Vue.extend()`**：Vue 2 语法，现代代码中已移除。
- **禁止 `defineComponent({ setup() { return {...} } })`**：使用 `<script setup>` 替代手动返回。
- 生命周期通过 `onMounted`、`onBeforeUnmount`、`onUpdated` 从 'vue' 导入。
- 模板引用：使用 `useTemplateRef('root')`（Vue 3.5+）替代旧的 `ref<HTMLElement | null>(null)` + `<div ref="root">` 模式。
- `useId()`（Vue 3.5+）用于稳定的 SSR 安全 ID；禁止 `Math.random()` 或递增计数器。
- 泛型组件：`<script setup lang="ts" generic="T extends {id: number}">`。
- `defineExpose({...})` 仅在父组件需要通过模板引用调用子组件方法时使用，且暴露面必须窄而显式。

### Props、Emits、Models

- **始终使用泛型语法**：
  ```ts
  const props = defineProps<{ user: User; editable?: boolean }>()
  const emit = defineEmits<{
    save: [user: User]
    cancel: []
    delete: [id: number]
  }>()
  ```
- **禁止运行时数组/对象语法**：
  ```ts
  defineProps(['user', 'editable']) // 禁止
  defineProps({ user: Object, editable: Boolean }) // 禁止
  ```
- 默认值通过 `withDefaults`：
  ```ts
  const props = withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg'; disabled?: boolean }>(), {
    size: 'md',
    disabled: false,
  })
  ```
- Props 不可变。子组件内 `props.foo = ...` 是 bug：
  - 需要本地可变副本？`const draft = ref(structuredClone(props.foo))`
  - 需要"编辑"父状态？发射事件让父组件处理，或使用 `defineModel()`（Vue 3.4+）
  - 需要派生值？`computed(() => transform(props.foo))`
- 双向绑定通过 `defineModel`（Vue 3.4+）：
  ```ts
  // 子组件
  const value = defineModel<string>({ required: true });
  // 父组件
  <ChildInput v-model="user.name" />
  ```
- `defineModel` 返回可写 ref。读取：`value.value`，写入：`value.value = newValue`。
- 多 v-model：`defineModel<string>('first')`，`defineModel<string>('last')`，用法 `v-model:first` / `v-model:last`。
- Emit 签名使用元组形式：
  ```ts
  defineEmits<{ change: [value: string, index: number] }>()
  ```
- Slot props 通过 `defineSlots`（Vue 3.3+）类型化：
  ```ts
  defineSlots<{
    default(props: { user: User }): any
    actions(props: { onSave: () => void }): any
  }>()
  ```
- 验证器（运行时）：仅在类型无法表达约束时使用。否则类型窄化是契约。
- `v-model` 在原生 input 上使用 `defineModel`。自定义输入组件暴露 `defineModel` 供父组件绑定。**禁止**手动管理 modelValue 的 props + emit 样板代码。

---

## 函数声明风格

所有函数统一使用箭头函数 + `const` 声明，禁止使用 `function` 关键字。

### 正确写法

```ts
const fetchData = async (id: number) => {
  // ...
}

const computeBbox = (positions: number[][]): number[] | null => {
  // ...
}

const handleClick = () => {
  // ...
}
```

### 禁止写法

```ts
// ✗ 禁止 function 声明
async function fetchData(id: number) {
  // ...
}

// ✗ 禁止 function 表达式
const fetchData = async function (id: number) {
  // ...
}
```

### 例外

- Vue 组件的 `defineExpose`、`defineProps`、`defineEmits` 等编译器宏不受此规则约束。
- 需要函数声明提升（hoisting）的极少数场景，须加注释说明原因。

---

## 响应式规范

- **默认使用 `ref`**：原始值、对象、数组都用 ref。
  ```ts
  const count = ref(0)
  const user = ref<User | null>(null)
  const items = ref<Item[]>([])
  ```
- 读取：`count.value`。写入：`count.value = n` 或 `items.value.push(...)`。
- `reactive` 保留给真正需要可变对象身份且被传递的场景：
  - 跨函数调用的长期存活的 store 类对象
  - 传递给多个兄弟辅助函数的表单状态对象
- 响应式对象解构会丢失响应性：
  ```ts
  const state = reactive({ count: 0 })
  const { count } = state // count 现在是 NUMBER，不是响应式的
  ```
  使用 `toRefs(state)` 解构为 refs：
  ```ts
  const { count } = toRefs(state)
  ```
- `computed` 用于任何派生值：
  1. 默认只读；需要写入时用 getter/setter 形式：`computed({ get, set })`
  2. **禁止副作用**：任何异步、任何 mutation、任何 fetch 调用 —— 那是 `watch` 或 `watchEffect`，不是 `computed`
- `watch` 用于对明确来源的显式反应：
  ```ts
  watch(user, (newUser, oldUser) => { ... });
  watch([userId, filter], ([id, f]) => { ... });
  watch(() => props.user.id, (id) => { ... });   // getter 形式
  ```
- `watchEffect` 用于"运行这个 effect，追踪它读取的一切"：
  ```ts
  watchEffect(() => {
    fetchPosts(filter.value, page.value)
  })
  ```
- `{ deep: true }` 是代码异味。如果需要 deep，数据形状可能有问题。可接受场景：对象数组且确实关心任一元素的 mutation。坏场景："测试只有 deep 才通过"——修复数据，不是 watch。
- `{ immediate: true }` 在 setup 时运行 watcher 一次。使用它；不要在 `onMounted` 中重复 body。
- `shallowRef` / `shallowReactive` 用于内部不需要细粒度追踪的大型对象（解析后的 AST、图表数据集、CodeMirror 实例）。响应性仅在顶层引用触发。
- `toRef` / `toRefs` 在 composable 边界 —— 从 composables 返回 refs 以便消费者解构不丢失响应性：
  ```ts
  function useUser() {
    const state = reactive({ name: '', age: 0 })
    return toRefs(state)
  }
  // 消费者
  const { name, age } = useUser() // 两者都是 refs
  ```
- **禁止**：`Object.assign(state, newState)` 来"强制响应性"。如果 ref 不更新，原因是解构或别名 —— 修复那个。
- `effectScope` / `onScopeDispose` 用于创建 watchers 且需要在消费者卸载时清理的 composables。框架处理组件级 effects 的清理；手动 scope 用于共享 composables（被多个组件使用的单例）。
- `markRaw` 用于明确不想响应式的对象（第三方 SDK 的 Class 实例、用作缓存的 Map）。将 Class 包装在 reactive 中是性能陷阱 —— proxy 拦截每个属性访问。

---

## Pinia 规范

- `defineStore('id', () => { ... })` setup 语法唯一。
- 每个功能域一个 store；禁止 mega-stores。
- `storeToRefs()` 解构 state/getters 时使用。
- actions 直接解构（函数无需 storeToRefs 保持响应性）。
- Stores 可以调用其他 stores；Pinia 处理排序。
- `pinia-plugin-persistedstate` 用于选择性持久化。
- **禁止 Vuex**：任何版本在新代码中禁用。

---

## Composables / Hooks 规范

- **目录与命名统一**：本项目所有 composable 一律放在 `src/hooks/` 下，文件与函数均以 `use` 前缀命名（如 `src/hooks/useEchart.ts`）。**禁止使用 `composables/` 目录**（本项目是 Vite，无 Nuxt 自动导入，需显式 `import`）。
- 返回 refs / computeds / functions；禁止返回普通值。
- 通过 `onScopeDispose` / `tryOnScopeDispose` 清理，不只是 `onBeforeUnmount`。
- `effectScope()` 用于需要组 disposal 的共享 hooks。
- **优先 VueUse**；仅在未覆盖时手写。
- Hooks 是工厂（每次调用新鲜状态），不是单例。
- 单例通过 Pinia，禁止模块级 refs。
- 异步 hooks 返回 `{ data, error, pending, refresh }` 形状。

---

## Nuxt 3 数据 & SSR（如适用）

- `useFetch` / `useAsyncData` 每次调用带 **显式 key**。
- `transform` / `pick` 缩小 SSR payload。
- `$fetch` 仅在事件处理函数和 server routes 内使用。
- `<script setup>` 中的普通 `fetch()` 是 bug（双 fetch）。
- `useState('key', () => initial)` 用于 SSR 安全共享状态。
- 模块级 refs 跨 SSR 请求泄漏 —— 禁止。
- `server: false` 用于仅客户端 fetch；`useLazyFetch` 用于非关键数据。
- `server/api/*.ts` 中用 Zod / valibot 验证输入。
- `createError({ statusCode, statusMessage })` 用于错误页面。
- `<ClientOnly>` 外禁止渲染 `Date.now()` / `Math.random()`。

---

## 路由规范（如适用）

- 文件路由：`pages/`（Nuxt）或 `unplugin-vue-router`（Vite）。
- 导航：对象形式 + 命名路由，禁止字符串路径。
- `useRoute('route-name')` 用于类型化参数。
- 路由组件懒加载通过动态导入。
- 全局守卫在 `router.beforeEach` 或 `middleware/*.ts`。
- `definePageMeta` 用于每页 layout / middleware / transition。
- Nuxt 中用 `navigateTo` 替代 `useRouter().push`（处理 middleware 重定向）。
- `<NuxtLink>` / `<RouterLink>` 用于内部链接，禁止 `<a href>`。
- 查询驱动 UI 状态通过 `router.replace` + Zod 验证查询。

---

## 测试规范

- Vitest 用于单元/组件测试。
- `@vue/test-utils` mount（非 shallowMount）+ Vue Testing Library。
- 基于角色的选择器；`data-testid` 是最后手段。
- `@testing-library/user-event` 替代 `fireEvent`。
- `flushPromises` 用于链式响应式更新。
- MSW handlers 在 Vitest（node）和 Playwright（browser）间共享。
- Composables 作为纯函数测试；生命周期 ones 通过包装组件。
- Pinia stores 用 `createPinia` + `setActivePinia` 每测试。
- `@nuxt/test-utils` `mountSuspended` 用于 Nuxt 感知组件。
- Playwright 用于 e2e，chromium/firefox/webkit 项目。
- Storybook 8 + test runner 用于视觉回归。
- Snapshot 仅用于稳定展示组件。
- 覆盖率：composables/stores/utils >90%，components >70%。
- CI：每 PR 运行 Vitest + Playwright + Storybook test runner。

---

## 禁止清单

- `export default { data() { return {...} } }` 块
- `methods: {}`、`computed: {}`、`watch: {}` Options API 块
- `mixins: [SomeMixin]`
- `extends: Base`
- `Vue.extend({...})`
- `defineComponent({ setup() { return {...} } })` 手动返回
- `defineProps(['user', 'editable'])` 运行时数组
- `defineProps({ user: Object, editable: Boolean })` 运行时对象
- `props.modelValue = v` —— Props 可变
- 手动 `modelValue` / `update:modelValue` 样板（用 `defineModel`）
- `Object.assign(state, newState)` 强制响应性
- `{ deep: true }` 无明确理由
- 模块级 refs（SSR 泄漏）
- `<script setup>` 中的普通 `fetch()`
- Vuex 任何版本
- `<a href>` 用于内部链接
