'use client'

import type { ForwardedRef } from 'react'
import {
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    markdownShortcutPlugin,
    MDXEditor,
    type MDXEditorMethods,
    type MDXEditorProps,
    // Toolbar components
    UndoRedo,
    BoldItalicUnderlineToggles,
    BlockTypeSelect,
    ListsToggle,
    InsertThematicBreak,
    CreateLink,
    toolbarPlugin,
    linkPlugin,
    linkDialogPlugin,
    InsertImage,
    imagePlugin,
    InsertTable,
    tablePlugin,
    InsertCodeBlock,
    codeBlockPlugin,
    InsertAdmonition,
    directivesPlugin,
    AdmonitionDirectiveDescriptor,
    InsertFrontmatter,
    frontmatterPlugin,
    DiffSourceToggleWrapper,
    diffSourcePlugin,
    Separator,
    CodeToggle,
    // Code blocks
    codeMirrorPlugin,
    ConditionalContents,
    ChangeCodeMirrorLanguage
} from '@mdxeditor/editor'

import { uploadFile } from '@/lib/utils/upload'
import { useTheme } from 'next-themes'

import './MDXEditorStyle.css'

export default function InitializedMDXEditor({ editorRef, ...props }: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
    const { resolvedTheme } = useTheme()
    
    return (
        <MDXEditor
            plugins={[
                headingsPlugin(),
                listsPlugin(),
                quotePlugin(),
                thematicBreakPlugin(),
                linkPlugin(),
                linkDialogPlugin(),
                imagePlugin({
                    imageUploadHandler: uploadFile
                }),
                tablePlugin(),
                codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
                codeMirrorPlugin({
                    codeBlockLanguages: {
                        txt: 'Plain Text',
                        js: 'JavaScript',
                        ts: 'TypeScript',
                        tsx: 'TypeScript (React)',
                        py: 'Python',
                        rs: 'Rust',
                        dart: 'Dart',
                        go: 'Go',
                        c: 'C',
                        cpp: 'C++',
                        cs: 'C#',
                        lua: 'Lua',
                        r: 'R',
                        fortran: 'Fortran',
                        css: 'CSS',
                        html: 'HTML',
                        json: 'JSON',
                        md: 'Markdown'
                    }
                }),
                directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
                frontmatterPlugin(),
                diffSourcePlugin({ viewMode: 'rich-text' }),
                markdownShortcutPlugin(),
                toolbarPlugin({
                    toolbarContents: () => (
                        <DiffSourceToggleWrapper>
                            <ConditionalContents
                                options={[
                                    {
                                        when: (editor) => editor?.editorType === 'codeblock',
                                        contents: () => <ChangeCodeMirrorLanguage />
                                    },
                                    {
                                        fallback: () => (
                                            <>
                                                <UndoRedo />
                                                <Separator />
                                                <BoldItalicUnderlineToggles />
                                                <CodeToggle />
                                                <Separator />
                                                <ListsToggle />
                                                <Separator />
                                                <BlockTypeSelect />
                                                <Separator />
                                                <CreateLink />
                                                <InsertImage />
                                                <InsertTable />
                                                <InsertThematicBreak />
                                                <InsertCodeBlock />
                                                <InsertAdmonition />
                                                <InsertFrontmatter />
                                            </>
                                        )
                                    }
                                ]}
                            />
                        </DiffSourceToggleWrapper>
                    )
                })
            ]}
            {...props}
            className={`${resolvedTheme === 'dark' ? 'dark-theme' : 'light-theme'} ${props.className || ''}`}
            ref={editorRef}
        />
    )
}
