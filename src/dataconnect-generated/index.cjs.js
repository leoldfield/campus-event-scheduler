const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'campus-event-scheduler',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const listEventsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListEvents');
}
listEventsRef.operationName = 'ListEvents';
exports.listEventsRef = listEventsRef;

exports.listEvents = function listEvents(dc) {
  return executeQuery(listEventsRef(dc));
};

const listUsersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUsers');
}
listUsersRef.operationName = 'ListUsers';
exports.listUsersRef = listUsersRef;

exports.listUsers = function listUsers(dc) {
  return executeQuery(listUsersRef(dc));
};

const getEventByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEventByID', inputVars);
}
getEventByIdRef.operationName = 'GetEventByID';
exports.getEventByIdRef = getEventByIdRef;

exports.getEventById = function getEventById(dcOrVars, vars) {
  return executeQuery(getEventByIdRef(dcOrVars, vars));
};

const createEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateEvent', inputVars);
}
createEventRef.operationName = 'CreateEvent';
exports.createEventRef = createEventRef;

exports.createEvent = function createEvent(dcOrVars, vars) {
  return executeMutation(createEventRef(dcOrVars, vars));
};

const getFirstNameByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFirstNameByID', inputVars);
}
getFirstNameByIdRef.operationName = 'GetFirstNameByID';
exports.getFirstNameByIdRef = getFirstNameByIdRef;

exports.getFirstNameById = function getFirstNameById(dcOrVars, vars) {
  return executeQuery(getFirstNameByIdRef(dcOrVars, vars));
};

const getNameByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetNameByID', inputVars);
}
getNameByIdRef.operationName = 'GetNameByID';
exports.getNameByIdRef = getNameByIdRef;

exports.getNameById = function getNameById(dcOrVars, vars) {
  return executeQuery(getNameByIdRef(dcOrVars, vars));
};

const validateUserCredentialsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ValidateUserCredentials', inputVars);
}
validateUserCredentialsRef.operationName = 'ValidateUserCredentials';
exports.validateUserCredentialsRef = validateUserCredentialsRef;

exports.validateUserCredentials = function validateUserCredentials(dcOrVars, vars) {
  return executeQuery(validateUserCredentialsRef(dcOrVars, vars));
};

const listRegistrationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListRegistrations');
}
listRegistrationsRef.operationName = 'ListRegistrations';
exports.listRegistrationsRef = listRegistrationsRef;

exports.listRegistrations = function listRegistrations(dc) {
  return executeQuery(listRegistrationsRef(dc));
};

const getRegistrationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetRegistration', inputVars);
}
getRegistrationRef.operationName = 'GetRegistration';
exports.getRegistrationRef = getRegistrationRef;

exports.getRegistration = function getRegistration(dcOrVars, vars) {
  return executeQuery(getRegistrationRef(dcOrVars, vars));
};

const createRegistrationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateRegistration', inputVars);
}
createRegistrationRef.operationName = 'CreateRegistration';
exports.createRegistrationRef = createRegistrationRef;

exports.createRegistration = function createRegistration(dcOrVars, vars) {
  return executeMutation(createRegistrationRef(dcOrVars, vars));
};

const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser', inputVars);
}
createUserRef.operationName = 'CreateUser';
exports.createUserRef = createUserRef;

exports.createUser = function createUser(dcOrVars, vars) {
  return executeMutation(createUserRef(dcOrVars, vars));
};

const findUserByEmailRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'FindUserByEmail', inputVars);
}
findUserByEmailRef.operationName = 'FindUserByEmail';
exports.findUserByEmailRef = findUserByEmailRef;

exports.findUserByEmail = function findUserByEmail(dcOrVars, vars) {
  return executeQuery(findUserByEmailRef(dcOrVars, vars));
};

const getUserByFirebaseUidRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserByFirebaseUid', inputVars);
}
getUserByFirebaseUidRef.operationName = 'GetUserByFirebaseUid';
exports.getUserByFirebaseUidRef = getUserByFirebaseUidRef;

exports.getUserByFirebaseUid = function getUserByFirebaseUid(dcOrVars, vars) {
  return executeQuery(getUserByFirebaseUidRef(dcOrVars, vars));
};
;

const getUserByFirebaseUidRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserByFirebaseUid', inputVars);
}
getUserByFirebaseUidRef.operationName = 'GetUserByFirebaseUid';
exports.getUserByFirebaseUidRef = getUserByFirebaseUidRef;

exports.getUserByFirebaseUid = function getUserByFirebaseUid(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getUserByFirebaseUidRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;
