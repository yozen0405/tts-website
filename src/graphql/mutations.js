/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createAudioHistory = /* GraphQL */ `
  mutation CreateAudioHistory(
    $input: CreateAudioHistoryInput!
    $condition: ModelAudioHistoryConditionInput
  ) {
    createAudioHistory(input: $input, condition: $condition) {
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
export const updateAudioHistory = /* GraphQL */ `
  mutation UpdateAudioHistory(
    $input: UpdateAudioHistoryInput!
    $condition: ModelAudioHistoryConditionInput
  ) {
    updateAudioHistory(input: $input, condition: $condition) {
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
export const deleteAudioHistory = /* GraphQL */ `
  mutation DeleteAudioHistory(
    $input: DeleteAudioHistoryInput!
    $condition: ModelAudioHistoryConditionInput
  ) {
    deleteAudioHistory(input: $input, condition: $condition) {
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
