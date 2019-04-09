interface accesses {
    name: string;
    permissions: Array<{
        name: string;
        url: string;
    }>;
}
interface options {
    mysql: any;
    synchronize?: boolean;
    rebuildTable?: boolean;
}
declare function init(accesses: Array<accesses>, { rebuildTable, synchronize, mysql }: options): any[];
export { init };
