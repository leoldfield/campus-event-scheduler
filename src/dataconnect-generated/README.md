# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListEvents*](#listevents)
  - [*ListUsers*](#listusers)
  - [*GetEventByID*](#geteventbyid)
  - [*GetFirstNameByID*](#getfirstnamebyid)
  - [*GetNameByID*](#getnamebyid)
  - [*ValidateUserCredentials*](#validateusercredentials)
  - [*ListRegistrations*](#listregistrations)
  - [*GetRegistration*](#getregistration)
  - [*FindUserByEmail*](#finduserbyemail)
  - [*GetUserByFirebaseUid*](#getuserbyfirebaseuid)
- [**Mutations**](#mutations)
  - [*CreateEvent*](#createevent)
  - [*CreateRegistration*](#createregistration)
  - [*CreateUser*](#createuser)
  - [*UpdateUserProfile*](#updateuserprofile)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListEvents
You can execute the `ListEvents` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listEvents(options?: ExecuteQueryOptions): QueryPromise<ListEventsData, undefined>;

interface ListEventsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListEventsData, undefined>;
}
export const listEventsRef: ListEventsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listEvents(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListEventsData, undefined>;

interface ListEventsRef {
  ...
  (dc: DataConnect): QueryRef<ListEventsData, undefined>;
}
export const listEventsRef: ListEventsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listEventsRef:
```typescript
const name = listEventsRef.operationName;
console.log(name);
```

### Variables
The `ListEvents` query has no variables.
### Return Type
Recall that executing the `ListEvents` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListEventsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListEventsData {
  eventLists: ({
    id: UUIDString;
    eventcoord: UUIDString;
    eventname: string;
    location?: string | null;
    eventdesc: string;
    starttime: TimestampString;
    endtime: TimestampString;
    eventstatus: boolean;
  } & EventList_Key)[];
}
```
### Using `ListEvents`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listEvents } from '@dataconnect/generated';


// Call the `listEvents()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listEvents();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listEvents(dataConnect);

console.log(data.eventLists);

// Or, you can use the `Promise` API.
listEvents().then((response) => {
  const data = response.data;
  console.log(data.eventLists);
});
```

### Using `ListEvents`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listEventsRef } from '@dataconnect/generated';


// Call the `listEventsRef()` function to get a reference to the query.
const ref = listEventsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listEventsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.eventLists);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.eventLists);
});
```

## ListUsers
You can execute the `ListUsers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listUsers(options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface ListUsersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
}
export const listUsersRef: ListUsersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface ListUsersRef {
  ...
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
}
export const listUsersRef: ListUsersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listUsersRef:
```typescript
const name = listUsersRef.operationName;
console.log(name);
```

### Variables
The `ListUsers` query has no variables.
### Return Type
Recall that executing the `ListUsers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListUsersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListUsers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listUsers } from '@dataconnect/generated';


// Call the `listUsers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listUsers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listUsers(dataConnect);

console.log(data.userLists);

// Or, you can use the `Promise` API.
listUsers().then((response) => {
  const data = response.data;
  console.log(data.userLists);
});
```

### Using `ListUsers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listUsersRef } from '@dataconnect/generated';


// Call the `listUsersRef()` function to get a reference to the query.
const ref = listUsersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listUsersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userLists);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userLists);
});
```

## GetEventByID
You can execute the `GetEventByID` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getEventById(vars: GetEventByIdVariables, options?: ExecuteQueryOptions): QueryPromise<GetEventByIdData, GetEventByIdVariables>;

interface GetEventByIdRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetEventByIdVariables): QueryRef<GetEventByIdData, GetEventByIdVariables>;
}
export const getEventByIdRef: GetEventByIdRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getEventById(dc: DataConnect, vars: GetEventByIdVariables, options?: ExecuteQueryOptions): QueryPromise<GetEventByIdData, GetEventByIdVariables>;

interface GetEventByIdRef {
  ...
  (dc: DataConnect, vars: GetEventByIdVariables): QueryRef<GetEventByIdData, GetEventByIdVariables>;
}
export const getEventByIdRef: GetEventByIdRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getEventByIdRef:
```typescript
const name = getEventByIdRef.operationName;
console.log(name);
```

### Variables
The `GetEventByID` query requires an argument of type `GetEventByIdVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetEventByIdVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetEventByID` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetEventByIdData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetEventByID`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getEventById, GetEventByIdVariables } from '@dataconnect/generated';

// The `GetEventByID` query requires an argument of type `GetEventByIdVariables`:
const getEventByIdVars: GetEventByIdVariables = {
  id: ..., 
};

// Call the `getEventById()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getEventById(getEventByIdVars);
// Variables can be defined inline as well.
const { data } = await getEventById({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getEventById(dataConnect, getEventByIdVars);

console.log(data.eventList);

// Or, you can use the `Promise` API.
getEventById(getEventByIdVars).then((response) => {
  const data = response.data;
  console.log(data.eventList);
});
```

### Using `GetEventByID`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getEventByIdRef, GetEventByIdVariables } from '@dataconnect/generated';

// The `GetEventByID` query requires an argument of type `GetEventByIdVariables`:
const getEventByIdVars: GetEventByIdVariables = {
  id: ..., 
};

// Call the `getEventByIdRef()` function to get a reference to the query.
const ref = getEventByIdRef(getEventByIdVars);
// Variables can be defined inline as well.
const ref = getEventByIdRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getEventByIdRef(dataConnect, getEventByIdVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.eventList);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.eventList);
});
```

## GetFirstNameByID
You can execute the `GetFirstNameByID` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getFirstNameById(vars: GetFirstNameByIdVariables, options?: ExecuteQueryOptions): QueryPromise<GetFirstNameByIdData, GetFirstNameByIdVariables>;

interface GetFirstNameByIdRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFirstNameByIdVariables): QueryRef<GetFirstNameByIdData, GetFirstNameByIdVariables>;
}
export const getFirstNameByIdRef: GetFirstNameByIdRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getFirstNameById(dc: DataConnect, vars: GetFirstNameByIdVariables, options?: ExecuteQueryOptions): QueryPromise<GetFirstNameByIdData, GetFirstNameByIdVariables>;

interface GetFirstNameByIdRef {
  ...
  (dc: DataConnect, vars: GetFirstNameByIdVariables): QueryRef<GetFirstNameByIdData, GetFirstNameByIdVariables>;
}
export const getFirstNameByIdRef: GetFirstNameByIdRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getFirstNameByIdRef:
```typescript
const name = getFirstNameByIdRef.operationName;
console.log(name);
```

### Variables
The `GetFirstNameByID` query requires an argument of type `GetFirstNameByIdVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetFirstNameByIdVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetFirstNameByID` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetFirstNameByIdData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetFirstNameByIdData {
  userList?: {
    firstname: string;
  };
}
```
### Using `GetFirstNameByID`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getFirstNameById, GetFirstNameByIdVariables } from '@dataconnect/generated';

// The `GetFirstNameByID` query requires an argument of type `GetFirstNameByIdVariables`:
const getFirstNameByIdVars: GetFirstNameByIdVariables = {
  id: ..., 
};

// Call the `getFirstNameById()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getFirstNameById(getFirstNameByIdVars);
// Variables can be defined inline as well.
const { data } = await getFirstNameById({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getFirstNameById(dataConnect, getFirstNameByIdVars);

console.log(data.userList);

// Or, you can use the `Promise` API.
getFirstNameById(getFirstNameByIdVars).then((response) => {
  const data = response.data;
  console.log(data.userList);
});
```

### Using `GetFirstNameByID`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getFirstNameByIdRef, GetFirstNameByIdVariables } from '@dataconnect/generated';

// The `GetFirstNameByID` query requires an argument of type `GetFirstNameByIdVariables`:
const getFirstNameByIdVars: GetFirstNameByIdVariables = {
  id: ..., 
};

// Call the `getFirstNameByIdRef()` function to get a reference to the query.
const ref = getFirstNameByIdRef(getFirstNameByIdVars);
// Variables can be defined inline as well.
const ref = getFirstNameByIdRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getFirstNameByIdRef(dataConnect, getFirstNameByIdVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userList);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userList);
});
```

## GetNameByID
You can execute the `GetNameByID` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getNameById(vars: GetNameByIdVariables, options?: ExecuteQueryOptions): QueryPromise<GetNameByIdData, GetNameByIdVariables>;

interface GetNameByIdRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetNameByIdVariables): QueryRef<GetNameByIdData, GetNameByIdVariables>;
}
export const getNameByIdRef: GetNameByIdRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getNameById(dc: DataConnect, vars: GetNameByIdVariables, options?: ExecuteQueryOptions): QueryPromise<GetNameByIdData, GetNameByIdVariables>;

interface GetNameByIdRef {
  ...
  (dc: DataConnect, vars: GetNameByIdVariables): QueryRef<GetNameByIdData, GetNameByIdVariables>;
}
export const getNameByIdRef: GetNameByIdRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getNameByIdRef:
```typescript
const name = getNameByIdRef.operationName;
console.log(name);
```

### Variables
The `GetNameByID` query requires an argument of type `GetNameByIdVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetNameByIdVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetNameByID` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetNameByIdData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetNameByIdData {
  userList?: {
    firstname: string;
    lastname: string;
  };
}
```
### Using `GetNameByID`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getNameById, GetNameByIdVariables } from '@dataconnect/generated';

// The `GetNameByID` query requires an argument of type `GetNameByIdVariables`:
const getNameByIdVars: GetNameByIdVariables = {
  id: ..., 
};

// Call the `getNameById()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getNameById(getNameByIdVars);
// Variables can be defined inline as well.
const { data } = await getNameById({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getNameById(dataConnect, getNameByIdVars);

console.log(data.userList);

// Or, you can use the `Promise` API.
getNameById(getNameByIdVars).then((response) => {
  const data = response.data;
  console.log(data.userList);
});
```

### Using `GetNameByID`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getNameByIdRef, GetNameByIdVariables } from '@dataconnect/generated';

// The `GetNameByID` query requires an argument of type `GetNameByIdVariables`:
const getNameByIdVars: GetNameByIdVariables = {
  id: ..., 
};

// Call the `getNameByIdRef()` function to get a reference to the query.
const ref = getNameByIdRef(getNameByIdVars);
// Variables can be defined inline as well.
const ref = getNameByIdRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getNameByIdRef(dataConnect, getNameByIdVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userList);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userList);
});
```

## ValidateUserCredentials
You can execute the `ValidateUserCredentials` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
validateUserCredentials(vars: ValidateUserCredentialsVariables, options?: ExecuteQueryOptions): QueryPromise<ValidateUserCredentialsData, ValidateUserCredentialsVariables>;

interface ValidateUserCredentialsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ValidateUserCredentialsVariables): QueryRef<ValidateUserCredentialsData, ValidateUserCredentialsVariables>;
}
export const validateUserCredentialsRef: ValidateUserCredentialsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
validateUserCredentials(dc: DataConnect, vars: ValidateUserCredentialsVariables, options?: ExecuteQueryOptions): QueryPromise<ValidateUserCredentialsData, ValidateUserCredentialsVariables>;

interface ValidateUserCredentialsRef {
  ...
  (dc: DataConnect, vars: ValidateUserCredentialsVariables): QueryRef<ValidateUserCredentialsData, ValidateUserCredentialsVariables>;
}
export const validateUserCredentialsRef: ValidateUserCredentialsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the validateUserCredentialsRef:
```typescript
const name = validateUserCredentialsRef.operationName;
console.log(name);
```

### Variables
The `ValidateUserCredentials` query requires an argument of type `ValidateUserCredentialsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ValidateUserCredentialsVariables {
  email: string;
  password: string;
}
```
### Return Type
Recall that executing the `ValidateUserCredentials` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ValidateUserCredentialsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ValidateUserCredentialsData {
  userLists: ({
    id: UUIDString;
    firstname: string;
    lastname: string;
    email: string;
  } & UserList_Key)[];
}
```
### Using `ValidateUserCredentials`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, validateUserCredentials, ValidateUserCredentialsVariables } from '@dataconnect/generated';

// The `ValidateUserCredentials` query requires an argument of type `ValidateUserCredentialsVariables`:
const validateUserCredentialsVars: ValidateUserCredentialsVariables = {
  email: ..., 
  password: ..., 
};

// Call the `validateUserCredentials()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await validateUserCredentials(validateUserCredentialsVars);
// Variables can be defined inline as well.
const { data } = await validateUserCredentials({ email: ..., password: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await validateUserCredentials(dataConnect, validateUserCredentialsVars);

console.log(data.userLists);

// Or, you can use the `Promise` API.
validateUserCredentials(validateUserCredentialsVars).then((response) => {
  const data = response.data;
  console.log(data.userLists);
});
```

### Using `ValidateUserCredentials`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, validateUserCredentialsRef, ValidateUserCredentialsVariables } from '@dataconnect/generated';

// The `ValidateUserCredentials` query requires an argument of type `ValidateUserCredentialsVariables`:
const validateUserCredentialsVars: ValidateUserCredentialsVariables = {
  email: ..., 
  password: ..., 
};

// Call the `validateUserCredentialsRef()` function to get a reference to the query.
const ref = validateUserCredentialsRef(validateUserCredentialsVars);
// Variables can be defined inline as well.
const ref = validateUserCredentialsRef({ email: ..., password: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = validateUserCredentialsRef(dataConnect, validateUserCredentialsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userLists);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userLists);
});
```

## ListRegistrations
You can execute the `ListRegistrations` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listRegistrations(options?: ExecuteQueryOptions): QueryPromise<ListRegistrationsData, undefined>;

interface ListRegistrationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListRegistrationsData, undefined>;
}
export const listRegistrationsRef: ListRegistrationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listRegistrations(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListRegistrationsData, undefined>;

interface ListRegistrationsRef {
  ...
  (dc: DataConnect): QueryRef<ListRegistrationsData, undefined>;
}
export const listRegistrationsRef: ListRegistrationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listRegistrationsRef:
```typescript
const name = listRegistrationsRef.operationName;
console.log(name);
```

### Variables
The `ListRegistrations` query has no variables.
### Return Type
Recall that executing the `ListRegistrations` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListRegistrationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListRegistrationsData {
  registrations: ({
    eventId: UUIDString;
    userId: UUIDString;
    notif?: boolean | null;
  } & Registration_Key)[];
}
```
### Using `ListRegistrations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listRegistrations } from '@dataconnect/generated';


// Call the `listRegistrations()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listRegistrations();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listRegistrations(dataConnect);

console.log(data.registrations);

// Or, you can use the `Promise` API.
listRegistrations().then((response) => {
  const data = response.data;
  console.log(data.registrations);
});
```

### Using `ListRegistrations`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listRegistrationsRef } from '@dataconnect/generated';


// Call the `listRegistrationsRef()` function to get a reference to the query.
const ref = listRegistrationsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listRegistrationsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.registrations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.registrations);
});
```

## GetRegistration
You can execute the `GetRegistration` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getRegistration(vars: GetRegistrationVariables, options?: ExecuteQueryOptions): QueryPromise<GetRegistrationData, GetRegistrationVariables>;

interface GetRegistrationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetRegistrationVariables): QueryRef<GetRegistrationData, GetRegistrationVariables>;
}
export const getRegistrationRef: GetRegistrationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getRegistration(dc: DataConnect, vars: GetRegistrationVariables, options?: ExecuteQueryOptions): QueryPromise<GetRegistrationData, GetRegistrationVariables>;

interface GetRegistrationRef {
  ...
  (dc: DataConnect, vars: GetRegistrationVariables): QueryRef<GetRegistrationData, GetRegistrationVariables>;
}
export const getRegistrationRef: GetRegistrationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getRegistrationRef:
```typescript
const name = getRegistrationRef.operationName;
console.log(name);
```

### Variables
The `GetRegistration` query requires an argument of type `GetRegistrationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetRegistrationVariables {
  eventId: UUIDString;
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `GetRegistration` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetRegistrationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetRegistrationData {
  registration?: {
    eventId: UUIDString;
    userId: UUIDString;
    notif?: boolean | null;
  } & Registration_Key;
}
```
### Using `GetRegistration`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getRegistration, GetRegistrationVariables } from '@dataconnect/generated';

// The `GetRegistration` query requires an argument of type `GetRegistrationVariables`:
const getRegistrationVars: GetRegistrationVariables = {
  eventId: ..., 
  userId: ..., 
};

// Call the `getRegistration()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getRegistration(getRegistrationVars);
// Variables can be defined inline as well.
const { data } = await getRegistration({ eventId: ..., userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getRegistration(dataConnect, getRegistrationVars);

console.log(data.registration);

// Or, you can use the `Promise` API.
getRegistration(getRegistrationVars).then((response) => {
  const data = response.data;
  console.log(data.registration);
});
```

### Using `GetRegistration`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getRegistrationRef, GetRegistrationVariables } from '@dataconnect/generated';

// The `GetRegistration` query requires an argument of type `GetRegistrationVariables`:
const getRegistrationVars: GetRegistrationVariables = {
  eventId: ..., 
  userId: ..., 
};

// Call the `getRegistrationRef()` function to get a reference to the query.
const ref = getRegistrationRef(getRegistrationVars);
// Variables can be defined inline as well.
const ref = getRegistrationRef({ eventId: ..., userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getRegistrationRef(dataConnect, getRegistrationVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.registration);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.registration);
});
```

## FindUserByEmail
You can execute the `FindUserByEmail` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
findUserByEmail(vars: FindUserByEmailVariables, options?: ExecuteQueryOptions): QueryPromise<FindUserByEmailData, FindUserByEmailVariables>;

interface FindUserByEmailRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: FindUserByEmailVariables): QueryRef<FindUserByEmailData, FindUserByEmailVariables>;
}
export const findUserByEmailRef: FindUserByEmailRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
findUserByEmail(dc: DataConnect, vars: FindUserByEmailVariables, options?: ExecuteQueryOptions): QueryPromise<FindUserByEmailData, FindUserByEmailVariables>;

interface FindUserByEmailRef {
  ...
  (dc: DataConnect, vars: FindUserByEmailVariables): QueryRef<FindUserByEmailData, FindUserByEmailVariables>;
}
export const findUserByEmailRef: FindUserByEmailRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the findUserByEmailRef:
```typescript
const name = findUserByEmailRef.operationName;
console.log(name);
```

### Variables
The `FindUserByEmail` query requires an argument of type `FindUserByEmailVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface FindUserByEmailVariables {
  email: string;
}
```
### Return Type
Recall that executing the `FindUserByEmail` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `FindUserByEmailData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface FindUserByEmailData {
  userLists: ({
    id: UUIDString;
    firebaseUid?: string | null;
    firstname: string;
    lastname: string;
    email: string;
  } & UserList_Key)[];
}
```
### Using `FindUserByEmail`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, findUserByEmail, FindUserByEmailVariables } from '@dataconnect/generated';

// The `FindUserByEmail` query requires an argument of type `FindUserByEmailVariables`:
const findUserByEmailVars: FindUserByEmailVariables = {
  email: ..., 
};

// Call the `findUserByEmail()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await findUserByEmail(findUserByEmailVars);
// Variables can be defined inline as well.
const { data } = await findUserByEmail({ email: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await findUserByEmail(dataConnect, findUserByEmailVars);

console.log(data.userLists);

// Or, you can use the `Promise` API.
findUserByEmail(findUserByEmailVars).then((response) => {
  const data = response.data;
  console.log(data.userLists);
});
```

### Using `FindUserByEmail`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, findUserByEmailRef, FindUserByEmailVariables } from '@dataconnect/generated';

// The `FindUserByEmail` query requires an argument of type `FindUserByEmailVariables`:
const findUserByEmailVars: FindUserByEmailVariables = {
  email: ..., 
};

// Call the `findUserByEmailRef()` function to get a reference to the query.
const ref = findUserByEmailRef(findUserByEmailVars);
// Variables can be defined inline as well.
const ref = findUserByEmailRef({ email: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = findUserByEmailRef(dataConnect, findUserByEmailVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userLists);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userLists);
});
```

## GetUserByFirebaseUid
You can execute the `GetUserByFirebaseUid` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserByFirebaseUid(vars: GetUserByFirebaseUidVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByFirebaseUidData, GetUserByFirebaseUidVariables>;

interface GetUserByFirebaseUidRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByFirebaseUidVariables): QueryRef<GetUserByFirebaseUidData, GetUserByFirebaseUidVariables>;
}
export const getUserByFirebaseUidRef: GetUserByFirebaseUidRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserByFirebaseUid(dc: DataConnect, vars: GetUserByFirebaseUidVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByFirebaseUidData, GetUserByFirebaseUidVariables>;

interface GetUserByFirebaseUidRef {
  ...
  (dc: DataConnect, vars: GetUserByFirebaseUidVariables): QueryRef<GetUserByFirebaseUidData, GetUserByFirebaseUidVariables>;
}
export const getUserByFirebaseUidRef: GetUserByFirebaseUidRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserByFirebaseUidRef:
```typescript
const name = getUserByFirebaseUidRef.operationName;
console.log(name);
```

### Variables
The `GetUserByFirebaseUid` query requires an argument of type `GetUserByFirebaseUidVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserByFirebaseUidVariables {
  firebaseUid: string;
}
```
### Return Type
Recall that executing the `GetUserByFirebaseUid` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserByFirebaseUidData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserByFirebaseUidData {
  userLists: ({
    id: UUIDString;
    firebaseUid?: string | null;
    firstname: string;
    lastname: string;
    email: string;
    age: number;
    major: string;
  } & UserList_Key)[];
}
```
### Using `GetUserByFirebaseUid`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserByFirebaseUid, GetUserByFirebaseUidVariables } from '@dataconnect/generated';

// The `GetUserByFirebaseUid` query requires an argument of type `GetUserByFirebaseUidVariables`:
const getUserByFirebaseUidVars: GetUserByFirebaseUidVariables = {
  firebaseUid: ..., 
};

// Call the `getUserByFirebaseUid()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserByFirebaseUid(getUserByFirebaseUidVars);
// Variables can be defined inline as well.
const { data } = await getUserByFirebaseUid({ firebaseUid: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserByFirebaseUid(dataConnect, getUserByFirebaseUidVars);

console.log(data.userLists);

// Or, you can use the `Promise` API.
getUserByFirebaseUid(getUserByFirebaseUidVars).then((response) => {
  const data = response.data;
  console.log(data.userLists);
});
```

### Using `GetUserByFirebaseUid`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserByFirebaseUidRef, GetUserByFirebaseUidVariables } from '@dataconnect/generated';

// The `GetUserByFirebaseUid` query requires an argument of type `GetUserByFirebaseUidVariables`:
const getUserByFirebaseUidVars: GetUserByFirebaseUidVariables = {
  firebaseUid: ..., 
};

// Call the `getUserByFirebaseUidRef()` function to get a reference to the query.
const ref = getUserByFirebaseUidRef(getUserByFirebaseUidVars);
// Variables can be defined inline as well.
const ref = getUserByFirebaseUidRef({ firebaseUid: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserByFirebaseUidRef(dataConnect, getUserByFirebaseUidVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userLists);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userLists);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateEvent
You can execute the `CreateEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createEvent(vars: CreateEventVariables): MutationPromise<CreateEventData, CreateEventVariables>;

interface CreateEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateEventVariables): MutationRef<CreateEventData, CreateEventVariables>;
}
export const createEventRef: CreateEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createEvent(dc: DataConnect, vars: CreateEventVariables): MutationPromise<CreateEventData, CreateEventVariables>;

interface CreateEventRef {
  ...
  (dc: DataConnect, vars: CreateEventVariables): MutationRef<CreateEventData, CreateEventVariables>;
}
export const createEventRef: CreateEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createEventRef:
```typescript
const name = createEventRef.operationName;
console.log(name);
```

### Variables
The `CreateEvent` mutation requires an argument of type `CreateEventVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateEventVariables {
  id: UUIDString;
  eventcoord: UUIDString;
  eventname: string;
  location: string;
  eventdesc: string;
  starttime: TimestampString;
  endtime: TimestampString;
}
```
### Return Type
Recall that executing the `CreateEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateEventData {
  eventList_insert: EventList_Key;
}
```
### Using `CreateEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createEvent, CreateEventVariables } from '@dataconnect/generated';

// The `CreateEvent` mutation requires an argument of type `CreateEventVariables`:
const createEventVars: CreateEventVariables = {
  id: ..., 
  eventcoord: ..., 
  eventname: ..., 
  location: ..., 
  eventdesc: ..., 
  starttime: ..., 
  endtime: ..., 
};

// Call the `createEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createEvent(createEventVars);
// Variables can be defined inline as well.
const { data } = await createEvent({ id: ..., eventcoord: ..., eventname: ..., location: ..., eventdesc: ..., starttime: ..., endtime: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createEvent(dataConnect, createEventVars);

console.log(data.eventList_insert);

// Or, you can use the `Promise` API.
createEvent(createEventVars).then((response) => {
  const data = response.data;
  console.log(data.eventList_insert);
});
```

### Using `CreateEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createEventRef, CreateEventVariables } from '@dataconnect/generated';

// The `CreateEvent` mutation requires an argument of type `CreateEventVariables`:
const createEventVars: CreateEventVariables = {
  id: ..., 
  eventcoord: ..., 
  eventname: ..., 
  location: ..., 
  eventdesc: ..., 
  starttime: ..., 
  endtime: ..., 
};

// Call the `createEventRef()` function to get a reference to the mutation.
const ref = createEventRef(createEventVars);
// Variables can be defined inline as well.
const ref = createEventRef({ id: ..., eventcoord: ..., eventname: ..., location: ..., eventdesc: ..., starttime: ..., endtime: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createEventRef(dataConnect, createEventVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.eventList_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.eventList_insert);
});
```

## CreateRegistration
You can execute the `CreateRegistration` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createRegistration(vars: CreateRegistrationVariables): MutationPromise<CreateRegistrationData, CreateRegistrationVariables>;

interface CreateRegistrationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateRegistrationVariables): MutationRef<CreateRegistrationData, CreateRegistrationVariables>;
}
export const createRegistrationRef: CreateRegistrationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createRegistration(dc: DataConnect, vars: CreateRegistrationVariables): MutationPromise<CreateRegistrationData, CreateRegistrationVariables>;

interface CreateRegistrationRef {
  ...
  (dc: DataConnect, vars: CreateRegistrationVariables): MutationRef<CreateRegistrationData, CreateRegistrationVariables>;
}
export const createRegistrationRef: CreateRegistrationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createRegistrationRef:
```typescript
const name = createRegistrationRef.operationName;
console.log(name);
```

### Variables
The `CreateRegistration` mutation requires an argument of type `CreateRegistrationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateRegistrationVariables {
  eventId: UUIDString;
  userId: UUIDString;
  notif?: boolean | null;
}
```
### Return Type
Recall that executing the `CreateRegistration` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateRegistrationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateRegistrationData {
  registration_insert: Registration_Key;
}
```
### Using `CreateRegistration`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createRegistration, CreateRegistrationVariables } from '@dataconnect/generated';

// The `CreateRegistration` mutation requires an argument of type `CreateRegistrationVariables`:
const createRegistrationVars: CreateRegistrationVariables = {
  eventId: ..., 
  userId: ..., 
  notif: ..., // optional
};

// Call the `createRegistration()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createRegistration(createRegistrationVars);
// Variables can be defined inline as well.
const { data } = await createRegistration({ eventId: ..., userId: ..., notif: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createRegistration(dataConnect, createRegistrationVars);

console.log(data.registration_insert);

// Or, you can use the `Promise` API.
createRegistration(createRegistrationVars).then((response) => {
  const data = response.data;
  console.log(data.registration_insert);
});
```

### Using `CreateRegistration`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createRegistrationRef, CreateRegistrationVariables } from '@dataconnect/generated';

// The `CreateRegistration` mutation requires an argument of type `CreateRegistrationVariables`:
const createRegistrationVars: CreateRegistrationVariables = {
  eventId: ..., 
  userId: ..., 
  notif: ..., // optional
};

// Call the `createRegistrationRef()` function to get a reference to the mutation.
const ref = createRegistrationRef(createRegistrationVars);
// Variables can be defined inline as well.
const ref = createRegistrationRef({ eventId: ..., userId: ..., notif: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createRegistrationRef(dataConnect, createRegistrationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.registration_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.registration_insert);
});
```

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation requires an argument of type `CreateUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUserVariables {
  id: UUIDString;
  firebaseUid?: string | null;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  age: number;
  major: string;
}
```
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  userList_insert: UserList_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser, CreateUserVariables } from '@dataconnect/generated';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  id: ..., 
  firebaseUid: ..., // optional
  firstname: ..., 
  lastname: ..., 
  email: ..., 
  password: ..., 
  age: ..., 
  major: ..., 
};

// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser(createUserVars);
// Variables can be defined inline as well.
const { data } = await createUser({ id: ..., firebaseUid: ..., firstname: ..., lastname: ..., email: ..., password: ..., age: ..., major: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect, createUserVars);

console.log(data.userList_insert);

// Or, you can use the `Promise` API.
createUser(createUserVars).then((response) => {
  const data = response.data;
  console.log(data.userList_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef, CreateUserVariables } from '@dataconnect/generated';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  id: ..., 
  firebaseUid: ..., // optional
  firstname: ..., 
  lastname: ..., 
  email: ..., 
  password: ..., 
  age: ..., 
  major: ..., 
};

// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef(createUserVars);
// Variables can be defined inline as well.
const ref = createUserRef({ id: ..., firebaseUid: ..., firstname: ..., lastname: ..., email: ..., password: ..., age: ..., major: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect, createUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userList_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userList_insert);
});
```

## UpdateUserProfile
You can execute the `UpdateUserProfile` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateUserProfile(vars: UpdateUserProfileVariables): MutationPromise<UpdateUserProfileData, UpdateUserProfileVariables>;

interface UpdateUserProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserProfileVariables): MutationRef<UpdateUserProfileData, UpdateUserProfileVariables>;
}
export const updateUserProfileRef: UpdateUserProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateUserProfile(dc: DataConnect, vars: UpdateUserProfileVariables): MutationPromise<UpdateUserProfileData, UpdateUserProfileVariables>;

interface UpdateUserProfileRef {
  ...
  (dc: DataConnect, vars: UpdateUserProfileVariables): MutationRef<UpdateUserProfileData, UpdateUserProfileVariables>;
}
export const updateUserProfileRef: UpdateUserProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateUserProfileRef:
```typescript
const name = updateUserProfileRef.operationName;
console.log(name);
```

### Variables
The `UpdateUserProfile` mutation requires an argument of type `UpdateUserProfileVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateUserProfileVariables {
  id: UUIDString;
  firstname: string;
  lastname: string;
  age: number;
  major: string;
}
```
### Return Type
Recall that executing the `UpdateUserProfile` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateUserProfileData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateUserProfileData {
  userList_update?: UserList_Key | null;
}
```
### Using `UpdateUserProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateUserProfile, UpdateUserProfileVariables } from '@dataconnect/generated';

// The `UpdateUserProfile` mutation requires an argument of type `UpdateUserProfileVariables`:
const updateUserProfileVars: UpdateUserProfileVariables = {
  id: ..., 
  firstname: ..., 
  lastname: ..., 
  age: ..., 
  major: ..., 
};

// Call the `updateUserProfile()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateUserProfile(updateUserProfileVars);
// Variables can be defined inline as well.
const { data } = await updateUserProfile({ id: ..., firstname: ..., lastname: ..., age: ..., major: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateUserProfile(dataConnect, updateUserProfileVars);

console.log(data.userList_update);

// Or, you can use the `Promise` API.
updateUserProfile(updateUserProfileVars).then((response) => {
  const data = response.data;
  console.log(data.userList_update);
});
```

### Using `UpdateUserProfile`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateUserProfileRef, UpdateUserProfileVariables } from '@dataconnect/generated';

// The `UpdateUserProfile` mutation requires an argument of type `UpdateUserProfileVariables`:
const updateUserProfileVars: UpdateUserProfileVariables = {
  id: ..., 
  firstname: ..., 
  lastname: ..., 
  age: ..., 
  major: ..., 
};

// Call the `updateUserProfileRef()` function to get a reference to the mutation.
const ref = updateUserProfileRef(updateUserProfileVars);
// Variables can be defined inline as well.
const ref = updateUserProfileRef({ id: ..., firstname: ..., lastname: ..., age: ..., major: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateUserProfileRef(dataConnect, updateUserProfileVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userList_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userList_update);
});
```

