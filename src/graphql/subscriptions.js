/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateAudioHistory = /* GraphQL */ `
  subscription OnCreateAudioHistory(
    $filter: ModelSubscriptionAudioHistoryFilterInput
    $userId: String
  ) {
    onCreateAudioHistory(filter: $filter, userId: $userId) {
      id
      userId
      text
      audioUrl
      audioPath
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateAudioHistory = /* GraphQL */ `
  subscription OnUpdateAudioHistory(
    $filter: ModelSubscriptionAudioHistoryFilterInput
    $userId: String
  ) {
    onUpdateAudioHistory(filter: $filter, userId: $userId) {
      id
      userId
      text
      audioUrl
      audioPath
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteAudioHistory = /* GraphQL */ `
  subscription OnDeleteAudioHistory(
    $filter: ModelSubscriptionAudioHistoryFilterInput
    $userId: String
  ) {
    onDeleteAudioHistory(filter: $filter, userId: $userId) {
      id
      userId
      text
      audioUrl
      audioPath
      createdAt
      updatedAt
      __typename
    }
  }
`;
