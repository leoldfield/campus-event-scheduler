import { ListEventsData, ListUsersData, GetEventByIdData, GetEventByIdVariables, CreateEventData, CreateEventVariables, GetFirstNameByIdData, GetFirstNameByIdVariables, GetNameByIdData, GetNameByIdVariables, ValidateUserCredentialsData, ValidateUserCredentialsVariables, ListRegistrationsData, GetRegistrationData, GetRegistrationVariables, CreateRegistrationData, CreateRegistrationVariables, CreateUserData, CreateUserVariables, FindUserByEmailData, FindUserByEmailVariables, GetUserByFirebaseUidData, GetUserByFirebaseUidVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListEvents(options?: useDataConnectQueryOptions<ListEventsData>): UseDataConnectQueryResult<ListEventsData, undefined>;
export function useListEvents(dc: DataConnect, options?: useDataConnectQueryOptions<ListEventsData>): UseDataConnectQueryResult<ListEventsData, undefined>;

export function useListUsers(options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;
export function useListUsers(dc: DataConnect, options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;

export function useGetEventById(vars: GetEventByIdVariables, options?: useDataConnectQueryOptions<GetEventByIdData>): UseDataConnectQueryResult<GetEventByIdData, GetEventByIdVariables>;
export function useGetEventById(dc: DataConnect, vars: GetEventByIdVariables, options?: useDataConnectQueryOptions<GetEventByIdData>): UseDataConnectQueryResult<GetEventByIdData, GetEventByIdVariables>;

export function useCreateEvent(options?: useDataConnectMutationOptions<CreateEventData, FirebaseError, CreateEventVariables>): UseDataConnectMutationResult<CreateEventData, CreateEventVariables>;
export function useCreateEvent(dc: DataConnect, options?: useDataConnectMutationOptions<CreateEventData, FirebaseError, CreateEventVariables>): UseDataConnectMutationResult<CreateEventData, CreateEventVariables>;

export function useGetFirstNameById(vars: GetFirstNameByIdVariables, options?: useDataConnectQueryOptions<GetFirstNameByIdData>): UseDataConnectQueryResult<GetFirstNameByIdData, GetFirstNameByIdVariables>;
export function useGetFirstNameById(dc: DataConnect, vars: GetFirstNameByIdVariables, options?: useDataConnectQueryOptions<GetFirstNameByIdData>): UseDataConnectQueryResult<GetFirstNameByIdData, GetFirstNameByIdVariables>;

export function useGetNameById(vars: GetNameByIdVariables, options?: useDataConnectQueryOptions<GetNameByIdData>): UseDataConnectQueryResult<GetNameByIdData, GetNameByIdVariables>;
export function useGetNameById(dc: DataConnect, vars: GetNameByIdVariables, options?: useDataConnectQueryOptions<GetNameByIdData>): UseDataConnectQueryResult<GetNameByIdData, GetNameByIdVariables>;

export function useValidateUserCredentials(vars: ValidateUserCredentialsVariables, options?: useDataConnectQueryOptions<ValidateUserCredentialsData>): UseDataConnectQueryResult<ValidateUserCredentialsData, ValidateUserCredentialsVariables>;
export function useValidateUserCredentials(dc: DataConnect, vars: ValidateUserCredentialsVariables, options?: useDataConnectQueryOptions<ValidateUserCredentialsData>): UseDataConnectQueryResult<ValidateUserCredentialsData, ValidateUserCredentialsVariables>;

export function useListRegistrations(options?: useDataConnectQueryOptions<ListRegistrationsData>): UseDataConnectQueryResult<ListRegistrationsData, undefined>;
export function useListRegistrations(dc: DataConnect, options?: useDataConnectQueryOptions<ListRegistrationsData>): UseDataConnectQueryResult<ListRegistrationsData, undefined>;

export function useGetRegistration(vars: GetRegistrationVariables, options?: useDataConnectQueryOptions<GetRegistrationData>): UseDataConnectQueryResult<GetRegistrationData, GetRegistrationVariables>;
export function useGetRegistration(dc: DataConnect, vars: GetRegistrationVariables, options?: useDataConnectQueryOptions<GetRegistrationData>): UseDataConnectQueryResult<GetRegistrationData, GetRegistrationVariables>;

export function useCreateRegistration(options?: useDataConnectMutationOptions<CreateRegistrationData, FirebaseError, CreateRegistrationVariables>): UseDataConnectMutationResult<CreateRegistrationData, CreateRegistrationVariables>;
export function useCreateRegistration(dc: DataConnect, options?: useDataConnectMutationOptions<CreateRegistrationData, FirebaseError, CreateRegistrationVariables>): UseDataConnectMutationResult<CreateRegistrationData, CreateRegistrationVariables>;

export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;

export function useFindUserByEmail(vars: FindUserByEmailVariables, options?: useDataConnectQueryOptions<FindUserByEmailData>): UseDataConnectQueryResult<FindUserByEmailData, FindUserByEmailVariables>;
export function useFindUserByEmail(dc: DataConnect, vars: FindUserByEmailVariables, options?: useDataConnectQueryOptions<FindUserByEmailData>): UseDataConnectQueryResult<FindUserByEmailData, FindUserByEmailVariables>;

export function useGetUserByFirebaseUid(vars: GetUserByFirebaseUidVariables, options?: useDataConnectQueryOptions<GetUserByFirebaseUidData>): UseDataConnectQueryResult<GetUserByFirebaseUidData, GetUserByFirebaseUidVariables>;
export function useGetUserByFirebaseUid(dc: DataConnect, vars: GetUserByFirebaseUidVariables, options?: useDataConnectQueryOptions<GetUserByFirebaseUidData>): UseDataConnectQueryResult<GetUserByFirebaseUidData, GetUserByFirebaseUidVariables>;

export function useUpdateUserProfile(options?: useDataConnectMutationOptions<UpdateUserProfileData, FirebaseError, UpdateUserProfileVariables>): UseDataConnectMutationResult<UpdateUserProfileData, UpdateUserProfileVariables>;
export function useUpdateUserProfile(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateUserProfileData, FirebaseError, UpdateUserProfileVariables>): UseDataConnectMutationResult<UpdateUserProfileData, UpdateUserProfileVariables>;
