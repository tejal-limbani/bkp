import {
  ForgotPasswordOptions,
  SignInOptions,
  SignUpOptions,
  SocialSignInOptions,
  generateOtpOptions,
  reauthenticationProps,
  setPasswordOptions,
  validateOtpOptions,
} from '@/models/auth'
import {
  BillDetailsPayload,
  PaymentPayload,
  VendorAgingDaysDrpdwn,
  bankAccDropDownProps,
  markaspaidProps,
  moveBillToPayProps,
  paymentColumnMappingProps,
  paymentGetListProps,
  saveColumnMappingProps,
  vendorAgingListProps,
  vendorCreditListProps,
} from '@/models/billsToPay'
import {
  AssignUserCompany,
  CompanyDataById,
  CompanyGetListOptions,
  SaveCompany,
  companyIdDropDown,
  conncetSageCompany,
  conncetSageUser,
  qbConncet,
  reconncetSageCompany,
  xeroConncet,
} from '@/models/company'
import {
  PermissionListOptions,
  RoleGetIdOptions,
  RoleGetListOptions,
  RoleListOptions,
  RoleRemoveOptions,
  savePermissionOptions,
  saveRoleOptions,
} from '@/models/role'
import {
  AssignCompanyToUser,
  CityListOptions,
  GetUserImage,
  SaveManageRight,
  StateListOptions,
  TimezoneListOptions,
  UploadUserImage,
  UserDataOptions,
  UserDelete,
  UserGetCompanyDropdown,
  UserGetListOptions,
  UserGetManageRights,
  UserSaveDataOptions,
  UserUpdateStatusOptions,
} from '@/models/user'

import axios, { AxiosError, AxiosResponse } from 'axios'
import { Toast } from 'pq-ap-lib'

import {
  ClassByIdOptions,
  ClassGetListOptions,
  DepartmentByIdOptions,
  DepartmentGetListOptions,
  DimensionRemoveOptions,
  LocationByIdOptions,
  LocationGetDropdownListOptions,
  LocationGetListOptions,
  LocationListDropdownOptions,
  ProjectByIdOptions,
  ProjectGetListOptions,
  SyncMasterProps,
  UpdateMasterProps,
  saveClassOptions,
  saveDepartmentOptions,
  saveLocationOptions,
  saveProjectOptions,
} from '@/models/dimensionMaster'

import {
  ApTermDropdownOptions,
  ApTermGetListOptions,
  SaveTermOptions,
  SyncApTermMasterOptions,
  TermByIdOptions,
  UpdateTermStatusOptions,
} from '@/models/aptermMaster'
import { AutomationGetRuleListOptions, RuleActiveInactiveOptions, RuleByIdOptions, SaveRuleOptions } from '@/models/automation'
import { billApprovals, getBillApprovalLists, reAssigns, vendordropdown } from '@/models/billApproval'
import {
  GetOcrDocumentOptions,
  SplitDocumentOptions,
  VendorListOptions,
  assignDocumentToUserOptions,
  assigneeOptions,
  deleteDocumentOptions,
  documentGetListOptions,
  getColumnMappingListOptions,
  getDocumentByIdOptions,
  locationListOptions,
  mergeDocumentOptions,
  removeDocumentOptions,
  userListOptions,
  vendorListOptions,
} from '@/models/billPosting'
import { CurrencyDropdownOptions, CurrencyGetListOptions, SyncCurrencyMasterOptions } from '@/models/currencyMaster'
import { GetFieldMappings, SaveFieldMappings } from '@/models/fieldMapping'
import { ProfileFormFieldsProps } from '@/models/formFields'
import {
  GLAccountByIdOptions,
  GLAccountDropdownOptions,
  GLAccountGetListOptions,
  SaveGLAccountOptions,
  SyncGLAccountMasterOptions,
  UpdateGLAccountStatusOptions,
} from '@/models/glAccountMaster'
import {
  GetEmailTemplate,
  ReadDeleteAllNotificationProps,
  SaveNotificationMatrix,
  SaveSummaryData,
  UpdateSummaryStatus,
} from '@/models/notification'
import {
  GetPaymentStatusColumnMappingOptions,
  PaymentStatusListOptions,
  SavePaymentStatusColumnMappingOptions,
} from '@/models/paymentStatus'
import { GLAccountOptions, ProductServiceGetListOptions, SyncProductServiceMasterOptions } from '@/models/product&ServiceMaster'
import {
  SyncVendorOptions,
  VendorDropdownListOptions,
  VendorGetByIdOptions,
  VendorGetDropdownListOptions,
  VendorGetListOptions,
  VendorSyncOptions,
  VendorUpdateStatusOptions,
} from '@/models/vendor'
import {
  ActivityListOptions,
  ActivityNotificationOptions,
  ActivityWatcherListOptions,
  SaveActivityListOptions,
  SaveWatcherListOptions,
  UpdateResloved,
} from '@/models/activity'
import { GetSearchHistoryOptions, SaveSearchHistoryOptions, SearchResultOptions } from '@/models/global'
import {
  SaveApAgingDetailsColumnMappingOptions,
  apAgingDetailsProps,
  getApAgingDetailsColumnMappingOptions,
} from '@/models/apAgingDetails'
import { apAgingSummaryProps } from '@/models/apAgingSummary'
import { getUnpaidBillsColumnMappingOptions, saveUnpaidBillsColumnMappingOptions, unpainBillsProps } from '@/models/unpaidBills'
import {
  VendorBalanceDetailProps,
  getVendorBalanceDetailColumnMappingOptions,
  saveVendorBalanceDetailColumnMappingOptions,
} from '@/models/vendorBalanceDetail'
import { VendorBalanceSummaryProps } from '@/models/vendorBalanceSummary'
import { apAgingSummaryDrawerProps } from '@/models/apAgingSummaryDrawer'
import {
  BillAnalysisProps,
  SaveBillAnalysisColumnMappingOptions,
  getBillAnalysisColumnMappingOptions,
} from '@/models/BillAnalysis'
import { vendorAgingGroupBy } from '@/store/features/reports/reportsSlice'
import { vendorAgingGroupByProps } from '@/models/vendorAgingGroupBy'
import { vendorAgingSummaryProps } from '@/models/vendorAgingSummary'
import { handleHistoryDocumentRetryProps, historyGetListProps, linkBillToExistingBillProps } from '@/models/files'
import { getFieldMappingOptions } from '@/models/common'

