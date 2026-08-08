import * as yup from 'yup';

export const semanticSearchSchema = yup.object({
  body: yup.object({
    collectionId: yup.string().required('Collection ID is required'),
    conversationId: yup.string().nullable().optional(),
    question: yup.string().required('Question is required'),
  }),
});

export const createConversationSchema = yup.object({
  body: yup.object({
    collectionId: yup.string().required('Collection ID is required'),
    title: yup.string().required('Title is required'),
  }),
});
