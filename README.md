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