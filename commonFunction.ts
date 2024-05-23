import { BillPostingFilterFormFieldsProps, EditBillPostingDataProps } from '@/models/billPosting'
import { BlobServiceClient } from '@azure/storage-blob'
import { format, parse, subMonths } from 'date-fns'

import {
  ClassDrawerFormFieldsProps,
  DepartmentDrawerFormFieldsProps,
  LocationDrawerFormFieldsProps,
  ProjectDrawerFormFieldsProps,
} from '@/models/formFields'
import { Toast } from 'pq-ap-lib'

export const verifyAllFieldsValues = (
  formFields:
    | ProfileFormFieldsProps
    | SignInFormFieldsProps
    | ForgotPasswordFormFieldsProps
    | SetPasswordFormFieldsProps
    | ClassDrawerFormFieldsProps
    | DepartmentDrawerFormFieldsProps
    | LocationDrawerFormFieldsProps
    | ProjectDrawerFormFieldsProps
    | { [x: string]: string | number | null }
) => {
  let hasFieldsError: any = {}
  !!formFields &&
    Object.entries(formFields).forEach(([key, value]) => {
      if (value === null || (typeof value === 'string' && value.trim().length === 0) || value === 0 || value === "0") {
        hasFieldsError = { ...hasFieldsError, [key]: true }
      } else {
        hasFieldsError = { ...hasFieldsError, [key]: false }
      }
    })
  return hasFieldsError
}

export const validate = ({ ...hasFormFieldLibraryErrors }) => {
  if (Object.entries(hasFormFieldLibraryErrors).every(([key, value]) => value === true || key === 'Index')) {
    return true;
  } else {
    return false;
  }
}

const firstDayOfPreviousMonth = subMonths(new Date(), 1)
const formattedDate = format(firstDayOfPreviousMonth, 'yyyy-MM-dd')
const formattedCurrentDate = format(new Date(), 'yyyy-MM-dd')

const initialBillPostingFilterFormFields: BillPostingFilterFormFieldsProps = {
  ft_status: ['1', '2', '6', '8'],
  ft_assignee: '1',
  ft_select_users: [],
  ft_vendor: null,
  ft_datepicker: `${formattedDate} to ${formattedCurrentDate}`,
  ft_location: null,
}

// {
//   InProcess: 0,
//   New: 1,
//   Drafted: 2,
//   Sent: 3,
//   Approval Sent: 4,
//   Bill Approved: 5,
//   Bill Rejected: 6,
//   Bill Approval Requested: 7,
//   Bill Failed: 8,
//   Deleted: 9,
//   Bill Posted: 10,
//   Payment Approval Sent: 11,
//   Payment Approved: 12,
//   Payment Rejected: 13,
//   Payment On Hold: 14,
//   Selected For Payment: 15,
//   Paid: 16,
//   Partially Paid: 17,
//   Reversed: 18,
//   Reversal: 19,
//   Send Bill To Pay: 20,
// }
//NOTE :-Not use value 35 its used for ocr Done Status in Document Table
// SendBillToPay = 20 Need to change in Future

const billStatusEditable = [1, 2, 6, 8]

const hasToken = (router: any) => {
  const token = localStorage.getItem('token')
  if (token) {
    router.push('/profile')
  }
}

const hasNoToken = (router: any) => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/signin')
  }
}

function limitString(str: string, limit: number) {
  if (str.length <= limit) {
    return str
  } else {
    return str.substring(0, limit) + '...'
  }
}

function convertUTCtoLocal(utcTimeString: string) {
  const date = new Date(utcTimeString)

  const offset = date.getTimezoneOffset()

  const localDate = new Date(date.getTime() - offset * 60 * 1000)

  return localDate
}

const convertFractionToRoundValue = (value: any) => {
  let roundedRes = Math.round(parseFloat(value) * 100) / 100
  // if (isNaN(roundedRes)) {
  //   roundedValue = 0
  // }
  return String(roundedRes).slice(0, 13)
}

/* BILLPOSTING START */
const totalAmountCalculate = (data: any) => {
  let totalAmount = 0
  !!data &&
    data.map((item: EditBillPostingDataProps) => {
      let itemAmount = !!item?.amount && typeof item?.amount === 'string' ? parseFloat(item?.amount) : item?.amount
      let calculatedTotalAmount = totalAmount + (typeof itemAmount === 'number' ? itemAmount : parseFloat(`${itemAmount}`))
      totalAmount = isNaN(calculatedTotalAmount) ? 0 + totalAmount : calculatedTotalAmount
    })
  return totalAmount
}

const taxTotalAmountCalculate = (data: any) => {
  let taxTotalAmount = 0
  !!data &&
    data.map((item: EditBillPostingDataProps) => {
      let itemTaxAmount = !!item?.taxamount && typeof item?.taxamount === 'string' ? parseFloat(item?.taxamount) : item?.taxamount
      let calculatedTotalTaxAmount =
        taxTotalAmount + (typeof itemTaxAmount === 'number' ? itemTaxAmount : parseFloat(`${itemTaxAmount}`))
      taxTotalAmount = isNaN(calculatedTotalTaxAmount) ? 0 + taxTotalAmount : calculatedTotalTaxAmount
    })
  return taxTotalAmount
}

