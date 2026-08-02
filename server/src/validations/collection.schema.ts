import * as yup from 'yup';

export const createCollectionSchema = yup.object({
  body: yup.object({
    name: yup.string().required('Name is required'),
    description: yup.string().optional(),
  }),
});

export const editCollectionSchema = yup.object({
  body: yup.object({
    name: yup.string().optional(),
    description: yup.string().optional(),
  }),
});
