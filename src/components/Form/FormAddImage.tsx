import { Box, Button, Stack, useToast } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { api } from '../../services/api';
import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

interface FormAddImageProps {
  closeModal: () => void;
}

type ImageProps = {
  title: string | unknown;
  description: string | unknown;
  url: string;
};

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const toast = useToast();

  const formValidations = {
    image: {
      required: 'Arquivo obrigatório',
      validate: {
        lessThan10MB: (image: File) =>
          image[0]?.size < 10000 * 1024 || 'O arquivo deve ser menor que 10MB',

        acceptedFormats: (image: File) =>
          ['image/jpeg', 'image/png', 'image/gif'].includes(image[0]?.type) ||
          'Somente são aceitos arquivos PNG, JPEG e GIF',
      },
    },
    title: {
      required: 'Título obrigatório',
      minLength: 'Mínimo de 2 caracteres',
      maxLength: 'Máximo de 20 caracteres',
    },
    description: {
      required: 'Descrição obrigatória',
      maxLength: 'Máximo de 65 caracteres',
    },
  };

  const queryClient = useQueryClient();
  const mutation = useMutation(
    (image: ImageProps) => api.post('/api/images', image),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('images');
      },
    }
  );

  const { register, handleSubmit, reset, formState, setError, trigger } =
    useForm();
  const { errors } = formState;

  const onSubmit = async (data: Record<string, unknown>): Promise<void> => {
    try {
      // TODO SHOW ERROR TOAST IF IMAGE URL DOES NOT EXISTS
      if (!imageUrl) {
        toast({
          title: 'Image not added',
          description:
            'You must add and wait for an image to be uploaded before registering.',
          status: 'error',
          duration: 9000,
          isClosable: true,
        });

        return;
      }
      // TODO EXECUTE ASYNC MUTATION
      // TODO SHOW SUCCESS TOAST
      const { title, description } = data;

      const image = {
        title,
        description,
        url: imageUrl,
      };

      await mutation.mutateAsync(image as ImageProps);

      toast({
        title: 'Image registered',
        description: 'Your image has been successfully registered.',
        status: 'success',
        duration: 9000,
        isClosable: true,
      });
    } catch {
      toast({
        title: 'Registration failure',
        description: 'An error occurred while trying to register your image.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
      // TODO SHOW ERROR TOAST IF SUBMIT FAILED
    } finally {
      setImageUrl('');
      setLocalImageUrl('');
      reset();
      closeModal();
      // TODO CLEAN FORM, STATES AND CLOSE MODAL
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}
          name="image"
          error={errors?.image}
          {...register('image', formValidations.image)}
        />

        <TextInput
          placeholder="Título da imagem..."
          name="title"
          error={errors?.title}
          {...register('title', formValidations.title)}
        />

        <TextInput
          placeholder="Descrição da imagem..."
          name="description"
          error={errors?.description}
          {...register('description', formValidations.description)}
        />
      </Stack>

      <Button
        my={6}
        isLoading={formState.isSubmitting}
        isDisabled={formState.isSubmitting}
        type="submit"
        w="100%"
        py={6}
      >
        Enviar
      </Button>
    </Box>
  );
}