const getRoundValue = (amount: number) => {
  let roundedAmount = Math.round(amount * 100) / 100
  if (isNaN(roundedAmount)) {
    roundedAmount = 0
  }
  return roundedAmount
}

const getUpdatedDataFromDetailsResponse = (
  data: any,
  keyValueMainFieldObj: any,
  keyValueLineItemFieldObj: any,
  mainFieldListOptions: any,
  generateLinetItemFieldsErrorObj: any
) => {
  let updatedDataObj: any = {}
  let updatedDataErrorObj: any = {}
  let newLineItems: any = []
  let newLineItemsErrorObj: any = []

  if (!!data) {
    for (const [key, value] of Object.entries(data)) {
      const filterObject = keyValueMainFieldObj.find((d: any) => d.value === key)

      if (!filterObject) {
        continue
      }

      const currentDate = new Date()

      if (!!filterObject) {
        updatedDataObj = {
          ...updatedDataObj,
          [filterObject?.key]:
            filterObject?.key === 'date'
              ? !!data?.BillDate
                ? format(data?.BillDate, 'MM/dd/yyyy')
                : format(currentDate, 'MM/dd/yyyy')
              : filterObject?.key === 'duedate'
                ? !!data?.DueDate
                  ? format(data?.DueDate, 'MM/dd/yyyy')
                  : format(currentDate, 'MM/dd/yyyy')
                : filterObject?.key === 'glpostingdate'
                  ? !!data?.GlPostingDate
                    ? format(data?.GlPostingDate, 'MM/dd/yyyy')
                    : format(currentDate, 'MM/dd/yyyy')
                  : filterObject?.key === 'apbillreceiveddate'
                    ? !!data?.ApBillReceivedDate
                      ? format(data?.ApBillReceivedDate, 'MM/dd/yyyy')
                      : format(currentDate, 'MM/dd/yyyy')
                    : value,
        }

        const filteredMainFieldObj = mainFieldListOptions?.find((field: any) => field.Name === filterObject.key)

        if (filteredMainFieldObj?.IsRequired) {
          updatedDataErrorObj = {
            ...updatedDataErrorObj,
            [filterObject.key]: !!value
              ? true
              : filterObject?.key === 'date' ||
                filterObject?.key === 'duedate' ||
                filterObject?.key === 'glpostingdate' ||
                filterObject?.key === 'apbillreceiveddate'
                ? true
                : false,
          }
        }
      }
    }

    if (!!data?.LineItems) {
      newLineItems = data?.LineItems?.map((items: any, index: number) => {
        let updatedLineItemObj: any = {}
        for (const [key, value] of Object.entries(items)) {
          const filterLineItemObject = keyValueLineItemFieldObj.find((d: any) => d.value === key)

          if (!filterLineItemObject) {
            continue
          }

          if (!!filterLineItemObject) {
            updatedLineItemObj = {
              ...updatedLineItemObj,
              Index: index + 1,
              Id: items?.Id,
              [filterLineItemObject.key]: filterLineItemObject.key === 'releasetopay' && !value ? false : value,
            }
          }
        }
        return updatedLineItemObj
      })

      newLineItemsErrorObj = data?.LineItems?.map((items: any, index: number) => {
        let updatedLineItemErrorObj: any = {}
        for (const [key, value] of Object.entries(items)) {
          const filterLineItemObject = keyValueLineItemFieldObj.find((d: any) => d.value === key)

          if (!filterLineItemObject) {
            continue
          }

          if (!!filterLineItemObject && filterLineItemObject.key in generateLinetItemFieldsErrorObj) {
            updatedLineItemErrorObj = {
              ...updatedLineItemErrorObj,
              Index: index + 1,
              [filterLineItemObject.key]: !value ? false : true,
            }
          }
        }
        return updatedLineItemErrorObj
      })
    }
  }

  return {
    newLineItems,
    newLineItemsErrorObj,
    updatedDataObj,
    updatedDataErrorObj,
  }
}

