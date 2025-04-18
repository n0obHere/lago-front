import { gql } from '@apollo/client'
import { useFormik } from 'formik'
import { forwardRef } from 'react'
import { object, string } from 'yup'

import { Button, Dialog, DialogRef } from '~/components/designSystem'
import { TextInputField } from '~/components/form'
import { addToast } from '~/core/apolloClient'
import { useUpdateOrganizationInvoiceTemplateMutation } from '~/generated/graphql'
import { useInternationalization } from '~/hooks/core/useInternationalization'

const MAX_CHAR_LIMIT = 600

gql`
  fragment EditOrganizationInvoiceTemplateDialog on CurrentOrganization {
    billingConfiguration {
      id
      invoiceFooter
    }
  }

  mutation updateOrganizationInvoiceTemplate($input: UpdateOrganizationInput!) {
    updateOrganization(input: $input) {
      id
      ...EditOrganizationInvoiceTemplateDialog
    }
  }
`

export type EditOrganizationInvoiceTemplateDialogRef = DialogRef

interface EditOrganizationInvoiceTemplateDialogProps {
  invoiceFooter: string
}

export const EditOrganizationInvoiceTemplateDialog = forwardRef<
  DialogRef,
  EditOrganizationInvoiceTemplateDialogProps
>(({ invoiceFooter }: EditOrganizationInvoiceTemplateDialogProps, ref) => {
  const { translate } = useInternationalization()
  const [updateOrganizationInvoiceTemplate] = useUpdateOrganizationInvoiceTemplateMutation({
    onCompleted(res) {
      if (res?.updateOrganization) {
        addToast({
          severity: 'success',
          translateKey: 'text_62bb10ad2a10bd182d002077',
        })
      }
    },
  })

  // Type is manually written here as errors type are not correclty read from UpdateOrganizationInput
  const formikProps = useFormik<{ billingConfiguration: { invoiceFooter: string } }>({
    initialValues: {
      billingConfiguration: { invoiceFooter },
    },
    validationSchema: object().shape({
      billingConfiguration: object().shape({
        invoiceFooter: string().max(600, 'text_62bb10ad2a10bd182d00203b'),
      }),
    }),
    enableReinitialize: true,
    validateOnMount: true,
    onSubmit: async (values) => {
      await updateOrganizationInvoiceTemplate({
        variables: {
          input: {
            ...values,
          },
        },
      })
    },
  })

  return (
    <Dialog
      ref={ref}
      title={translate('text_62bb10ad2a10bd182d00201d')}
      onClose={() => formikProps.resetForm()}
      actions={({ closeDialog }) => (
        <>
          <Button variant="quaternary" onClick={closeDialog}>
            {translate('text_62bb10ad2a10bd182d002031')}
          </Button>
          <Button
            variant="primary"
            disabled={!formikProps.isValid || !formikProps.dirty}
            onClick={async () => {
              await formikProps.submitForm()
              closeDialog()
            }}
          >
            {translate('text_62bb10ad2a10bd182d002037')}
          </Button>
        </>
      )}
    >
      <div className="mb-8">
        <TextInputField
          className="whitespace-pre-line"
          name="billingConfiguration.invoiceFooter"
          rows="4"
          multiline
          label={translate('text_62bb10ad2a10bd182d002023')}
          placeholder={translate('text_62bb10ad2a10bd182d00202b')}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          formikProps={formikProps}
          error={formikProps.errors?.billingConfiguration?.invoiceFooter}
          helperText={
            <div className="flex justify-between">
              <div className="flex-1">
                {!!formikProps.errors?.billingConfiguration?.invoiceFooter
                  ? translate('text_62bb10ad2a10bd182d00203b')
                  : translate('text_62bc52dd8536260acc9eb762')}
              </div>
              <div className="shrink-0">
                {formikProps.values.billingConfiguration?.invoiceFooter?.length}/{MAX_CHAR_LIMIT}
              </div>
            </div>
          }
        />
      </div>
    </Dialog>
  )
})

EditOrganizationInvoiceTemplateDialog.displayName = 'forwardRef'
