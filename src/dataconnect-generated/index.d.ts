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
  eventid: UUIDString;
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
    eventid: UUIDString;
    eventcoord: UUIDString;
    eventname: string;
    eventdesc: string;
    starttime: TimestampString;
    endtime: TimestampString;
  };
}

export interface GetEventByIdVariables {
  eventid: UUIDString;
}

export interface ListEventsData {
  eventLists: ({
    eventid: UUIDString;
    eventcoord: UUIDString;
    eventname: string;
    eventdesc: string;
    starttime: TimestampString;
    endtime: TimestampString;
  })[];
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

