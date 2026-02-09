import { Block } from 'payload'

export const CustomHTMLBlock: Block = {
    slug: 'custom-html',
    labels: {
        singular: 'Custom HTML',
        plural: 'Custom HTML Blocks',
    },
    fields: [
        {
            name: 'code',
            type: 'textarea',
            label: 'HTML Code',
            required: true,
        },
    ],
}
