# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useListEvents, useListUsers, useGetEventById, useCreateEvent, useGetFirstNameById, useGetNameById, useValidateUserCredentials, useListRegistrations, useGetRegistration, useCreateRegistration } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useListEvents();

const { data, isPending, isSuccess, isError, error } = useListUsers();

const { data, isPending, isSuccess, isError, error } = useGetEventById(getEventByIdVars);

const { data, isPending, isSuccess, isError, error } = useCreateEvent(createEventVars);

const { data, isPending, isSuccess, isError, error } = useGetFirstNameById(getFirstNameByIdVars);

const { data, isPending, isSuccess, isError, error } = useGetNameById(getNameByIdVars);

const { data, isPending, isSuccess, isError, error } = useValidateUserCredentials(validateUserCredentialsVars);

const { data, isPending, isSuccess, isError, error } = useListRegistrations();

const { data, isPending, isSuccess, isError, error } = useGetRegistration(getRegistrationVars);

const { data, isPending, isSuccess, isError, error } = useCreateRegistration(createRegistrationVars);

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { listEvents, listUsers, getEventById, createEvent, getFirstNameById, getNameById, validateUserCredentials, listRegistrations, getRegistration, createRegistration } from '@dataconnect/generated';


// Operation ListEvents: 
const { data } = await ListEvents(dataConnect);

// Operation ListUsers: 
const { data } = await ListUsers(dataConnect);

// Operation GetEventByID:  For variables, look at type GetEventByIdVars in ../index.d.ts
const { data } = await GetEventById(dataConnect, getEventByIdVars);

// Operation CreateEvent:  For variables, look at type CreateEventVars in ../index.d.ts
const { data } = await CreateEvent(dataConnect, createEventVars);

// Operation GetFirstNameByID:  For variables, look at type GetFirstNameByIdVars in ../index.d.ts
const { data } = await GetFirstNameById(dataConnect, getFirstNameByIdVars);

// Operation GetNameByID:  For variables, look at type GetNameByIdVars in ../index.d.ts
const { data } = await GetNameById(dataConnect, getNameByIdVars);

// Operation ValidateUserCredentials:  For variables, look at type ValidateUserCredentialsVars in ../index.d.ts
const { data } = await ValidateUserCredentials(dataConnect, validateUserCredentialsVars);

// Operation ListRegistrations: 
const { data } = await ListRegistrations(dataConnect);

// Operation GetRegistration:  For variables, look at type GetRegistrationVars in ../index.d.ts
const { data } = await GetRegistration(dataConnect, getRegistrationVars);

// Operation CreateRegistration:  For variables, look at type CreateRegistrationVars in ../index.d.ts
const { data } = await CreateRegistration(dataConnect, createRegistrationVars);


```