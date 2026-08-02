import * as yup from 'yup';

export const semanticSearchSchema = yup.object({
  body: yup.object({
    collectionId: yup.string().required('Collection ID is required'),
    question: yup.string().required('Question is required'),
  }),
});