const getViewUpdatedDataFromDetailsResponse = (
  data: any,
  keyValueMainFieldObj: any,
  keyValueLineItemFieldObj: any,
  vendorOptions: any,
  termOptions: any,
  locationOptions: any,
  accountOptions: any,
  classOptions: any,
  productServiceOptions: any,
  departmentOptions: any,
  productOptions: any,
  customerOptions: any
) => {
  let updatedDataObj: any = {}
  let newLineItems: any = []

  if (!!data) {
    for (const [key, value] of Object.entries(data)) {
      const filterObject = keyValueMainFieldObj.find((d: any) => d.value === key)

      if (!filterObject) {
        continue
      }

      const currentDate = new Date()

      let dropdownValue = ''
      switch (filterObject?.key) {
        case 'vendor':
          dropdownValue =
            !!value &&
            !!vendorOptions &&
            vendorOptions?.length > 0 &&
            vendorOptions.find((item: any) => item?.value === value)?.label
          break
        case 'from':
          dropdownValue =
            !!value &&
            !!vendorOptions &&
            vendorOptions?.length > 0 &&
            vendorOptions.find((item: any) => item?.value === value)?.label
          break
        case 'term':
          dropdownValue =
            !!value && !!termOptions && termOptions?.length > 0 && termOptions.find((item: any) => item.value === value).label
          break
        case 'location':
          dropdownValue =
            !!value &&
            !!locationOptions &&
            locationOptions?.length > 0 &&
            locationOptions.find((item: any) => item?.value === value)?.label
          break
        case 'payto':
          dropdownValue =
            !!value &&
            !!vendorOptions &&
            vendorOptions?.length > 0 &&
            vendorOptions.find((item: any) => item?.value === value)?.label
          break
        case 'returnto':
          dropdownValue =
            !!value &&
            !!vendorOptions &&
            vendorOptions?.length > 0 &&
            vendorOptions.find((item: any) => item?.value === value)?.label
          break
        case 'paymentpriority':
          const priorityOptions: any = [
            { label: 'Urgent', value: '1' },
            { label: 'High', value: '2' },
            { label: 'Medium', value: '3' },
            { label: 'Low', value: '4' },
          ]
          dropdownValue =
            !!value &&
            !!priorityOptions &&
            priorityOptions?.length > 0 &&
            priorityOptions.find((item: any) => item.value === value).label
          break
      }

      if (!!filterObject) {
        updatedDataObj = {
          ...updatedDataObj,
          [filterObject?.key]:
            filterObject?.key === 'date'
              ? !!data?.BillDate
                ? format(data?.BillDate, 'MM/dd/yyyy')
                : format(currentDate, 'MM/dd/yyyy')
              : filterObject?.key === 'duedate'
                ? !!data?.DueDate
                  ? format(data?.DueDate, 'MM/dd/yyyy')
                  : format(currentDate, 'MM/dd/yyyy')
                : filterObject?.key === 'glpostingdate'
                  ? !!data?.GlPostingDate
                    ? format(data?.GlPostingDate, 'MM/dd/yyyy')
                    : format(currentDate, 'MM/dd/yyyy')
                  : filterObject?.key === 'apbillreceiveddate'
                    ? !!data?.ApBillReceivedDate
                      ? format(data?.ApBillReceivedDate, 'MM/dd/yyyy')
                      : format(currentDate, 'MM/dd/yyyy')
                    : !!dropdownValue
                      ? dropdownValue
                      : value === true
                        ? 'Yes'
                        : value === false
                          ? 'No'
                          : filterObject?.options?.length > 0
                            ? filterObject?.options?.find((item: any) => item?.value == value)?.label
                            : value,
        }

      }
    }

    if (!!data?.LineItems) {
      newLineItems = data?.LineItems?.map((items: any, index: number) => {
        let updatedLineItemObj: any = {}
        for (const [key, value] of Object.entries(items)) {
          const filterLineItemObject = keyValueLineItemFieldObj.find((d: any) => d.value === key)

          if (!filterLineItemObject) {
            continue
          }

          let dropdownValue = ''
          switch (filterLineItemObject?.key) {
            case 'account':
              dropdownValue =
                !!value &&
                !!accountOptions &&
                accountOptions?.length > 0 &&
                accountOptions.find((item: any) => item?.value === value)?.label
              break
            case 'class':
              dropdownValue =
                !!value &&
                !!classOptions &&
                classOptions?.length > 0 &&
                classOptions.find((item: any) => item?.value === value)?.label
              break
            case 'location':
              dropdownValue =
                !!value &&
                !!locationOptions &&
                locationOptions?.length > 0 &&
                locationOptions.find((item: any) => item?.value === value)?.label
              break
            case 'project':
              dropdownValue =
                !!value &&
                !!productServiceOptions &&
                productServiceOptions?.length > 0 &&
                productServiceOptions.find((item: any) => item?.value === value)?.label
              break
            case 'department':
              dropdownValue =
                !!value &&
                !!departmentOptions &&
                departmentOptions?.length > 0 &&
                departmentOptions.find((item: any) => item?.value === value)?.label
              break
            case 'product':
              dropdownValue =
                !!value &&
                !!productOptions &&
                productOptions?.length > 0 &&
                productOptions.find((item: any) => item?.value === value)?.label
              break
            case 'customer':
              dropdownValue =
                !!value &&
                !!customerOptions &&
                customerOptions?.length > 0 &&
                customerOptions.find((item: any) => item?.value === value)?.label
              break
            case 'items':
              dropdownValue =
                !!value &&
                !!productOptions &&
                productOptions?.length > 0 &&
                productOptions.find((item: any) => item?.value === value)?.label
              break
          }

          if (!!filterLineItemObject) {
            updatedLineItemObj = {
              ...updatedLineItemObj,
              Index: index + 1,
              Id: items?.Id,
              [filterLineItemObject.key]: !!dropdownValue
                ? dropdownValue
                : value === true
                  ? 'Yes'
                  : value === false
                    ? 'No'
                    : filterLineItemObject?.options?.length > 0
                      ? filterLineItemObject?.options?.find((item: any) => item?.value == value)?.label
                      : value,
            }
          }
        }
        return updatedLineItemObj
      })

    }
  }

  return {
    newLineItems,
    updatedDataObj,
  }
}

