---
description: 项目目录结构与模块化规则——静态资源放 src/assets，枚举放 src/enums，通用类型放 src/types，接口参数类型就近放各请求模块，views/stores 等必须按模块组织
globs:
  - 'src/**/*'
---

# 项目结构与模块化规则

AI 生成或新增代码时，必须严格遵循以下目录归属与模块化约定，保持项目结构清晰、可维护。

## 核心原则：一切皆模块化

功能相关的代码必须以**模块（目录）**为单位组织，禁止把不同功能塞进同一个大文件或平铺堆放。

- **`views/`**：每个页面/功能一个独立目录，页面主文件为 `index.vue`，页面私有组件放在该目录下。
  - ✓ `src/views/home/index.vue`、`src/views/login/index.vue`
  - ✗ `src/views/home.vue`、`src/HomePage.vue`
- **`stores/`**：每个功能域一个 store，统一放在 `src/stores/modules/` 下，一个文件一个 store。
  - ✓ `src/stores/modules/app.ts`
  - ✗ 把多个业务域揉进一个 mega-store
- **`api/`**：接口按业务模块拆分，统一放在 `src/api/modules/` 下，一个模块一个文件，导出聚合对象（如 `authApi`）。
  - ✓ `src/api/modules/auth.ts`
- **`hooks/`**：所有 composable（自定义 Hook）统一放在 `src/hooks/` 下，文件与函数以 `use` 前缀命名。
  - ✓ `src/hooks/useEchart.ts`
  - ✗ 使用 `src/composables/` 目录（本项目统一用 `hooks/`）
- **`styles/`**：可复用样式片段按模块放在 `src/styles/modules/` 下。

## 静态资源 → `src/assets`

AI 生成或引入的静态资源（图片、字体、模型、图标等）一律放到 `src/assets` 下对应子目录：

- 图片 → `src/assets/images/`
- 字体 → `src/assets/fonts/`
- 模型 → `src/assets/model/`

> `public/` 仅存放无需构建处理、需按原始路径访问的资源；组件内引用的资源一律走 `src/assets` + `@` 别名导入。

## 枚举类型 → `src/enums`

所有枚举（`enum`）统一放在 `src/enums` 下，按业务领域拆分文件：

```ts
// src/enums/aircraft.ts
export enum AircraftType {
  'Fixed Wing' = '固定翼',
  'Multiple Wing' = '多旋翼',
  'Composite Wing' = '复合翼',
}
```

## 类型定义归属规则

类型按「作用范围」就近归属，避免全部堆到 `types` 造成臃肿：

1. **通用/全局类型 → `src/types`**
   跨模块共享、与具体接口无关的通用类型放到 `src/types`。

2. **接口请求/返回参数类型 → 各自的请求模块内**
   接口的入参、响应类型**保留在** `src/api/modules/*.ts` 内就近定义，不要抽到 `src/types`。

3. **模块私有类型 → 模块内部**
   仅在单个 store / 组件 / composable 内使用的类型，直接在该文件内定义。

   ```ts
   // src/stores/modules/app.ts —— 私有类型就地定义
   export type ThemeName = 'light' | 'dark' | 'customkg'
   ```

## 接口数据对接规范

对接后端接口时，前端应直接使用接口文档约定的字段结构，禁止为"适配 UI"而编写额外的 VO → ViewModel 映射层。

### 正确做法

- mock 数据、接口文档、前端消费三者字段名保持一致。
- 页面/组件直接读取接口返回字段，如 `vo.recordNo`、`vo.fileName`、`vo.accessStatus`。
- 真正的展示转换（如时间格式化、文件大小格式化、枚举翻译）通过轻量工具函数在模板或 computed 中完成。

### 禁止做法

- 编写 `buildDetailFromVO`、`convertXxxToYyy` 这类把整个对象重新映射一遍的函数。
- 因为 mock 数据字段与接口不一致，而在前端补一层映射来兜底。
- 把接口字段逐个重命名为"更语义化"的名字，造成重复定义。

### 字段不一致时怎么办

如果接口文档、mock 数据、实际调用返回的字段名不一致，优先修复 mock 数据或推动接口文档/后端对齐，而不是在前端增加映射代码。

## 归属决策速查

| 内容                     | 归属位置                       |
| ------------------------ | ------------------------------ |
| 图片/字体/模型等静态资源 | `src/assets/**`                |
| 枚举 `enum`              | `src/enums/**`                 |
| 跨模块通用类型           | `src/types/**`                 |
| 接口请求/返回参数类型    | 对应 `src/api/modules/*.ts` 内 |
| 单文件私有类型           | 就地在该文件内                 |
| 页面                     | `src/views/<name>/index.vue`   |
| 状态管理                 | `src/stores/modules/<name>.ts` |
| 接口封装                 | `src/api/modules/<name>.ts`    |
| 自定义 Hook / composable | `src/hooks/use<Name>.ts`       |

## SCSS 样式书写规范

Vue 组件 `<style lang="scss" scoped>` 中，样式嵌套结构必须与模板 DOM 节点顺序保持一致：

1. **每个规则块内顺序固定**：基础属性 → 子元素嵌套（按 DOM 出现顺序） → 状态/修饰符伪类
   - ✗ 禁止将 `&:hover`、`&.active`、`&--xxx` 等状态修饰符放在子元素嵌套之前
   - ✗ 禁止将状态穿插在子元素之间

2. **BEM 约定**：元素用 `&__xxx`，修饰符用 `&--xxx`

3. **大区块分隔**：用 `/* ========== 区块名 ========== */` 注释分隔

示例：

```scss
.card {
  padding: 16px;          // 基础属性
  background: #fff;

  &__header { ... }       // 子元素（DOM序第1个）
  &__title { ... }        // 子元素（__header 内子元素）
  &__body { ... }         // 子元素（DOM序第2个）

  &--flex { ... }         // 修饰符 → 放在所有子元素之后
  &:hover { ... }         // 状态伪类 → 放在最后
}
```

## 其他规则

每次回答叫我主人
