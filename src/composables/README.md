# Composables

This directory contains reusable Vue composables for the SIAE frontend application.

## Composables

### useTable

Manages table data fetching, pagination, and search functionality.

**Usage:**
```typescript
import { useTable } from '@/composables'
import { userApi } from '@/api'

const {
  data,
  loading,
  pagination,
  searchParams,
  handlePageChange,
  search,
  reset
} = useTable({
  fetchFn: async (params) => {
    const response = await userApi.getUsers(params)
    return {
      items: response.data.items,
      total: response.data.total
    }
  },
  pageSize: 10,
  immediate: true
})

// Search with params
search({ username: 'john' })

// Reset search
reset()
```

### useForm

Manages form state, validation, and submission.

**Usage:**
```typescript
import { useForm } from '@/composables'
import { userApi } from '@/api'

const {
  formRef,
  formData,
  loading,
  validate,
  submit,
  reset
} = useForm({
  initialData: {
    username: '',
    email: ''
  },
  rules: {
    username: [{ required: true, message: 'Required' }],
    email: [{ required: true, email: true }]
  },
  submitFn: async (data) => {
    return await userApi.createUser(data)
  },
  successMessage: 'User created successfully',
  onSuccess: () => {
    // Handle success
  }
})

// Submit form
await submit()
```

### usePermission

Provides permission and role checking utilities.

**Usage:**
```typescript
import { usePermission } from '@/composables'

const {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  hasRole,
  isAdmin,
  permissions,
  roles
} = usePermission()

// Check single permission
if (hasPermission('user:create')) {
  // Show create button
}

// Check multiple permissions (any)
if (hasAnyPermission(['user:edit', 'user:delete'])) {
  // Show actions
}

// Check role
if (hasRole('admin')) {
  // Show admin features
}
```

### useTheme

Manages application theme (light/dark mode).

**Usage:**
```typescript
import { useTheme } from '@/composables'

const {
  theme,
  isDark,
  isLight,
  toggleTheme,
  setTheme,
  onThemeChange
} = useTheme()

// Toggle theme
toggleTheme()

// Set specific theme
setTheme('dark')

// Watch theme changes
onThemeChange((newTheme) => {
  console.log('Theme changed to:', newTheme)
})

// Get theme-specific value
const color = getThemeValue('#000', '#fff')
```

### useRouter

Enhanced router utilities with breadcrumbs and navigation helpers.

**Usage:**
```typescript
import { useRouter } from '@/composables'

const {
  router,
  route,
  breadcrumbs,
  navigateTo,
  goBack,
  isCurrentRoute
} = useRouter()

// Navigate to route
navigateTo('UserList')

// Go back
goBack()

// Check current route
if (isCurrentRoute('Dashboard')) {
  // Do something
}
```
