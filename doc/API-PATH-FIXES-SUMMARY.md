# API 路径修复总结

## ✅ 全部修复完成！

### ✅ auth.ts
- `/auth/login` - 登录
- `/auth/register` - 注册
- `/auth/logout` - 登出
- `/auth/me` - 获取当前用户信息
- `/auth/refresh-token` - 刷新令牌

### ✅ permission.ts
- `/auth/permissions` - 权限管理（CRUD）
- `/auth/permissions/tree` - 权限树结构
- `/auth/permissions/page` - 权限分页查询
- `/auth/roles` - 角色管理（CRUD）
- `/auth/roles/page` - 角色分页查询
- `/auth/roles/{roleId}/permissions` - 角色权限管理
- `/auth/users/{userId}/role` - 用户角色分配
- `/auth/users/roles/batch` - 批量分配角色
- `/auth/user-permission/*` - 用户权限管理

### ✅ dashboard.ts
- `/auth/logs/dashboard/stats/{days}` - 仪表盘统计
- `/auth/logs/login` - 登录日志（POST方法）
- `/auth/logs/login/fail` - 登录失败日志

### ✅ user.ts
- `/user/` - 用户CRUD
- `/user/page` - 用户分页查询（POST方法）
- `/user/{id}` - 用户详情
- `/user/username/{username}` - 根据用户名查询
- `/user/members` - 正式成员管理
- `/user/members/page` - 正式成员分页
- `/user/members/from-candidate` - 从候选成员转正
- `/user/candidates` - 候选成员管理
- `/user/candidates/page` - 候选成员分页
- `/user/classes` - 班级管理
- `/user/classes/page` - 班级分页
- `/user/class-users` - 班级用户关联
- `/user/award-types` - 奖项类型
- `/user/award-levels` - 奖项等级
- `/user/user-awards` - 用户获奖记录
- `/user/user-awards/page` - 获奖记录分页
- `/user/profile` - 用户详情管理

### ✅ content.ts
- `/content/` - 内容CRUD
- `/content/query/{id}` - 内容详情
- `/content/hot` - 热门内容
- `/content/comments/{contentId}` - 评论管理
- `/content/comments/page` - 评论分页
- `/content/categories` - 分类管理
- `/content/categories/{id}` - 分类详情
- `/content/tags` - 标签管理
- `/content/tags/page` - 标签分页（POST方法）
- `/content/tags/{id}` - 标签详情
- `/content/audits` - 审核管理
- `/content/audits/pending` - 待审核列表
- `/content/audits/{id}` - 处理审核（PUT方法）
- `/content/statistics/{contentId}` - 内容统计
- `/content/interactions/action` - 用户交互（POST/DELETE）

### ✅ notification.ts (新增)
- `/notification/email/code/send` - 发送邮箱验证码
- `/notification/email/code/verify` - 验证邮箱验证码
- `/notification/send` - 发送通知
- `/notification/my` - 我的通知列表
- `/notification/unread-count` - 未读通知数量
- `/notification/{id}/read` - 标记通知已读
- `/notification/read-all` - 全部标记已读
- `/notification/email/template/test/*` - 邮件模板测试接口

## 关键修复点

1. ✅ **分页查询**: 改为 POST 方法，路径使用 `/xxx/page`
2. ✅ **更新操作**: PUT 方法，部分不带 ID 在路径中
3. ✅ **删除操作**: 特殊参数处理（如 isTrash）
4. ✅ **服务前缀**: 所有路径都添加了正确的服务前缀
   - Auth 服务: `/auth/*`
   - User 服务: `/user/*`
   - Content 服务: `/content/*`
   - Notification 服务: `/notification/*`

## 新增文件

- ✅ `siae-frontend/src/api/notification.ts` - 通知服务 API
- ✅ 已在 `index.ts` 中导出

## 测试建议

1. 测试登录/注册流程
2. 测试用户管理和权限分配
3. 测试内容发布和审核流程
4. 测试通知发送和邮件验证码
5. 测试评论和互动功能
