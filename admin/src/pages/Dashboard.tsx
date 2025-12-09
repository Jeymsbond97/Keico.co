import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Refresh,
  Logout,
  EnergySavingsLeaf,
  Close,
  PlayArrow,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { FIND_ALL_NEWS, REMOVE_NEWS, FIND_ALL_PRODUCTS, REMOVE_PRODUCT } from '../graphql/queries';
import { NewsStatus, type News, type NewsFilterInput, type Product, type ProductFilterInput } from '../types';
import NewsForm from '../components/NewsForm';
import ProductForm from '../components/ProductForm';

export default function Dashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'news' | 'products'>('news');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<NewsStatus | 'ALL'>('ALL');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const filterInput: NewsFilterInput = {
    page,
    limit,
    sort: 'createdAt',
    direction: sortDirection,
    search: statusFilter !== 'ALL' ? { status: statusFilter } : undefined,
  };

  const { data, loading, error, refetch } = useQuery(FIND_ALL_NEWS, {
    variables: { input: filterInput },
    fetchPolicy: 'network-only',
  });

  // Get stats (all news counts - ACTIVE and PAUSE only, not DELETE)
  const { data: statsData, refetch: refetchStats } = useQuery(FIND_ALL_NEWS, {
    variables: {
      input: {
        page: 1,
        limit: 1000, // Get all for counting
        sort: 'createdAt',
        direction: 'DESC',
        search: undefined, // No status filter - get all except DELETE
      },
    },
    fetchPolicy: 'network-only',
  });

  const allNewsForStats = (statsData as any)?.findAllNews?.list || [];
  const totalActiveCount = allNewsForStats.filter(
    (n: News) => n.status === NewsStatus.ACTIVE,
  ).length;
  const totalPauseCount = allNewsForStats.filter(
    (n: News) => n.status === NewsStatus.PAUSE,
  ).length;
  const totalCount = totalActiveCount + totalPauseCount;

  // Product queries
  const productFilterInput: ProductFilterInput = {
    page,
    limit,
    sort: 'createdAt',
    direction: sortDirection,
  };

  const { data: productData, loading: productLoading, error: productError, refetch: refetchProducts } = useQuery(FIND_ALL_PRODUCTS, {
    variables: { input: productFilterInput },
    fetchPolicy: 'network-only',
    skip: activeTab !== 'products',
  });

  const { data: productStatsData, refetch: refetchProductStats } = useQuery(FIND_ALL_PRODUCTS, {
    variables: {
      input: {
        page: 1,
        limit: 1000,
        sort: 'createdAt',
        direction: 'DESC',
      },
    },
    fetchPolicy: 'network-only',
    skip: activeTab !== 'products',
  });

  const allProductsForStats = (productStatsData as any)?.findAllProducts?.list || [];
  const totalProductCount = allProductsForStats.length;

  const [removeNews] = useMutation(REMOVE_NEWS, {
    onCompleted: () => {
      setDeleteConfirm(null);
      refetch();
      refetchStats();
    },
  });

  const [removeProduct] = useMutation(REMOVE_PRODUCT, {
    onCompleted: () => {
      setDeleteConfirm(null);
      refetchProducts();
      refetchProductStats();
    },
  });

  const handleCreate = () => {
    if (activeTab === 'news') {
      setEditingNews(null);
    } else {
      setEditingProduct(null);
    }
    setOpenDialog(true);
  };

  const handleEdit = (item: News | Product) => {
    if (activeTab === 'news') {
      setEditingNews(item as News);
    } else {
      setEditingProduct(item as Product);
    }
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      if (activeTab === 'news') {
        await removeNews({ variables: { id } });
      } else {
        await removeProduct({ variables: { id } });
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleStatusChange = async (news: News, newStatus: NewsStatus) => {
    // This will be handled by NewsForm component
    setEditingNews({ ...news, status: newStatus });
    setOpenDialog(true);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'news' | 'products') => {
    setActiveTab(newValue);
    setPage(1);
  };

  const totalNews = (data as any)?.findAllNews?.metaCounter?.[0]?.total || 0;
  const totalPages = Math.ceil(totalNews / limit);
  const newsList = (data as any)?.findAllNews?.list || [];

  const totalProducts = (productData as any)?.findAllProducts?.metaCounter?.[0]?.total || 0;
  const totalProductPages = Math.ceil(totalProducts / limit);
  const productList = (productData as any)?.findAllProducts?.list || [];

  const getStatusColor = (status: NewsStatus) => {
    switch (status) {
      case NewsStatus.ACTIVE:
        return 'success';
      case NewsStatus.PAUSE:
        return 'warning';
      case NewsStatus.DELETE:
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'white',
          boxShadow: 2,
          mb: 3,
          py: 2,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <EnergySavingsLeaf sx={{ fontSize: 40, color: '#667eea' }} />
              <Typography variant="h5" fontWeight="bold" color="primary">
                KEICO PLUS Admin
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Logout />}
              onClick={logout}
              color="error"
            >
              Logout
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ pb: 4 }}>
        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="admin tabs">
            <Tab label="News" value="news" />
            <Tab label="Products" value="products" />
          </Tabs>
        </Paper>

        {/* Stats Cards */}
        {activeTab === 'news' ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 2,
              mb: 3,
            }}
          >
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  gutterBottom
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Total News
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    fontWeight: 'bold',
                  }}
                >
                  {totalCount}
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  gutterBottom
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Active News
                </Typography>
                <Typography
                  variant="h4"
                  color="success.main"
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    fontWeight: 'bold',
                  }}
                >
                  {totalActiveCount}
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  gutterBottom
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Paused News
                </Typography>
                <Typography
                  variant="h4"
                  color="warning.main"
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    fontWeight: 'bold',
                  }}
                >
                  {totalPauseCount}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 2,
              mb: 3,
            }}
          >
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  gutterBottom
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Total Products
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    fontWeight: 'bold',
                  }}
                >
                  {totalProductCount}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Controls */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreate}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {activeTab === 'news' ? 'Create News' : 'Create Product'}
            </Button>

            {activeTab === 'news' && (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status Filter"
                  onChange={(e) => {
                    setStatusFilter(e.target.value as NewsStatus | 'ALL');
                    setPage(1);
                  }}
                >
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value={NewsStatus.ACTIVE}>Active</MenuItem>
                  <MenuItem value={NewsStatus.PAUSE}>Pause</MenuItem>
                  <MenuItem value={NewsStatus.DELETE}>Delete</MenuItem>
                </Select>
              </FormControl>
            )}

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sort</InputLabel>
              <Select
                value={sortDirection}
                label="Sort"
                onChange={(e) => {
                  setSortDirection(e.target.value as 'ASC' | 'DESC');
                  setPage(1);
                }}
              >
                <MenuItem value="DESC">Newest First</MenuItem>
                <MenuItem value="ASC">Oldest First</MenuItem>
              </Select>
            </FormControl>

            <IconButton onClick={() => activeTab === 'news' ? refetch() : refetchProducts()} color="primary">
              <Refresh />
            </IconButton>
          </Box>
        </Paper>

        {/* News Table */}
        {activeTab === 'news' ? (
          loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error loading news: {error.message}
            </Alert>
          ) : (
            <>
              <TableContainer
                component={Paper}
                sx={{
                  overflowX: 'auto',
                  width: '100%',
                }}
              >
                <Table
                  sx={{
                    minWidth: 600,
                    '& .MuiTableCell-root': {
                      '@media (max-width: 768px)': {
                        padding: '8px 4px',
                        fontSize: '0.75rem',
                      },
                    },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          minWidth: { xs: 120, sm: 150 },
                          maxWidth: { xs: 150, sm: 200 },
                        }}
                      >
                        Title
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: { xs: 100, sm: 150 },
                          maxWidth: { xs: 150, sm: 250, md: 300 },
                          display: { xs: 'none', sm: 'table-cell' },
                        }}
                      >
                        Content
                      </TableCell>
                      <TableCell sx={{ minWidth: { xs: 80, sm: 100 } }}>Status</TableCell>
                      <TableCell
                        sx={{
                          minWidth: { xs: 60, sm: 100 },
                          display: { xs: 'none', md: 'table-cell' },
                        }}
                      >
                        Image
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: { xs: 60, sm: 100 },
                          display: { xs: 'none', lg: 'table-cell' },
                        }}
                      >
                        Video
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: { xs: 80, sm: 120 },
                          display: { xs: 'none', sm: 'table-cell' },
                        }}
                      >
                        Created
                      </TableCell>
                      <TableCell align="right" sx={{ minWidth: { xs: 100, sm: 150 } }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {newsList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography color="textSecondary" py={3}>
                            No news found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      newsList.map((news: News) => (
                        <TableRow key={news.id} hover>
                          <TableCell>
                            <Typography
                              fontWeight="medium"
                              sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                wordBreak: 'break-word',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {news.title}
                            </Typography>
                          </TableCell>
                          <TableCell
                            sx={{
                              display: { xs: 'none', sm: 'table-cell' },
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                maxWidth: { sm: 200, md: 300 },
                              }}
                            >
                              {news.content}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={news.status}
                              color={getStatusColor(news.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              display: { xs: 'none', md: 'table-cell' },
                            }}
                          >
                            {news.image ? (
                              <Chip
                                label="Image"
                                size="small"
                                color="primary"
                                onClick={() => {
                                  if (news.image) {
                                    const imageUrl = news.image.startsWith('http') 
                                      ? news.image 
                                      : `${window.location.origin}${news.image}`;
                                    setImagePreview(imageUrl);
                                  }
                                }}
                                sx={{
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s, box-shadow 0.2s',
                                  '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: 2,
                                  },
                                }}
                              />
                            ) : (
                              <Typography
                                variant="body2"
                                color="textSecondary"
                                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                              >
                                No image
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell
                            sx={{
                              display: { xs: 'none', lg: 'table-cell' },
                            }}
                          >
                            {news.video ? (
                              <Chip
                                icon={<PlayArrow />}
                                label="Video"
                                size="small"
                                color="primary"
                                onClick={() => {
                                  if (news.video) {
                                    setVideoPreview(news.video.startsWith('http') ? news.video : `${window.location.origin}${news.video}`);
                                  }
                                }}
                                sx={{
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s, box-shadow 0.2s',
                                  '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: 2,
                                  },
                                }}
                              />
                            ) : (
                              <Typography
                                variant="body2"
                                color="textSecondary"
                                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                              >
                                No video
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell
                            sx={{
                              display: { xs: 'none', sm: 'table-cell' },
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            >
                              {new Date(news.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEdit(news)}
                              >
                                <Edit />
                              </IconButton>
                              {news.status === NewsStatus.DELETE ? (
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => setDeleteConfirm(news.id)}
                                >
                                  <Delete />
                                </IconButton>
                              ) : (
                                <FormControl size="small" sx={{ minWidth: 100 }}>
                                  <Select
                                    value={news.status}
                                    onChange={(e) =>
                                      handleStatusChange(news, e.target.value as NewsStatus)
                                    }
                                    size="small"
                                  >
                                    <MenuItem value={NewsStatus.ACTIVE}>Active</MenuItem>
                                    <MenuItem value={NewsStatus.PAUSE}>Pause</MenuItem>
                                    <MenuItem value={NewsStatus.DELETE}>Delete</MenuItem>
                                  </Select>
                                </FormControl>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )
        ) : (
          /* Products Table */
          productLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : productError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error loading products: {productError.message}
            </Alert>
          ) : (
            <>
              <TableContainer
                component={Paper}
                sx={{
                  overflowX: 'auto',
                  width: '100%',
                }}
              >
                <Table
                  sx={{
                    minWidth: 600,
                    '& .MuiTableCell-root': {
                      '@media (max-width: 768px)': {
                        padding: '8px 4px',
                        fontSize: '0.75rem',
                      },
                    },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          minWidth: { xs: 120, sm: 150 },
                          maxWidth: { xs: 150, sm: 200 },
                        }}
                      >
                        Title
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: { xs: 100, sm: 150 },
                          maxWidth: { xs: 150, sm: 250, md: 300 },
                          display: { xs: 'none', sm: 'table-cell' },
                        }}
                      >
                        Description
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: { xs: 60, sm: 100 },
                          display: { xs: 'none', md: 'table-cell' },
                        }}
                      >
                        Image
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: { xs: 80, sm: 120 },
                          display: { xs: 'none', sm: 'table-cell' },
                        }}
                      >
                        Created
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: { xs: 80, sm: 120 },
                          display: { xs: 'none', sm: 'table-cell' },
                        }}
                      >
                        Updated
                      </TableCell>
                      <TableCell align="right" sx={{ minWidth: { xs: 100, sm: 150 } }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography color="textSecondary" py={3}>
                            No products found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      productList.map((product: Product) => (
                        <TableRow key={product.id} hover>
                          <TableCell>
                            <Typography
                              fontWeight="medium"
                              sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                wordBreak: 'break-word',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {product.title}
                            </Typography>
                          </TableCell>
                          <TableCell
                            sx={{
                              display: { xs: 'none', sm: 'table-cell' },
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                maxWidth: { sm: 200, md: 300 },
                              }}
                            >
                              {product.description}
                            </Typography>
                          </TableCell>
                          <TableCell
                            sx={{
                              display: { xs: 'none', md: 'table-cell' },
                            }}
                          >
                            {product.image ? (
                              <Chip
                                label="Image"
                                size="small"
                                color="primary"
                                onClick={() => {
                                  if (product.image) {
                                    const imageUrl = product.image.startsWith('http') 
                                      ? product.image 
                                      : `${window.location.origin}${product.image}`;
                                    setImagePreview(imageUrl);
                                  }
                                }}
                                sx={{
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s, box-shadow 0.2s',
                                  '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: 2,
                                  },
                                }}
                              />
                            ) : (
                              <Typography
                                variant="body2"
                                color="textSecondary"
                                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                              >
                                No image
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell
                            sx={{
                              display: { xs: 'none', sm: 'table-cell' },
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            >
                              {new Date(product.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell
                            sx={{
                              display: { xs: 'none', sm: 'table-cell' },
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            >
                              {new Date(product.updatedAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEdit(product)}
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeleteConfirm(product.id)}
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalProductPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 4 }}>
                  <Pagination
                    count={totalProductPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )
        )}
      </Container>

      {/* News Form Dialog */}
      {activeTab === 'news' && (
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editingNews ? 'Edit News' : 'Create News'}</DialogTitle>
          <DialogContent>
            <NewsForm
              news={editingNews}
              onSuccess={() => {
                setOpenDialog(false);
                setEditingNews(null);
                refetch();
                refetchStats();
              }}
              onCancel={() => {
                setOpenDialog(false);
                setEditingNews(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Product Form Dialog */}
      {activeTab === 'products' && (
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editingProduct ? 'Edit Product' : 'Create Product'}</DialogTitle>
          <DialogContent>
            <ProductForm
              product={editingProduct}
              onSuccess={() => {
                setOpenDialog(false);
                setEditingProduct(null);
                refetchProducts();
                refetchProductStats();
              }}
              onCancel={() => {
                setOpenDialog(false);
                setEditingProduct(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently remove this {activeTab === 'news' ? 'news' : 'product'}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

