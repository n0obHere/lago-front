import { gql } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Button, Popper, Typography } from '~/components/designSystem'
import { SearchInput } from '~/components/SearchInput'
import {
  AvalaraIntegrationItemsListAddonsFragmentDoc,
  AvalaraIntegrationItemsListBillableMetricsFragmentDoc,
  AvalaraIntegrationItemsListDefaultFragmentDoc,
  MappableTypeEnum,
  useGetAddOnsForAvalaraItemsListLazyQuery,
  useGetAvalaraIntegrationCollectionMappingsLazyQuery,
  useGetBillableMetricsForAvalaraItemsListLazyQuery,
} from '~/generated/graphql'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import { useDebouncedSearch } from '~/hooks/useDebouncedSearch'
import { MenuPopper } from '~/styles'

import AvalaraIntegrationItemsListAddons from './AvalaraIntegrationItemsListAddons'
import AvalaraIntegrationItemsListBillableMetrics from './AvalaraIntegrationItemsListBillableMetrics'
import AvalaraIntegrationItemsListDefault from './AvalaraIntegrationItemsListDefault'
import {
  AvalaraIntegrationMapItemDialog,
  AvalaraIntegrationMapItemDialogRef,
} from './AvalaraIntegrationMapItemDialog'

const SelectedItemTypeEnum = {
  Default: 'Default',
  [MappableTypeEnum.AddOn]: 'AddOn',
  [MappableTypeEnum.BillableMetric]: 'BillableMetric',
} as const

const SelectedItemTypeEnumTranslation = {
  Default: 'text_65281f686a80b400c8e2f6d1',
  [MappableTypeEnum.AddOn]: 'text_629728388c4d2300e2d3801a',
  [MappableTypeEnum.BillableMetric]: 'text_623b497ad05b960101be3438',
} as const

gql`
  fragment AvalaraIntegrationItems on AvalaraIntegration {
    id # integrationId received in props
  }

  query getAvalaraIntegrationCollectionMappings($integrationId: ID!) {
    integrationCollectionMappings(integrationId: $integrationId) {
      collection {
        id
        ...AvalaraIntegrationItemsListDefault
      }
    }
  }

  query getAddOnsForAvalaraItemsList(
    $page: Int
    $limit: Int
    $searchTerm: String
    # integrationId used in item list fragment
    $integrationId: ID!
  ) {
    addOns(page: $page, limit: $limit, searchTerm: $searchTerm) {
      metadata {
        currentPage
        totalPages
      }
      collection {
        id
        ...AvalaraIntegrationItemsListAddons
      }
    }
  }

  query getBillableMetricsForAvalaraItemsList(
    $page: Int
    $limit: Int
    $searchTerm: String
    # integrationId used in item list fragment
    $integrationId: ID!
  ) {
    billableMetrics(page: $page, limit: $limit, searchTerm: $searchTerm) {
      metadata {
        currentPage
        totalPages
      }
      collection {
        id
        ...AvalaraIntegrationItemsListBillableMetrics
      }
    }
  }

  ${AvalaraIntegrationItemsListDefaultFragmentDoc}
  ${AvalaraIntegrationItemsListAddonsFragmentDoc}
  ${AvalaraIntegrationItemsListBillableMetricsFragmentDoc}
`

