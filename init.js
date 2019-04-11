"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const initSQL = `
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS \`auth_admin_role\`;
CREATE TABLE \`auth_admin_role\`  (
  \`admin_id\` int(11) NOT NULL,
  \`role_id\` int(11) NOT NULL,
  PRIMARY KEY (\`admin_id\`, \`role_id\`) USING BTREE,
  INDEX \`IDX_ROLE\`(\`role_id\`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

DROP TABLE IF EXISTS \`auth_menu\`;
CREATE TABLE \`auth_menu\`  (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '菜单名',
  \`url\` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '菜单路由地址',
  \`icon\` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '菜单图标',
  \`order\` int(11) NOT NULL DEFAULT 0 COMMENT '菜单排序',
  \`parent_id\` int(11) NOT NULL DEFAULT 0 COMMENT '父菜单ID',
  PRIMARY KEY (\`id\`) USING BTREE,
  INDEX \`IDX_PARENT\`(\`parent_id\`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

DROP TABLE IF EXISTS \`auth_permission\`;
CREATE TABLE \`auth_permission\`  (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '权限名',
  \`url\` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '路由地址',
  \`resource\` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '对应页面元素的显示隐藏',
  \`menu_id\` int(11) NOT NULL COMMENT '对应菜单的ID',
  PRIMARY KEY (\`id\`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

DROP TABLE IF EXISTS \`auth_role\`;
CREATE TABLE \`auth_role\`  (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '角色名',
  PRIMARY KEY (\`id\`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

DROP TABLE IF EXISTS \`auth_role_permission\`;
CREATE TABLE \`auth_role_permission\`  (
  \`role_id\` int(11) NOT NULL,
  \`permission_id\` int(11) NOT NULL,
  PRIMARY KEY (\`role_id\`, \`permission_id\`) USING BTREE,
  INDEX \`IDX_PERMISSION\`(\`permission_id\`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
`;
// default options
const opts = {
    mysql: null,
    synchronize: false,
    rebuildTable: false,
};
function init(menus, { rebuildTable, synchronize, mysql }) {
    if (!mysql.pool) {
        throw new Error(`Mysql please use promise`);
    }
    if (!mysql.pool.config.connectionConfig.multipleStatements) {
        throw new Error(`MySQL configuration options 'multipleStatements' must be true`);
    }
    opts.mysql = mysql;
    opts.synchronize = synchronize || opts.synchronize;
    opts.rebuildTable = rebuildTable || opts.rebuildTable;
    let menuId = 1;
    let permissionId = 1;
    const menuArray = [];
    const permissionArray = [];
    const root = { id: 1, name: 'root', url: '', icon: '', parentId: 0 };
    menuArray.push(root);
    // 遍历菜单目录
    menus.forEach(menu => {
        const menuDir = {
            id: ++menuId,
            name: menu.name,
            url: menu.url || '',
            icon: menu.icon || '',
            parentId: root.id,
        };
        menuArray.push(menuDir);
        // 遍历子菜单目录
        menu.menus.forEach(subMenu => {
            menuArray.push({
                id: ++menuId,
                name: subMenu.name,
                url: subMenu.url || '',
                icon: subMenu.icon || '',
                parentId: menuDir.id,
            });
            // 遍历权限
            subMenu.permissions.forEach(permission => {
                permissionArray.push({
                    id: permissionId++,
                    name: permission.name,
                    url: permission.url || '',
                    resource: permission.resource,
                    menuId: menuId,
                });
            });
        });
    });
    execute(menuArray, permissionArray);
}
exports.init = init;
function execute(menuArray, permissionArray) {
    let promise = Promise.resolve();
    if (opts.rebuildTable) {
        promise = opts.mysql.query(initSQL);
    }
    if (opts.synchronize) {
        const menus = [];
        const permissions = [];
        menuArray.forEach(menu => {
            menus.push([menu.id, menu.name, menu.url, menu.icon, menu.parentId]);
        });
        permissionArray.forEach(permission => {
            permissions.push([permission.id, permission.name, permission.url, permission.resource, permission.menuId]);
        });
        promise.then(() => {
            return opts.mysql.query(`
                    DELETE FROM auth_menu;
                    DELETE FROM auth_permission;
                    ALTER TABLE auth_menu auto_increment = 1;
                    ALTER TABLE auth_permission auto_increment = 1;
                    `);
        }).then(() => {
            opts.mysql.query(`INSERT INTO auth_menu       (id, name, url, icon, parent_id)   VALUES ?;`, [menus]);
            opts.mysql.query(`INSERT INTO auth_permission (id, name, url, resource, menu_id) VALUES ?;`, [permissions]);
        });
    }
}