const API_URL = process.env.api_url
const API_PROFILE = process.env.api_profile
const API_MANAGE = process.env.api_manage
const API_MASTER = process.env.api_master
const API_FILEUPLOAD = process.env.api_fileupload
const API_ADMIN = process.env.base_url
const API_BILLS = process.env.api_bills
const API_BILLSTOPAY = process.env.api_BillsToPay
const API_ACTIVTY = process.env.api_Activity
const API_REPORTS = process.env.api_Reports
const API_NOTIFICATION = process.env.api_Notification
const API_GLOBAL = process.env.api_global
const API_REALTIMENOTIFICATION = process.env.REALTIME_NOTIFICATION

const sleep = () => new Promise((resolve) => setTimeout(resolve, 500))

// axios.defaults.baseURL = process.env.REACT_APP_API_URL;
// axios.defaults.withCredentials = true;

const responseBody = (response: AxiosResponse) => response.data

axios.interceptors.request.use(async (config) => {
  // const token = localStorage.getItem('token')
  // const CompanyId = localStorage.getItem('CompanyId')
  // if (token) config.headers.Authorization = `bearer ${token}`
  // config.headers.CompanyId = CompanyId

  config.headers.Authorization = `bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoidGVqYWwubGltYmFuaUB0ZWNobm9tYXJrLmlvIiwianRpIjoiZTJlYTVkMjItMjMzOC00ODg1LWFjMTItYjcxNDZlZTgwZTk2IiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiIiwibG9naW4tdHlwZSI6IlBBVEhRVUVTVCIsImV4cCI6MTcxNjUzMzQ0NCwiaXNzIjoiMDRCOEEzODgtQ0EyQy00ODExLUE3MUQtRTE5OEMyNkZFNzE3IiwiYXVkIjoiMDRCOEEzODgtQ0EyQy00ODExLUE3MUQtRTE5OEMyNkZFNzE2In0.8ItKZ3dFmdqNlFc-3uc4cuPAwEfaBqQtvw3bIHgBYKk`
  config.headers.CompanyId = 259

  return config
})

// axios.interceptors.response.use(
//   async (response) => {
//     if (process.env.NODE_ENV === 'development') await sleep()
//     return response
//   },
//   (error: AxiosError) => {
//     const { data, status } = error.response as AxiosResponse

//     switch (status) {
//       case 400:
//         if (data.errors) {
//           const modelStateErrors: string[] = []
//           for (const key in data.errors) {
//             if (data.errors[key]) {
//               modelStateErrors.push(data.errors[key])
//             }
//           }
//           throw modelStateErrors.flat()
//         }
//         break
//       case 401:
//         const refreshToken = localStorage.getItem('refreshToken')
//         const token = localStorage.getItem('token')

//         axios
//           .post(`${API_URL}/refreshtoken`, {
//             accesstoken: token,
//             refreshtoken: refreshToken,
//           })
//           .then((res) => {
//             if (res.data.ResponseStatus === 'Failure') {
//               localStorage.removeItem('token')
//               localStorage.removeItem('refreshToken')
//               localStorage.removeItem('CompanyId')
//               window.location.href = '/signin'
//             }
//             if (res.data.ResponseStatus === 'Success') {
//               axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.ResponseData.Token}`

//               localStorage.setItem('token', res.data.ResponseData.Token)
//               localStorage.setItem('refreshToken', res.data.ResponseData.RefreshToken)
//             }
//           })
//           .catch((err) => {
//             console.log('Err', err)
//           })
//         break
//       case 403:
//         Toast.error('You are not allowed to do that!')
//         break
//       case 500:
//         Toast.error('Internal Server Error!!')
//         break
//       default:
//         break
//     }

//     return Promise.reject(error.response)
//   }
// )

function createFormData(item: any) {
  let formData = new FormData()
  for (const key in item) {
    formData.append(key, item[key])
  }
  return formData
}

const requests = {
  get: (url: string, params?: URLSearchParams) => axios.get(url, { params }).then(responseBody),
  post: (url: string, body: {}) => axios.post(url, body).then(responseBody),
  put: (url: string, body: {}) => axios.put(url, body).then(responseBody),
  delete: (url: string) => axios.delete(url).then(responseBody),
  postForm: (url: string, data: FormData) =>
    axios
      .post(url, data, {
        headers: { 'Content-type': 'multipart/form-data' },
      })
      .then(responseBody),
  putForm: (url: string, data: FormData) =>
    axios
      .put(url, data, {
        headers: { 'Content-type': 'multipart/form-data' },
      })
      .then(responseBody),
}