const lineItemRemoveArr = (data: any, currentIndex: number) => {
  return (
    !!data &&
    data
      .filter((i: any) => i.Index !== currentIndex)
      .map((item: any, index: number) => {
        return {
          ...item,
          Index: index + 1,
        }
      })
  )
}

const getPDFUrl = async (
  FilePath: string,
  FileName: string,
  setPDFUrl: any,
  setImgUrl: any,
  setFileBlob: any,
  setIsPdfLoading: any,
  isNewWindowUpdate: any,
  currentWindow: any,
  openInNewWindow: any,
  setIsNewWindowUpdate: any
) => {
  if (!!FilePath) {
    const storageAccount = process.env.STORAGE_ACCOUNT
    const containerName: any = process.env.CONTAINER_NAME
    const sasToken = process.env.SAAS_TOKEN

    const fileExtension = FilePath?.split('.').pop()?.toLowerCase()

    const blobServiceClient = new BlobServiceClient(`https://${storageAccount}.blob.core.windows.net?${sasToken}`)
    const containerClient = blobServiceClient.getContainerClient(containerName)
    const blockBlobClient = containerClient?.getBlockBlobClient(FilePath)

    if (fileExtension && ['jpeg', 'png', 'jpg'].includes(fileExtension)) {
      setPDFUrl('')
      try {
        const downloadBlockBlobResponse = await blockBlobClient.download(0)

        if (downloadBlockBlobResponse.blobBody) {
          const blob = await downloadBlockBlobResponse.blobBody

          const contentType = downloadBlockBlobResponse.contentType
          const fileBlob = new Blob([blob], { type: contentType })
          const url = URL.createObjectURL(fileBlob)
          setImgUrl(url)
          setFileBlob(blob)
          setIsPdfLoading(false)

          if (!!isNewWindowUpdate && !!currentWindow) {
            openInNewWindow(blob, FileName)
            setIsNewWindowUpdate(false)
          }
        } else {
          setIsPdfLoading(false)
          console.error('Blob body is undefined')
        }
      } catch (error) {
        setIsPdfLoading(false)
        console.error('Error downloading blob:', error)
      }
    } else {
      !!setImgUrl && setImgUrl('')
      try {
        const downloadBlockBlobResponse = await blockBlobClient.download(0)

        if (downloadBlockBlobResponse.blobBody) {
          const blob = await downloadBlockBlobResponse.blobBody

          const contentType = downloadBlockBlobResponse.contentType
          const fileBlob = new Blob([blob], { type: contentType })
          const url = URL.createObjectURL(fileBlob)
          setPDFUrl(url)
          setFileBlob(blob)
          setIsPdfLoading(false)

          if (!!isNewWindowUpdate && !!currentWindow) {
            openInNewWindow(blob, FileName)
            setIsNewWindowUpdate(false)
          }
        } else {
          setIsPdfLoading(false)
          console.error('Blob body is undefined')
        }
      } catch (error) {
        setIsPdfLoading(false)
        console.error('Error downloading blob:', error)
      }
    }
  }
}

