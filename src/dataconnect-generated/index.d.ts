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
  eventdesc: string;
  starttime: TimestampString;
  endtime: TimestampString;
}

export interface EventList_Key {
  id: UUIDString;
  __typename?: 'EventList_Key';
}

export interface GetEventByIdData {
  eventList?: {
    id: UUIDString;
    eventcoord: UUIDString;
    eventname: string;
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

export interface ListEventsData {
  eventLists: ({
    id: UUIDString;
    eventcoord: UUIDString;
    eventname: string;
    eventdesc: string;
    starttime: TimestampString;
    endtime: TimestampString;
  } & EventList_Key)[];
}

export interface ListUsersData {
  userLists: ({
    id: UUIDString;
    firstname: string;
    lastname: string;
    age: number;
    major: string;
  } & UserList_Key)[];
}

export interface UserList_Key {
  id: UUIDString;
  __typename?: 'UserList_Key';
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