const Auth = {
  login: (data: SignInOptions) => requests.post(`${API_URL}/token`, data),
  register: (data: SignUpOptions) => requests.post(`${API_URL}/register`, data),
  socialLogin: (data: SocialSignInOptions) => requests.post(`${API_URL}/social-login`, data),
  forgotPassword: (data: ForgotPasswordOptions) => requests.post(`${API_URL}/forgotpassword`, data),
  getQboConnectUrl: () => requests.get(`${API_URL}/getqboconnecturl`),
  generateOtp: (data: generateOtpOptions) => requests.post(`${API_URL}/generateotp`, data),
  validateOtp: (data: validateOtpOptions) => requests.post(`${API_URL}/validateotp`, data),
  setPassword: (data: setPasswordOptions) => requests.post(`${API_URL}/setpassword`, data),
  reauthentication: (data: reauthenticationProps) => requests.post(`${API_URL}/reauthentication`, data),

  // lists: (params: URLSearchParams) => requests.get('lists', params),
  // create: (item: any) => requests.postForm('items', createFormData(item)),
  // update: (item: any) => requests.putForm('items', createFormData(item)),
  // delete: (id: number) => requests.delete(`items/${id}`)
}

const Profile = {
  getUserProfile: () => requests.get(`${API_PROFILE}/user/getuserprofile`),
  getCountries: () => requests.get(`${API_PROFILE}/country/list`),
  getStates: (id: number) => requests.get(`${API_PROFILE}/state/list?countryId=${id}`),
  getCities: (id: number) => requests.get(`${API_PROFILE}/city/list?stateId=${id}`),
  getTimeZone: (id: number) => requests.get(`${API_PROFILE}/timezone/list?countryId=${id}`),
  saveUserProfile: (data: ProfileFormFieldsProps) => requests.post(`${API_PROFILE}/user/saveuserprofile`, data),
  getUserConfig: () => requests.get(`${API_MANAGE}/user/getuserconfig`),
}

// Manage Company
const Company = {
  companyGetList: (data: CompanyGetListOptions) => requests.post(`${API_MANAGE}/company/getlist`, data),
  saveCompany: (data: SaveCompany) => requests.post(`${API_MANAGE}/company/save`, data),
  companyGetById: (data: CompanyDataById) => requests.get(`${API_MANAGE}/company/getbyid?companyId=${data.Id}`),
  redirectQb: () => requests.get(`${API_MANAGE}/settings/getconfigbyid?configId=3`),
  conncetQb: (data: qbConncet) => requests.post(`${API_MANAGE}/company/connectqbocompany`, data),
  redirectXero: () => requests.get(`${API_MANAGE}/settings/getconfigbyid?configId=4`),
  conncetXero: (data: xeroConncet) => requests.post(`${API_MANAGE}/company/connectxerocompany`, data),
  sageUserConnect: (data: conncetSageUser) => requests.post(`${API_MANAGE}/company/getclientlist`, data),
  sageCompanyConnect: (data: conncetSageCompany) => requests.post(`${API_MANAGE}/company/getentitylist`, data),
  sageCompanyReconnect: (data: reconncetSageCompany) => requests.post(`${API_MANAGE}/company/connectintacctcompany`, data),
  // country,state and city api we take it from user

  // below api use in manage user
  // Also use in manage company filter api
  companyListDropdown: () => requests.get(`${API_MANAGE}/company/getdropdown`),
  manageCompanyAssignUser: (data: companyIdDropDown) => requests.post(`${API_MANAGE}/user/getdropdownbycompany`, data),
  companyAssignUser: (data: companyIdDropDown) => requests.post(`${API_MANAGE}/user/GetDropDownForRule`, data),
  filterAccounting: () => requests.get(`${API_MANAGE}/settings/getaccountingtooldropdown`),
  AssignUserToCompany: (data: AssignUserCompany) => requests.post(`${API_MANAGE}/company/assignusertocompany`, data),
  uploadCompanyImage: (data: UploadUserImage) => requests.post(`${API_MANAGE}/company/upload/image`, data),
  getCompanyImage: (data: GetUserImage) => requests.get(`${API_MANAGE}/company/getcompanyimage?fileName=${data.fileName}`),
}

