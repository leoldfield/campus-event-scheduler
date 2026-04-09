import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'campus-event-scheduler',
  location: 'us-central1'
};

export const listEventsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListEvents');
}
listEventsRef.operationName = 'ListEvents';

export function listEvents(dc) {
  return executeQuery(listEventsRef(dc));
}

export const listUsersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUsers');
}
listUsersRef.operationName = 'ListUsers';

export function listUsers(dc) {
  return executeQuery(listUsersRef(dc));
}

export const getEventByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEventByID', inputVars);
}
getEventByIdRef.operationName = 'GetEventByID';

export function getEventById(dcOrVars, vars) {
  return executeQuery(getEventByIdRef(dcOrVars, vars));
}

export const createEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateEvent', inputVars);
}
createEventRef.operationName = 'CreateEvent';

export function createEvent(dcOrVars, vars) {
  return executeMutation(createEventRef(dcOrVars, vars));
}

export const getFirstNameByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFirstNameByID', inputVars);
}
getFirstNameByIdRef.operationName = 'GetFirstNameByID';

export function getFirstNameById(dcOrVars, vars) {
  return executeQuery(getFirstNameByIdRef(dcOrVars, vars));
}

export const getNameByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetNameByID', inputVars);
}
getNameByIdRef.operationName = 'GetNameByID';

export function getNameById(dcOrVars, vars) {
  return executeQuery(getNameByIdRef(dcOrVars, vars));
}

export const validateUserCredentialsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ValidateUserCredentials', inputVars);
}
validateUserCredentialsRef.operationName = 'ValidateUserCredentials';

export function validateUserCredentials(dcOrVars, vars) {
  return executeQuery(validateUserCredentialsRef(dcOrVars, vars));
}

export const listRegistrationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListRegistrations');
}
listRegistrationsRef.operationName = 'ListRegistrations';

export function listRegistrations(dc) {
  return executeQuery(listRegistrationsRef(dc));
}

export const getRegistrationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetRegistration', inputVars);
}
getRegistrationRef.operationName = 'GetRegistration';

export function getRegistration(dcOrVars, vars) {
  return executeQuery(getRegistrationRef(dcOrVars, vars));
}

export const createRegistrationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateRegistration', inputVars);
}
createRegistrationRef.operationName = 'CreateRegistration';

export function createRegistration(dcOrVars, vars) {
  return executeMutation(createRegistrationRef(dcOrVars, vars));
}

export const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser', inputVars);
}
createUserRef.operationName = 'CreateUser';

export function createUser(dcOrVars, vars) {
  return executeMutation(createUserRef(dcOrVars, vars));
}

export const findUserByEmailRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'FindUserByEmail', inputVars);
}
findUserByEmailRef.operationName = 'FindUserByEmail';

export function findUserByEmail(dcOrVars, vars) {
  return executeQuery(findUserByEmailRef(dcOrVars, vars));
}

export const getUserByFirebaseUidRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserByFirebaseUid', inputVars);
}
getUserByFirebaseUidRef.operationName = 'GetUserByFirebaseUid';

export function getUserByFirebaseUid(dcOrVars, vars) {
  return executeQuery(getUserByFirebaseUidRef(dcOrVars, vars));
}

