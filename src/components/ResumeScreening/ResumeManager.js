import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Typography,
    Alert,
    CircularProgress,
    TextField,
    InputAdornment,
    Tooltip,
    LinearProgress,
    Checkbox,
    Divider,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    UploadFile as UploadFileIcon,
    Description as DescriptionIcon,
    Folder as FolderIcon,
    NavigateNext as NavigateNextIcon,
    Search as SearchIcon,
    Download as DownloadIcon,
    Analytics as AnalyticsIcon,
    CreateNewFolder as CreateFolderIcon,
} from '@mui/icons-material';
import axios from 'axios';

const ResumeManager = ({ open, onClose, onResumeSelect, selectedResumes }) => {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentFolder, setCurrentFolder] = useState('');
    const [uploading, setUploading] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
    const [selectedItems, setSelectedItems] = useState(new Set());

    const fetchResumes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('/api/resumes', {
                params: { path: currentFolder }
            });
            console.log('Raw API Response:', response.data);

            // Process the response data to match our component's needs
            const processedResumes = Array.isArray(response.data) ? response.data.map(item => {
                console.log('Processing item:', item);
                // Handle both string and object formats
                let name, path, type;

                if (typeof item === 'string') {
                    // Handle string format (e.g., "folder/" or "file.pdf")
                    path = item;
                    name = item.endsWith('/') ? item.slice(0, -1).split('/').pop() : item.split('/').pop();
                    type = item.endsWith('/') ? 'folder' : 'file';
                } else {
                    // Handle object format
                    path = item.path;
                    name = item.name;
                    type = item.type || 'file';
                }

                // If we're in a folder, remove the parent path from the name
                if (currentFolder && name.startsWith(currentFolder)) {
                    name = name.slice(currentFolder.length + 1);
                }

                // Ensure the path is properly formatted
                const fullPath = currentFolder ? `${currentFolder}/${name}` : name;

                return {
                    id: fullPath,
                    name: name,
                    type: type,
                    uploadDate: new Date().toISOString(),
                    path: fullPath
                };
            }) : [];

            // Sort items: folders first, then files, both alphabetically
            processedResumes.sort((a, b) => {
                if (a.type === 'folder' && b.type !== 'folder') return -1;
                if (a.type !== 'folder' && b.type === 'folder') return 1;
                return a.name.localeCompare(b.name);
            });

            console.log('Processed resumes:', processedResumes);
            setResumes(processedResumes);
        } catch (err) {
            console.error('Error fetching resumes:', err);
            setError('Failed to fetch resumes: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchResumes();
        }
    }, [open, currentFolder]);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            setUploading(true);
            setError('');
            const formData = new FormData();
            formData.append('file', selectedFile);

            await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(progress);
                },
            });

            await fetchResumes();
            setSelectedFile(null);
            setUploadProgress(0);
        } catch (err) {
            setError('Failed to upload file. Please try again.');
            console.error('Error uploading file:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (resumeId) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            setError(null);
            await axios.delete(`/api/resumes/${resumeId}`);
            await fetchResumes();
        } catch (err) {
            setError('Failed to delete item. Please try again.');
            console.error('Error deleting item:', err);
        }
    };

    const handleDownload = async (resumeId) => {
        try {
            setError(null);
            const response = await axios.get(`/api/resumes/${resumeId}/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `resume-${resumeId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError('Failed to download file. Please try again.');
            console.error('Error downloading file:', err);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) {
            setError('Please enter a folder name');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await axios.post('/api/resumes/folders', {
                name: newFolderName,
                parentFolder: currentFolder
            });
            setNewFolderName('');
            setShowNewFolderDialog(false);
            await fetchResumes();
        } catch (err) {
            setError('Failed to create folder: ' + (err.response?.data?.detail || err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleFolderClick = (folderName) => {
        const newPath = currentFolder ? `${currentFolder}/${folderName}` : folderName;
        console.log('Navigating to folder:', newPath);
        setCurrentFolder(newPath);
    };

    const handleBack = () => {
        const parentFolder = currentFolder.split('/').slice(0, -1).join('/');
        console.log('Navigating back to:', parentFolder);
        setCurrentFolder(parentFolder);
    };

    const handleItemSelect = (item) => {
        console.log('Item selected:', item);
        if (item.type === 'folder') {
            // If it's a folder, toggle selection of all items in that folder
            const folderPath = currentFolder ? `${currentFolder}/${item.name}` : item.name;
            const newSelectedItems = new Set(selectedItems);

            if (newSelectedItems.has(folderPath)) {
                newSelectedItems.delete(folderPath);
            } else {
                newSelectedItems.add(folderPath);
            }

            setSelectedItems(newSelectedItems);
            // Also trigger the onResumeSelect for the folder
            onResumeSelect({
                ...item,
                id: folderPath,
                path: folderPath,
                name: item.name,
                type: 'folder'
            });
        } else {
            // If it's a file, just select the file
            const fileData = {
                id: item.id,
                name: item.name,
                path: item.path,
                type: 'file',
                uploadDate: item.uploadDate
            };
            console.log('Selecting file:', fileData);
            onResumeSelect(fileData);
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={() => onClose(resumes)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: 24,
                        height: '80vh',
                        display: 'flex',
                        flexDirection: 'column'
                    }
                }}
            >
                <DialogTitle sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    pb: 2
                }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5" sx={{
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            color: 'primary.main'
                        }}>
                            Resume Manager
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<FolderIcon />}
                                onClick={() => setShowNewFolderDialog(true)}
                                sx={{
                                    borderColor: 'primary.main',
                                    color: 'primary.main',
                                    '&:hover': {
                                        borderColor: 'primary.dark',
                                        backgroundColor: 'primary.light',
                                    }
                                }}
                            >
                                New Folder
                            </Button>
                            <Button
                                variant="contained"
                                component="label"
                                startIcon={<UploadFileIcon />}
                                disabled={uploading}
                                sx={{
                                    backgroundColor: 'secondary.main',
                                    '&:hover': {
                                        backgroundColor: 'secondary.dark',
                                    }
                                }}
                            >
                                Upload Resume
                                <input
                                    type="file"
                                    hidden
                                    accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.jpg,.jpeg,.png"
                                    onChange={handleFileSelect}
                                />
                            </Button>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    p: 3,
                    overflow: 'hidden'
                }}>
                    {error && (
                        <Alert severity="error" sx={{ borderRadius: 1 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Navigation */}
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center',
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        boxShadow: 1
                    }}>
                        {currentFolder && (
                            <Button
                                startIcon={<NavigateNextIcon />}
                                onClick={handleBack}
                                sx={{
                                    color: 'primary.main',
                                    '&:hover': {
                                        backgroundColor: 'primary.light',
                                    }
                                }}
                            >
                                Back to Parent
                            </Button>
                        )}
                        <Typography variant="subtitle1" color="text.secondary" sx={{ flex: 1 }}>
                            {currentFolder || 'Root Directory'}
                        </Typography>
                    </Box>

                    {/* Resume List */}
                    <Box sx={{
                        flex: 1,
                        overflow: 'auto',
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        boxShadow: 1
                    }}>
                        {loading ? (
                            <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                                <CircularProgress color="primary" />
                            </Box>
                        ) : resumes.length === 0 ? (
                            <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                                <Typography color="text.secondary">
                                    No items found
                                </Typography>
                            </Box>
                        ) : (
                            <List>
                                {resumes.map((resume) => (
                                    <ListItem
                                        key={resume.id}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                            },
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            '&:last-child': {
                                                borderBottom: 'none'
                                            }
                                        }}
                                    >
                                        <Checkbox
                                            edge="start"
                                            checked={selectedItems.has(resume.path) || selectedResumes?.some(r => r.id === resume.id)}
                                            onChange={() => handleItemSelect(resume)}
                                        />
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {resume.type === 'folder' ? <FolderIcon color="primary" /> : <DescriptionIcon />}
                                                    {resume.name}
                                                </Box>
                                            }
                                            secondary={resume.type === 'file' ? `Uploaded: ${new Date(resume.uploadDate).toLocaleDateString()}` : 'Folder'}
                                            onClick={() => resume.type === 'folder' && handleFolderClick(resume.name)}
                                            sx={{
                                                cursor: resume.type === 'folder' ? 'pointer' : 'default',
                                                '& .MuiListItemText-primary': {
                                                    color: 'text.primary',
                                                    fontWeight: resume.type === 'folder' ? 600 : 400
                                                }
                                            }}
                                        />
                                        <ListItemSecondaryAction>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                {resume.type !== 'folder' && (
                                                    <Tooltip title="Download">
                                                        <IconButton
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDownload(resume.id);
                                                            }}
                                                            color="primary"
                                                            sx={{
                                                                '&:hover': {
                                                                    backgroundColor: 'primary.light',
                                                                }
                                                            }}
                                                        >
                                                            <DownloadIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(resume.id);
                                                        }}
                                                        color="error"
                                                        sx={{
                                                            '&:hover': {
                                                                backgroundColor: 'error.light',
                                                            }
                                                        }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>

                    {/* Upload Progress */}
                    {uploading && (
                        <Box sx={{
                            p: 2,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: 1
                        }}>
                            <LinearProgress
                                variant="determinate"
                                value={uploadProgress}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: 'primary.light',
                                    '& .MuiLinearProgress-bar': {
                                        backgroundColor: 'primary.main'
                                    }
                                }}
                            />
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                align="center"
                                sx={{ mt: 1 }}
                            >
                                Uploading... {uploadProgress}%
                            </Typography>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{
                    p: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper'
                }}>
                    <Button
                        onClick={() => onClose(resumes)}
                        variant="outlined"
                        sx={{
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': {
                                borderColor: 'primary.dark',
                                backgroundColor: 'primary.light',
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>

                {/* New Folder Dialog */}
                <Dialog
                    open={showNewFolderDialog}
                    onClose={() => setShowNewFolderDialog(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            boxShadow: 24,
                        }
                    }}
                >
                    <DialogTitle sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        pb: 2
                    }}>
                        Create New Folder
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Folder Name"
                            fullWidth
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            error={!newFolderName.trim()}
                            helperText={!newFolderName.trim() ? 'Folder name is required' : ''}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                    '&:hover fieldset': {
                                        borderColor: 'primary.main',
                                    },
                                }
                            }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Button
                            onClick={() => setShowNewFolderDialog(false)}
                            variant="outlined"
                            sx={{
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                '&:hover': {
                                    borderColor: 'primary.dark',
                                    backgroundColor: 'primary.light',
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateFolder}
                            variant="contained"
                            disabled={!newFolderName.trim()}
                            sx={{
                                backgroundColor: 'primary.main',
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                }
                            }}
                        >
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>
            </Dialog>
        </>
    );
};

export default ResumeManager; 