// Manage User
const User = {
  userGetList: (data: UserGetListOptions) => requests.post(`${API_MANAGE}/user/getlist`, data),
  userUpdateStatus: (data: UserUpdateStatusOptions) => requests.post(`${API_MANAGE}/user/updatestatus`, data),
  countryListDropdown: () => requests.get(`${API_PROFILE}/country/list`),
  timezoneListDropdown: (data: TimezoneListOptions) => requests.get(`${API_PROFILE}/timezone/list?countryId=${data.CountryId}`),
  stateListDropdown: (data: StateListOptions) => requests.get(`${API_PROFILE}/state/list?countryId=${data.CountryId}`),
  cityListDropdown: (data: CityListOptions) => requests.get(`${API_PROFILE}/city/list?stateId=${data.StateId}`),
  userGetDataById: (data: UserDataOptions) => requests.get(`${API_MANAGE}/user/getbyid?userId=${data.UserId}`),
  userSaveData: (data: UserSaveDataOptions) => requests.post(`${API_MANAGE}/user/save`, data),
  userGetManageRights: (data: UserGetManageRights) => requests.post(`${API_PROFILE}/role/getusercompanypermissions`, data),
  userListDropdown: () => requests.get(`${API_MANAGE}/user/getdropdown`),
  getAssignUsertoCompany: (data: UserGetCompanyDropdown) => requests.post(`${API_MANAGE}/company/getdropdownbyuser`, data),
  assignCompanyToUser: (data: AssignCompanyToUser) => requests.post(`${API_MANAGE}/user/assigncompanytouser`, data),
  SaveManageRight: (data: SaveManageRight) => requests.post(`${API_PROFILE}/role/saveusercompanypermissions`, data),
  uploadUserImage: (data: UploadUserImage) => requests.post(`${API_PROFILE}/user/upload/image`, data),
  getUserImage: (data: GetUserImage) => requests.get(`${API_PROFILE}/user/getuserimage?fileName=${data.fileName}`),
  deleteUser: (data: UserDelete) => requests.post(`${API_MANAGE}/user/delete`, data),
}

// Manage Roles
const Role = {
  roleListDropdown: (data: RoleListOptions) => requests.post(`${API_PROFILE}/role/getdropdown`, data),
  roleGetList: (data: RoleGetListOptions) => requests.post(`${API_PROFILE}/role/getrolesbycompany`, data),
  permissionGetList: (data: PermissionListOptions) => requests.post(`${API_PROFILE}/role/getrolepermissions`, data),
  roleRemove: (data: RoleRemoveOptions) => requests.post(`${API_PROFILE}/role/deleterole`, data),
  savePermission: (data: savePermissionOptions) => requests.post(`${API_PROFILE}/role/saverolepermission`, data),
  saveRole: (data: saveRoleOptions) => requests.post(`${API_PROFILE}/role/createrole`, data),
  roleGetById: (data: RoleGetIdOptions) => requests.post(`${API_PROFILE}/role/getbyid`, data),
}

const FileUpload = {
  userGetList: (data: UserGetListOptions) => requests.post(`${API_MANAGE}/user/getlist`, data),
}

// Master Dimension
const Dimension = {
  syncDimensionMaster: (data: SyncMasterProps, tab: string) => requests.post(`${API_MASTER}/${tab}/sync`, data),
  updateDimensionMaster: (data: UpdateMasterProps, tab: string) => requests.post(`${API_MASTER}/${tab}/updatestatus`, data),
  //No Accounting Tool
  importDimensionData: (data: any, tab: string) => requests.postForm(`${API_MASTER}/${tab}/import`, data),

  classGetList: (data: ClassGetListOptions) => requests.post(`${API_MASTER}/class/getlist`, data),
  saveClass: (data: saveClassOptions) => requests.post(`${API_MASTER}/class/save`, data),
  classGetById: (data: ClassByIdOptions) => requests.post(`${API_MASTER}/class/getbyid`, data),
  classRemove: (data: DimensionRemoveOptions) => requests.post(`${API_MASTER}/class/delete`, data),

  locationListDropdown: (data: LocationListDropdownOptions) => requests.post(`${API_MASTER}/location/getdropdown`, data),
  locationGetDropdownList: (data: LocationGetDropdownListOptions) =>
    requests.post(`${API_MANAGE}/settings/automation/getlocationdropdown`, data),
  locationGetList: (data: LocationGetListOptions) => requests.post(`${API_MASTER}/location/getlist`, data),
  saveLocation: (data: saveLocationOptions) => requests.post(`${API_MASTER}/location/save`, data),
  locationGetById: (data: LocationByIdOptions) => requests.post(`${API_MASTER}/location/getbyid`, data),
  locationRemove: (data: DimensionRemoveOptions) => requests.post(`${API_MASTER}/location/delete`, data),

  departmentGetList: (data: DepartmentGetListOptions) => requests.post(`${API_MASTER}/department/getlist`, data),
  departmentGetById: (data: DepartmentByIdOptions) => requests.post(`${API_MASTER}/department/getbyid`, data),
  saveDepartment: (data: saveDepartmentOptions) => requests.post(`${API_MASTER}/department/save`, data),
  departmentRemove: (data: DimensionRemoveOptions) => requests.post(`${API_MASTER}/department/delete`, data),

  projectGetList: (data: ProjectGetListOptions) => requests.post(`${API_MASTER}/project/getlist`, data),
  projectGetById: (data: ProjectByIdOptions) => requests.post(`${API_MASTER}/project/getbyid`, data),
  saveProject: (data: saveProjectOptions) => requests.post(`${API_MASTER}/project/save`, data),
  projectRemove: (data: DimensionRemoveOptions) => requests.post(`${API_MASTER}/project/delete`, data),
}

