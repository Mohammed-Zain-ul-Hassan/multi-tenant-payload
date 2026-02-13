'use client'
import React, { useEffect, useState } from 'react'
import { useFormFields, Button } from '@payloadcms/ui'

export const PreviewButton: React.FC = () => {
    // Subscribe to form fields
    const { tenant, slug } = useFormFields(([fields]) => ({
        tenant: fields.tenant,
        slug: fields.slug,
    }))

    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // Extract values safely
    const tenantValue = tenant?.value
    const slugValue = slug?.value as string

    useEffect(() => {
        let isMounted = true

        const fetchTenantSlug = async () => {
            // Need both tenant and slug to form the URL
            if (!tenantValue || !slugValue) {
                if (isMounted) setPreviewUrl(null)
                return
            }

            let tenantId = ''
            let tenantSlug = ''

            // Handle relation value (could be string ID or populated object)
            if (typeof tenantValue === 'string') {
                tenantId = tenantValue
            } else if (typeof tenantValue === 'object' && tenantValue !== null) {
                tenantId = (tenantValue as any).id
                // If the object already has the slug, use it
                if ((tenantValue as any).slug) {
                    tenantSlug = (tenantValue as any).slug
                }
            }

            if (!tenantId) {
                if (isMounted) setPreviewUrl(null)
                return
            }

            // If we already have the tenant slug (from populated field), use it directly
            if (tenantSlug) {
                if (isMounted) setPreviewUrl(`/${tenantSlug}/${slugValue}`)
                return
            }

            // Otherwise fetch the tenant details to get the slug
            try {
                if (isMounted) setLoading(true)
                const response = await fetch(`/api/tenants/${tenantId}`)
                if (response.ok) {
                    const data = await response.json()
                    if (data.slug && isMounted) {
                        setPreviewUrl(`/${data.slug}/${slugValue}`)
                    }
                }
            } catch (error) {
                console.error('Error fetching tenant for preview:', error)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchTenantSlug()

        return () => { isMounted = false }
    }, [tenantValue, slugValue])

    if (!previewUrl && !loading) return null

    return (
        <div style={{ marginBottom: '20px', marginTop: '10px' }}>
            <Button
                onClick={() => {
                    if (previewUrl) window.open(previewUrl, '_blank')
                }}
                size="small"
                buttonStyle="secondary" // Use secondary style to match other actions
                disabled={loading || !previewUrl}
            >
                {loading ? 'Loading Preview...' : 'Preview Blog Post'}
            </Button>
        </div>
    )
}
