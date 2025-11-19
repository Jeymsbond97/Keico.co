/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { uploadWithFiles } from '../lib/apollo-client';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import { CREATE_NEWS, UPDATE_NEWS } from '../graphql/queries';
import { NewsStatus, type News } from '../types';
import { gql } from '@apollo/client';
import type { T } from '../lib/common/types';

interface NewsFormProps {
  news: News | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function NewsForm({ news, onSuccess, onCancel }: NewsFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<NewsStatus>(NewsStatus.PAUSE);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const [createNews, { loading: creating }] = useMutation(CREATE_NEWS);
  const [updateNews, { loading: updating }] = useMutation(UPDATE_NEWS);

  useEffect(() => {
    if (news) {
      setTitle(news.title);
      setContent(news.content);
      setStatus(news.status);
      const imageUrl = news.image
        ? news.image.startsWith('http')
          ? news.image
          : `${window.location.origin}${news.image}`
        : null;
      setExistingImageUrl(imageUrl);
      const videoUrl = news.video
        ? news.video.startsWith('http')
          ? news.video
          : `${window.location.origin}${news.video}`
        : null;
      setExistingVideoUrl(videoUrl);
    } else {
      setTitle('');
      setContent('');
      setStatus(NewsStatus.PAUSE);
      setExistingImageUrl(null);
      setExistingVideoUrl(null);
    }
    setImageFile(null);
    setVideoFile(null);
    setImagePreview(null);
    setVideoPreview(null);
    setError('');
  }, [news]);

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

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only mp4, webm, ogg video files are allowed');
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        setError('Video file size must be less than 25MB');
        return;
      }
      setVideoFile(file);
      setExistingVideoUrl(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
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

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    const fileInput = document.querySelector('input[type="file"][accept*="video"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handlePreviewImage = () => {
    console.log('Preview image clicked:', { existingImageUrl, imageFile, imagePreview });
    if (existingImageUrl) {
      console.log('Setting preview to existing image:', existingImageUrl);
      setImagePreview(existingImageUrl);
      return;
    }
    if (imageFile && imagePreview) {
      console.log('Setting preview to new image:', imagePreview);
      setImagePreview(imagePreview);
      return;
    }
    console.log('No image to preview');
  };

  const handlePreviewVideo = () => {
    console.log('Preview video clicked:', { existingVideoUrl, videoFile, videoPreview });
    if (existingVideoUrl) {
      console.log('Setting preview to existing video:', existingVideoUrl);
      setVideoPreview(existingVideoUrl);
      return;
    }
    if (videoFile && videoPreview) {
      console.log('Setting preview to new video:', videoPreview);
      setVideoPreview(videoPreview);
      return;
    }
    console.log('No video to preview');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      const mutation = news
        ? gql`
            mutation UpdateNews($input: UpdateNewsInput!, $file: Upload, $videoFile: Upload) {
              updateNews(input: $input, file: $file, videoFile: $videoFile) {
                id
                title
                content
                status
                image
                video
                createdAt
                updatedAt
              }
            }
          `
        : gql`
            mutation CreateNews($input: CreateNewsInput!, $file: Upload, $videoFile: Upload) {
              createNews(input: $input, file: $file, videoFile: $videoFile) {
                id
                title
                content
                status
                image
                video
                createdAt
                updatedAt
              }
            }
          `;
      const input: T = news
        ? {
            id: news.id,
            title: title.trim(),
            content: content.trim(),
            status,
          }
        : {
            title: title.trim(),
            content: content.trim(),
            status,
          };

      let result: T;
      if (imageFile || videoFile) {
        result = await uploadWithFiles(
          mutation,
          { input },
          {
            file: imageFile || undefined,
            videoFile: videoFile || undefined,
          },
        );

        if (result.errors) {
          throw new Error(result.errors[0]?.message || 'Upload failed');
        }
      } else {
        if (news) {
          result = await updateNews({
            variables: {
              input,
            },
          });
        } else {
          result = await createNews({
            variables: {
              input,
            },
          });
        }
      }

      // Update state with server response
      const responseData = result?.data?.createNews || result?.data?.updateNews || result?.data;
      if (responseData) {
        if (responseData.image) {
          const imageUrl = responseData.image.startsWith('http')
            ? responseData.image
            : `${window.location.origin}${responseData.image}`;
          setExistingImageUrl(imageUrl);
        } else {
          setExistingImageUrl(null);
        }
        if (responseData.video) {
          const videoUrl = responseData.video.startsWith('http')
            ? responseData.video
            : `${window.location.origin}${responseData.video}`;
          setExistingVideoUrl(videoUrl);
        } else {
          setExistingVideoUrl(null);
        }
      }

      // Clear file states and previews after successful upload
      setImageFile(null);
      setVideoFile(null);
      setImagePreview(null);
      setVideoPreview(null);

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
        label="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        margin="normal"
        required
        multiline
        rows={4}
        disabled={loading}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Status</InputLabel>
        <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value as NewsStatus)}>
          <MenuItem value={NewsStatus.ACTIVE}>Active</MenuItem>
          <MenuItem value={NewsStatus.PAUSE}>Pause</MenuItem>
          <MenuItem value={NewsStatus.DELETE}>Delete</MenuItem>
        </Select>
      </FormControl>

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

      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Video (mp4, webm, ogg - max 25MB)
        </Typography>
        <input
          type="file"
          accept="video/mp4,video/webm,video/ogg"
          onChange={handleVideoChange}
          disabled={loading}
        />
        {existingVideoUrl && !videoFile && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Chip
              label="Video"
              size="small"
              color="primary"
              onClick={handlePreviewVideo}
              sx={{ cursor: 'pointer' }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              Click to preview
            </Typography>
            <IconButton
              onClick={() => {
                setExistingVideoUrl(null);
                setVideoPreview(null);
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
        {videoFile && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Chip
              label="Video"
              size="small"
              color="primary"
              onClick={handlePreviewVideo}
              sx={{ cursor: videoPreview ? 'pointer' : 'default' }}
            />
            <Typography variant="body2" sx={{ flex: 1 }}>
              {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
            </Typography>
            <IconButton
              onClick={handleRemoveVideo}
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
          {loading ? <CircularProgress size={24} /> : news ? 'Update' : 'Create'}
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
              key={imagePreview} // Force re-render when URL changes
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

      {/* Video Preview Modal */}
      <Dialog
        open={!!videoPreview}
        onClose={() => setVideoPreview(null)}
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
          <Typography variant="h6">Video Preview</Typography>
          <IconButton onClick={() => setVideoPreview(null)} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          {videoPreview ? (
            <Box
              key={videoPreview} // Force re-render when URL changes
              component="video"
              src={videoPreview}
              controls
              autoPlay
              onError={(e) => {
                console.error('Video load error:', videoPreview);
                const target = e.target as HTMLVideoElement;
                target.style.display = 'none';
              }}
              onLoadedData={() => {
                console.log('Video loaded successfully:', videoPreview);
              }}
              sx={{
                maxWidth: '100%',
                maxHeight: '80vh',
                width: '100%',
                bgcolor: 'transparent',
              }}
            />
          ) : (
            <Typography color="white">No video to preview</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

