import { ListEventsData, GetEventByIdData, GetEventByIdVariables, CreateEventData, CreateEventVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListEvents(options?: useDataConnectQueryOptions<ListEventsData>): UseDataConnectQueryResult<ListEventsData, undefined>;
export function useListEvents(dc: DataConnect, options?: useDataConnectQueryOptions<ListEventsData>): UseDataConnectQueryResult<ListEventsData, undefined>;

export function useGetEventById(vars: GetEventByIdVariables, options?: useDataConnectQueryOptions<GetEventByIdData>): UseDataConnectQueryResult<GetEventByIdData, GetEventByIdVariables>;
export function useGetEventById(dc: DataConnect, vars: GetEventByIdVariables, options?: useDataConnectQueryOptions<GetEventByIdData>): UseDataConnectQueryResult<GetEventByIdData, GetEventByIdVariables>;

export function useCreateEvent(options?: useDataConnectMutationOptions<CreateEventData, FirebaseError, CreateEventVariables>): UseDataConnectMutationResult<CreateEventData, CreateEventVariables>;
export function useCreateEvent(dc: DataConnect, options?: useDataConnectMutationOptions<CreateEventData, FirebaseError, CreateEventVariables>): UseDataConnectMutationResult<CreateEventData, CreateEventVariables>;
