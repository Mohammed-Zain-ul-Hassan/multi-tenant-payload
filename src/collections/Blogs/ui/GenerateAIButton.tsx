'use client'
import React, { useCallback, useState } from 'react'
import { useForm, useField, useConfig, Button, toast } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'

export type GenerateAIButtonProps = {
    clientField?: {
        admin?: {
            custom?: {
                type: 'meta' | 'keywords' | 'full-article'
                label?: string
            }
        }
    }
    field?: {
        admin?: {
            custom?: {
                type: 'meta' | 'keywords' | 'full-article'
                label?: string
            }
        }
    }
}

export const GenerateAIButton: React.FC<GenerateAIButtonProps> = (props) => {
    const custom = props.clientField?.admin?.custom || props.field?.admin?.custom
    const type = custom?.type
    const label = custom?.label
    const { getData, dispatchFields } = useForm()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleClick = useCallback(async () => {
        const data = getData()
        console.log('GenerateAIButton: Form data:', data)

        // Robust tenant extraction
        let tenantId = ''
        if (data.tenant) {
            if (typeof data.tenant === 'object') {
                tenantId = (data.tenant as any).id || (data.tenant as any).value
            } else {
                tenantId = data.tenant as string
            }
        }

        // Determine input based on type
        let input = ''
        if (type === 'full-article') {
            input = data.title as string
        } else {
            // For meta and keywords, we prefer content but can fallback to title
            const contentString = data.content ? JSON.stringify(data.content) : ''
            input = contentString && contentString !== '{}' ? contentString : (data.title as string)
        }

        console.log(`GenerateAIButton: Type=${type}, TenantId=${tenantId}, Input Length=${input?.length || 0}`)

        if (!tenantId) {
            toast.error('Please select a Tenant first.')
            return
        }

        if (!input || input.trim() === '') {
            toast.error(`Please enter a ${type === 'full-article' ? 'Title' : 'Title or Content'} first.`)
            return
        }

        setIsLoading(true)

        try {
            console.log('GenerateAIButton: Calling AI API...')

            // Choose endpoint based on type
            const endpoint = type === 'full-article' ? '/api/generate-article' : '/api/ai/generate'
            const payload = type === 'full-article'
                ? { tenantId, topic: input }
                : { tenantId, input, type }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: response.statusText }))
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
            }

            const result = await response.json()
            console.log('GenerateAIButton: API Result:', result)

            if (type === 'full-article') {
                if (result.success && result.postId) {
                    toast.success('Article generated successfully! Redirecting...')
                    // Redirect to the new blog post
                    router.push(`/admin/collections/blogs/${result.postId}`)
                } else {
                    throw new Error(result.error || 'Failed to generate article')
                }
            } else {
                // Handle meta and keywords (legacy flow)
                if (result.success && result.result) {
                    if (type === 'meta') {
                        dispatchFields({ type: 'UPDATE', path: 'metaDescription', value: result.result })
                        toast.success('Meta description generated!')
                    } else if (type === 'keywords') {
                        const keywordsArray = result.result.split(',')
                            .map((k: string) => k.trim())
                            .filter((k: string) => k.length > 0)
                            .map((k: string) => ({ keyword: k }))

                        dispatchFields({ type: 'UPDATE', path: 'keywords', value: keywordsArray })
                        toast.success('Keywords generated!')
                    }
                } else {
                    throw new Error(result.error || 'No result from AI')
                }
            }

        } catch (error: any) {
            console.error('GenerateAIButton: Error:', error)
            toast.error('AI Error: ' + error.message)
        } finally {
            setIsLoading(false)
        }
    }, [getData, dispatchFields, type, router])

    return (
        <div style={{ marginBottom: '10px' }}>
            <Button
                type="button"
                onClick={handleClick}
                disabled={isLoading}
                size="small"
                buttonStyle="secondary"
            >
                {isLoading ? 'Generating...' : (label || `Generate ${type} with AI`)}
            </Button>
        </div>
    )
}
