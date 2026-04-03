import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateEventData {
  eventList_insert: EventList_Key;
}

export interface CreateEventVariables {
  id: UUIDString;
  eventcoord: UUIDString;
  eventname: string;
  location: string;
  eventdesc: string;
  starttime: TimestampString;
  endtime: TimestampString;
}

export interface CreateRegistrationData {
  registration_insert: Registration_Key;
}

export interface CreateRegistrationVariables {
  eventId: UUIDString;
  userId: UUIDString;
  notif?: boolean | null;
}

export interface CreateUserData {
  userList_insert: UserList_Key;
}

export interface CreateUserVariables {
  id: UUIDString;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  age: number;
  major: string;
}

export interface EventList_Key {
  id: UUIDString;
  __typename?: 'EventList_Key';
}

export interface FindUserByEmailData {
  userLists: ({
    id: UUIDString;
  } & UserList_Key)[];
}

export interface FindUserByEmailVariables {
  email: string;
}

export interface GetEventByIdData {
  eventList?: {
    id: UUIDString;
    eventcoord: UUIDString;
    eventname: string;
    location?: string | null;
    eventdesc: string;
    starttime: TimestampString;
    endtime: TimestampString;
  } & EventList_Key;
}

export interface GetEventByIdVariables {
  id: UUIDString;
}

export interface GetFirstNameByIdData {
  userList?: {
    firstname: string;
  };
}

export interface GetFirstNameByIdVariables {
  id: UUIDString;
}

export interface GetNameByIdData {
  userList?: {
    firstname: string;
    lastname: string;
  };
}

export interface GetNameByIdVariables {
  id: UUIDString;
}

export interface GetRegistrationData {
  registration?: {
    eventId: UUIDString;
    userId: UUIDString;
    notif?: boolean | null;
  } & Registration_Key;
}

export interface GetRegistrationVariables {
  eventId: UUIDString;
  userId: UUIDString;
}

export interface ListEventsData {
  eventLists: ({
    id: UUIDString;
    eventcoord: UUIDString;
    eventname: string;
    location?: string | null;
    eventdesc: string;
    starttime: TimestampString;
    endtime: TimestampString;
  } & EventList_Key)[];
}

export interface ListRegistrationsData {
  registrations: ({
    eventId: UUIDString;
    userId: UUIDString;
    notif?: boolean | null;
  } & Registration_Key)[];
}

export interface ListUsersData {
  userLists: ({
    id: UUIDString;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    age: number;
    major: string;
  } & UserList_Key)[];
}

export interface Registration_Key {
  eventId: UUIDString;
  userId: UUIDString;
  __typename?: 'Registration_Key';
}

export interface UserList_Key {
  id: UUIDString;
  __typename?: 'UserList_Key';
}

export interface ValidateUserCredentialsData {
  userLists: ({
    id: UUIDString;
    firstname: string;
    lastname: string;
    email: string;
  } & UserList_Key)[];
}

export interface ValidateUserCredentialsVariables {
  email: string;
  password: string;
}

interface ListEventsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListEventsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListEventsData, undefined>;
  operationName: string;
}
export const listEventsRef: ListEventsRef;

export function listEvents(): QueryPromise<ListEventsData, undefined>;
export function listEvents(dc: DataConnect): QueryPromise<ListEventsData, undefined>;

interface ListUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
  operationName: string;
}
export const listUsersRef: ListUsersRef;

export function listUsers(): QueryPromise<ListUsersData, undefined>;
export function listUsers(dc: DataConnect): QueryPromise<ListUsersData, undefined>;

interface GetEventByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetEventByIdVariables): QueryRef<GetEventByIdData, GetEventByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetEventByIdVariables): QueryRef<GetEventByIdData, GetEventByIdVariables>;
  operationName: string;
}
export const getEventByIdRef: GetEventByIdRef;

export function getEventById(vars: GetEventByIdVariables): QueryPromise<GetEventByIdData, GetEventByIdVariables>;
export function getEventById(dc: DataConnect, vars: GetEventByIdVariables): QueryPromise<GetEventByIdData, GetEventByIdVariables>;

interface CreateEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateEventVariables): MutationRef<CreateEventData, CreateEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateEventVariables): MutationRef<CreateEventData, CreateEventVariables>;
  operationName: string;
}
export const createEventRef: CreateEventRef;

