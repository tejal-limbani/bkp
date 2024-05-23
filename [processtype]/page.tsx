'use server'

import agent from '@/api/axios'

import { store } from '@/store/configureStore'
import CreateBillPosting from '../__components/create/CreateBillPosting'

const handleResponse = (response: any) => {
  if (response?.ResponseStatus === 'Success') {
    return response.ResponseData
  }
}

async function getVendorDropdown() {
  const response = await agent.APIs.vendorDropdown({ CompanyId: 322, IsActive: true })
  return handleResponse(response)
}

async function getTermDropdown() {
  const response = await agent.APIs.termDropdown({ CompanyId: 322, IsActive: true })
  if (response.ResponseStatus === 'Success') {
    const newTermOptions = response?.ResponseData?.map((item: any) => {
      return {
        label: item.Name,
        value: item.RecordNo,
      }
    })
    return {
      defaultTermOptions: response.ResponseData,
      termOptions: newTermOptions,
    }
  }
}

async function getAccountDropdown() {
  const response = await agent.APIs.accountDropdown({ CompanyId: 322, IsActive: true })
  return handleResponse(response)
}

async function getClassDropdown() {
  const response = await agent.APIs.classDropdown({ CompanyId: 322, IsActive: true })
  return handleResponse(response)
}

async function getProductServiceDropdown() {
  const response = await agent.APIs.productServiceDropdown({ CompanyId: 322 })
  return handleResponse(response)
}

async function getCustomerDropdown() {
  const response = await agent.APIs.customerDropdown({ CompanyId: 322, IsActive: true })
  return handleResponse(response)
}

async function getProjectDropdown() {
  const response = await agent.APIs.projectDropdown({ CompanyId: 322 })
  return handleResponse(response)
}

async function getDepartmentDropdown() {
  const response = await agent.APIs.departmentDropdown({ CompanyId: 322 })
  return handleResponse(response)
}

async function getLocationDropdown() {
  const response = await agent.APIs.locationDropdown({ CompanyId: 322, IsActive: true })
  return handleResponse(response)
}

async function getProcessDropdown() {
  const response = await agent.APIs.processDropdown()
  return handleResponse(response)
}

async function getStatusDropdown() {
  const response = await agent.APIs.statusDropdown()
  return handleResponse(response)
}

async function getUserDropdown() {
  const response = await agent.APIs.userDropdown({ CompanyId: 322 })
  return handleResponse(response)
}

async function getFieldMappingConfigurations(ProcessType: number) {
  const response = await agent.APIs.getFieldMappings({
    CompanyId: 322,
    ProcessType,
  })
  return handleResponse(response)
}

