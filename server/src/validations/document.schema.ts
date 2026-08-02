import * as yup from 'yup';

export const uploadDocumentSchema = yup.object({
  body: yup.object({
    collectionId: yup.string().required('Collection ID is required'),
    title: yup.string().optional(),
  }),
});
