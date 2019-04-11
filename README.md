## Installation

```
$ npm i koa-rbac-mysql
```

## Example

```js
const Koa = require('koa')
const Router = require('koa-router')
const {permissionCheck} = require('koa-rbac-mysql')

const app = new Koa()
const router = new Router()

app.use(async function (ctx, next) {
  // Simulate user permissions
  // Actual data is retrieved from the cache or database
  const userPermissions = ['/user/add', '/admin/:id']

  // Permissions must be injected into the state
  // permission Check will be used
  ctx.state.permissions = userPermissions
  await next()
})

// success
router.post('/user/add', permissionCheck, ctx => {
  ctx.body = 'success'
})

// access denied
router.post('/user/del', permissionCheck, ctx => {
  ctx.body = 'access denied'
})

// success
router.post('/admin/:id', permissionCheck, ctx => {
  ctx.body = 'success'
})

// access denied
router.post('/admin/:id/del', permissionCheck, ctx => {
  ctx.body = 'access denied'
})

app.use(router.routes())

app.listen(3000, () => {
  console.log('http://127.0.0.1:3000')
})
```
# initialization
`$ node init.js`
```js
// init.js
const mysql = require('mysql2')
const {init} = require('koa-rbac-mysql/init')

// The array will be synchronized to the database
const menus = [
  {
    name: '目录1',
    icon: '目录图标',
    menus: [
      {
        name: '子目录1-1',
        url: '页面路由',
        permissions: [
          {name: '权限1-1-1', url: '接口路由1-1-1', resource: '对应页面元素的显示隐藏1-1-1'},
          {name: '权限1-1-2', url: '接口路由1-1-2', resource: '对应页面元素的显示隐藏1-1-2'},
        ],
      },
    ],
  },
  {
    name: '个人中心',
    icon: 'icon-user',
    menus: [
      {
        name: '用户管理',
        url: '/user',
        permissions: [
          {name: '添加用户', url: '/user/add', resource: 'user_add'},
          {name: '删除用户', url: '/user/del', resource: 'user_del'},
        ],
      },
      {
        name: '文章管理',
        url: '/article',
        permissions: [
          {name: '添加文章', url: '/article/add', resource: 'article_add'},
          {name: '删除文章', url: '/article/del', resource: 'article_del'},
        ],
      },
    ],
  },
]

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Admin0-0-',
  database: 'rbac',
  // Must be true when initializing
  multipleStatements: true,
}).promise()

// Initialize mysql rbac permissions
init(menus, {
  // Inject data source
  mysql: pool,
  // Create table after deleting
  rebuildTable: true,
  // Synchronize permissions in the 'accesses' array to mysql
  synchronize: true,
})
```