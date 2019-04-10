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
const accesses = [
  {
    name: 'UserManage',
    permissions: [
      {name: 'user_add', url: '/user/add'},
      {name: 'user_del', url: '/user/del'},
    ],
  },
  {
    name: 'AdminManage',
    permissions: [
      {name: 'admin_get', url: '/admin/:id'},
      {name: 'admin_del', url: '/admin/:id/del'},
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
init(accesses, {
  // Inject data source
  mysql: pool,
  // Create table after deleting
  rebuildTable: true,
  // Synchronize permissions in the 'accesses' array to mysql
  synchronize: true,
})
```