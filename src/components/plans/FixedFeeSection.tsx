import { gql } from '@apollo/client'
import { InputAdornment } from '@mui/material'
import { FormikProps } from 'formik'
import { memo, RefObject, useEffect, useState } from 'react'
import styled from 'styled-components'

import { Accordion, Button, Card, Chip, Icon, Tooltip, Typography } from '~/components/designSystem'
import { AmountInputField, RadioGroupField, TextInputField } from '~/components/form'
import { EditInvoiceDisplayNameRef } from '~/components/invoices/EditInvoiceDisplayName'
import { FORM_TYPE_ENUM, getIntervalTranslationKey } from '~/core/constants/form'
import { getCurrencySymbol, intlFormatNumber } from '~/core/formats/intlFormatNumber'
import { CurrencyEnum } from '~/generated/graphql'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import { NAV_HEIGHT, theme } from '~/styles'

import { PlanFormInput } from './types'

gql`
  fragment PlanForFixedFeeSection on Plan {
    id
    amountCents
    payInAdvance
    trialPeriod
    invoiceDisplayName
  }
`

interface FixedFeeSectionProps {
  canBeEdited?: boolean
  isInSubscriptionForm?: boolean
  subscriptionFormType?: keyof typeof FORM_TYPE_ENUM
  editInvoiceDisplayNameRef: RefObject<EditInvoiceDisplayNameRef>
  formikProps: FormikProps<PlanFormInput>
  isEdition?: boolean
  isInitiallyOpen?: boolean
}