// Master GL Account
const GLAccount = {
  syncGLAccountMaster: (data: SyncGLAccountMasterOptions) => requests.post(`${API_MASTER}/account/sync`, data),
  glAccountGetList: (data: GLAccountGetListOptions) => requests.post(`${API_MASTER}/account/getlist`, data),
  GLAccountDropdown: (data: GLAccountDropdownOptions) => requests.post(`${API_MASTER}/account/getdropdown`, data),

  //No Accounting Tool
  importGLAccountData: (data: any) => requests.postForm(`${API_MASTER}/account/import`, data),
  saveGLAccount: (data: SaveGLAccountOptions) => requests.post(`${API_MASTER}/account/save`, data),
  glAccountGetById: (data: GLAccountByIdOptions) => requests.post(`${API_MASTER}/account/getbyid`, data),
  updateAccountStatus: (data: UpdateGLAccountStatusOptions) => requests.post(`${API_MASTER}/account/updatestatus`, data),
}

// Master Product & Service
const ProductService = {
  syncProductServiceMaster: (data: SyncProductServiceMasterOptions) =>
    requests.post(`${API_MASTER}/productandservice/sync`, data),
  productServiceGetList: (data: ProductServiceGetListOptions) => requests.post(`${API_MASTER}/productandservice/getlist`, data),
  glAccountList: (data: GLAccountOptions) => requests.post(`${API_MASTER}/productandservice/getdropdown`, data),
}

// Master Currency
const Currency = {
  syncCurrencyMaster: (data: SyncCurrencyMasterOptions) => requests.post(`${API_MASTER}/currency/sync`, data),
  currencyGetList: (data: CurrencyGetListOptions) => requests.post(`${API_MASTER}/currency/getlist`, data),
  currencyDropdown: (data: CurrencyDropdownOptions) => requests.post(`${API_MASTER}/currency/getdropdown`, data),
}

// AP Term Currency
const ApTerm = {
  syncApTermMaster: (data: SyncApTermMasterOptions) => requests.post(`${API_MASTER}/term/sync`, data),
  aptermGetList: (data: ApTermGetListOptions) => requests.post(`${API_MASTER}/term/getlist`, data),
  aptermDropdown: (data: ApTermDropdownOptions) => requests.post(`${API_MASTER}/term/getdropdown`, data),

  //No Accounting Tool
  importApTermData: (data: any) => requests.postForm(`${API_MASTER}/term/import`, data),
  saveTerm: (data: SaveTermOptions) => requests.post(`${API_MASTER}/term/save`, data),
  termGetById: (data: TermByIdOptions) => requests.post(`${API_MASTER}/term/getbyid`, data),
  updateTermStatus: (data: UpdateTermStatusOptions) => requests.post(`${API_MASTER}/term/updatestatus`, data),
}

// Notification
const Notification = {
  getNotificationMatrix: () => requests.get(`${API_NOTIFICATION}/notification/getmatrix`),
  getEmailTemplate: (data: GetEmailTemplate) => requests.post(`${API_NOTIFICATION}/notification/gettemplate`, data),
  saveEmailTemplate: (data: GetEmailTemplate) => requests.post(`${API_NOTIFICATION}/notification/savetemplate`, data),
  saveNotificationMatrix: (data: SaveNotificationMatrix) => requests.post(`${API_NOTIFICATION}/notification/savematrix`, data),
  updateSummaryStatus: (data: UpdateSummaryStatus) =>
    requests.post(`${API_NOTIFICATION}/notification/updatesummarytypestatus`, data),
  getSummaryData: () => requests.get(`${API_NOTIFICATION}/notification/getsummarytype`),
  saveSummaryData: (data: SaveSummaryData) => requests.post(`${API_NOTIFICATION}/notification/savesummarytype`, data),
  getNotificationList: () => requests.get(`${API_NOTIFICATION}/notification/getportalnotification`),
  readAllNotifications: (data: ReadDeleteAllNotificationProps) =>
    requests.post(`${API_NOTIFICATION}/notification/markasread`, data),
  deleteAllNotifications: (data: ReadDeleteAllNotificationProps) => requests.post(`${API_NOTIFICATION}/notification/clear`, data),
}

