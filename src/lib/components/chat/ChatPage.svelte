<script lang="ts">
    import ChatHistory from "$lib/components/chat/ChatHistory.svelte";
    import {Pane, Splitpanes} from "svelte-splitpanes";
    import ChatMessageEntry from "$lib/components/chat/ChatMessageEntry.svelte";
    import ChatPromptTextArea from "$lib/components/chat/ChatPromptTextArea.svelte";
    import {cn} from "$lib/utils";
    import {Button} from "$lib/components/ui/button";
    import {PaperclipIcon, SendIcon} from "lucide-svelte";
</script>

<div class="flex flex-col py-2 px-4 h-screen">
    <div class="flex-0 flex flex-row pt-4 pb-4">
        <h1 class="font-bold text-3xl tracking-tight">Chat Assistant</h1>
    </div>
    <div class="flex-1 flex flex-row overflow-x-hidden">
        <ChatHistory/>
        <div class="flex flex-grow">
            <Splitpanes>
                <Pane minSize={40} size={65}>
                    <div class="flex h-full flex-col justify-between">
                        <div class="flex flex-col h-full container max-w-4xl mx-auto">
                            <div class="flex flex-grow overflow-y-auto">
                                <div class="flex flex-col space-y-4">
                                    <ChatMessageEntry content="123\n\n" isUser={true}/>
                                    <ChatMessageEntry content="123\n\n" isUser={false}/>
                                    <ChatMessageEntry content="123\n\n" isUser={true}/>
                                    <ChatMessageEntry content="123\n\n" isUser={true}/>
                                    <ChatMessageEntry content="123\n\n" isUser={true}/>
                                    <ChatMessageEntry content="123\n\n" isUser={true}/>
                                    <ChatMessageEntry content="123\n\n" isUser={true}/>
                                    <ChatMessageEntry content="123\n\n" isUser={true}/>
                                    <ChatMessageEntry content="123\n\n" isUser={true}/>
                                    <ChatMessageEntry content="123\n\n" isUser={true}/>
                                    <ChatMessageEntry content="123\n\n" isUser={true}/>
                                    <ChatMessageEntry content="123\n\n" isUser={true}/>
                                    <ChatMessageEntry content="123\n\n" isUser={true}/>
                                    <ChatMessageEntry content="123\n\n" isUser={true}/>
                                    <ChatMessageEntry content="123\n\n" isUser={true}/>
                                    <ChatMessageEntry content="123\n\n" isUser={true}/>
                                    <ChatMessageEntry content="123\n\n" isUser={true}/>
                                    <ChatMessageEntry content="123\n\n" isUser={true}/>
                                </div>
                            </div>
                            <div class="flex-grow-0 flex flex-col">
                                <div>
                                    <!-- for other toolbars here eventually -->
                                </div>
                                <div class="flex flex-row justify-between items-center">
                                    <ChatPromptTextArea/>
                                    <div class="flex flex-col space-y-2">
                                        <Button variant="outline">
                                            <PaperclipIcon class="w-6 h-6"/>
                                        </Button>
                                        <Button variant="outline">
                                            <SendIcon class="w-6 h-6"/>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Pane>
                <Pane minSize={25} size={35}>
                    <div class="flex h-full flex-col justify-center items-center">
                        <h1 class="text-2xl font-bold">Context</h1>
                    </div>
                </Pane>
            </Splitpanes>
        </div>
    </div>
</div>