const returnKeyValueObjForFormFields = (MainFieldConfiguration: any, LineItemConfiguration: any) => {
  let keyValueMainFieldObj: any = []
  let keyValueLineItemFieldObj: any = []
  MainFieldConfiguration?.map((item: any) => {
    switch (item.Name) {
      case 'vendor':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'VendorId',
          options: item.Options,
        })
        return
      case 'from':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'VendorId',
          options: item.Options,
        })
        return
      case 'refrencenumber':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'ReferenceNumber',
          options: item.Options,
        })
        return
      case 'billnumber':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'BillNumber',
          options: item.Options,
        })
        return
      case 'total':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Amount',
          options: item.Options,
        })
        return
      case 'currency':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Currency',
          options: item.Options,
        })
        return
      case 'amountsare':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'AmountsAre',
          options: item.Options,
        })
        return
      case 'duedate':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'DueDate',
          options: item.Options,
        })
        return
      case 'pono':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'PoNumber',
          options: item.Options,
        })
        return
      case 'date':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'BillDate',
          options: item.Options,
        })
        return
      case 'term':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Term',
          options: item.Options,
        })
        return
      case 'location':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'LocationId',
          options: item.Options,
        })
        return
      case 'mailingaddress':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'MailingAddress',
          options: item.Options,
        })
        return
      case 'glpostingdate':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'GlPostingDate',
          options: item.Options,
        })
        return
      case 'payto':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'PayTo',
          options: item.Options,
        })
        return
      case 'returnto':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'ReturnTo',
          options: item.Options,
        })
        return
      case 'recommendedtopayon':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'RecommendedToPayOn',
          options: item.Options,
        })
        return
      case 'paymentpriority':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'PaymentPriority',
          options: item.Options,
        })
        return
      case 'description':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Description',
          options: item.Options,
        })
        return
      case 'placethisbillonhold':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'OnHold',
          options: item.Options,
        })
        return
      case 'missingdocument':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'MissingDocument',
          options: item.Options,
        })
        return
      case 'apbillreceiveddate':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'ApBillReceivedDate',
          options: item.Options,
        })
        return
      case 'podverification':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'PodVerification',
          options: item.Options,
        })
        return
      case 'return':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Return',
          options: item.Options,
        })
        return
      case 'fixedassets':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'FixedAssets',
          options: item.Options,
        })
        return
      case 'memo':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Memo',
          options: item.Options,
        })
        return
      case 'comment':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Comment',
          options: item.Options,
        })
        return
      case 'billstatus':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'BillStatus',
          options: item.Options,
        })
        return
      case 'adjustmentreferencenumber':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'AdjestmentReferenceNumber',
          options: item.Options,
        })
        return
      case 'permitno':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'PermitNo',
          options: item.Options,
        })
        return
      case 'custom1':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Custom1',
          options: item.Options,
        })
        return
      case 'custom2':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Custom2',
          options: item.Options,
        })
        return
      case 'custom3':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Custom3',
          options: item.Options,
        })
        return
      case 'custom4':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Custom4',
          options: item.Options,
        })
        return
      case 'custom5':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Custom5',
          options: item.Options,
        })
        return
      case 'custom6':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Custom6',
          options: item.Options,
        })
        return
      case 'custom7':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Custom7',
          options: item.Options,
        })
        return
      case 'custom8':
        keyValueMainFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Custom8',
          options: item.Options,
        })
        return
      default:
        return null
    }
  })

  LineItemConfiguration?.map((item: any) => {
    switch (item.Name) {
      case 'description':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Description',
          options: item.Options,
        })
        return
      case 'account':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Account',
          options: item.Options,
        })
        return
      case 'customer':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Customer',
          options: item.Options,
        })
        return
      case 'items':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Item',
          options: item.Options,
        })
        return
      case 'qty':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Quantity',
          options: item.Options,
        })
        return
      case 'rate':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Rate',
          options: item.Options,
        })
        return
      case 'taxrate':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'TaxRate',
          options: item.Options,
        })
        return
      case 'amount':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Amount',
          options: item.Options,
        })
        return
      case 'taxtotal':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'TaxTotal',
          options: item.Options,
        })
        return
      case 'total':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Total',
          options: item.Options,
        })
        return
      case 'billable':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Billable',
          options: item.Options,
        })
        return
      case 'tax':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Tax',
          options: item.Options,
        })
        return
      case 'product':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'ProductServiceId',
          options: item.Options,
        })
        return
      case 'salesamount':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'SalesAmount',
          options: item.Options,
        })
        return
      case 'markup':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Markup',
          options: item.Options,
        })
        return
      case 'memo':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Memo',
          options: item.Options,
        })
        return
      case 'location':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Location',
          options: item.Options,
        })
        return
      case '1099':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Form1099',
          options: item.Options,
        })
        return
      case 'job':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Job',
          options: item.Options,
        })
        return
      case 'project':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Project',
          options: item.Options,
        })
        return
      case 'department':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Department',
          options: item.Options,
        })
        return
      case 'class':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Class',
          options: item.Options,
        })
        return
      case 'productline':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'ProductLine',
          options: item.Options,
        })
        return
      case 'releasetopay':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'ReleaseToPay',
          options: item.Options,
        })
        return
      case 'division':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Divison',
          options: item.Options,
        })
        return
      case 'fund':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Fund',
          options: item.Options,
        })
        return
      case 'grant':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Grant',
          options: item.Options,
        })
        return
      case 'fas':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'FAS',
          options: item.Options,
        })
        return
      case 'approver':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Approver',
          options: item.Options,
        })
        return
      case 'taxamount':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'TaxAmount',
          options: item.Options,
        })
        return
      case 'total':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Total',
          options: item.Options,
        })
        return
      case 'salesamount':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'SalesAmount',
          options: item.Options,
        })
        return
      case 'custom1':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Custom1',
          options: item.Options,
        })
        return
      case 'custom2':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Custom2',
          options: item.Options,
        })
        return
      case 'custom3':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Custom3',
          options: item.Options,
        })
        return
      case 'custom4':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Custom4',
          options: item.Options,
        })
        return
      case 'custom5':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Custom5',
          options: item.Options,
        })
        return
      case 'custom6':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Custom6',
          options: item.Options,
        })
        return
      case 'custom7':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Custom7',
          options: item.Options,
        })
        return
      case 'custom8':
        keyValueLineItemFieldObj.push({
          key: item.Name,
          label: item.Label,
          value: 'Custom8',
          options: item.Options,
        })
        return
      default:
        return null
    }
  })

  return {
    keyValueMainFieldObj,
    keyValueLineItemFieldObj,
  }
}