// Bill Posting
const Bill = {
  documentGetList: (data: documentGetListOptions) => requests.post(`${API_FILEUPLOAD}/document/getlist`, data),
  documentGetStatusList: () => requests.get(`${API_FILEUPLOAD}/document/getstatusdropdown`),
  getVendorList: (data: vendorListOptions) => requests.post(`${API_FILEUPLOAD}/vendor/getlist`, data),
  getProcessList: () => requests.get(`${API_ADMIN}/settings/getprocessdropdown`),
  getLocationList: (data: any) => requests.post(`${API_MASTER}/location/getdropdown`, data),
  getUserList: (data: userListOptions) => requests.post(`${API_ADMIN}/user/getlist`, data),
  removeDocument: (data: removeDocumentOptions) => requests.post(`${API_FILEUPLOAD}/document/delete`, data),
  deleteDocument: (data: deleteDocumentOptions) => requests.post(`${API_FILEUPLOAD}/document/updateStatus`, data),
  getAssigneeList: (data: assigneeOptions) => requests.post(`${API_MANAGE}/user/getdropdownbycompany`, data),
  assignDocumentsToUser: (data: assignDocumentToUserOptions) => requests.post(`${API_FILEUPLOAD}/document/update`, data),
  getfieldmappings: (data: getFieldMappingOptions) => requests.post(`${API_MANAGE}/settings/getfieldmappings`, data),
  documentDetailById: (data: getDocumentByIdOptions) => requests.post(`${API_FILEUPLOAD}/document/getdetails`, data),
  mergeDocuments: (data: mergeDocumentOptions) => requests.post(`${API_FILEUPLOAD}/document/mergepdf`, data),
  splitDocuments: (data: SplitDocumentOptions) => requests.post(`${API_FILEUPLOAD}/document/splitpdf`, data),
  getocrDocument: (data: GetOcrDocumentOptions) => requests.post(`${API_FILEUPLOAD}/indexing/getocrDocument`, data),
  accountPayableSave: (data: any) => requests.post(`${API_FILEUPLOAD}/accountpayable/save`, data),
  getColumnMappingList: (data: getColumnMappingListOptions) =>
    requests.post(`${API_FILEUPLOAD}/document/getcolumnmappinglist`, data),
  saveColumnMappingList: (data: any) => requests.post(`${API_FILEUPLOAD}/document/savecolumnmapping`, data),
  uploadAttachment: (data: any) => requests.postForm(`${API_FILEUPLOAD}/document/uploadattachments`, data),
  processTypeChangeByDocumentId: (data: any) => requests.post(`${API_FILEUPLOAD}/document/updateProcess`, data),
  vendorDropdown: (data: any) => requests.post(`${API_MASTER}/vendor/getdropdown`, data),
  termDropdown: (data: VendorListOptions) => requests.post(`${API_MASTER}/term/getdropdown`, data),
  deletelineItem: (data: any) => requests.post(`${API_FILEUPLOAD}/document/deletelineitem`, data),
  getGLAccountDropdown: (data: any) => requests.post(`${API_MASTER}/account/getdropdown`, data),
  getClassDropdown: (data: any) => requests.post(`${API_MASTER}/class/getdropdown`, data),
  getProductServiceDropdown: (data: any) => requests.post(`${API_MASTER}/productandservice/getdropdown`, data),
  getCustomerDropdown: (data: any) => requests.post(`${API_MASTER}/customer/getdropdown`, data),
  getProjectDropdown: (data: any) => requests.post(`${API_MASTER}/project/getdropdown`, data),
  getDepartmentDropdown: (data: any) => requests.post(`${API_MASTER}/department/getdropdown`, data),
}

//Field Mapping
const FieldMapping = {
  // Get ProcessType Api From BillPosting
  getFieldMappingData: (data: GetFieldMappings) => requests.post(`${API_MANAGE}/settings/getfieldmappings`, data),
  saveFieldMappingData: (data: SaveFieldMappings) => requests.post(`${API_MANAGE}/settings/savefieldmappings`, data),
}

const BillApproval = {
  getBillApprovalList: (data: getBillApprovalLists) => requests.post(`${API_BILLS}/approval/getlist`, data),
  billsApproval: (data: billApprovals) => requests.post(`${API_BILLS}/approval/set`, data),
  reAssign: (data: reAssigns) => requests.post(`${API_BILLS}/approval/reassign`, data),
  vendorList: (data: vendordropdown) => requests.post(`${API_MASTER}/vendor/getdropdown`, data),
}

// Bills-To-Pay
const BillsToPay = {
  getStatusList: () => requests.get(`${API_BILLSTOPAY}/payment/getstatusdropdown`),
  getAgingFilterDropdown: () => requests.get(`${API_BILLSTOPAY}/payment/getagingfilterdropdown`),
  getPaymentMethods: () => requests.get(`${API_BILLSTOPAY}/payment/getpaymentmethoddropdown`),

  getLocationDropDownList: (data: any) => requests.post(`${API_MASTER}/location/getdropdown`, data),
  getBankAccountDrpdwnList: (data: bankAccDropDownProps) =>
    requests.post(`${API_BILLSTOPAY}/payment/getbankaccountdropdown`, data),
  paymentGetList: (data: paymentGetListProps) => requests.post(`${API_BILLSTOPAY}/payment/getlist`, data),
  getPaymentColumnMapping: (data: paymentColumnMappingProps) =>
    requests.post(`${API_BILLSTOPAY}/Payment/getcolumnmappinglist`, data),
  savePaymentColumnMapping: (data: saveColumnMappingProps) => requests.post(`${API_BILLSTOPAY}/Payment/savecolumnmapping`, data),
  markAsPaidAndBillsOnHold: (data: markaspaidProps) => requests.post(`${API_BILLSTOPAY}/Payment/markaspaidandbillsonhold`, data),
  getVendorAginglist: (data: vendorAgingListProps) => requests.post(`${API_BILLSTOPAY}/Payment/getvendoraginglist`, data),
  getVendorAgingDaysDrpdwn: (data: VendorAgingDaysDrpdwn) =>
    requests.post(`${API_BILLSTOPAY}/Payment/getvendoragingdaysdrpdwn`, data),
  getVendorCreditList: (data: vendorCreditListProps) => requests.post(`${API_BILLSTOPAY}/Payment/getvendorcredit`, data),
  moveBillToPay: (data: moveBillToPayProps) => requests.post(`${API_BILLSTOPAY}/payment/onholdaction`, data),
  getautomaticvendorcredit: (data: BillDetailsPayload) =>
    requests.post(`${API_BILLSTOPAY}/payment/getautomaticvendorcredit`, data),
  sendForPay: (data: PaymentPayload) => requests.post(`${API_BILLSTOPAY}/payment/sentforpayment`, data),
}

