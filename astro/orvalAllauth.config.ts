import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: './src/api/schemas/allauth/schema.yaml',
    output: {
      override: {
        mutator: {
          path: './src/api/axios.ts',
          name: 'customAxiosInstance',
        },
      },
      mode: 'tags-split',
      target: 'src/api/allauth',
      prettier: true,
    },
  },
});