const getTimeDifference = (createdOn: any) => {
  //TATStatus 1 for tat over
  //TATStatus 2 for 25% percent of api hours
  //TATStatus 3 for normal

  const createdDate = convertUTCtoLocal(createdOn)

  const apiHoursInSeconds = 24 * 3600
  const currentDate: Date = new Date()
  const secondsDifference = Math.floor((currentDate.getTime() - createdDate.getTime()) / 1000)


  var remainingSec = 86400 - secondsDifference // 86400 sec = 24 hours
  const twofivePercentOfTAT = apiHoursInSeconds * (25 / 100)
  const hours = Math.floor(remainingSec / 3600)
  const minutes = Math.round((remainingSec % 3600) / 60)
  if (hours === 23 && minutes === 60) {
    return {
      TATStatus: 3,
      value: '24:00',
    }
  }
  if (remainingSec < apiHoursInSeconds && remainingSec > 0) {
    if (remainingSec <= twofivePercentOfTAT) {
      return {
        TATStatus: 2,
        value: `${hours.toString().length > 1 ? hours : `0${hours}`}:${minutes.toString().length > 1 ? minutes : `0${minutes}`
          }`,
      }
    } else {
      return {
        TATStatus: 3,
        value: `${hours.toString().length > 1 ? hours : `0${hours}`}:${minutes.toString().length > 1 ? minutes : `0${minutes}`
          }`,
      }
    }
  } else {
    return {
      TATStatus: 1,
      value: '00:00',
    }
  }
}

interface FormField {
  [key: string]: any;
}

interface LineItemField {
  [key: string]: any;
}

interface FieldLibraryErrors {
  [key: string]: any;
}

interface ErrorObject {
  [key: string]: any;
}

// Function to process main form fields and get error values
function getNewErrorValues(errorsValues: ErrorObject, fieldLibraryErrors: FieldLibraryErrors): ErrorObject {
  let newErrorValues: ErrorObject = {};
  for (const [key, value] of Object.entries(errorsValues)) {
    if (fieldLibraryErrors.hasOwnProperty(key)) {
      newErrorValues[key] = value;
    }
  }
  return newErrorValues;
}

/*======================= Vallidation check on submit form ========================*/
// Function to process line item fields and get error values
function getNewLineItemErrorValues(
  lineItemsFieldsData: LineItemField[],
  disableFields: string[],
  fieldLibraryErrors: FieldLibraryErrors
): ErrorObject[] {
  let newLineItemErrorValues: ErrorObject[] = [];

  lineItemsFieldsData.forEach((item) => {
    const errorsLinetItemValues = verifyAllFieldsValues(item);

    if (disableFields.includes('rate')) delete errorsLinetItemValues.rate;
    if (disableFields.includes('qty')) delete errorsLinetItemValues.qty;

    let newLineItemErrorValuesObj: ErrorObject = {};
    for (const [key, value] of Object.entries(errorsLinetItemValues)) {
      if (fieldLibraryErrors.hasOwnProperty(key)) {
        newLineItemErrorValuesObj[key] = key === 'Index' ? item.Index : value;
      }
    }
    newLineItemErrorValues.push(newLineItemErrorValuesObj);
  });

  return newLineItemErrorValues;
}

// Function to validate line item fields and count errors
function countErrorsInItems(fieldLibraryErrors: FieldLibraryErrors[]): number {
  let errorInItems = 0;
  fieldLibraryErrors.forEach((fieldLibraryError) => {
    if (!validate(fieldLibraryError)) {
      errorInItems++;
    }
  });
  return errorInItems;
}

// Example usage of the above functions
function processFormAndLineItems(
  formFields: FormField,
  lineItemsFieldsData: LineItemField[],
  lineItemDisableFields: string[],
  hasFormFieldLibraryErrors: FieldLibraryErrors,
  hasLineItemFieldLibraryErrors: FieldLibraryErrors[],
  verifyAllFieldsValues: (fields: any) => ErrorObject
) {
  const errorsValues = verifyAllFieldsValues(formFields);
  const newErrorValues = getNewErrorValues(errorsValues, hasFormFieldLibraryErrors);

  const newLineItemErrorValues = getNewLineItemErrorValues(
    lineItemsFieldsData,
    lineItemDisableFields,
    hasLineItemFieldLibraryErrors
  );

  const errorInItems = countErrorsInItems(hasLineItemFieldLibraryErrors);

  return { newErrorValues, newLineItemErrorValues, errorInItems };
}
/*======================== Validation end on submit form ============================ */

