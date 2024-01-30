<script lang="ts">
    import * as Avatar from "$lib/components/ui/avatar";
    import {marked} from "marked";
    import MarkdownView from "$lib/components/ui/markdown/MarkdownView.svelte";

    const text =
        `
# Sample Markdown Document

Sure, here's a piece of random text:

"In the verdant valleys of a distant land, where the sun painted the sky in hues of amber and violet, there lived a curious fox named Lysander. He spent his days exploring the hidden groves and whispering rivers, always in search of something new. One day, while meandering through a sun-dappled glade, Lysander stumbled upon a peculiar object. It was a small, intricately carved box, adorned with symbols that shimmered like stars. Overcome with curiosity, he nudged the box open with his snout, and to his astonishment, a swirl of luminous colors burst forth, painting the world around him in shades of dreams and wonder."

Feel free to let me know if you need anything else!

## Headings
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

## Text Styles
*Italic text* or _Italic text_
**Bold text** or __Bold text__
***Bold and italic text*** or ___Bold and italic text___
~~Strikethrough text~~

## Lists

### Ordered List
1. First item
2. Second item
3. Third item

### Unordered List
- Item
- Another item
  - Subitem
  - Another subitem
    - Sub-subitem

## Links
[OpenAI](https://www.openai.com)

## Images
![Alt text for image](https://via.placeholder.com/150)

## Code
\`Inline code\` with backticks

### Code Blocks
\`\`\`python
# Python code example
def hello_world():
    print("Hello, world!")
\`\`\`

## Blockquotes
> This is a blockquote.
>
> > Nested blockquote.

## Horizontal Rule
---

## Tables

| Syntax    | Description |
| --------- | ----------- |
| Header    | Title       |
| Paragraph | Text        |

## Task Lists
- [x] Completed task
- [ ] Incomplete task
- [ ] Another incomplete task`;

</script>

<div class="flex flex-col">
    <div class="flex flex-row justify-between">
        <Avatar.Root class="w-8 h-8 border-2">
            <Avatar.Image src="https://github.com/shadcn.png" alt="@chatgpt"/>
            <Avatar.Fallback>User</Avatar.Fallback>
        </Avatar.Root>
        <div class="flex flex-col w-full">
            <h3 class="font-bold mt-0.5 ml-3 text-xl">You</h3>
            <div class="ml-3">
                <MarkdownView text={text}/>
            </div>
        </div>
    </div>
</div>