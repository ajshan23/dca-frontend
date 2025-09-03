import { lazy } from 'react'
import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'
import { ADMIN, SUPERADMIN, USER } from '../roles'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    {
        key: 'users',
        path: '/users',
        component: lazy(() => import('@/views/users/UserList')),
        authority: [ADMIN,SUPERADMIN],
    },
    {
        key: 'usersCreate',
        path: '/users/create',
        component: lazy(() => import('@/views/users/UserForm')),
        authority: [ADMIN,SUPERADMIN],
    },
    {
        key: 'usersEdit',
        path: '/users/edit/:id',
        component: lazy(() => import('@/views/users/UserEdit')),
        authority: [ADMIN,SUPERADMIN],
    },
    {
        key: 'branches',
        path: '/branches',
        component: lazy(() => import('@/views/branches/BranchList')),
        authority: [ADMIN,SUPERADMIN],
    },
    {
        key: 'branchesCreate',
        path: '/branches/create',
        component: lazy(() => import('@/views/branches/BranchCreate')),
        authority: [ADMIN,SUPERADMIN],
    },
    {
        key: 'branchesEdit',
        path: '/branches/edit/:id',
        component: lazy(() => import('@/views/branches/BranchEdit')),
        authority: [ADMIN,SUPERADMIN],
    },
    {
        key: 'categories',
        path: '/categories',
        component: lazy(() => import('@/views/categories/CategoryList')),
        authority: [ADMIN,SUPERADMIN],
    },
    {
        key: 'categoriesCreate',
        path: '/categories/create',
        component: lazy(() => import('@/views/categories/CategoryCreate')),
        authority: [ADMIN,SUPERADMIN],
    },
    {
        key: 'categoriesEdit',
        path: '/categories/edit/:id',
        component: lazy(() => import('@/views/categories/CategoryEdit')),
        authority: [ADMIN,SUPERADMIN],
    },
    {
        key: 'employees',
        path: '/employees',
        component: lazy(() => import('@/views/employees/EmployeeList')),
        authority: [ADMIN,SUPERADMIN],
    },
    {
        key: 'employeesCreate',
        path: '/employees/create',
        component: lazy(() => import('@/views/employees/EmployeeCreate')),
        authority: [ADMIN,SUPERADMIN],
    },
    {
        key: 'employeesEdit',
        path: '/employees/edit/:id',
        component: lazy(() => import('@/views/employees/EmployeeEdit')),
        authority: [ADMIN,SUPERADMIN],
    },
    {
        key: 'products',
        path: '/products',
        component: lazy(() => import('@/views/products/ProductList')),
        authority: [ADMIN,SUPERADMIN,USER],
    },
    {
        key: 'productsCreate',
        path: '/products/create',
        component: lazy(() => import('@/views/products/ProductCreate')),
        authority: [ADMIN,SUPERADMIN,USER],
    },
    {
        key: 'productView',
        path: '/products/view/:id',
        component: lazy(() => import('@/views/products/ProductDetailsPage')),
        authority: [ADMIN,SUPERADMIN,USER],
    },
    {
        key: 'productsEdit',
        path: '/products/edit/:id',
        component: lazy(() => import('@/views/products/ProductEdit')),
        authority: [ADMIN,SUPERADMIN,USER],
    },
    {
        key: 'productAssignments',
        path: '/assignments',
        component: lazy(() => import('@/views/products/ProductAssignedList')),
        authority: [ADMIN,SUPERADMIN,USER],
    },
    {
        key: 'productAssignmentHistory',
        path: '/product-assignments/history/:productId?',
        component: lazy(() => import('@/views/products/ProductAssignmentHistory')),
        authority: [ADMIN,SUPERADMIN,USER],
    },
    {
        key: 'productAssignmentHistory',
        path: '/assignments/:id?',
        component: lazy(() => import('@/views/products/AssignmentList')),
        authority: [ADMIN,SUPERADMIN,USER],
        
    },{
        key: 'departmentList',
        path: '/departments',
        component: lazy(() => import('@/views/departments/DepartmentList')),
        authority: [ADMIN,SUPERADMIN],
        
    },{
        key: 'departmentCreate',
        path: '/departments/create',
        component: lazy(() => import('@/views/departments/DepartmentCreate')),
        authority: [ADMIN,SUPERADMIN],
        
    },{
        key: 'departmentEdit',
        path: '/departments/edit/:id?',
        component: lazy(() => import('@/views/departments/DepartmentEdit')),
        authority: [ADMIN,SUPERADMIN],
        
    },

    /** Example purpose only, please remove */
    {
        key: 'singleMenuItem',
        path: '/single-menu-view',
        component: lazy(() => import('@/views/demo/SingleMenuView')),
        authority: [],
    },
    {
        key: 'collapseMenu.item1',
        path: '/collapse-menu-item-view-1',
        component: lazy(() => import('@/views/demo/CollapseMenuItemView1')),
        authority: [],
    },
    {
        key: 'collapseMenu.item2',
        path: '/collapse-menu-item-view-2',
        component: lazy(() => import('@/views/demo/CollapseMenuItemView2')),
        authority: [],
    },
    {
        key: 'groupMenu.single',
        path: '/group-single-menu-item-view',
        component: lazy(() => import('@/views/demo/GroupSingleMenuItemView')),
        authority: [],
    },
    {
        key: 'groupMenu.collapse.item1',
        path: '/group-collapse-menu-item-view-1',
        component: lazy(
            () => import('@/views/demo/GroupCollapseMenuItemView1'),
        ),
        authority: [],
    },
    {
        key: 'groupMenu.collapse.item2',
        path: '/group-collapse-menu-item-view-2',
        component: lazy(
            () => import('@/views/demo/GroupCollapseMenuItemView2'),
        ),
        authority: [],
    },
]