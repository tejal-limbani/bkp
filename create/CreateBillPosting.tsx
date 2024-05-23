'use client'

import { useParams, useRouter } from 'next/navigation'
import { RefObject, useEffect, useRef, useState } from 'react'

import { Button, CheckBox, DataTable, Datepicker, Select, Text, Toast, Tooltip, Typography } from 'pq-ap-lib'

import AddIcon from '@/assets/Icons/billposting/accountpayable/AddIcon'
import BackIcon from '@/assets/Icons/billposting/accountpayable/BackIcon'
import RemoveIcon from '@/assets/Icons/billposting/accountpayable/RemoveIcon'

import Wrapper from '@/components/Common/Wrapper'

import agent from '@/api/axios'
import PostaspaidModal from '@/app/bills/__components/PostaspaidModal'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import BillsControlFields from '@/components/Common/BillsControls/page'
import Editable from '@/components/Common/Editable'
import { accountPayableAdditionalObj, accountPayableLineItemsObj, accountPayableObj } from '@/data/billPosting'
import { EditBillPostingDataProps } from '@/models/billPosting'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { validate, verifyAllFieldsValues } from '@/utils'
import { convertFractionToRoundValue, getRoundValue, handleFormFieldErrors, lineItemRemoveArr, prepareAccountPayableParams, setLoaderState, taxTotalAmountCalculate, totalAmountCalculate, validateAttachments, validateTotals } from '@/utils/commonFunction'
import { format } from 'date-fns'

// Helper functions for validation
// const isValidQty = (value: any) => {
//     return !value.includes('.') && value.toString().length <= 3 && value >= 0 && value <= 500 && value !== '000' && value !== '00';
// };

// const isValidRate = (value: any) => {
//     return value.toString().length <= 10 && value >= 0;
// };

// const isValidAmount = (value: any) => {
//     return value >= 0;
// };

// // Helper functions to handle specific updates
// const handleTaxRateUpdate = (item: any, value: any) => {
//     const calculatedTaxAmount = (parseFloat(value) * parseFloat(item.amount)) / 100;
//     return {
//         taxamount: convertFractionToRoundValue(isNaN(calculatedTaxAmount) ? 0 : calculatedTaxAmount),
//         total: convertFractionToRoundValue(parseFloat(item.amount) + (isNaN(calculatedTaxAmount) ? 0 : calculatedTaxAmount)),
//     };
// };

// const handleProductUpdate = (item: any, value: any) => {
//     if (value.includes('primary')) {
//         setLineItemDisableFields(['rate', 'qty']);
//         updateFieldListOptions(['rate', 'qty'], false);
//         updateFieldErrors(['rate', 'qty'], false, true);
//         return {
//             rate: 0,
//             qty: 0,
//         };
//     } else {
//         setLineItemDisableFields(['amount']);
//         return {};
//     }
// };

// const handleBillableUpdate = (item: any, value: any) => {
//     if (!value) {
//         return {
//             markup: '',
//             salesamount: '',
//             tax: false,
//         };
//     }
//     return {};
// };

// const handleMarkupUpdate = (item: any, value: any) => {
//     const calculatedSalesAmount = parseFloat(item.amount) + (parseFloat(item.markup) / 100) * parseFloat(item.amount);
//     return {
//         billable: !!value ? true : false,
//         tax: !!value ? true : false,
//         salesamount: calculatedSalesAmount,
//     };
// };

// const calculateAmounts = (item: any, key: string, value: any) => {
//     const calculatedAmount = key === 'rate'
//         ? parseFloat(value) * parseFloat(item.qty)
//         : key === 'qty'
//             ? parseFloat(item.rate) * parseFloat(value)
//             : parseFloat(item.amount);
//     const calculatedTaxAmount = (parseFloat(item.taxrate) * parseFloat(`${calculatedAmount}`)) / 100;
//     const calculatedSalesAmount = parseFloat(`${calculatedAmount}`) + (parseFloat(item.markup) / 100) * parseFloat(`${calculatedAmount}`);

//     return {
//         amount: isNaN(parseFloat(`${calculatedAmount}`)) ? '0' : convertFractionToRoundValue(parseFloat(`${calculatedAmount}`)),
//         taxamount: convertFractionToRoundValue(isNaN(calculatedTaxAmount) ? 0 : calculatedTaxAmount),
//         total: convertFractionToRoundValue(calculatedAmount + (isNaN(calculatedTaxAmount) ? 0 : calculatedTaxAmount)),
//         salesamount: calculatedSalesAmount,
//     };
// };

// // Main function to update table field value
// const onChangeTableFieldValue = (currentIndex: any, value: any, key: string) => {
//     if (key === 'qty' && !isValidQty(value)) return;
//     if (key === 'rate' && !isValidRate(value)) return;
//     if (key === 'amount' && !isValidAmount(value)) return;

//     const fractionColumn = ['rate', 'taxamount', 'amount', 'total'];
    
//     const newArr: EditBillPostingDataProps[] =
//         lineItemsFieldsData?.map((item: any) => {
//             if (item.Index === currentIndex) {
//                 let updates = {};

//                 if (key === 'taxrate') {
//                     updates = handleTaxRateUpdate(item, value);
//                 } else if (key === 'product') {
//                     updates = handleProductUpdate(item, value);
//                 } else if (key === 'billable') {
//                     updates = handleBillableUpdate(item, value);
//                 } else if (key === 'markup') {
//                     updates = handleMarkupUpdate(item, value);
//                 } else {
//                     updates = calculateAmounts(item, key, value);
//                 }

//                 return {
//                     ...item,
//                     [key]: fractionColumn.includes(key) ? convertFractionToRoundValue(value) : value,
//                     ...updates,
//                 };
//             }
//             return item;
//         });

//     setLineItemsFieldsData(newArr);
// };

// // Helper functions for updating field options and errors
// const updateFieldListOptions = (fields: string[], isRequired: boolean) => {
//     const newLineItemFieldListOptions: any =
//         lineItemFieldListOptions?.map((item: any) => {
//             if (fields.includes(item.Name)) {
//                 return {
//                     ...item,
//                     IsRequired: isRequired,
//                 };
//             }
//             return item;
//         });
//     setLineItemFieldListOptions(newLineItemFieldListOptions);
// };

// const updateFieldErrors = (fields: string[], hasFieldErrors: boolean, hasFieldLibraryErrors: boolean) => {
//     const newHasFieldErrors = hasLineItemFieldErrors.map((item) => {
//         let updatedItem = { ...item };
//         fields.forEach((field) => {
//             updatedItem[field] = hasFieldErrors;
//         });
//         return updatedItem;
//     });
//     const newHasFieldLibraryErrors = hasLineItemFieldLibraryErrors.map((item) => {
//         let updatedItem = { ...item };
//         fields.forEach((field) => {
//             updatedItem[field] = hasFieldLibraryErrors;
//         });
//         return updatedItem;
//     });
//     setHasLineItemFieldErrors(newHasFieldErrors);
//     setHasLineItemFieldLibraryErrors(newHasFieldLibraryErrors);
// };


