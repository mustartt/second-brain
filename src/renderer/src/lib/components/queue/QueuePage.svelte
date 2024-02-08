<script lang="ts">
    import LocalFileCard from "$lib/components/queue/LocalFileCard.svelte";
    import {createTable, Subscribe, Render, createRender} from "svelte-headless-table";
    import {fileQueueView} from "$lib/store/file-queue";
    import * as Table from "$lib/components/ui/table";
    import * as Pagination from "$lib/components/ui/pagination";
    import Progress from "$lib/components/queue/table/Progress.svelte";
    import FileAction from "$lib/components/queue/table/FileAction.svelte";
    import Filename from "$lib/components/queue/table/Filename.svelte";

    const table = createTable(fileQueueView);
    const columns = table.createColumns([
        table.column({
            header: 'Files',
            accessor: 'name',
            cell: ({value}) => createRender(Filename, {name: value})
        }),
        table.column({
            header: 'Progress',
            accessor: 'progress',
            cell: ({value}) => createRender(Progress, {value})
        }),
        table.column({
            header: '',
            accessor: (value) => value,
            cell: ({value}) => createRender(FileAction, {
                id: value.id,
                status: value.progress.status
            })
        })
    ]);
    const {headerRows, pageRows, tableAttrs, tableBodyAttrs} =
        table.createViewModel(columns);
</script>

<div class="flex flex-col py-2 px-4 h-screen">
    <div class="flex-0 flex flex-row pt-4 pb-4">
        <h1 class="font-bold text-3xl tracking-tight">File Queue</h1>
    </div>
    <div class="flex-1 flex flex-row overflow-x-hidden space-x-4">
        <div class="flex flex-col w-2/3">
            <LocalFileCard/>
        </div>
        <div class="flex justify-center w-1/3">
            <div class="w-full rounded-md border">
                <Table.Root {...$tableAttrs}>
                    <Table.Header>
                        {#each $headerRows as headerRow}
                            <Subscribe rowAttrs={headerRow.attrs()}>
                                <Table.Row>
                                    {#each headerRow.cells as cell (cell.id)}
                                        <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()}>
                                            <Table.Head {...attrs}>
                                                <Render of={cell.render()}/>
                                            </Table.Head>
                                        </Subscribe>
                                    {/each}
                                </Table.Row>
                            </Subscribe>
                        {/each}
                    </Table.Header>
                    <Table.Body {...$tableBodyAttrs}>
                        {#each $pageRows as row (row.id)}
                            <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
                                <Table.Row {...rowAttrs}>
                                    {#each row.cells as cell (cell.id)}
                                        <Subscribe attrs={cell.attrs()} let:attrs>
                                            <Table.Cell {...attrs}>
                                                <Render of={cell.render()}/>
                                            </Table.Cell>
                                        </Subscribe>
                                    {/each}
                                </Table.Row>
                            </Subscribe>
                        {/each}
                    </Table.Body>
                </Table.Root>
            </div>
        </div>
    </div>
</div>
