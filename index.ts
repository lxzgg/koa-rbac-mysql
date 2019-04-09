async function permissionCheck(ctx, next) {
    const permissions = ctx.state.permissions
    if (!Array.isArray(permissions)) return ctx.throw(403)
    let some = ctx.router.stack.some(router => permissions.includes(router.path))
    if (!some) return ctx.throw(403)
    await next()
}

export {permissionCheck}