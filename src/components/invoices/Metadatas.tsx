import { gql } from '@apollo/client'
import { memo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import { Button, Typography } from '~/components/designSystem'
import {
  InvoiceMetadatasForMetadataDrawerFragmentDoc,
  useGetInvoiceMetadatasQuery,
} from '~/generated/graphql'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import { theme } from '~/styles'
import { SectionHeader } from '~/styles/customer'

import { AddMetadataDrawer, AddMetadataDrawerRef } from './AddMetadataDrawer'

gql`
  fragment CustomerMetadatasForInvoiceOverview on Customer {
    id
    metadata {
      id
      displayInInvoice
      key
      value
    }
  }

  fragment InvoiceMetadatasForInvoiceOverview on Invoice {
    id
    metadata {
      id
      key
      value
    }
  }

  query getInvoiceMetadatas($id: ID!) {
    invoice(id: $id) {
      id
      ...InvoiceMetadatasForInvoiceOverview
      ...InvoiceMetadatasForMetadataDrawer
      customer {
        ...CustomerMetadatasForInvoiceOverview
      }
    }
  }

  ${InvoiceMetadatasForMetadataDrawerFragmentDoc}
`

export const Metadatas = memo(() => {
  const { translate } = useInternationalization()
  const { invoiceId } = useParams()
  const addMetadataDrawerDialogRef = useRef<AddMetadataDrawerRef>(null)

  const { data, loading } = useGetInvoiceMetadatasQuery({
    variables: {
      id: invoiceId || '',
    },
  })

  const invoice = data?.invoice
  const customer = invoice?.customer

  const customerMetadatas = (customer?.metadata || []).filter((m) => m.displayInInvoice)

  if (loading) {
    return null
  }

  return (
    <>
      <Wrapper>
        <SectionHeader variant="subhead">
          {translate('text_6405cac5c833dcf18cad019c')}
          <Button
            variant="quaternary"
            align="left"
            onClick={() => {
              addMetadataDrawerDialogRef?.current?.openDrawer()
            }}
          >
            {translate(
              !!invoice?.metadata?.length
                ? 'text_6405cac5c833dcf18cad0198'
                : 'text_6405cac5c833dcf18cad0196',
            )}
          </Button>
        </SectionHeader>
        <div>
          {invoice?.metadata?.length ? (
            invoice?.metadata.map((metadata) => (
              <InfoLine key={`customer-metadata-${metadata.id}`}>
                <Typography variant="caption" color="grey600" noWrap>
                  {metadata.key}
                </Typography>
                <Typography variant="body" color="grey700">
                  {metadata.value}
                </Typography>
              </InfoLine>
            ))
          ) : (
            <Typography variant="body" color="grey500">
              {translate('text_6405cac5c833dcf18cad01a2')}
            </Typography>
          )}
        </div>
        {!!customerMetadatas.length && (
          <>
            <SectionHeader variant="subhead">
              {translate('text_63fdc195ee23e51024c607b8')}
            </SectionHeader>
            <div>
              {customerMetadatas.map((metadata) => (
                <InfoLine key={`customer-metadata-${metadata.id}`}>
                  <Typography variant="caption" color="grey600" noWrap>
                    {metadata.key}
                  </Typography>
                  <Typography variant="body" color="grey700">
                    {metadata.value}
                  </Typography>
                </InfoLine>
              ))}
            </div>
          </>
        )}
      </Wrapper>

      {invoice && <AddMetadataDrawer ref={addMetadataDrawerDialogRef} invoiceId={invoice?.id} />}
    </>
  )
})

Metadatas.displayName = 'Metadatas'

const Wrapper = styled.section`
  margin-top: ${theme.spacing(8)};

  > *:not(:last-child) {
    margin-bottom: ${theme.spacing(6)};
  }
`

const InfoLine = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: ${theme.spacing(3)};

  > div:first-child {
    min-width: 232px;
    margin-right: ${theme.spacing(3)};
    line-height: 28px;
  }

  > div:last-child {
    width: 100%;
    line-break: anywhere;
  }
`