export function createEvent(vars: CreateEventVariables): MutationPromise<CreateEventData, CreateEventVariables>;
export function createEvent(dc: DataConnect, vars: CreateEventVariables): MutationPromise<CreateEventData, CreateEventVariables>;

interface GetFirstNameByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFirstNameByIdVariables): QueryRef<GetFirstNameByIdData, GetFirstNameByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetFirstNameByIdVariables): QueryRef<GetFirstNameByIdData, GetFirstNameByIdVariables>;
  operationName: string;
}
export const getFirstNameByIdRef: GetFirstNameByIdRef;

export function getFirstNameById(vars: GetFirstNameByIdVariables): QueryPromise<GetFirstNameByIdData, GetFirstNameByIdVariables>;
export function getFirstNameById(dc: DataConnect, vars: GetFirstNameByIdVariables): QueryPromise<GetFirstNameByIdData, GetFirstNameByIdVariables>;

interface GetNameByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetNameByIdVariables): QueryRef<GetNameByIdData, GetNameByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetNameByIdVariables): QueryRef<GetNameByIdData, GetNameByIdVariables>;
  operationName: string;
}
export const getNameByIdRef: GetNameByIdRef;

export function getNameById(vars: GetNameByIdVariables): QueryPromise<GetNameByIdData, GetNameByIdVariables>;
export function getNameById(dc: DataConnect, vars: GetNameByIdVariables): QueryPromise<GetNameByIdData, GetNameByIdVariables>;

interface ValidateUserCredentialsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ValidateUserCredentialsVariables): QueryRef<ValidateUserCredentialsData, ValidateUserCredentialsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ValidateUserCredentialsVariables): QueryRef<ValidateUserCredentialsData, ValidateUserCredentialsVariables>;
  operationName: string;
}
export const validateUserCredentialsRef: ValidateUserCredentialsRef;

export function validateUserCredentials(vars: ValidateUserCredentialsVariables): QueryPromise<ValidateUserCredentialsData, ValidateUserCredentialsVariables>;
export function validateUserCredentials(dc: DataConnect, vars: ValidateUserCredentialsVariables): QueryPromise<ValidateUserCredentialsData, ValidateUserCredentialsVariables>;

interface ListRegistrationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListRegistrationsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListRegistrationsData, undefined>;
  operationName: string;
}
export const listRegistrationsRef: ListRegistrationsRef;

export function listRegistrations(): QueryPromise<ListRegistrationsData, undefined>;
export function listRegistrations(dc: DataConnect): QueryPromise<ListRegistrationsData, undefined>;

interface GetRegistrationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetRegistrationVariables): QueryRef<GetRegistrationData, GetRegistrationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetRegistrationVariables): QueryRef<GetRegistrationData, GetRegistrationVariables>;
  operationName: string;
}
export const getRegistrationRef: GetRegistrationRef;

export function getRegistration(vars: GetRegistrationVariables): QueryPromise<GetRegistrationData, GetRegistrationVariables>;
export function getRegistration(dc: DataConnect, vars: GetRegistrationVariables): QueryPromise<GetRegistrationData, GetRegistrationVariables>;

interface CreateRegistrationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateRegistrationVariables): MutationRef<CreateRegistrationData, CreateRegistrationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateRegistrationVariables): MutationRef<CreateRegistrationData, CreateRegistrationVariables>;
  operationName: string;
}
export const createRegistrationRef: CreateRegistrationRef;

export function createRegistration(vars: CreateRegistrationVariables): MutationPromise<CreateRegistrationData, CreateRegistrationVariables>;
export function createRegistration(dc: DataConnect, vars: CreateRegistrationVariables): MutationPromise<CreateRegistrationData, CreateRegistrationVariables>;

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface FindUserByEmailRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: FindUserByEmailVariables): QueryRef<FindUserByEmailData, FindUserByEmailVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: FindUserByEmailVariables): QueryRef<FindUserByEmailData, FindUserByEmailVariables>;
  operationName: string;
}
export const findUserByEmailRef: FindUserByEmailRef;

export function findUserByEmail(vars: FindUserByEmailVariables): QueryPromise<FindUserByEmailData, FindUserByEmailVariables>;
export function findUserByEmail(dc: DataConnect, vars: FindUserByEmailVariables): QueryPromise<FindUserByEmailData, FindUserByEmailVariables>;