/* on Submit start */
// Function to set loader state based on postSaveAs value
function setLoaderState(postSaveAs: number, loader: any, setLoader: any) {
  let newLoader;
  switch (postSaveAs) {
    case 12:
      newLoader = { ...loader, postAsPaid: true };
      break;
    case 2:
      newLoader = { ...loader, saveAsDraft: true };
      break;
    case 3:
      newLoader = { ...loader, post: true };
      break;
    default:
      break;
  }
  setLoader(newLoader);
}

// Function to handle form field errors
function handleFormFieldErrors(
  formFields: any,
  lineItemsFieldsData: any,
  lineItemDisableFields: string[],
  hasFormFieldLibraryErrors: any,
  hasLineItemFieldLibraryErrors: any[],
  setHasLineItemFieldErrors: any,
  setHasFormFieldErrors: any,
  verifyAllFieldsValues: (fields: any) => any,
  validate: (errors: any) => boolean,
  onErrorLoader: any,
  postSaveAs: number
) {
  const { newErrorValues, newLineItemErrorValues, errorInItems } = processFormAndLineItems(
    formFields,
    lineItemsFieldsData,
    lineItemDisableFields,
    hasFormFieldLibraryErrors,
    hasLineItemFieldLibraryErrors,
    verifyAllFieldsValues
  );

  setHasLineItemFieldErrors(newLineItemErrorValues);
  setHasFormFieldErrors(newErrorValues);

  if (!validate(hasFormFieldLibraryErrors)) {
    onErrorLoader(postSaveAs);
    Toast.error('Please add required fields.');
    return false;
  }

  if (errorInItems > 0) {
    onErrorLoader(postSaveAs);
    Toast.error('Please enter required field.');
    return false;
  }

  return true;
}

// Function to validate totals
function validateTotals(formFields: any, formattedTotalAmountValue: string, formattedTotalTaxAmountValue: string, onErrorLoader: any, postSaveAs: number) {
  const calculatedTotalAmount = formFields.amountsare === '1'
    ? parseFloat(formattedTotalAmountValue) + parseFloat(formattedTotalTaxAmountValue)
    : parseFloat(formattedTotalAmountValue);
  if (parseFloat(formFields.total) !== calculatedTotalAmount) {
    onErrorLoader(postSaveAs);
    Toast.error('The totals does not match.');
    return false;
  }
  return true;
}

// Function to validate attachments
function validateAttachments(formFields: any, onErrorLoader: any, postSaveAs: number) {
  const maxFileCount = 5;
  const maxFileSizeMB = 50;

  if (formFields?.attachment?.length > maxFileCount) {
    onErrorLoader(postSaveAs);
    Toast.error('You are only allowed to upload a maximum of 5 files at a time');
    return false;
  }

  let totalFileSizeMB = 0;
  for (const file of formFields?.attachment || []) {
    totalFileSizeMB += file.size / (1024 * 1024);
  }

  if (totalFileSizeMB > maxFileSizeMB) {
    onErrorLoader(postSaveAs);
    Toast.error(`Total file size exceeds the maximum limit of ${maxFileSizeMB} MB`);
    return false;
  }

  return true;
}

const parseAndFormatDate = (dateString: any) => {
  if (dateString) {
    const parsedDate = parse(dateString, 'MM/dd/yyyy', new Date())
    return format(parsedDate, 'yyyy-MM-dd HH:mm:ss.SSS')
  }
  return null
}

