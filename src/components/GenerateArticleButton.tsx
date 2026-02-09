'use client'

import React, { useCallback, useState } from 'react'
import { Button, useFormFields, toast } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'

export const GenerateArticleButton: React.FC = () => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    // Subscribe to the 'tenant' field to ensure we have the latest value
    // Subscribe to the 'tenant' and 'title' fields
    const { tenant, title } = useFormFields(([fields]) => ({
        tenant: fields.tenant,
        title: fields.title,
    }))

    // Robustly extract tenant ID (could be string or object depending on depth)
    const tenantId = tenant?.value
        ? (typeof tenant.value === 'string'
            ? tenant.value
            : (tenant.value as { id: string }).id)
        : null

    const handleClick = useCallback(async () => {
        if (!tenantId) {
            toast.error('Please select a Tenant first.')
            return
        }

        let topic = title?.value as string

        if (!topic) {
            topic = window.prompt('What topic should the article be about?') || ''
        }

        if (!topic) return

        setIsLoading(true)
        const toastId = toast.loading('Generating article... This may take a minute.')

        try {
            const response = await fetch('/api/generate-article', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tenantId,
                    topic,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || `HTTP error! status: ${response.status}`)
            }

            if (result.success && result.postId) {
                toast.success('Article generated successfully! Redirecting...', {
                    id: toastId
                })
                // Redirect to the new draft
                router.push(`/admin/collections/blogs/${result.postId}`)
            } else {
                throw new Error(result.error || 'Failed to generate article')
            }
        } catch (error: any) {
            console.error('Error generating article:', error)
            toast.error(`Error: ${error.message}`, { id: toastId })
        } finally {
            setIsLoading(false)
        }
    }, [tenantId, router])

    return (
        <div style={{ marginBottom: '20px' }}>
            <Button
                onClick={handleClick}
                disabled={isLoading || !tenantId}
                size="small"
                buttonStyle="secondary"
            >
                {isLoading ? 'Generating...' : 'Generate Article with AI'}
            </Button>
        </div>
    )
}