const EditBill = async ({
  params,
}: {
  params: { id: string }
}) => {
  const { bill, user } = store.getState()
  const processType = bill.selectedProcessTypeInList
  const accountingTool = user.selectedCompany?.accountingTool

  let vendorOptions: any = []
  let defaultTermOptions: any = []
  let termOptions: any = []
  let accountOptions: any = []
  let classOptions: any = []
  let productServiceOptions: any = []
  let customerOptions: any = []
  let projectOptions: any = []
  let departmentOptions: any = []
  let locationOptions: any = []

  const processOptions: any = await getProcessDropdown()
  const statusOptions: any = await getStatusDropdown()
  const userOptions: any = await getUserDropdown()

  const fieldMappingConfigurations: any = await getFieldMappingConfigurations(Number(processType))

  const mainFieldConfigurationList = fieldMappingConfigurations?.ComapnyConfigList?.MainFieldConfiguration
  const lineItemConfigurationList = fieldMappingConfigurations?.ComapnyConfigList?.LineItemConfiguration

  const mainFieldConfigurationNames = mainFieldConfigurationList?.map((item: any) => item?.Name)
  const lineItemConfigurationNames = lineItemConfigurationList?.map((item: any) => item?.Name)

  const fieldMappingNames = [...mainFieldConfigurationNames, ...lineItemConfigurationNames]

  await Promise.all(
    fieldMappingNames.map(async (name: string) => {
      switch (name) {
        case 'vendor':
          vendorOptions = await getVendorDropdown()
          break
        case 'from':
          vendorOptions = await getVendorDropdown()
          break
        case 'term':
          let { defaultTermOptions, termOptions }: any = await getTermDropdown()
          defaultTermOptions = defaultTermOptions
          termOptions = termOptions
        case 'account':
          accountOptions = await getAccountDropdown()
          break
        case 'class':
          classOptions = await getClassDropdown()
          break
        case 'product':
          const responseData1 = await getProductServiceDropdown()
          productServiceOptions = responseData1?.map((item: any) => {
            return {
              ...item,
              value: item.value + '-secondary',
            }
          })
          if(accountingTool === 2) {
            const responseData2 = await getAccountDropdown()
            accountOptions = responseData2?.map((item: any) => {
              return {
                ...item,
                value: item.value + '-primary',
              }
            }) 
          }
          break
        case 'items':
          productServiceOptions = await getProductServiceDropdown()
          break
        case 'customer':
          customerOptions = await getCustomerDropdown()
          break
        case 'project':
          projectOptions = await getProjectDropdown()
          break
        case 'department':
          departmentOptions = await getDepartmentDropdown()
          break
        case 'location':
          locationOptions = await getLocationDropdown()
          break
        default:
          return
      }
    })
  )

  const generateFormFields = Object.assign(
    {},
    ...mainFieldConfigurationList?.map(({ Name, Value }: any) => ({
      [Name]: Name === 'placethisbillonhold' ? false : Value,
    }))
  )

  const generateFormFieldsErrorObj = Object.assign(
    {},
    ...mainFieldConfigurationList?.filter(({ IsRequired }: any) => !!IsRequired)?.map(({ Name }: any) => ({ [Name]: false }))
  )

  const generateLinetItemFieldsErrorObj = Object.assign(
    { Index: 1 },
    ...lineItemConfigurationList?.filter(({ IsRequired }: any) => !!IsRequired)?.map(({ Name }: any) => ({ [Name]: false }))
  )

  const fieldType: any =
    !!lineItemConfigurationList &&
    lineItemConfigurationList.map((o: any) => {
      let columnStyle = ''
      let colalign = 'left'
      let sortable = false
      switch (o.Name) {
        case 'account':
          columnStyle = 'th-edit-account !uppercase'
          break
        case 'rate':
          columnStyle = 'th-edit-unit-price !uppercase'
          colalign = 'right'
          break
        case 'qty':
          columnStyle = 'th-edit-quantity !uppercase'
          colalign = 'right'
          break
        case 'amount':
          columnStyle = 'th-edit-amount !uppercase'
          colalign = 'right'
          break
        case 'memo':
          columnStyle = 'th-edit-memo !uppercase'
          break
        case 'class':
          columnStyle = 'th-edit-class !uppercase'
          break
        case 'location':
          columnStyle = 'th-edit-location !uppercase'
          break
        case 'description':
          columnStyle = 'th-edit-description !uppercase'
          break
        default:
          columnStyle = 'th-edit-common !uppercase'
          break
      }
      return {
        header: o.Name === 'account' ? 'GL Account' : o.Label,
        accessor: o.Label,
        sortable: sortable,
        colStyle: columnStyle,
        colalign: colalign,
      }
    })

  const lineItemFieldColumns = [
    {
      header: '#',
      accessor: 'Index',
      sortable: false,
      colStyle: 'th-edit-sr-no !uppercase',
    },
    ...fieldType,
    {
      header: '',
      accessor: 'actions',
      sortable: false,
      colStyle: 'th-edit-actions !uppercase',
      colalign: 'right',
    },
  ]

  let lineItemsFieldsDataObj = lineItemConfigurationList?.reduce((acc: any, o: any) => {
    return {
      ...acc,
      [o.Name]: o.Value,
    };
  }, {});

  return (
    <>
      <CreateBillPosting
        vendorOptions={vendorOptions}
        termOptions={termOptions}
        defaultTermOptions={defaultTermOptions}
        accountOptions={accountOptions}
        classOptions={classOptions}
        productServiceOptions={productServiceOptions}
        customerOptions={customerOptions}
        projectOptions={projectOptions}
        departmentOptions={departmentOptions}
        locationOptions={locationOptions}
        processOptions={processOptions}
        statusOptions={statusOptions}
        userOptions={userOptions}
        fieldMappingConfigurations={fieldMappingConfigurations}
        generateFormFields={generateFormFields}
        generateFormFieldsErrorObj={generateFormFieldsErrorObj}
        generateLinetItemFieldsErrorObj={generateLinetItemFieldsErrorObj}
        lineItemFieldColumns={lineItemFieldColumns}
        lineItemsFieldsDataObj={lineItemsFieldsDataObj}
      />
    </>
  )
}

export default EditBill
