/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { uploadWithFiles } from '../lib/apollo-client';
import {
  Box,
  TextField,
  Button,
  Alert,
  Typography,
  CircularProgress,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { CREATE_PRODUCT, UPDATE_PRODUCT } from '../graphql/queries';
import { type Product } from '../types';
import { gql } from '@apollo/client';
import type { T } from '../lib/common/types';

interface ProductFormProps {
  product: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT);
  const [updateProduct, { loading: updating }] = useMutation(UPDATE_PRODUCT);

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setDescription(product.description);
      const imageUrl = product.image
        ? product.image.startsWith('http')
          ? product.image
          : `${window.location.origin}${product.image}`
        : null;
      setExistingImageUrl(imageUrl);
    } else {
      setTitle('');
      setDescription('');
      setExistingImageUrl(null);
    }
    setImageFile(null);
    setImagePreview(null);
    setError('');
  }, [product]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }
      setImageFile(file);
      setExistingImageUrl(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    const fileInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handlePreviewImage = () => {
    if (existingImageUrl) {
      setImagePreview(existingImageUrl);
      return;
    }
    if (imageFile && imagePreview) {
      setImagePreview(imagePreview);
      return;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }

    try {
      const mutation = product
        ? gql`
            mutation UpdateProduct($input: UpdateProductInput!, $file: Upload) {
              updateProduct(input: $input, file: $file) {
                id
                title
                description
                image
                createdAt
                updatedAt
              }
            }
          `
        : gql`
            mutation CreateProduct($input: CreateProductInput!, $file: Upload) {
              createProduct(input: $input, file: $file) {
                id
                title
                description
                image
                createdAt
                updatedAt
              }
            }
          `;
      const input: T = product
        ? {
            id: product.id,
            title: title.trim(),
            description: description.trim(),
          }
        : {
            title: title.trim(),
            description: description.trim(),
          };

      let result: T;
      if (imageFile) {
        result = await uploadWithFiles(
          mutation,
          { input },
          {
            file: imageFile,
          },
        );

        if (result.errors) {
          throw new Error(result.errors[0]?.message || 'Upload failed');
        }
      } else {
        if (product) {
          result = await updateProduct({
            variables: {
              input,
            },
          });
        } else {
          result = await createProduct({
            variables: {
              input,
            },
          });
        }
      }

      // Update state with server response
      const responseData = result?.data?.createProduct || result?.data?.updateProduct || result?.data;
      if (responseData) {
        if (responseData.image) {
          const imageUrl = responseData.image.startsWith('http')
            ? responseData.image
            : `${window.location.origin}${responseData.image}`;
          setExistingImageUrl(imageUrl);
        } else {
          setExistingImageUrl(null);
        }
      }

      // Clear file states and previews after successful upload
      setImageFile(null);
      setImagePreview(null);

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Form error:', err);
    }
  };

  const loading = creating || updating;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        margin="normal"
        required
        disabled={loading}
      />

      <TextField
        fullWidth
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        margin="normal"
        required
        multiline
        rows={4}
        disabled={loading}
      />

      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Image
        </Typography>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ marginBottom: 8 }}
          disabled={loading}
        />
        {existingImageUrl && !imageFile && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Chip
              label="Image"
              size="small"
              color="primary"
              onClick={handlePreviewImage}
              sx={{ cursor: 'pointer' }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              Click to preview
            </Typography>
            <IconButton
              onClick={() => {
                setExistingImageUrl(null);
                setImagePreview(null);
              }}
              size="small"
              color="error"
              sx={{
                '&:hover': {
                  bgcolor: 'error.light',
                },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        )}
        {imageFile && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Chip
              label="Image"
              size="small"
              color="primary"
              onClick={handlePreviewImage}
              sx={{ cursor: imagePreview ? 'pointer' : 'default' }}
            />
            <Typography variant="body2" sx={{ flex: 1 }}>
              {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
            </Typography>
            <IconButton
              onClick={handleRemoveImage}
              size="small"
              color="error"
              sx={{
                '&:hover': {
                  bgcolor: 'error.light',
                },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          {loading ? <CircularProgress size={24} /> : product ? 'Update' : 'Create'}
        </Button>
      </Box>

      {/* Image Preview Modal */}
      <Dialog
        open={!!imagePreview}
        onClose={() => setImagePreview(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.95)',
            color: 'white',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Image Preview</Typography>
          <IconButton onClick={() => setImagePreview(null)} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          {imagePreview ? (
            <Box
              key={imagePreview}
              component="img"
              src={imagePreview}
              alt="Preview"
              onError={(e) => {
                console.error('Image load error:', imagePreview);
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', imagePreview);
              }}
              sx={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                display: 'block',
                bgcolor: 'transparent',
              }}
            />
          ) : (
            <Typography color="white">No image to preview</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