const CreateBillPosting = ({
    vendorOptions,
    termOptions,
    defaultTermOptions,
    accountOptions,
    classOptions,
    productServiceOptions,
    customerOptions,
    projectOptions,
    departmentOptions,
    locationOptions,
    processOptions,
    statusOptions,
    userOptions,
    fieldMappingConfigurations,
    generateFormFields,
    generateFormFieldsErrorObj,
    generateLinetItemFieldsErrorObj,
    lineItemFieldColumns,
    lineItemsFieldsDataObj,
}: any) => {
    const [formFields, setFormFields] = useState<{ [x: string]: string | number | null | any }>({})

    const mainFieldListOptions = fieldMappingConfigurations?.ComapnyConfigList?.MainFieldConfiguration
    const [lineItemFieldListOptions, setLineItemFieldListOptions] = useState(
        fieldMappingConfigurations?.ComapnyConfigList?.LineItemConfiguration
    )

    const [postaspaidModal, setPostaspaidModal] = useState<boolean>(false)
    const [lineItemsFieldsData, setLineItemsFieldsData] = useState<EditBillPostingDataProps[] | any>([])

    const [hasFormFieldErrors, setHasFormFieldErrors] = useState<{ [x: string]: boolean }>({})
    const [hasFormFieldLibraryErrors, setHasFormFieldLibraryErrors] = useState<{ [x: string]: boolean }>({})
    const [hasLineItemFieldErrors, setHasLineItemFieldErrors] = useState<Array<{ [x: string]: boolean }>>([])
    const [hasLineItemFieldLibraryErrors, setHasLineItemFieldLibraryErrors] = useState<Array<{ [x: string]: boolean }>>([])

    const [hoveredRow, setHoveredRow] = useState<any>({})

    const [tableDynamicWidth, setTableDynamicWidth] = useState('laptopMd:w-[calc(100vw-255px)]')

    const [lineItemDisableFields, setLineItemDisableFields] = useState<any>(['amount'])

    const [isSubmitClick, setIsSubmitClick] = useState<boolean>(false)

    const [loader, setLoader] = useState<any>({
        postAsPaid: false,
        saveAsDraft: false,
        post: false,
    })

    const params = useParams()
    const router = useRouter()
    const dispatch = useAppDispatch()

    const inputRef: RefObject<HTMLInputElement> = useRef(null)

    const processtype = params?.processtype
    const userId = localStorage.getItem('UserId')

    const { selectedCompany } = useAppSelector((state) => state.user)
    const { isLeftSidebarCollapsed } = useAppSelector((state) => state.auth)
    const CompanyId = selectedCompany?.value
    const AccountingTool = selectedCompany?.accountingTool

    let totalAmount = totalAmountCalculate(lineItemsFieldsData)
    let taxTotalAmount = taxTotalAmountCalculate(lineItemsFieldsData)

    const formattedTotalAmountValue = String(getRoundValue(totalAmount)).slice(0, 13)
    const formattedTotalTaxAmountValue = String(getRoundValue(taxTotalAmount)).slice(0, 13)

    useEffect(() => {
        if (!!isLeftSidebarCollapsed) {
            setTableDynamicWidth('laptopMd:w-[calc(100vw-95px)]')
        } else {
            setTableDynamicWidth('laptopMd:w-[calc(100vw-230px)]')
        }
    }, [isLeftSidebarCollapsed])

    const onLineItemAdd = () => {
        setIsSubmitClick(true)

        let newLineItemErrorValues: any = []

        lineItemsFieldsData.map((item: any) => {
            const errorsLinetItemValues = verifyAllFieldsValues(item)
            let newLineItemErrorValuesObj: any = {}
            for (const [key, value] of Object.entries(errorsLinetItemValues)) {
                if (generateLinetItemFieldsErrorObj.hasOwnProperty(key)) {
                    newLineItemErrorValuesObj = {
                        ...newLineItemErrorValuesObj,
                        [key]: key === 'Index' ? item.Index : value,
                    }
                }
            }
            newLineItemErrorValues.push(newLineItemErrorValuesObj)
        })

        let errorInItems = 0
        hasLineItemFieldLibraryErrors.map((fieldLibraryErrors) => {
            if (!validate(fieldLibraryErrors)) {
                errorInItems++
            } else {
                errorInItems = 0
            }
        })

        setHasLineItemFieldErrors(newLineItemErrorValues)
        if (errorInItems > 0) {
            Toast.error('Please enter required field.')
            return
        } else {
            setIsSubmitClick(false)
            setLineItemsFieldsData([
                ...lineItemsFieldsData,
                {
                    Index: !!lineItemsFieldsData && lineItemsFieldsData[lineItemsFieldsData.length - 1].Index + 1,
                    ...lineItemsFieldsDataObj,
                },
            ])
            setHasLineItemFieldErrors([
                ...hasLineItemFieldErrors,
                {
                    ...generateLinetItemFieldsErrorObj,
                    Index: !!lineItemsFieldsData && lineItemsFieldsData[lineItemsFieldsData.length - 1].Index + 1,
                },
            ])
            setHasLineItemFieldLibraryErrors([
                ...hasLineItemFieldLibraryErrors,
                {
                    ...generateLinetItemFieldsErrorObj,
                    Index: !!lineItemsFieldsData && lineItemsFieldsData[lineItemsFieldsData.length - 1].Index + 1,
                },
            ])
        }
    }

    const onLineItemRemove = (currentIndex: number) => {
        const dataAfterRemoveItem = lineItemRemoveArr(lineItemsFieldsData, currentIndex)
        const dataAfterRemoveFormFieldErrors = lineItemRemoveArr(hasLineItemFieldErrors, currentIndex)
        const dataAfterRemoveFormFieldLibraryErrors = lineItemRemoveArr(hasLineItemFieldLibraryErrors, currentIndex)

        setLineItemsFieldsData(dataAfterRemoveItem)
        setHasLineItemFieldErrors(dataAfterRemoveFormFieldErrors)
        setHasLineItemFieldLibraryErrors(dataAfterRemoveFormFieldLibraryErrors)
    }

    const onChangeTableFieldValue = (currentIndex: any, value: any, key: string) => {
        if (key === 'qty') {
            if (value.includes('.') || value.toString().length > 3 || value < 0 || value > 500 || value === '000' || value === '00') {
                return
            }
        }

        if (key === 'rate') {
            const valueWithoutDecimal = value.toString()
            if (valueWithoutDecimal.length > 10 || value < 0) {
                return
            }
        }

        if (key === 'amount' && value < 0) {
            return
        }

        const fractionColumn = ['rate', 'taxamount', 'amount', 'total']

        const newArr: EditBillPostingDataProps[] =
            !!lineItemsFieldsData &&
            lineItemsFieldsData.map((i: any) => {
                if (i.Index === currentIndex) {
                    if (!!i.rate && !!i.qty) {
                        if (key === 'taxrate') {
                            const calculatedTaxAmount = (parseFloat(value) * parseFloat(i.amount)) / 100
                            return {
                                ...i,
                                [key]: fractionColumn.includes(key) ? convertFractionToRoundValue(value) : value,
                                ...(lineItemsFieldsDataObj.hasOwnProperty('taxamount')
                                    ? { taxamount: convertFractionToRoundValue(isNaN(calculatedTaxAmount) ? 0 : calculatedTaxAmount) }
                                    : {}),
                                ...(lineItemsFieldsDataObj.hasOwnProperty('total')
                                    ? {
                                        total: convertFractionToRoundValue(
                                            parseFloat(i.amount) + (isNaN(calculatedTaxAmount) ? 0 : calculatedTaxAmount)
                                        ),
                                    }
                                    : {}),
                            }
                        }

                        if (key === 'product') {
                            if (value.includes('primary')) {
                                setLineItemDisableFields(['rate', 'qty'])
                                const newLineItemFieldListOptions: any =
                                    !!lineItemFieldListOptions &&
                                    lineItemFieldListOptions.map((item: any) => {
                                        if (item.Name === 'rate' || item.Name === 'qty') {
                                            return {
                                                ...item,
                                                IsRequired: false,
                                            }
                                        } else {
                                            return item
                                        }
                                    })
                                const newHasFieldErrors = hasLineItemFieldErrors.map((item) => {
                                    return {
                                        ...item,
                                        ...(item.hasOwnProperty('qty') ? { qty: false } : {}),
                                        ...(item.hasOwnProperty('rate') ? { rate: false } : {}),
                                    }
                                })
                                const newHasFieldLibraryErrors = hasLineItemFieldLibraryErrors.map((item) => {
                                    return {
                                        ...item,
                                        ...(item.hasOwnProperty('qty') ? { qty: true } : {}),
                                        ...(item.hasOwnProperty('rate') ? { rate: true } : {}),
                                    }
                                })
                                setHasLineItemFieldErrors(newHasFieldErrors)
                                setHasLineItemFieldLibraryErrors(newHasFieldLibraryErrors)
                                setLineItemFieldListOptions(newLineItemFieldListOptions)
                                return {
                                    ...i,
                                    [key]: value,
                                    rate: 0,
                                    qty: 0,
                                }
                            } else {
                                setLineItemDisableFields(['amount'])
                                return {
                                    ...i,
                                    [key]: value,
                                }
                            }
                        }

                        if (key === 'billable' && !value) {
                            return {
                                ...i,
                                [key]: value,
                                ...(lineItemsFieldsDataObj.hasOwnProperty('markup') ? { markup: '' } : {}),
                                ...(lineItemsFieldsDataObj.hasOwnProperty('salesamount') ? { salesamount: '' } : {}),
                                ...(lineItemsFieldsDataObj.hasOwnProperty('tax') ? { tax: false } : {}),
                            }
                        }

                        if (key === 'markup') {
                            const calculatedSalesAmount = parseFloat(i.amount) + (parseFloat(i.markup) / 100) * parseFloat(i.amount)
                            return {
                                ...i,
                                [key]: value,
                                ...(lineItemsFieldsDataObj.hasOwnProperty('billable') ? { billable: !!value ? true : false } : {}),
                                ...(lineItemsFieldsDataObj.hasOwnProperty('tax') ? { tax: !!value ? true : false } : {}),
                                ...(lineItemsFieldsDataObj.hasOwnProperty('salesamount') ? { salesamount: calculatedSalesAmount } : {}),
                            }
                        }

                        const calculatedAmount =
                            key === 'rate'
                                ? parseFloat(value) * parseFloat(i.qty)
                                : key === 'qty'
                                    ? parseFloat(i.rate) * parseFloat(value)
                                    : parseFloat(i.amount)
                        const calculatedTaxAmount = (parseFloat(i.taxrate) * parseFloat(`${calculatedAmount}`)) / 100
                        const calculatedSalesAmount =
                            parseFloat(`${calculatedAmount}`) + (parseFloat(i.markup) / 100) * parseFloat(`${calculatedAmount}`)
                        return {
                            ...i,
                            [key]: fractionColumn.includes(key) ? convertFractionToRoundValue(value) : value,
                            amount: isNaN(parseFloat(`${calculatedAmount}`))
                                ? '0'
                                : convertFractionToRoundValue(parseFloat(`${calculatedAmount}`)),
                            ...(lineItemsFieldsDataObj.hasOwnProperty('taxamount')
                                ? { taxamount: convertFractionToRoundValue(isNaN(calculatedTaxAmount) ? 0 : calculatedTaxAmount) }
                                : {}),
                            ...(lineItemsFieldsDataObj.hasOwnProperty('total')
                                ? {
                                    total: convertFractionToRoundValue(calculatedAmount + (isNaN(calculatedTaxAmount) ? 0 : calculatedTaxAmount)),
                                }
                                : {}),
                            ...(lineItemsFieldsDataObj.hasOwnProperty('salesamount') ? { salesamount: calculatedSalesAmount } : {}),
                        }
                    } else {
                        if (key === 'taxrate') {
                            const calculatedTaxAmount = (parseFloat(value) * parseFloat(i.amount)) / 100
                            return {
                                ...i,
                                [key]: fractionColumn.includes(key) ? convertFractionToRoundValue(value) : value,
                                ...(lineItemsFieldsDataObj.hasOwnProperty('taxamount')
                                    ? {
                                        taxamount: !!calculatedTaxAmount
                                            ? convertFractionToRoundValue(isNaN(calculatedTaxAmount) ? 0 : calculatedTaxAmount)
                                            : '0',
                                    }
                                    : {}),
                                ...(lineItemsFieldsDataObj.hasOwnProperty('total')
                                    ? {
                                        total: convertFractionToRoundValue(
                                            parseFloat(i.amount) + (isNaN(calculatedTaxAmount) ? 0 : calculatedTaxAmount)
                                        ),
                                    }
                                    : {}),
                            }
                        }

                        if (key === 'product') {
                            if (value.includes('primary')) {
                                setLineItemDisableFields(['rate', 'qty'])
                                const newLineItemFieldListOptions: any =
                                    !!lineItemFieldListOptions &&
                                    lineItemFieldListOptions.map((item: any) => {
                                        if (item.Name === 'rate' || item.Name === 'qty') {
                                            return {
                                                ...item,
                                                IsRequired: false,
                                            }
                                        } else {
                                            return item
                                        }
                                    })
                                const newHasFieldErrors = hasLineItemFieldErrors.map((item) => {
                                    return {
                                        ...item,
                                        ...(item.hasOwnProperty('qty') ? { qty: false } : {}),
                                        ...(item.hasOwnProperty('rate') ? { rate: false } : {}),
                                    }
                                })
                                const newHasFieldLibraryErrors = hasLineItemFieldLibraryErrors.map((item) => {
                                    return {
                                        ...item,
                                        ...(item.hasOwnProperty('qty') ? { qty: true } : {}),
                                        ...(item.hasOwnProperty('rate') ? { rate: true } : {}),
                                    }
                                })
                                setHasLineItemFieldErrors(newHasFieldErrors)
                                setHasLineItemFieldLibraryErrors(newHasFieldLibraryErrors)
                                setLineItemFieldListOptions(newLineItemFieldListOptions)
                                return {
                                    ...i,
                                    [key]: value,
                                    rate: 0,
                                    qty: 0,
                                }
                            } else {
                                setLineItemDisableFields(['amount'])
                                return {
                                    ...i,
                                    [key]: value,
                                }
                            }
                        }

                        if (key === 'billable' && !value) {
                            return {
                                ...i,
                                [key]: value,
                                ...(lineItemsFieldsDataObj.hasOwnProperty('markup') ? { markup: '' } : {}),
                                ...(lineItemsFieldsDataObj.hasOwnProperty('salesamount') ? { salesamount: '' } : {}),
                                ...(lineItemsFieldsDataObj.hasOwnProperty('tax') ? { tax: false } : {}),
                            }
                        }

                        if (key === 'markup') {
                            const calculatedSalesAmount = parseFloat(i.amount) + (parseFloat(i.markup) / 100) * parseFloat(i.amount)
                            return {
                                ...i,
                                [key]: value,
                                ...(lineItemsFieldsDataObj.hasOwnProperty('billable') ? { billable: !!value ? true : false } : {}),
                                ...(lineItemsFieldsDataObj.hasOwnProperty('tax') ? { tax: !!value ? true : false } : {}),
                                ...(lineItemsFieldsDataObj.hasOwnProperty('salesamount') ? { salesamount: calculatedSalesAmount } : {}),
                            }
                        }

                        const calculatedAmount =
                            key === 'rate' && !!i.qty
                                ? parseFloat(value) * parseFloat(i.qty)
                                : key === 'qty' && !!i.rate
                                    ? parseFloat(i.rate) * parseFloat(value)
                                    : !!i.rate && !!i.qty
                                        ? parseFloat(i.rate) * parseFloat(i.qty)
                                        : key === 'amount'
                                            ? parseFloat(value)
                                            : parseFloat(i.amount)
                        const calculatedTaxAmount = (parseFloat(i.taxrate) * parseFloat(`${calculatedAmount}`)) / 100
                        const calculatedSalesAmount =
                            parseFloat(`${calculatedAmount}`) + (parseFloat(i.markup) / 100) * parseFloat(`${calculatedAmount}`)
                        return {
                            ...i,
                            [key]: fractionColumn.includes(key) ? convertFractionToRoundValue(value) : value,
                            amount: isNaN(parseFloat(`${calculatedAmount}`)) ? '0' : convertFractionToRoundValue(`${calculatedAmount}`),
                            ...(lineItemsFieldsDataObj.hasOwnProperty('taxamount')
                                ? { taxamount: convertFractionToRoundValue(isNaN(calculatedTaxAmount) ? 0 : calculatedTaxAmount) }
                                : {}),
                            ...(lineItemsFieldsDataObj.hasOwnProperty('total')
                                ? {
                                    total: convertFractionToRoundValue(calculatedAmount + (isNaN(calculatedTaxAmount) ? 0 : calculatedTaxAmount)),
                                }
                                : {}),
                            ...(lineItemsFieldsDataObj.hasOwnProperty('salesamount') ? { salesamount: calculatedSalesAmount } : {}),
                        }
                    }
                }
                return i
            })

        setLineItemsFieldsData(newArr)
    }

    const renderField = (fieldName: any, d: any, field: any) => {
        const currentRowHasLineItemFieldErrorsObj: any = hasLineItemFieldErrors.find((item) => item.Index === d.Index)

        switch (field.FieldType) {
            case 'text':
                let isDisabled =
                    fieldName === 'total' ||
                        fieldName === 'taxamount' ||
                        fieldName === 'salesamount' ||
                        (fieldName === 'amount' &&
                            lineItemsFieldsDataObj.hasOwnProperty('rate') &&
                            lineItemsFieldsDataObj.hasOwnProperty('qty') &&
                            lineItemDisableFields.includes('amount')) ||
                        (fieldName === 'rate' && lineItemDisableFields.includes('rate')) ||
                        (fieldName === 'qty' && lineItemDisableFields.includes('qty'))
                        ? true
                        : false

                return (
                    <Editable
                        text={
                            fieldName === 'amount'
                                ? d?.amount === 0 || d?.amount === null || d?.amount === ''
                                    ? `$${0}`
                                    : `$${d?.amount}`
                                : (fieldName === 'rate' && !!d.rate) ||
                                    (fieldName === 'taxamount' && !!d.taxamount) ||
                                    (fieldName === 'total' && !!d.total)
                                    ? (fieldName === 'rate' || fieldName === 'taxamount' || fieldName === 'total') && isNaN(d[fieldName])
                                        ? `$${0}`
                                        : `$${d[fieldName]}`
                                    : d[fieldName]
                        }
                        placeholder={`Enter ${fieldName}`}
                        type='input'
                        childRef={inputRef}
                        borderClassName={`
              ${!!currentRowHasLineItemFieldErrorsObj && currentRowHasLineItemFieldErrorsObj[fieldName]
                                ? '!text-[#DC3545] border-none'
                                : ''
                            }
              ${isDisabled ? 'bg-[#F4F4F4] w-full opacity-75 pointer-events-none' : ''} 
              ${hoveredRow?.Index === d.Index ? 'cursor-pointer w-full border-b border-solid border-[#b6b6bc]' : ''} 
              ${fieldName === 'qty' || fieldName === 'rate' || fieldName === 'amount' ? 'text-right' : ''}
            `}
                    >
                        <span className='textError'>
                            <Text
                                validate={field.IsRequired}
                                inputRef={inputRef}
                                type={
                                    fieldName === 'qty' || fieldName === 'rate' || fieldName === 'amount' || fieldName === 'markup'
                                        ? 'number'
                                        : 'text'
                                }
                                value={d[fieldName]}
                                tabIndex={0}
                                getValue={(value) => {
                                    onChangeTableFieldValue(d.Index, fieldName === 'amount' ? parseFloat(value) : value, fieldName)

                                    const currentRowObj: any =
                                        !!hasLineItemFieldErrors && hasLineItemFieldErrors.find((item) => item.Index === d.Index)

                                    if (!!currentRowObj && currentRowObj.hasOwnProperty(fieldName)) {
                                        const updatedArray: any =
                                            !!hasLineItemFieldErrors &&
                                            hasLineItemFieldErrors.map((itemErrors: any) => {
                                                if (itemErrors.Index === currentRowObj.Index && generateLinetItemFieldsErrorObj.hasOwnProperty(fieldName)) {
                                                    return { ...currentRowObj, [fieldName]: false }
                                                }
                                                return itemErrors
                                            })
                                        setHasLineItemFieldErrors(updatedArray)
                                    }
                                }}
                                getError={(err: boolean) => {
                                    const currentRowObj: any =
                                        !!hasLineItemFieldLibraryErrors && hasLineItemFieldLibraryErrors.find((item) => item.Index === d.Index)

                                    if (!!currentRowObj && currentRowObj.hasOwnProperty(fieldName)) {
                                        const updatedArray: any =
                                            !!hasLineItemFieldLibraryErrors &&
                                            hasLineItemFieldLibraryErrors.map((itemErrors: any) => {
                                                if (itemErrors.Index === currentRowObj.Index && generateLinetItemFieldsErrorObj.hasOwnProperty(fieldName)) {
                                                    return {
                                                        ...currentRowObj,
                                                        [fieldName]: err,
                                                        amount: (!!currentRowObj.qty || !!err) && (!!currentRowObj.rate || !!err) ? true : false,
                                                        taxamount: !!currentRowObj.taxrate || !!err ? true : false,
                                                        total: (!!currentRowObj.qty || !!err) && (!!currentRowObj.rate || !!err) ? true : false,
                                                    }
                                                }
                                                return itemErrors
                                            })
                                        setHasLineItemFieldLibraryErrors(updatedArray)
                                    }
                                }}
                                disabled={isDisabled}
                                hasError={!!currentRowHasLineItemFieldErrorsObj && currentRowHasLineItemFieldErrorsObj[fieldName]}
                                style={{
                                    textAlign: fieldName === 'qty' || fieldName === 'rate' || fieldName === 'amount' ? 'right' : 'left',
                                }}
                                maxLength={fieldName === 'amount' ? 15 : 150}
                                className={`!pt-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${fieldName === 'qty' || fieldName === 'unitprice' ? 'text-right' : ''
                                    }`}
                            />
                        </span>
                    </Editable>
                )
            case 'dropdown':
                let optionsObj: any = []
                let isSecondaryDropdown = false
                let secondaryOptions: any = []
                let primaryLabel = ''
                let secondaryLabel = ''
                switch (field?.Name) {
                    case 'vendor':
                        optionsObj = vendorOptions
                        break
                    case 'account':
                        optionsObj = accountOptions
                        break
                    case 'class':
                        optionsObj = classOptions
                        break
                    case 'customer':
                        optionsObj = customerOptions
                        break
                    case 'project':
                        optionsObj = projectOptions
                        break
                    case 'department':
                        optionsObj = departmentOptions
                        break
                    case 'location':
                        optionsObj = locationOptions
                        break
                    case 'product':
                        optionsObj = !!accountOptions ? accountOptions : []
                        if (AccountingTool === 2) {
                            isSecondaryDropdown = true
                            secondaryOptions = !!productServiceOptions ? productServiceOptions : []
                            primaryLabel = 'Category'
                            secondaryLabel = 'Product/Service'
                        }
                        break
                    case 'items':
                        optionsObj = productServiceOptions
                        break
                    case 'taxrate':
                        optionsObj = [
                            { value: '10', label: '10%' },
                            { value: '20', label: '20%' },
                            { value: '30', label: '30%' },
                            { value: '40', label: '40%' },
                            { value: '50', label: '50%' },
                            { value: '60', label: '60%' },
                            { value: '70', label: '70%' },
                        ]
                        break
                }

                return (
                    <div className='selectDropdown'>
                        <Select
                            search
                            id={field?.id ?? ''}
                            options={field?.Options?.length > 0 ? field.Options : !!optionsObj ? optionsObj : []}
                            secondaryOptions={secondaryOptions}
                            isSecondaryDropdown={isSecondaryDropdown}
                            primaryLabel={primaryLabel}
                            secondaryLabel={secondaryLabel}
                            errorClass='!-mt-4'
                            validate={field.IsRequired}
                            defaultValue={d[fieldName]}
                            getValue={(value) => {
                                onChangeTableFieldValue(d.Index, value, fieldName)

                                const currentRowObj: any =
                                    !!hasLineItemFieldErrors && hasLineItemFieldErrors.find((item) => item.Index === d.Index)

                                if (!!currentRowObj && currentRowObj.hasOwnProperty(fieldName)) {
                                    const updatedArray: any =
                                        !!hasLineItemFieldErrors &&
                                        hasLineItemFieldErrors.map((itemErrors: any) => {
                                            if (itemErrors.Index === currentRowObj.Index && generateLinetItemFieldsErrorObj.hasOwnProperty(fieldName)) {
                                                return { ...currentRowObj, [fieldName]: false }
                                            }
                                            return itemErrors
                                        })
                                    setHasLineItemFieldErrors(updatedArray)
                                }
                            }}
                            getError={(err: boolean) => {
                                const currentRowObj: any =
                                    !!hasLineItemFieldLibraryErrors && hasLineItemFieldLibraryErrors.find((item) => item.Index === d.Index)

                                if (!!currentRowObj && currentRowObj.hasOwnProperty(fieldName)) {
                                    const updatedArray: any =
                                        !!hasLineItemFieldLibraryErrors &&
                                        hasLineItemFieldLibraryErrors.map((itemErrors: any) => {
                                            if (itemErrors.Index === currentRowObj.Index && generateLinetItemFieldsErrorObj.hasOwnProperty(fieldName)) {
                                                return { ...currentRowObj, [fieldName]: err }
                                            }
                                            return itemErrors
                                        })
                                    setHasLineItemFieldLibraryErrors(updatedArray)
                                }
                            }}
                            hasError={!!currentRowHasLineItemFieldErrorsObj && currentRowHasLineItemFieldErrorsObj[fieldName]}
                            autoComplete={!!field.autoComplete ? 'on' : 'off'}
                            disabled={field.isDisabled}
                            className='bg-white'
                        />
                    </div>
                )
            case 'checkbox':
                return (
                    <CheckBox
                        id={`${d?.Index}-${field.Name}` ?? ''}
                        label={`${d?.Index}-${field.Name}` ?? ''}
                        onChange={(e) => {
                            e.stopPropagation()
                            onChangeTableFieldValue(d.Index, e.target.checked, fieldName)

                            const currentRowObj: any = hasLineItemFieldLibraryErrors.find((item) => item.Index === d.Index)

                            if (!!currentRowObj && currentRowObj.hasOwnProperty(fieldName)) {
                                const updatedArray: any = hasLineItemFieldLibraryErrors.map((itemErrors: any) => {
                                    if (itemErrors.Index === currentRowObj.Index && generateLinetItemFieldsErrorObj.hasOwnProperty(fieldName)) {
                                        return { ...currentRowObj, [fieldName]: e.target.checked ? true : false }
                                    }
                                    return itemErrors
                                })
                                setHasLineItemFieldLibraryErrors(updatedArray)
                            }
                        }}
                        className={`text-[#333333] ${field.Name === '1099' ? `Form${field.Name}` : field.Name}`}
                        variant='small'
                        invalid={!!d[fieldName] ? false : isSubmitClick ? field.IsRequired : false}
                        checked={d[fieldName]}
                        disabled={field.isDisabled}
                    />
                )
            case 'date':
                return (
                    <div className='lineItemDatepicker w-full'>
                        <Datepicker
                            startYear={1995}
                            endYear={2050}
                            id={`${d?.Index}-${field.Name}` ?? ''}
                            validate={field.IsRequired}
                            value={d[fieldName]}
                            format='MM/DD/YYYY'
                            getValue={(value) => {
                                onChangeTableFieldValue(d.Index, value, fieldName)
                            }}
                            getError={(err: boolean) => {
                                const currentRowObj: any =
                                    !!hasLineItemFieldLibraryErrors && hasLineItemFieldLibraryErrors.find((item) => item.Index === d.Index)

                                if (!!currentRowObj && currentRowObj.hasOwnProperty(fieldName)) {
                                    const updatedArray: any =
                                        !!hasLineItemFieldLibraryErrors &&
                                        hasLineItemFieldLibraryErrors.map((itemErrors: any) => {
                                            if (itemErrors.Index === currentRowObj.Index && generateLinetItemFieldsErrorObj.hasOwnProperty(fieldName)) {
                                                return {
                                                    ...currentRowObj,
                                                    [fieldName]: err,
                                                }
                                            }
                                            return itemErrors
                                        })
                                    setHasLineItemFieldLibraryErrors(updatedArray)
                                }
                            }}
                            hasError={!!currentRowHasLineItemFieldErrorsObj && currentRowHasLineItemFieldErrorsObj[fieldName]}
                            disabled={field.isDisabled}
                        />
                    </div>
                )
            default:
                return null
        }
    }

    const table_data =
        !!lineItemsFieldsData &&
        lineItemsFieldsData.map((d: any, index: number) => {
            const renderedFields: any = {}
            lineItemFieldListOptions.forEach((field: any) => {
                renderedFields[field.Label] = renderField(field.Name, d, field)
            })

            return new Object({
                ...d,
                ...renderedFields,
                actions: (
                    <>
                        {hoveredRow?.Index === d.Index && (
                            <div className={`flex w-full justify-end`}>
                                {index === 0 ? (
                                    <div onClick={onLineItemAdd} className={`mr-[8px]`} tabIndex={0}>
                                        <Tooltip position='left' content='Add' className='z-[4] !p-0 !text-[12px]'>
                                            <AddIcon />
                                        </Tooltip>
                                    </div>
                                ) : (
                                    <>
                                        <span className={`border-r border-gray-500 pr-[26px]`}>
                                            <div onClick={onLineItemAdd} tabIndex={0}>
                                                <Tooltip position='left' content='Add' className='z-[4] !p-0 !text-[12px]'>
                                                    <AddIcon />
                                                </Tooltip>
                                            </div>
                                        </span>
                                        <span className={`pl-[26px] pr-[12px]`}>
                                            <div onClick={() => onLineItemRemove(d.Index)} tabIndex={0}>
                                                <Tooltip position='left' content='Remove' className='z-[4] !p-0 !text-[12px]'>
                                                    <RemoveIcon />
                                                </Tooltip>
                                            </div>
                                        </span>
                                    </>
                                )}
                            </div>
                        )}
                    </>
                ),
            })
        })

    const handleBackPage = () => {
        router.push('/bills')
    }

    const addDays = (date: any, days: any) => {
        date.setDate(date.getDate() + parseInt(days))
        return date ?? ''
    }

    const setFormValues = (key: string, value: any) => {
        if (key === 'date') {
            if (formFields.hasOwnProperty('term') && !!formFields.term) {
                const filterTerm = defaultTermOptions.find((t: any) => t.RecordNo === formFields.term)
                let formattedDueDateCalculated = ''

                if (!!value) {
                    const dueDateCalculatedValue = addDays(new Date(value), parseInt(filterTerm?.DueDate))
                    formattedDueDateCalculated = !!dueDateCalculatedValue ? format(dueDateCalculatedValue, 'MM/dd/yyyy') : ''
                } else {
                    const dueDateCalculatedValue = addDays(new Date(), parseInt(filterTerm?.DueDate))
                    formattedDueDateCalculated = !!dueDateCalculatedValue ? format(dueDateCalculatedValue, 'MM/dd/yyyy') : ''
                }

                setFormFields({
                    ...formFields,
                    [key]: value,
                    ...(lineItemsFieldsDataObj.hasOwnProperty('glpostingdate') ? { glpostingdate: value } : {}),
                    duedate: formattedDueDateCalculated,
                })
            } else {
                setFormFields({
                    ...formFields,
                    [key]: value,
                    ...(lineItemsFieldsDataObj.hasOwnProperty('glpostingdate') ? { glpostingdate: value } : {}),
                })
            }
            return
        }

        if (key === 'amountsare') {
            let newLineItemsArr = []
            if (value === '1') {
                newLineItemsArr =
                    !!lineItemsFieldsData &&
                    lineItemsFieldsData.map((item: any) => {
                        const calculatedTaxAmount = `${(parseFloat(item.taxrate) * parseFloat(item.amount)) / 100}`
                        return {
                            ...item,
                            ...(lineItemsFieldsDataObj.hasOwnProperty('taxamount')
                                ? { taxamount: isNaN(parseFloat(calculatedTaxAmount)) ? '0' : convertFractionToRoundValue(calculatedTaxAmount) }
                                : {}),
                            ...(lineItemsFieldsDataObj.hasOwnProperty('total')
                                ? { total: convertFractionToRoundValue(parseFloat(item.amount) + parseFloat(calculatedTaxAmount)) }
                                : {}),
                        }
                    })
            }
            if (value === '2') {
                newLineItemsArr =
                    !!lineItemsFieldsData &&
                    lineItemsFieldsData.map((item: any) => {
                        const calculatedTaxAmount = `${(parseFloat(item.taxrate) * parseFloat(item.amount)) / 100}`
                        return {
                            ...item,
                            ...(lineItemsFieldsDataObj.hasOwnProperty('taxamount')
                                ? { taxamount: isNaN(parseFloat(calculatedTaxAmount)) ? '0' : convertFractionToRoundValue(calculatedTaxAmount) }
                                : {}),
                            ...(lineItemsFieldsDataObj.hasOwnProperty('total')
                                ? { total: convertFractionToRoundValue(parseFloat(item.amount)) ?? '0' }
                                : {}),
                        }
                    })
            }
            if (value === '3') {
                newLineItemsArr =
                    !!lineItemsFieldsData &&
                    lineItemsFieldsData.map((item: any) => {
                        return {
                            ...item,
                            ...(lineItemsFieldsDataObj.hasOwnProperty('taxamount') ? { taxamount: '0' } : {}),
                            ...(lineItemsFieldsDataObj.hasOwnProperty('total')
                                ? { total: convertFractionToRoundValue(parseFloat(item.amount)) ?? '0' }
                                : {}),
                        }
                    })
            }
            setLineItemsFieldsData(newLineItemsArr)
            setFormFields({
                ...formFields,
                [key]: value,
            })
            return
        }

        if (key === 'total') {
            setFormFields((prevFields) => ({
                ...formFields,
                [key]: /^[0-9]*\.?[0-9]*$/.test(value) ? value : prevFields.total,
            }))
            return
        }

        if (key === 'term') {
            const filterTerm = defaultTermOptions.find((t: any) => t.RecordNo === value)
            let dueDateCalculated = ''

            if (!!formFields.date) {
                dueDateCalculated = addDays(new Date(formFields.date), parseInt(filterTerm.DueDate))
            } else {
                dueDateCalculated = addDays(new Date(), parseInt(filterTerm.DueDate))
            }
            const formattedDueDateCalculated = format(dueDateCalculated, 'MM/dd/yyyy')

            setFormFields({
                ...formFields,
                [key]: value,
                duedate: formattedDueDateCalculated,
            })
            setHasFormFieldLibraryErrors({
                ...hasFormFieldLibraryErrors,
                duedate: true,
            })
            return
        }

        setFormFields({
            ...formFields,
            [key]: value,
        })
    }

    const onErrorLoader = (postSaveAs: number) => {
        let newLoaderError
        switch (postSaveAs) {
            case 12:
                newLoaderError = {
                    ...loader,
                    postAsPaid: false,
                }
                setLoader(newLoaderError)
                break
            case 2:
                newLoaderError = {
                    ...loader,
                    saveAsDraft: false,
                }
                setLoader(newLoaderError)
                break
            case 3:
                newLoaderError = {
                    ...loader,
                    post: false,
                }
                setLoader(newLoaderError)
                break
            default:
                break
        }
    }

    const newMainFieldListOptions =
        !!mainFieldListOptions &&
        mainFieldListOptions?.map((item: any) => {
            const maxLength =
                (item.Name === 'refrencenumber' || item.Name === 'billnumber') && item.FieldType === 'text'
                    ? 20
                    : item.Name === 'description' && item.FieldType === 'text'
                        ? 150
                        : undefined

            const hasError = hasFormFieldErrors[item.Name] && !formFields[item.Name]

            let optionsObj: any = []
            switch (item?.Name) {
                case 'vendor':
                    optionsObj = vendorOptions
                    break
                case 'from':
                    optionsObj = vendorOptions
                    break
                case 'account':
                    optionsObj = accountOptions
                    break
                case 'class':
                    optionsObj = classOptions
                    break
                case 'customer':
                    optionsObj = customerOptions
                    break
                case 'project':
                    optionsObj = projectOptions
                    break
                case 'department':
                    optionsObj = departmentOptions
                    break
                case 'location':
                    optionsObj = locationOptions
                    break
                case 'product':
                    optionsObj = productServiceOptions
                    break
                case 'items':
                    optionsObj = productServiceOptions
                    break
                case 'payto':
                    optionsObj = vendorOptions
                    break
                case 'returnto':
                    optionsObj = vendorOptions
                    break
                case 'paymentpriority':
                    optionsObj = [
                        { label: 'Urgent', value: '1' },
                        { label: 'High', value: '2' },
                        { label: 'Medium', value: '3' },
                        { label: 'Low', value: '4' },
                    ]
                    break
                case 'term':
                    optionsObj = termOptions
                    break
                case 'pono':
                    optionsObj = [
                        { label: 'Urgent', value: '1' },
                        { label: 'High', value: '2' },
                        { label: 'Medium', value: '3' },
                        { label: 'Low', value: '4' },
                    ]
                    break
                case 'amountsare':
                    optionsObj = [
                        { label: 'Exclusive', value: '1' },
                        { label: 'Inclusive', value: '2' },
                        { label: 'NoTax', value: '3' },
                    ]
                    break
            }

            return {
                ...item,
                Label: processtype === '2' && item.Name === 'billnumber' ? 'Adjustment Number' : item.Label,
                isValidate: item?.IsRequired,
                Value: formFields[item.Name],
                IsChecked: formFields[item.Name],
                Options: item?.Options?.length > 0 ? item.Options : !!optionsObj ? optionsObj : [],
                getValue: (key: string, value: string) => {
                    if (key === 'placethisbillonhold') {
                        setFormValues(key, value)
                    } else {
                        if (!value && (key === 'date' || key === 'glpostingdate' || key === 'duedate' || key === 'apbillreceiveddate')) {
                            // setFormValues(key, value)
                        } else {
                            setFormValues(key, value)

                            if (key === 'date') {
                                if (generateFormFieldsErrorObj.hasOwnProperty(key)) {
                                    setHasFormFieldErrors({
                                        ...hasFormFieldErrors,
                                        [key]: false,
                                        glpostingdate: false,
                                    })
                                }
                                return
                            }
                            if (key === 'term') {
                                if (generateFormFieldsErrorObj.hasOwnProperty(key)) {
                                    setHasFormFieldErrors({
                                        ...hasFormFieldErrors,
                                        [key]: false,
                                        duedate: false,
                                    })
                                }
                                return
                            }

                            if (generateFormFieldsErrorObj.hasOwnProperty(key)) {
                                setHasFormFieldErrors({
                                    ...hasFormFieldErrors,
                                    [key]: false,
                                })
                            }
                        }
                    }
                },
                getError: (key: string, err: boolean) => {
                    if (!err && (key === 'date' || key === 'glpostingdate' || key === 'duedate' || key === 'apbillreceiveddate')) {
                    } else {
                        if (key === 'date') {
                            if (generateFormFieldsErrorObj.hasOwnProperty(key)) {
                                setHasFormFieldLibraryErrors({
                                    ...hasFormFieldLibraryErrors,
                                    [key]: err,
                                    glpostingdate: true,
                                })
                            }
                            return
                        }

                        if (key === 'term') {
                            if (generateFormFieldsErrorObj.hasOwnProperty(key)) {
                                setHasFormFieldLibraryErrors({
                                    ...hasFormFieldLibraryErrors,
                                    [key]: err,
                                    duedate: true,
                                })
                            }
                            return
                        }

                        if (generateFormFieldsErrorObj.hasOwnProperty(key)) {
                            setHasFormFieldLibraryErrors({
                                ...hasFormFieldLibraryErrors,
                                [key]: err,
                            })
                        }
                    }
                },
                hasError: hasError,
                classNames: `mb-6 laptop:mr-5 fieldWrapper`,
                // isSpecialChar: item?.Name === 'billnumber' || item?.Name === 'refrencenumber' ? true : false,
                maxLength: maxLength,
            }
        })

    const saveAccountPayable = async (params: any, postSaveAs: any) => {
        try {
            const response = await agent.APIs.accountPayableSave(params)

            if (response?.ResponseStatus === 'Success') {
                if (!formFields?.attachment) {
                    setLoaderState(postSaveAs, loader, setLoader);
                    if (postSaveAs === 2) {
                        Toast.success('Successfully bill drafted!!')
                    } else if (postSaveAs === 12) {
                        setPostaspaidModal(false)
                        Toast.success('Successfully bill posted!!')
                    } else {
                        Toast.success('Successfully bill posted!!')
                    }
                    router.push('/bills')
                    return
                }

                var formData: any = new FormData()
                const attachmentFiles = (formFields?.attachment as any) || []

                Array.from(attachmentFiles).map((file, index) => {
                    formData.append(`Files[${index}]`, file)
                })

                formData.append('CompanyId', parseInt(CompanyId))
                formData.append('DocumentId', response?.ResponseData)

                const attachmentResponse = await agent.APIs.uploadAttachment(formData)

                if (attachmentResponse?.ResponseStatus === 'Success') {
                    if (attachmentFiles) {
                        setLoaderState(postSaveAs, loader, setLoader);
                    }
                    router.push('/bills')
                    return
                }

                setLoaderState(postSaveAs, loader, setLoader);
                return
            }
        } catch (error) {
            setLoaderState(postSaveAs, loader, setLoader);
        }
    }

    const onCreateBill = async (postSaveAs: number) => {
        setIsSubmitClick(true)
        setLoaderState(postSaveAs, loader, setLoader);

        const accountPayableParams = prepareAccountPayableParams(
            formFields,
            formattedTotalAmountValue,
            formattedTotalTaxAmountValue,
            CompanyId,
            userId,
            processtype,
            vendorOptions,
            accountPayableObj,
            accountPayableAdditionalObj,
            accountPayableLineItemsObj,
            lineItemsFieldsData,
            postSaveAs
        );

        const isValidAttachments = validateAttachments(
            formFields,
            onErrorLoader,
            postSaveAs
        );

        if (!isValidAttachments) return false;

        if (postSaveAs !== 2) {
            const isValidFormFieldErrors = handleFormFieldErrors(
                formFields,
                lineItemsFieldsData,
                lineItemDisableFields,
                hasFormFieldLibraryErrors,
                hasLineItemFieldLibraryErrors,
                setHasLineItemFieldErrors,
                setHasFormFieldErrors,
                verifyAllFieldsValues,
                validate,
                onErrorLoader,
                postSaveAs
            );

            if (!isValidFormFieldErrors) return false;

            const isValidTotals = validateTotals(
                formFields,
                formattedTotalAmountValue,
                formattedTotalTaxAmountValue,
                onErrorLoader,
                postSaveAs
            );

            if (!isValidTotals) return false;

            try {
                const response = await saveAccountPayable(accountPayableParams, postSaveAs);
                return response;
            } catch (error) {
                onErrorLoader(postSaveAs);
                Toast.error('Error while creating the bill.');
                return false;
            }

        } else {
            try {
                const response = await saveAccountPayable(accountPayableParams, postSaveAs);
                return response;
            } catch (error) {
                onErrorLoader(postSaveAs);
                Toast.error('Error while creating the bill.');
                return false;
            }
        }
    };

    const PostasPiad = (postaspaid: number) => {
        setIsSubmitClick(true)
        const errorsValues = verifyAllFieldsValues(formFields)

        let newErrorValues: any = {}
        for (const [key, value] of Object.entries(errorsValues)) {
            if (hasFormFieldLibraryErrors.hasOwnProperty(key)) {
                newErrorValues = {
                    ...newErrorValues,
                    [key]: value,
                }
            }
        }

        let newLineItemErrorValues: any = []

        lineItemsFieldsData.map((item: any) => {
            const errorsLinetItemValues = verifyAllFieldsValues(item)
            let newLineItemErrorValuesObj: any = {}
            for (const [key, value] of Object.entries(errorsLinetItemValues)) {
                if (generateLinetItemFieldsErrorObj.hasOwnProperty(key)) {
                    newLineItemErrorValuesObj = {
                        ...newLineItemErrorValuesObj,
                        [key]: key === 'Index' ? item.Index : value,
                    }
                }
            }
            newLineItemErrorValues.push(newLineItemErrorValuesObj)
        })

        let errorInItems = 0
        hasLineItemFieldLibraryErrors.map((fieldLibraryErrors) => {
            if (!validate(fieldLibraryErrors)) {
                errorInItems++
            } else {
                errorInItems = 0
            }
        })

        setHasLineItemFieldErrors(newLineItemErrorValues)
        setHasFormFieldErrors(newErrorValues)

        if (validate(hasFormFieldLibraryErrors)) {
            if (errorInItems > 0) {
                let newLoaderSuccess
                switch (postaspaid) {
                    case 12:
                        newLoaderSuccess = {
                            ...loader,
                            postAsPaid: false,
                        }
                        break
                    default:
                        break
                }
                setLoader(newLoaderSuccess)
                Toast.error('Please enter required field.')
                return
            } else {
                setPostaspaidModal(true)
            }
        } else {
            setPostaspaidModal(false)
            Toast.error('Please add required fields.')
            return
        }
    }

    const isDisablePaidButton = formFields.placethisbillonhold || !!loader.saveAsDraft || !!loader.post
    const isDisableDraftButton =
        Object.values(formFields).every((field) => field === null || field === '') || !!loader.postAsPaid || !!loader.post
    const isDisablePostButton = !!loader.postAsPaid || !!loader.saveAsDraft

    return (
        <Wrapper masterSettings={false}>
            <div className='sticky top-0 !z-[3] flex w-full flex-row justify-between bg-[#F4F4F4] p-4'>
                <div className='flex items-center justify-center'>
                    <span
                        className='cursor-pointer rounded-full bg-white p-1.5'
                        onClick={handleBackPage}
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleBackPage()}
                    >
                        <BackIcon />
                    </span>
                    <span className='pl-4 !text-[14px] font-semibold'>
                        {processtype === '1' ? 'Account Payable' : 'Account Adjustment'}
                    </span>
                </div>
            </div>

            <div className='flex flex-col pt-5'>
                <div className='grid grid-cols-4 items-center px-5'>
                    <BillsControlFields formFields={newMainFieldListOptions} />
                </div>

                <div className='py-5'>
                    <div className={` custom-scroll !min-h-[253px] overflow-scroll ${tableDynamicWidth}`}>
                        <DataTable
                            getExpandableData={() => { }}
                            columns={lineItemFieldColumns}
                            data={table_data}
                            sticky
                            hoverEffect
                            getRowId={(value: any) => {
                                setHoveredRow(value)
                            }}
                            isTableLayoutFixed={true}
                            userClass='lineItemtable'
                            isHeaderTextBreak={true}
                        />
                    </div>

                    <div className='justify-end px-5 pb-[77px] pt-[34px]'>
                        <div className='mb-2 flex flex-row justify-end'>
                            <span className='w-[15%] text-sm'>Sub Total</span>
                            <span className='w-[20%] text-end text-sm font-semibold'>${formattedTotalAmountValue}</span>
                        </div>
                        {AccountingTool === 3 && (
                            <div className='mb-2 flex flex-row justify-end'>
                                <span className='w-[15%] text-sm'>Tax Total</span>
                                <span className='w-[20%] text-end text-sm font-semibold'>${formattedTotalTaxAmountValue}</span>
                            </div>
                        )}
                        <div className='flex flex-row justify-end'>
                            <span className='w-[15%] text-sm'>Total Amount</span>
                            <span className='w-[20%] text-end text-sm font-semibold'>
                                $
                                {formFields?.amountsare === '1'
                                    ? convertFractionToRoundValue(
                                        parseFloat(formattedTotalAmountValue) + parseFloat(formattedTotalTaxAmountValue)
                                    )
                                    : convertFractionToRoundValue(parseFloat(formattedTotalAmountValue))}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className='bottom-0 flex items-center justify-end !border-t border-[#D8D8D8] px-5 py-[12px]'>
                {processtype !== '2' && (
                    <Button
                        variant={isDisablePaidButton ? 'btn' : 'btn-outline-primary'}
                        className='btn-md w-[130px] rounded-full disabled:opacity-50'
                        disabled={isDisablePaidButton ? true : false}
                        onClick={() => PostasPiad(12)}
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && PostasPiad(12)}
                    >
                        <Typography className='!text-[14px] font-semibold uppercase'>Post as paid</Typography>
                    </Button>
                )}

                <Button
                    variant={`${isDisableDraftButton ? 'btn' : 'btn-outline-primary'}`}
                    className='btn-md ml-[20px] w-[143px] rounded-full'
                    onClick={() => onCreateBill(2)}
                    disabled={isDisableDraftButton ? true : false}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onCreateBill(2)}
                >
                    {!!loader.saveAsDraft ? (
                        <div className={`flex w-full items-center justify-center`}>
                            <div className='animate-spin '>
                                <SpinnerIcon bgColor='#02B89D' />
                            </div>
                        </div>
                    ) : (
                        <Typography className='!text-[14px] font-semibold uppercase'>Save as draft</Typography>
                    )}
                </Button>

                <Button
                    variant={isDisablePostButton ? 'btn' : 'btn-primary'}
                    className='btn-md ml-[20px] w-[90px] rounded-full disabled:opacity-50'
                    onClick={() => onCreateBill(3)}
                    disabled={isDisablePostButton ? true : false}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onCreateBill(3)}
                >
                    {!!loader.post ? (
                        <div className={`flex w-full items-center justify-center`}>
                            <div className='animate-spin '>
                                <SpinnerIcon bgColor='#FFF' />
                            </div>
                        </div>
                    ) : (
                        <Typography className='!text-[14px] font-semibold uppercase'>Post</Typography>
                    )}
                </Button>
            </div>


            <PostaspaidModal
                loader={loader.postAsPaid}
                onOpen={postaspaidModal}
                onClose={() => setPostaspaidModal(false)}
                handleSubmit={() => onCreateBill(12)}
            />
        </Wrapper>

    )
}

export default CreateBillPosting
