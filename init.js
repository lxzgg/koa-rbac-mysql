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
  \`name\` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT 'menu name',
  \`url\` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT 'menu url',
  \`icon\` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT 'menu icon',
  \`order\` int(11) NOT NULL DEFAULT 0 COMMENT 'menu sort',
  \`parent_id\` int(11) NULL DEFAULT NULL COMMENT 'menu parentId',
  PRIMARY KEY (\`id\`) USING BTREE,
  INDEX \`IDX_PARENT\`(\`parent_id\`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

DROP TABLE IF EXISTS \`auth_permission\`;
CREATE TABLE \`auth_permission\`  (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT 'router name',
  \`url\` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT 'router url',
  \`resource_id\` int(11) NOT NULL,
  PRIMARY KEY (\`id\`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

DROP TABLE IF EXISTS \`auth_resource\`;
CREATE TABLE \`auth_resource\`  (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (\`id\`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

DROP TABLE IF EXISTS \`auth_role\`;
CREATE TABLE \`auth_role\`  (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT 'role name',
  PRIMARY KEY (\`id\`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

DROP TABLE IF EXISTS \`auth_role_menu\`;
CREATE TABLE \`auth_role_menu\`  (
  \`role_id\` int(11) NOT NULL,
  \`menu_id\` int(11) NOT NULL,
  PRIMARY KEY (\`role_id\`, \`menu_id\`) USING BTREE,
  INDEX \`IDX_MENU\`(\`menu_id\`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

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
function init(accesses, { rebuildTable, synchronize, mysql }) {
    if (!mysql.pool) {
        throw new Error(`Mysql please use promise`);
    }
    if (!mysql.pool.config.connectionConfig.multipleStatements) {
        throw new Error(`MySQL configuration options 'multipleStatements' must be true`);
    }
    opts.mysql = mysql;
    opts.synchronize = synchronize || opts.synchronize;
    opts.rebuildTable = rebuildTable || opts.rebuildTable;
    const routes = [];
    const resources = [];
    const permissions = [];
    let resources_id = 0;
    let permission_id = 0;
    accesses.forEach(access => {
        resources_id++;
        resources.push([resources_id, access.name]);
        access.permissions.forEach(permission => {
            permission_id++;
            routes.push(permission.url);
            permissions.push([permission_id, permission.name, permission.url, resources_id]);
        });
    });
    execute(resources, permissions);
    return routes;
}
exports.init = init;
function execute(resources, permissions) {
    let promise = Promise.resolve();
    if (opts.rebuildTable) {
        promise = opts.mysql.query(initSQL);
    }
    if (opts.synchronize) {
        promise.then(() => {
            return opts.mysql.query(`
                    DELETE FROM auth_resource;
                    DELETE FROM auth_permission;
                    ALTER TABLE auth_resource auto_increment = 1;
                    ALTER TABLE auth_permission auto_increment = 1;
                    `);
        }).then(() => {
            opts.mysql.query(`INSERT INTO auth_resource   (id, name)                VALUES ?;`, [resources]);
            opts.mysql.query(`INSERT INTO auth_permission (id,NAME,url,resource_id) VALUES ?;`, [permissions]);
        });
    }
}
