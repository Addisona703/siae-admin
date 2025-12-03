# Common Components

This directory contains reusable UI components for the SIAE frontend application.

## Components

### DataTable

A wrapper around TDesign's table component with built-in pagination support.

**Usage:**
```vue
<template>
  <DataTable
    :data="users"
    :columns="columns"
    :loading="loading"
    :pagination="pagination"
    @page-change="handlePageChange"
  >
    <template #status="{ row }">
      <t-tag :theme="row.status === 'active' ? 'success' : 'danger'">
        {{ row.status }}
      </t-tag>
    </template>
  </DataTable>
</template>

<script setup lang="ts">
import { DataTable } from '@/components/common'

const columns = [
  { colKey: 'name', title: 'Name' },
  { colKey: 'status', title: 'Status' }
]
</script>
```

### SearchForm

A consistent search form wrapper with built-in search and reset buttons.

**Usage:**
```vue
<template>
  <SearchForm
    v-model="searchParams"
    @search="handleSearch"
    @reset="handleReset"
  >
    <t-form-item label="Username" name="username">
      <t-input v-model="searchParams.username" />
    </t-form-item>
  </SearchForm>
</template>

<script setup lang="ts">
import { SearchForm } from '@/components/common'
import { reactive } from 'vue'

const searchParams = reactive({ username: '' })
</script>
```

### PageHeader

A page header component with title, description, breadcrumbs, and action buttons.

**Usage:**
```vue
<template>
  <PageHeader
    title="User Management"
    description="Manage system users"
    icon="user"
    :show-back="true"
  >
    <template #actions>
      <t-button theme="primary" @click="handleCreate">
        Add User
      </t-button>
    </template>
  </PageHeader>
</template>

<script setup lang="ts">
import { PageHeader } from '@/components/common'
</script>
```

### FormDialog

A dialog component with integrated form validation.

**Usage:**
```vue
<template>
  <FormDialog
    v-model:visible="dialogVisible"
    title="Create User"
    :form-data="formData"
    :rules="rules"
    :loading="loading"
    @confirm="handleConfirm"
  >
    <t-form-item label="Username" name="username">
      <t-input v-model="formData.username" />
    </t-form-item>
  </FormDialog>
</template>

<script setup lang="ts">
import { FormDialog } from '@/components/common'
import { ref } from 'vue'

const dialogVisible = ref(false)
const formData = ref({ username: '' })
const rules = {
  username: [{ required: true, message: 'Required' }]
}
</script>
```