// Payment Status
const PaymentStatus = {
  paymentStatusGetList: (data: PaymentStatusListOptions) => requests.post(`${API_BILLSTOPAY}/paymentstatus/getlist`, data),
  getPaymentStatusColumnMapping: (data: GetPaymentStatusColumnMappingOptions) =>
    requests.post(`${API_BILLSTOPAY}/Paymentstatus/getcolumnmappinglist`, data),
  savePaymentStatusColumnMapping: (data: SavePaymentStatusColumnMappingOptions) =>
    requests.post(`${API_BILLSTOPAY}/Paymentstatus/savecolumnmapping`, data),
  paymentStatusDropdown: () => requests.get(`${API_BILLSTOPAY}/payment/getallstatusdropdown`),
}

//Workflow Automation
const Automation = {
  automationGetRuleList: (data: AutomationGetRuleListOptions) => requests.post(`${API_MANAGE}/settings/automation/getRule`, data),
  ruleActiveInactive: (data: RuleActiveInactiveOptions) =>
    requests.post(`${API_MANAGE}/settings/automation/activeInActiveRule`, data),
  ruleGetById: (data: RuleByIdOptions) => requests.post(`${API_MANAGE}/settings/automation/getRuleById`, data),
  saveRule: (data: SaveRuleOptions) => requests.post(`${API_MANAGE}/settings/automation/saveRule`, data),
}

//Vendor
const Vendor = {
  syncVendor: (data: SyncVendorOptions) => requests.post(`${API_MASTER}/vendor/sync`, data),
  vendorDropdownList: (data: VendorDropdownListOptions) => requests.post(`${API_MASTER}/vendor/getdropdown`, data),
  vendorGetDropdownList: (data: VendorGetDropdownListOptions) =>
    requests.post(`${API_MANAGE}/settings/automation/getvendordropdown`, data),
  vendorGetList: (data: VendorGetListOptions) => requests.post(`${API_MASTER}/vendor/getlist`, data),
  vendorSync: (data: VendorSyncOptions) => requests.post(`${API_MASTER}/vendor/sync`, data),
  vendorSave: (data: any) => requests.post(`${API_MASTER}/vendor/save`, data),
  vendorGetById: (data: VendorGetByIdOptions) => requests.post(`${API_MASTER}/vendor/getbyid`, data),
  vendorUpdateStatus: (data: VendorUpdateStatusOptions) => requests.post(`${API_MASTER}/vendor/updatestatus`, data),
  importVendorData: (data: any) => requests.postForm(`${API_MASTER}/vendor/import`, data),
}

//Activity
const Activity = {
  getActivityList: (data: ActivityListOptions) => requests.post(`${API_ACTIVTY}/activity/getlist`, data),
  getWatcherList: (data: ActivityWatcherListOptions) => requests.post(`${API_ACTIVTY}/activity/getwatcherlist`, data),
  saveActivityList: (data: SaveActivityListOptions) => requests.post(`${API_ACTIVTY}/activity/save`, data),
  saveWatcherList: (data: SaveWatcherListOptions) => requests.post(`${API_ACTIVTY}/activity/savewatchers`, data),
  updateResolved: (data: UpdateResloved) => requests.post(`${API_ACTIVTY}/activity/updateisresolved`, data),
  storeNotification: (data: ActivityNotificationOptions) =>
    requests.post(`${API_REALTIMENOTIFICATION}/notifications/store`, data),
}

// Reports
const Reports = {
  // Reports Header List API
  getHeaderList: () => requests.get(`${API_REPORTS}/report/getreportheader`),

  // AP Aging Detail Reports API
  apAgingDetail: (data: apAgingDetailsProps) => requests.post(`${API_REPORTS}/Reports/getapagingdetail`, data),
  getApAgingDetailsColumnMapping: (data: getApAgingDetailsColumnMappingOptions) =>
    requests.post(`${API_REPORTS}/reports/getcolumnmappinglist`, data),
  saveApAgingDetailsColumnMapping: (data: SaveApAgingDetailsColumnMappingOptions) =>
    requests.post(`${API_REPORTS}/reports/savecolumnmapping`, data),

  // AP Aging Summary Reports API
  apAgingSummary: (data: apAgingSummaryProps) => requests.post(`${API_REPORTS}/reports/getapagingsummary`, data),
  apAgingSummaryDrawer: (data: apAgingSummaryDrawerProps) =>
    requests.post(`${API_REPORTS}/reports/getapagingdetaildaywise`, data),

  // Unpaid Bills Reports API
  unpaidBills: (data: unpainBillsProps) => requests.post(`${API_REPORTS}/reports/getunpaidbill`, data),
  getUnpaidBillsColumnMapping: (data: getUnpaidBillsColumnMappingOptions) =>
    requests.post(`${API_REPORTS}/reports/getcolumnmappinglist`, data),
  saveUnpaidBillsColumnMapping: (data: saveUnpaidBillsColumnMappingOptions) =>
    requests.post(`${API_REPORTS}/reports/savecolumnmapping`, data),

  // Vendor Balance Detail Reports API
  vendorBalanceDetail: (data: VendorBalanceDetailProps) => requests.post(`${API_REPORTS}/reports/getvendorbaldetail`, data),
  getVendorBalanceDetailColumnMapping: (data: getVendorBalanceDetailColumnMappingOptions) =>
    requests.post(`${API_REPORTS}/reports/getcolumnmappinglist`, data),
  saveVendorBalanceDetailColumnMapping: (data: saveVendorBalanceDetailColumnMappingOptions) =>
    requests.post(`${API_REPORTS}/reports/savecolumnmapping`, data),

  // Vendor Balance Summary Reports API
  vendorBalanceSummary: (data: VendorBalanceSummaryProps) => requests.post(`${API_REPORTS}/reports/getvendorbalsummary`, data),

  // Bill Analysis Reports API
  billAnalysis: (data: BillAnalysisProps) => requests.post(`${API_REPORTS}/reports/getbillanalysissum`, data),
  getBillAnalysisColumnMapping: (data: getBillAnalysisColumnMappingOptions) =>
    requests.post(`${API_REPORTS}/reports/getcolumnmappinglist`, data),
  saveBillAnalysisColumnMapping: (data: SaveBillAnalysisColumnMappingOptions) =>
    requests.post(`${API_REPORTS}/reports/savecolumnmapping`, data),

  // Vendor Aging Reports API
  vendorAgingGroupBy: (data: vendorAgingGroupByProps) => requests.post(`${API_REPORTS}/reports/getvendoraginggroupby`, data),
  vendorAgingSummary: (data: vendorAgingSummaryProps) => requests.post(`${API_REPORTS}/reports/getvendoragingsummary`, data),
}

