'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@payloadcms/ui'

/**
 * Affiche un message de bienvenue pour l'utilisateur connecté
 * @returns
 */
const WelcomeMessage = () => {
  const [tenantName, setTenantName] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    const fetchTenant = async () => {
      if (user && user.tenants && user.tenants.length > 0) {
        // Utilisation de find pour récupérer le premier tenant de l'utilisateur
        // Assurez-vous que user.tenants est un tableau et que chaque élément a une propriété 'tenant' qui est un objet avec un 'id'
        const tenantId = user.tenants[0].tenant.id

        // Vérification si un ID de tenant a été trouvé
        if (tenantId) {
          try {
            const foundTenant = await fetch(`/api/tenants/${tenantId}`).then((res) => res.json())

            // Vérification si le tenant a été trouvé et a un nom
            if (foundTenant && foundTenant.name) {
              setTenantName(foundTenant.name)
            }
          } catch (error) {
            console.error('Failed to fetch tenant:', error)
          }
        } else {
          console.warn('No tenant ID found for user')
        }
      }
    }

    fetchTenant()
  }, [user])

  return <div>{tenantName && <h1>Bienvenue, {tenantName} !</h1>}</div>
}

export default WelcomeMessage