export const FixedFeeSection = memo(
  ({
    canBeEdited,
    isInSubscriptionForm,
    subscriptionFormType,
    editInvoiceDisplayNameRef,
    formikProps,
    isEdition,
    isInitiallyOpen,
  }: FixedFeeSectionProps) => {
    const { translate } = useInternationalization()
    const [shouldDisplayTrialPeriod, setShouldDisplayTrialPeriod] = useState(false)
    const hasErrorInSection =
      Boolean(formikProps.errors.amountCents) || formikProps.errors.amountCents === ''

    useEffect(() => {
      const initialTrialPeriod = formikProps?.initialValues?.trialPeriod || 0

      setShouldDisplayTrialPeriod(!isNaN(initialTrialPeriod) && initialTrialPeriod > 0)
    }, [formikProps.initialValues.trialPeriod])

    return (
      <Card>
        <SectionTitle>
          <Typography variant="subhead">{translate('text_642d5eb2783a2ad10d670336')}</Typography>
          <Typography variant="caption">
            {translate('text_6661fc17337de3591e29e3ed', {
              interval: translate(getIntervalTranslationKey[formikProps.values.interval]),
            })}
          </Typography>
        </SectionTitle>

        <Accordion
          noContentMargin
          initiallyOpen={isInitiallyOpen}
          summary={
            <BoxHeader>
              <BoxHeaderGroupLeft>
                <Typography noWrap variant="bodyHl" color="grey700">
                  {formikProps.values.invoiceDisplayName ||
                    translate('text_642d5eb2783a2ad10d670336')}
                </Typography>
                <Tooltip title={translate('text_65018c8e5c6b626f030bcf8d')} placement="top-end">
                  <Button
                    icon="pen"
                    variant="quaternary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()

                      editInvoiceDisplayNameRef.current?.openDialog({
                        invoiceDisplayName: formikProps.values.invoiceDisplayName,
                        callback: (invoiceDisplayName: string) => {
                          formikProps.setFieldValue('invoiceDisplayName', invoiceDisplayName)
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
                    hasErrorInSection
                      ? translate('text_635b975ecea4296eb76924b7')
                      : translate('text_635b975ecea4296eb76924b1')
                  }
                >
                  <Icon name="validate-filled" color={hasErrorInSection ? 'disabled' : 'success'} />
                </Tooltip>
                {!!formikProps.values?.taxes?.length && (
                  <Chip
                    label={intlFormatNumber(
                      Number(formikProps?.values?.taxes?.reduce((acc, cur) => acc + cur.rate, 0)) /
                        100 || 0,
                      {
                        style: 'percent',
                      },
                    )}
                  />
                )}
                <Chip label={translate(getIntervalTranslationKey[formikProps.values.interval])} />
              </BoxHeaderGroupRight>
            </BoxHeader>
          }
          data-test="fixed-fee-section-accordion"
        >
          <BoxContent>
            <AmountInputField
              name="amountCents"
              currency={formikProps.values.amountCurrency}
              beforeChangeFormatter={['positiveNumber']}
              label={translate('text_624453d52e945301380e49b6')}
              formikProps={formikProps}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {getCurrencySymbol(formikProps.values.amountCurrency || CurrencyEnum.Usd)}
                  </InputAdornment>
                ),
              }}
            />

            <RadioGroupField
              name="payInAdvance"
              label={translate('text_6682c52081acea90520743a8')}
              description={translate('text_6682c52081acea90520743aa')}
              formikProps={formikProps}
              disabled={isInSubscriptionForm || (isEdition && !canBeEdited)}
              optionLabelVariant="body"
              options={[
                {
                  label: translate('text_6682c52081acea90520743ac'),
                  value: false,
                },
                {
                  label: translate('text_6682c52081acea90520743ae'),
                  value: true,
                },
              ]}
            />

            <Group>
              <GroupTitle>
                <Typography variant="captionHl" color="textSecondary">
                  {translate('text_624453d52e945301380e49c2')}
                </Typography>
                <Typography variant="caption">
                  {translate('text_6661fc17337de3591e29e403')}
                </Typography>
              </GroupTitle>

              {shouldDisplayTrialPeriod ? (
                <InlineTrialPeriod>
                  <TextInputField
                    className="flex-1"
                    name="trialPeriod"
                    disabled={
                      subscriptionFormType === FORM_TYPE_ENUM.edition || (isEdition && !canBeEdited)
                    }
                    beforeChangeFormatter={['positiveNumber', 'int']}
                    placeholder={translate('text_624453d52e945301380e49c4')}
                    formikProps={formikProps}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {translate('text_624453d52e945301380e49c6')}
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Tooltip
                    placement="top-end"
                    title={translate('text_63aa085d28b8510cd46443ff')}
                    disableHoverListener={
                      subscriptionFormType === FORM_TYPE_ENUM.edition || (isEdition && !canBeEdited)
                    }
                  >
                    <Button
                      icon="trash"
                      variant="quaternary"
                      disabled={
                        subscriptionFormType === FORM_TYPE_ENUM.edition ||
                        (isEdition && !canBeEdited)
                      }
                      onClick={() => {
                        formikProps.setFieldValue('trialPeriod', null)
                        setShouldDisplayTrialPeriod(false)
                      }}
                    />
                  </Tooltip>
                </InlineTrialPeriod>
              ) : (
                <Button
                  startIcon="plus"
                  disabled={
                    subscriptionFormType === FORM_TYPE_ENUM.edition || (isEdition && !canBeEdited)
                  }
                  variant="quaternary"
                  data-test="show-trial-period"
                  onClick={() => setShouldDisplayTrialPeriod(true)}
                >
                  {translate('text_642d5eb2783a2ad10d670344')}
                </Button>
              )}
            </Group>
          </BoxContent>
        </Accordion>
      </Card>
    )
  },
)

FixedFeeSection.displayName = 'FixedFeeSection'

const SectionTitle = styled.div`
  > div:not(:last-child) {
    margin-bottom: ${theme.spacing(2)};
  }
`

const InlineTrialPeriod = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing(3)};
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

const BoxContent = styled.div`
  padding: ${theme.spacing(6)};

  > *:not(:last-child) {
    margin-bottom: ${theme.spacing(8)};
  }
`

const Group = styled.div`
  > div:not(:last-child) {
    margin-bottom: ${theme.spacing(4)};
  }
`

const GroupTitle = styled.div`
  > div:not(:last-child) {
    margin-bottom: ${theme.spacing(1)};
  }
`