const Global = {
  getSearchHistory: (data: GetSearchHistoryOptions) => requests.post(`${API_GLOBAL}/global/gethistory`, data),
  saveSearchHistory: (data: SaveSearchHistoryOptions) => requests.post(`${API_GLOBAL}/global/savehistory`, data),
  getSearchResult: (data: SearchResultOptions) => requests.post(`${API_GLOBAL}/global/search`, data),
}

const Files = {
  historyGetList: (data: historyGetListProps) => requests.post(`${API_FILEUPLOAD}/documenthistory/getlist`, data),
  getBillNumbersList: () => requests.get(`${API_FILEUPLOAD}/documenthistory/getbillnumberdropdown`),
  linkBillToExistingBill: (data: linkBillToExistingBillProps) =>
    requests.post(`${API_FILEUPLOAD}/documenthistory/addattachments`, data),
  handleHistoryDocumentRetry: (data: handleHistoryDocumentRetryProps) =>
    requests.post(`${API_FILEUPLOAD}/documenthistory/sendforocr`, data),
}

const APIs = {
  vendorDropdown: (data: any) => requests.post(`${API_MASTER}/vendor/getdropdown`, data),
  termDropdown: (data: any) => requests.post(`${API_MASTER}/term/getdropdown`, data),
  accountDropdown: (data: any) => requests.post(`${API_MASTER}/account/getdropdown`, data),
  classDropdown: (data: any) => requests.post(`${API_MASTER}/class/getdropdown`, data),
  productServiceDropdown: (data: any) => requests.post(`${API_MASTER}/productandservice/getdropdown`, data),
  customerDropdown: (data: any) => requests.post(`${API_MASTER}/customer/getdropdown`, data),
  projectDropdown: (data: any) => requests.post(`${API_MASTER}/project/getdropdown`, data),
  departmentDropdown: (data: any) => requests.post(`${API_MASTER}/department/getdropdown`, data),
  locationDropdown: (data: any) => requests.post(`${API_MASTER}/location/getdropdown`, data),

  processDropdown: () => requests.get(`${API_ADMIN}/settings/getprocessdropdown`),
  statusDropdown: () => requests.get(`${API_FILEUPLOAD}/document/getstatusdropdown`),
  userDropdown: (data: any) => requests.post(`${API_MANAGE}/user/getdropdownbycompany`, data),

  getFieldMappings: (data: getFieldMappingOptions) => requests.post(`${API_MANAGE}/settings/getfieldmappings`, data),
  getDocumentDetails: (data: getDocumentByIdOptions) => requests.post(`${API_FILEUPLOAD}/document/getdetails`, data),

  deleteLineItem: (data: any) => requests.post(`${API_FILEUPLOAD}/document/deletelineitem`, data),
  saveColumnMappingList: (data: any) => requests.post(`${API_FILEUPLOAD}/document/savecolumnmapping`, data),

  documentGetList: (data: documentGetListOptions) => requests.post(`${API_FILEUPLOAD}/document/getlist`, data),

  mergeDocuments: (data: mergeDocumentOptions) => requests.post(`${API_FILEUPLOAD}/document/mergepdf`, data),
  splitDocuments: (data: SplitDocumentOptions) => requests.post(`${API_FILEUPLOAD}/document/splitpdf`, data),
  getocrDocument: (data: GetOcrDocumentOptions) => requests.post(`${API_FILEUPLOAD}/indexing/getocrDocument`, data),

  accountPayableSave: (data: any) => requests.post(`${API_FILEUPLOAD}/accountpayable/save`, data),
  uploadAttachment: (data: any) => requests.postForm(`${API_FILEUPLOAD}/document/uploadattachments`, data),
}

const agent = {
  Auth,
  ApTerm,
  Company,
  Dimension,
  GLAccount,
  Currency,
  FileUpload,
  ProductService,
  PaymentStatus,
  Profile,
  Role,
  User,
  Bill,
  FieldMapping,
  BillsToPay,
  Automation,
  Vendor,
  BillApproval,
  Activity,
  Notification,
  Global,
  Reports,
  Files,
  APIs,
}

export default agent
