import { gql } from '@apollo/client'
import { Stack } from '@mui/material'
import { FormikProps } from 'formik'
import { RefObject, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { Accordion, Button, Chip, Icon, Tooltip, Typography } from '~/components/designSystem'
import { AmountInputField, ComboBox, ComboboxItem } from '~/components/form'
import { EditInvoiceDisplayNameRef } from '~/components/invoices/EditInvoiceDisplayName'
import { PremiumWarningDialogRef } from '~/components/PremiumWarningDialog'
import {
  MUI_INPUT_BASE_ROOT_CLASSNAME,
  SEARCH_TAX_INPUT_FOR_MIN_COMMITMENT_CLASSNAME,
} from '~/core/constants/form'
import { intlFormatNumber } from '~/core/formats/intlFormatNumber'
import {
  CommitmentTypeEnum,
  CurrencyEnum,
  useGetTaxesForCommitmentsLazyQuery,
} from '~/generated/graphql'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import { useCurrentUser } from '~/hooks/useCurrentUser'
import { NAV_HEIGHT, theme } from '~/styles'

import { mapChargeIntervalCopy } from './ChargeAccordion'
import { PlanFormInput } from './types'

gql`
  query getTaxesForCommitments($limit: Int, $page: Int) {
    taxes(limit: $limit, page: $page) {
      metadata {
        currentPage
        totalPages
      }
      collection {
        id
        ...TaxForPlanChargeAccordion
      }
    }
  }
`

type CommitmentsSectionProps = {
  editInvoiceDisplayNameRef: RefObject<EditInvoiceDisplayNameRef>
  formikProps: FormikProps<PlanFormInput>
  premiumWarningDialogRef: RefObject<PremiumWarningDialogRef>
}

export const CommitmentsSection = ({
  editInvoiceDisplayNameRef,
  formikProps,
  premiumWarningDialogRef,
}: CommitmentsSectionProps) => {
  const { isPremium } = useCurrentUser()
  const { translate } = useInternationalization()

  const [shouldDisplayTaxesInput, setShouldDisplayTaxesInput] = useState<boolean>(false)
  const [displayMinimumCommitment, setDisplayMinimumCommitment] = useState<boolean>(
    !isNaN(Number(formikProps.initialValues.minimumCommitment?.amountCents)),
  )

  const hasErrorInGroup = !!formikProps?.errors?.minimumCommitment

  const [getTaxes, { data: taxesData, loading: taxesLoading }] = useGetTaxesForCommitmentsLazyQuery(
    {
      variables: { limit: 500 },
    },
  )
  const { collection: taxesCollection } = taxesData?.taxes || {}

  const taxesDataForCombobox = useMemo(() => {
    if (!taxesCollection) return []

    const minCommitmentsTaxesIds =
      formikProps.values.minimumCommitment?.taxes?.map((tax) => tax.id) || []

    return taxesCollection.map(({ id: taxId, name, rate }) => {
      return {
        label: `${name} (${intlFormatNumber(Number(rate) / 100 || 0, {
          style: 'percent',
        })})`,
        labelNode: (
          <ComboboxItem>
            {name}&nbsp;
            <Typography color="textPrimary">
              (
              {intlFormatNumber(Number(rate) / 100 || 0, {
                style: 'percent',
              })}
              )
            </Typography>
          </ComboboxItem>
        ),
        value: taxId,
        disabled: minCommitmentsTaxesIds.includes(taxId),
      }
    })
  }, [formikProps.values.minimumCommitment?.taxes, taxesCollection])

  const taxValueForBadgeDisplay = useMemo((): string | undefined => {
    if (!formikProps?.values?.minimumCommitment?.taxes?.length) return

    return String(
      formikProps?.values?.minimumCommitment?.taxes?.reduce((acc, cur) => acc + cur.rate, 0),
    )
  }, [formikProps?.values?.minimumCommitment?.taxes])

  useEffect(() => {
    setDisplayMinimumCommitment(
      !isNaN(Number(formikProps.initialValues.minimumCommitment?.amountCents)),
    )
  }, [formikProps.initialValues.minimumCommitment?.amountCents])

  return (
    <Stack gap={4} alignItems="flex-start">
      <SectionTitle>
        <Typography variant="bodyHl" color="grey700">
          {translate('text_65d601bffb11e0f9d1d9f569')}
        </Typography>
        <Typography variant="caption" color="grey600">
          {translate('text_6661fc17337de3591e29e451', {
            interval: translate(
              mapChargeIntervalCopy(formikProps.values.interval, false),
            ).toLocaleLowerCase(),
          })}
        </Typography>
      </SectionTitle>
      {displayMinimumCommitment ? (
        <Accordion
          className="w-full"
          summary={
            <BoxHeader>
              <BoxHeaderGroupLeft>
                <Typography variant="bodyHl" color="grey700" noWrap>
                  {formikProps.values.minimumCommitment?.invoiceDisplayName ||
                    translate('text_65d601bffb11e0f9d1d9f569')}
                </Typography>
                <Tooltip title={translate('text_65018c8e5c6b626f030bcf8d')} placement="top-end">
                  <Button
                    icon="pen"
                    variant="quaternary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()

                      editInvoiceDisplayNameRef.current?.openDialog({
                        invoiceDisplayName:
                          formikProps.values.minimumCommitment?.invoiceDisplayName,
                        callback: (invoiceDisplayName: string) => {
                          formikProps.setFieldValue(
                            'minimumCommitment.invoiceDisplayName',
                            invoiceDisplayName,
                          )
                        },
                      })
                    }}
                  />
                </Tooltip>
              </BoxHeaderGroupLeft>

              <BoxHeaderGroupRight>
                <Tooltip
                  placement="top-end"
                  title={
                    hasErrorInGroup
                      ? translate('text_635b975ecea4296eb76924b7')
                      : translate('text_635b975ecea4296eb76924b1')
                  }
                >
                  <Icon
                    name="validate-filled"
                    className="flex items-center"
                    color={hasErrorInGroup ? 'disabled' : 'success'}
                  />
                </Tooltip>
                {!!taxValueForBadgeDisplay && (
                  <Chip
                    label={intlFormatNumber(Number(taxValueForBadgeDisplay) / 100 || 0, {
                      style: 'percent',
                    })}
                  />
                )}
                <Chip
                  label={translate(mapChargeIntervalCopy(formikProps.values.interval, false))}
                />
                <Tooltip placement="top-end" title={translate('text_63aa085d28b8510cd46443ff')}>
                  <Button
                    size="small"
                    icon="trash"
                    variant="quaternary"
                    onClick={() => {
                      formikProps.setFieldValue('minimumCommitment', {})
                      setDisplayMinimumCommitment(false)
                    }}
                  />
                </Tooltip>
              </BoxHeaderGroupRight>
            </BoxHeader>
          }
        >
          <Stack direction="column" spacing={6}>
            <AmountInputField
              name="minimumCommitment.amountCents"
              currency={formikProps.values.amountCurrency || CurrencyEnum.Usd}
              beforeChangeFormatter={['positiveNumber']}
              label={translate('text_65d601bffb11e0f9d1d9f571')}
              placeholder={translate('text_62a0b7107afa2700a65ef700')}
              formikProps={formikProps}
            />

            <div>
              <Typography className="mb-2" variant="captionHl" color="grey700">
                {translate('text_64be910fba8ef9208686a8e3')}
              </Typography>
              <Group>
                {!!formikProps?.values?.minimumCommitment?.taxes?.length && (
                  <InlineTaxesWrapper>
                    {formikProps?.values?.minimumCommitment?.taxes.map(
                      ({ id: localTaxId, name, rate }) => (
                        <Chip
                          key={localTaxId}
                          label={`${name} (${rate}%)`}
                          type="secondary"
                          size="medium"
                          deleteIcon="trash"
                          icon="percentage"
                          deleteIconLabel={translate('text_63aa085d28b8510cd46443ff')}
                          onDelete={() => {
                            const newTaxedArray =
                              formikProps?.values?.minimumCommitment?.taxes?.filter(
                                (tax) => tax.id !== localTaxId,
                              ) || []

                            formikProps.setFieldValue('minimumCommitment.taxes', newTaxedArray)
                          }}
                        />
                      ),
                    )}
                  </InlineTaxesWrapper>
                )}

                {shouldDisplayTaxesInput ? (
                  <InlineTaxInputWrapper>
                    <ComboBox
                      className={SEARCH_TAX_INPUT_FOR_MIN_COMMITMENT_CLASSNAME}
                      data={taxesDataForCombobox}
                      searchQuery={getTaxes}
                      loading={taxesLoading}
                      placeholder={translate('text_64be910fba8ef9208686a8e7')}
                      emptyText={translate('text_64be91fd0678965126e5657b')}
                      onChange={(newTaxId) => {
                        const previousTaxes = [
                          ...(formikProps?.values?.minimumCommitment?.taxes || []),
                        ]
                        const newTaxObject = taxesData?.taxes?.collection.find(
                          (t) => t.id === newTaxId,
                        )

                        formikProps.setFieldValue('minimumCommitment.taxes', [
                          ...previousTaxes,
                          newTaxObject,
                        ])
                        setShouldDisplayTaxesInput(false)
                      }}
                    />

                    <Tooltip placement="top-end" title={translate('text_63aa085d28b8510cd46443ff')}>
                      <Button
                        icon="trash"
                        variant="quaternary"
                        onClick={() => {
                          setShouldDisplayTaxesInput(false)
                        }}
                      />
                    </Tooltip>
                  </InlineTaxInputWrapper>
                ) : (
                  // Wrapping div to avoid the button to be full width, caused by the <Stack> parent
                  <div>
                    <Button
                      startIcon="plus"
                      variant="quaternary"
                      onClick={() => {
                        setShouldDisplayTaxesInput(true)

                        setTimeout(() => {
                          const element = document.querySelector(
                            `.${SEARCH_TAX_INPUT_FOR_MIN_COMMITMENT_CLASSNAME} .${MUI_INPUT_BASE_ROOT_CLASSNAME}`,
                          ) as HTMLElement

                          if (!element) return

                          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          element.click()
                        }, 0)
                      }}
                    >
                      {translate('text_64be910fba8ef9208686a8c9')}
                    </Button>
                  </div>
                )}
              </Group>
            </div>
          </Stack>
        </Accordion>
      ) : (
        <Button
          variant="quaternary"
          startIcon="plus"
          endIcon={isPremium ? undefined : 'sparkles'}
          disabled={displayMinimumCommitment}
          onClick={() => {
            if (isPremium) {
              // Add default minimum commitment to the plan
              formikProps.setFieldValue('minimumCommitment', {
                commitmentType: CommitmentTypeEnum.MinimumCommitment,
              })

              // Show the minimum commitment input
              setDisplayMinimumCommitment(true)
            } else {
              premiumWarningDialogRef.current?.openDialog()
            }
          }}
        >
          {translate('text_6661ffe746c680007e2df0e1')}
        </Button>
      )}
    </Stack>
  )
}

CommitmentsSection.displayName = 'CommitmentsSection'

const SectionTitle = styled.div`
  > div:not(:last-child) {
    margin-bottom: ${theme.spacing(1)};
  }
`

const BoxHeader = styled.div`
  /* Used to prevent long invoice display name to overflow */
  overflow: hidden;
  width: 100%;
  height: ${NAV_HEIGHT}px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing(3)};
`

const BoxHeaderGroupLeft = styled.div`
  /* Used to prevent long invoice display name to overflow */
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: ${theme.spacing(3)};
  /* Padding added to prevent overflow hidden to crop the focus ring */
  box-sizing: border-box;
  padding: ${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)} 0;
`

const BoxHeaderGroupRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing(3)};
`

const InlineTaxesWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing(3)};
  flex-wrap: wrap;
`

const InlineTaxInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing(3)};

  > *:first-child {
    flex: 1;
  }
`

const Group = styled.div`
  > div:not(:last-child) {
    margin-bottom: ${theme.spacing(4)};
  }
`
