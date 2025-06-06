import { gql } from '@apollo/client'
import { useMemo } from 'react'

import { useFilters } from '~/components/designSystem/Filters/useFilters'
import { ComboBox } from '~/components/form'
import { useGetCustomersForFilterItemCustomerLazyQuery } from '~/generated/graphql'
import { useInternationalization } from '~/hooks/core/useInternationalization'

import { filterDataInlineSeparator, FiltersFormValues } from '../types'

gql`
  query getCustomersForFilterItemCustomer($page: Int, $limit: Int, $searchTerm: String) {
    customers(page: $page, limit: $limit, searchTerm: $searchTerm, withDeleted: true) {
      metadata {
        currentPage
        totalPages
      }
      collection {
        id
        displayName
        externalId
        deletedAt
      }
    }
  }
`

type FiltersItemCustomerProps = {
  value: FiltersFormValues['filters'][0]['value']
  setFilterValue: (value: string) => void
}

export const FiltersItemCustomer = ({ value, setFilterValue }: FiltersItemCustomerProps) => {
  const { translate } = useInternationalization()
  const { displayInDialog } = useFilters()

  const [getCustomers, { data, loading }] = useGetCustomersForFilterItemCustomerLazyQuery({
    variables: { page: 1, limit: 10 },
  })

  const comboboxCustomersData = useMemo(() => {
    if (!data?.customers?.collection) return []

    return data.customers.collection.map((customer) => {
      const { externalId } = customer

      const customerName = customer?.displayName

      return {
        label: `${customerName || externalId || ''}${customer.deletedAt ? ` (${translate('text_1743158702704o1juwxmr4ab')})` : ''}`,
        value: `${externalId}${filterDataInlineSeparator}${customerName}`,
      }
    })
  }, [data?.customers?.collection, translate])

  return (
    <ComboBox
      PopperProps={{
        displayInDialog,
      }}
      disableClearable
      searchQuery={getCustomers}
      loading={loading}
      placeholder={translate('text_63befc65efcd9374da45b801')}
      data={comboboxCustomersData}
      onChange={(customerValue) => setFilterValue(customerValue)}
      value={value}
    />
  )
}
