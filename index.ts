async function permissionCheck(ctx, next) {
    const permissions = ctx.state.permissions
    if (!Array.isArray(permissions)) return ctx.throw(403)
    let some = permissions.includes(ctx._matchedRoute)
    if (!some) return ctx.throw(403)
    await next()
}

export {permissionCheck}