// Function to prepare account payable params
function prepareAccountPayableParams(formFields: any, formattedTotalAmountValue: string, formattedTotalTaxAmountValue: string, CompanyId: string, userId: any, processtype: any, vendorOptions: any, accountPayableObj: any, accountPayableAdditionalObj: any, accountPayableLineItemsObj: any, lineItemsFieldsData: any, postSaveAs: number) {
  const transactionDate = parseAndFormatDate(formFields?.date);
  const glPostingDate = parseAndFormatDate(formFields?.glpostingdate);
  const dueDate = parseAndFormatDate(formFields?.duedate);
  const apBillReceivedDate = parseAndFormatDate(formFields?.apbillreceiveddate);

  const vendorOption = vendorOptions.find((i: any) => i.value === (formFields?.from || formFields?.vendor));
  const vendorName = vendorOption ? vendorOption.label : null;

  const afterCalculateTotal = formFields.total || (formFields.amountsare === '1' ? formattedTotalAmountValue + formattedTotalTaxAmountValue : formattedTotalAmountValue);

  const params = {
    accountPayable: {
      ...accountPayableObj,
      CompanyId: parseInt(CompanyId),
      UserId: parseInt(userId),
      GlPostingDate: glPostingDate ?? null,
      ReferenceNumber: formFields?.refrencenumber ?? null,
      Description: formFields?.description ?? null,
      VendorId: !!formFields.hasOwnProperty('from') ? formFields?.from : formFields?.vendor ?? null,
      VendorName: vendorName ?? null,
      OnHold: formFields?.placethisbillonhold ? 1 : 0,
      FileName: null,
      Status: postSaveAs ?? null,
      Term: formFields?.term ?? null,
      PayTo: formFields?.payto ?? null,
      ReturnTo: formFields?.returnto ?? null,
      PaymentPriority: formFields?.paymentpriority ?? null,
      InvoiceNumber: !!formFields.hasOwnProperty('adjustmentnumber')
        ? formFields?.adjustmentnumber
        : formFields?.billnumber ?? null,
      Amount: afterCalculateTotal ?? null,
      DueAmount: afterCalculateTotal ?? null,
      DocumnetPath: null,
      ProviderType: 0,
      LocationId: 0,
      PageCount: 0,
      Size: 0,
      InvoiceDate: transactionDate ?? null,
      TransactionDate: transactionDate ?? null,
      DueDate: dueDate ?? null,
      TransactionType: parseInt(processtype) ?? null,
      GUID: null,
    },
    accountPayableAdditional: {
      ...accountPayableAdditionalObj,
      MailingAddress: formFields?.mailingaddress ?? null,
      MissingDocument: formFields?.missingdocument ?? null,
      ApBillReceiveDate: apBillReceivedDate ?? null,
      PodVerification: formFields?.podverification ?? null,
      Return: formFields?.return ?? null,
      FixedAssets: formFields?.fixedassets ?? null,
      Memo: formFields?.memo ?? null,
      Comment: formFields?.comment ?? null,
      AdjestmentReferenceNumber: formFields?.adjustmentreferencenumber ?? null,
      RecommendedToPayOn: formFields?.recommendedtopayon ?? null,
      PoNumber: formFields?.pono ?? null,
      Custom1: formFields?.custom1 ?? null,
      Custom2: formFields?.custom2 ?? null,
      Custom3: formFields?.custom3 ?? null,
      Custom4: formFields?.custom4 ?? null,
      Custom5: formFields?.custom5 ?? null,
      Custom6: formFields?.custom6 ?? null,
      Custom7: formFields?.custom7 ?? null,
      Custom8: formFields?.custom8 ?? null,
      AmountsAre: formFields?.amountsare ?? null,
      PermitNo: formFields?.permitno ?? null,
    },
    accountPayableLineItems: lineItemsFieldsData.map((item: any) => {
      const productAndServices = item.product?.includes('secondary') ? item.product.replace('-secondary', '') : item.product;
      const glAccount = item.product?.includes('primary') ? item.product.replace('-primary', '') : item.account;
      return {
        ...accountPayableLineItemsObj,
        Id: item.Id ?? 0,
        Description: item.description ?? null,
        GLAccountId: glAccount ?? null,
        CustomerId: item.customer ?? null,
        Item: item.item ?? null,
        Quantity: item.qty ?? null,
        Rate: item.rate ?? null,
        TaxRate: item.taxrate ?? null,
        Amount: item.amount ?? null,
        TaxAmount: item.taxamount ?? null,
        TaxTotal: item.taxtotal ?? null,
        Total: item.total ?? null,
        Billable: item.billable ?? null,
        Tax: item.tax ?? null,
        ProductServiceId: productAndServices ?? null,
        SalesAmount: item.salesamount ?? null,
        MarkupPer: item.markup ?? null,
        Memo: item.memo ?? null,
        Location: item.location ?? null,
        Form1099: item['1099'] ?? null,
        Job: item.job ?? null,
        Project: item.project ?? null,
        Department: item.department ?? null,
        ClassId: item.class ?? null,
        ProductLine: item.productline ?? null,
        ReleaseToPay: item.releasetopay ?? null,
        Division: item.division ?? null,
        Fund: item.fund ?? null,
        Grant: item.grant ?? null,
        FAS: item.fas ?? null,
        Approver: item.approver ?? null,
        Custom1: item.custom1 ?? null,
        Custom2: item.custom2 ?? null,
        Custom3: item.custom3 ?? null,
        Custom4: item.custom4 ?? null,
        Custom5: item.custom5 ?? null,
        Custom6: item.custom6 ?? null,
        Custom7: item.custom7 ?? null,
        Custom8: item.custom8 ?? null,
      };
    }),
  };

  return params;
}

/* on Submit stop */

/* BILLPOSTING START */

export {
  billStatusEditable,
  convertFractionToRoundValue,
  convertUTCtoLocal,
  getPDFUrl,
  getRoundValue, getTimeDifference, getUpdatedDataFromDetailsResponse,
  getViewUpdatedDataFromDetailsResponse,
  hasNoToken,
  hasToken,
  initialBillPostingFilterFormFields,
  limitString,
  lineItemRemoveArr,
  returnKeyValueObjForFormFields,
  taxTotalAmountCalculate,
  totalAmountCalculate,
  processFormAndLineItems,
  setLoaderState,
  handleFormFieldErrors,
  validateTotals,
  validateAttachments,
  prepareAccountPayableParams
}