const AvalaraIntegrationItemsList = ({ integrationId }: { integrationId: string }) => {
  const { translate } = useInternationalization()
  const avalaraIntegrationMapItemDialogRef = useRef<AvalaraIntegrationMapItemDialogRef>(null)
  const [searchParams, setSearchParams] = useSearchParams({
    item_type: SelectedItemTypeEnum.Default,
  })
  const [selectedItemType, setSelectedItemType] = useState<keyof typeof SelectedItemTypeEnum>(
    searchParams.get('item_type') as keyof typeof SelectedItemTypeEnum,
  )

  useEffect(() => {
    // Update url with the search param depending on the selected item type
    setSearchParams({ item_type: selectedItemType })
  }, [selectedItemType, setSearchParams])

  const [
    getDefaultItems,
    {
      data: collectionMappingData,
      loading: collectionMappingLoading,
      error: collectionMappingError,
    },
  ] = useGetAvalaraIntegrationCollectionMappingsLazyQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      integrationId,
    },
  })

  const [
    getAddonList,
    {
      data: addonData,
      loading: addonLoading,
      error: addonError,
      variables: addonVariables,
      fetchMore: fetchMoreAddons,
    },
  ] = useGetAddOnsForAvalaraItemsListLazyQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      limit: 20,
      integrationId,
    },
  })

  const [
    getBillableMetricsList,
    {
      data: billableMetricsData,
      loading: billableMetricsLoading,
      error: billableMetricsError,
      variables: billableMetricsVariables,
      fetchMore: fetchMoreBillableMetrics,
    },
  ] = useGetBillableMetricsForAvalaraItemsListLazyQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      limit: 20,
      integrationId,
    },
  })

  const { debouncedSearch: debouncedSearchAddons, isLoading: isLoadingAddons } = useDebouncedSearch(
    getAddonList,
    addonLoading,
  )

  const { debouncedSearch: debouncedSearchBillableMetrics, isLoading: isLoadingBillableMetrics } =
    useDebouncedSearch(getBillableMetricsList, billableMetricsLoading)

  // handeling data fetching
  useEffect(() => {
    if (selectedItemType === SelectedItemTypeEnum.Default) {
      getDefaultItems()
    } else if (selectedItemType === MappableTypeEnum.AddOn) {
      getAddonList()
    } else if (selectedItemType === MappableTypeEnum.BillableMetric) {
      getBillableMetricsList()
    }
  }, [selectedItemType, getAddonList, getDefaultItems, getBillableMetricsList])

  return (
    <>
      <div className="flex h-nav items-center justify-between px-12 shadow-b">
        <div className="flex items-center gap-3">
          <Typography variant="body" color="grey600">
            {translate('text_6630e3210c13c500cd398e95')}
          </Typography>
          <Popper
            PopperProps={{ placement: 'bottom-end' }}
            opener={
              <Button endIcon="chevron-down" variant="secondary">
                {translate(SelectedItemTypeEnumTranslation[selectedItemType])}
              </Button>
            }
          >
            {({ closePopper }) => (
              <MenuPopper>
                <Button
                  variant="quaternary"
                  fullWidth
                  align="left"
                  onClick={() => {
                    setSelectedItemType(SelectedItemTypeEnum.Default)
                    closePopper()
                  }}
                >
                  {translate('text_65281f686a80b400c8e2f6d1')}
                </Button>
                <Button
                  variant="quaternary"
                  align="left"
                  fullWidth
                  onClick={() => {
                    setSelectedItemType(MappableTypeEnum.AddOn)
                    closePopper()
                  }}
                >
                  {translate('text_629728388c4d2300e2d3801a')}
                </Button>
                <Button
                  variant="quaternary"
                  align="left"
                  fullWidth
                  onClick={() => {
                    setSelectedItemType(MappableTypeEnum.BillableMetric)
                    closePopper()
                  }}
                >
                  {translate('text_623b497ad05b960101be3438')}
                </Button>
              </MenuPopper>
            )}
          </Popper>
        </div>

        {selectedItemType === MappableTypeEnum.AddOn && (
          <SearchInput
            onChange={debouncedSearchAddons}
            placeholder={translate('text_63bee4e10e2d53912bfe4db8')}
          />
        )}
        {selectedItemType === MappableTypeEnum.BillableMetric && (
          <SearchInput
            onChange={debouncedSearchBillableMetrics}
            placeholder={translate('text_63ba9ee977a67c9693f50aea')}
          />
        )}
      </div>

      {selectedItemType === SelectedItemTypeEnum.Default && (
        <AvalaraIntegrationItemsListDefault
          defaultItems={collectionMappingData?.integrationCollectionMappings?.collection}
          integrationId={integrationId}
          isLoading={collectionMappingLoading}
          hasError={!!collectionMappingError}
          avalaraIntegrationMapItemDialogRef={avalaraIntegrationMapItemDialogRef}
        />
      )}
      {selectedItemType === MappableTypeEnum.AddOn && (
        <AvalaraIntegrationItemsListAddons
          data={addonData}
          fetchMoreAddons={fetchMoreAddons}
          integrationId={integrationId}
          isLoading={isLoadingAddons}
          hasError={!!addonError}
          avalaraIntegrationMapItemDialogRef={avalaraIntegrationMapItemDialogRef}
          searchTerm={addonVariables?.searchTerm}
        />
      )}
      {selectedItemType === MappableTypeEnum.BillableMetric && (
        <AvalaraIntegrationItemsListBillableMetrics
          data={billableMetricsData}
          fetchMoreBillableMetrics={fetchMoreBillableMetrics}
          integrationId={integrationId}
          isLoading={isLoadingBillableMetrics}
          hasError={!!billableMetricsError}
          avalaraIntegrationMapItemDialogRef={avalaraIntegrationMapItemDialogRef}
          searchTerm={billableMetricsVariables?.searchTerm}
        />
      )}

      <AvalaraIntegrationMapItemDialog ref={avalaraIntegrationMapItemDialogRef} />
    </>
  )
}

export default AvalaraIntegrationItemsList
