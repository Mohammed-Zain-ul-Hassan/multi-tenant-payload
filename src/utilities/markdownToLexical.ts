import {
    convertMarkdownToLexical,
    editorConfigFactory,
    ServerEditorConfig,
} from '@payloadcms/richtext-lexical'
import configPromise from '@payload-config'
import jsdom from 'jsdom'

const { JSDOM } = jsdom

export const markdownToLexical = async (markdown: string) => {
    // Polyfill JSDOM for server-side environment
    const dom = new JSDOM()
    global.window = dom.window as any
    global.document = dom.window.document
    global.DocumentFragment = dom.window.DocumentFragment
    global.Element = dom.window.Element
    global.Node = dom.window.Node

    try {
        const config = await configPromise
        const editorConfig = await editorConfigFactory.default({ config })

        const editorState = await convertMarkdownToLexical({
            markdown,
            editorConfig: editorConfig as any,
        })

        // Post-process to convert generic 'code' nodes to Payload 'Code' blocks
        if (editorState && editorState.root) {
            traverseAndTransform(editorState.root)
        }

        return editorState
    } finally {
        // Cleanup
        delete (global as any).window
        delete (global as any).document
        delete (global as any).DocumentFragment
        delete (global as any).Element
        delete (global as any).Node
        if (dom && dom.window) {
            dom.window.close()
        }
    }
}

// Helper to traverse and transform Lexical JSON
const traverseAndTransform = (node: any) => {
    if (!node || !node.children || !Array.isArray(node.children)) return

    for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i]

        // Transform CodeNode to BlockNode (CodeBlock)
        if (child.type === 'code') {
            const codeContent = child.children?.map((c: any) => c.text).join('') || ''
            const language = child.language || 'javascript'

            node.children[i] = {
                type: 'block',
                fields: {
                    blockType: 'Code', // Must match the slug of the CodeBlock
                    code: codeContent,
                    language: language,
                },
                format: '',
                version: 2,
            }
        } else {
            // Recurse
            traverseAndTransform(child)
        }
    }
}
