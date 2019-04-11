interface menus {
    name: string;
    url: string;
    icon: string;
    menus: Array<{
        name: string;
        url: string;
        icon: string;
        permissions: Array<{
            name: string;
            url: string;
            resource: string;
        }>;
    }>;
}
interface options {
    mysql: any;
    synchronize?: boolean;
    rebuildTable?: boolean;
}
declare function init(menus: Array<menus>, { rebuildTable, synchronize, mysql }: options): void;
export { init };
