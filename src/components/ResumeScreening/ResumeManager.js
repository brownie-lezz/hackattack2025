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
    ListItemButton,
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
    Visibility as VisibilityIcon,
    ArrowBack as ArrowBackIcon,
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
            console.log('Fetching resumes with params:', {
                path: currentFolder ? 'original' : null,
                subdir: currentFolder || null
            });

            const response = await axios.get('http://localhost:8000/api/resumes', {
                params: {
                    path: 'original',  // Always fetch from original resumes
                    subdir: currentFolder || null
                }
            });
            console.log('Raw API Response:', response.data);

            // Process the response data to maintain the nested structure
            const processedResumes = Array.isArray(response.data) ? response.data.map(item => {
                console.log('Processing item:', item);

                // If the item is a directory, recursively process its items
                if (item.type === 'directory' && Array.isArray(item.items)) {
                    return {
                        ...item,
                        items: item.items.map(subItem => ({
                            ...subItem,
                            path: `${item.path}/${subItem.name}`
                        }))
                    };
                }

                return item;
            }) : [];

            console.log('Processed resumes:', processedResumes);
            setResumes(processedResumes);
        } catch (err) {
            console.error('Error fetching resumes:', err);
            setError(err.message || 'Failed to fetch resumes');
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
            console.log('Selected file:', {
                name: file.name,
                type: file.type,
                size: file.size
            });
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        try {
            setUploading(true);
            setError('');
            const formData = new FormData();
            formData.append('file', selectedFile);

            console.log('Uploading file:', {
                name: selectedFile.name,
                type: selectedFile.type,
                size: selectedFile.size
            });

            const response = await axios.post('http://localhost:8000/api/upload', formData, {
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

            console.log('Upload response:', response.data);
            await fetchResumes();
            setSelectedFile(null);
            setUploadProgress(0);
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload file: ' + (err.response?.data?.detail || err.message || 'Unknown error'));
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (resumeId) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            setError(null);
            await axios.delete(`http://localhost:8000/api/resumes/${resumeId}`);
            await fetchResumes();
        } catch (err) {
            setError('Failed to delete item. Please try again.');
            console.error('Error deleting item:', err);
        }
    };

    const handleDownload = async (resumeId) => {
        try {
            setError(null);
            const response = await axios.get(`http://localhost:8000/api/resumes/${resumeId}/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `resume-${resumeId}`);
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
            await axios.post('http://localhost:8000/api/resumes/folders', {
                name: newFolderName,
                parentId: currentFolder
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
        // If we're already in a folder, append the new folder name
        // Otherwise, just use the folder name
        const newPath = currentFolder ? `${currentFolder}/${folderName}` : folderName;

        // Prevent duplicate folder names in the path
        const pathParts = newPath.split('/');
        const uniquePathParts = pathParts.filter((part, index) => pathParts.indexOf(part) === index);
        const finalPath = uniquePathParts.join('/');

        console.log('Navigating to folder:', finalPath);
        setCurrentFolder(finalPath);
        fetchResumes();
    };

    const handleBackClick = () => {
        // Split the path and remove the last part
        const parts = currentFolder.split('/');
        parts.pop();
        const newPath = parts.join('/');
        console.log('Navigating back to:', newPath);
        setCurrentFolder(newPath);
        fetchResumes();
    };

    const handleItemSelect = (item) => {
        console.log('Item selected:', item);
        if (item.type === 'directory') {
            // If it's a directory, select all files in that directory
            const folderPath = currentFolder ? `${currentFolder}/${item.name}` : item.name;
            console.log('Selecting folder:', folderPath);

            // Get all files in the directory recursively
            const getAllFiles = async (path) => {
                try {
                    const response = await fetch(`http://localhost:8000/api/resumes?path=original&subdir=${encodeURIComponent(path)}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch directory contents');
                    }
                    const items = await response.json();

                    let files = [];
                    for (const subItem of items) {
                        if (subItem.type === 'file') {
                            files.push({
                                id: subItem.id,
                                name: subItem.name,
                                path: subItem.path,
                                type: 'file',
                                uploadDate: subItem.uploadDate
                            });
                        } else if (subItem.type === 'directory') {
                            const subPath = path ? `${path}/${subItem.name}` : subItem.name;
                            const subFiles = await getAllFiles(subPath);
                            files = files.concat(subFiles);
                        }
                    }
                    return files;
                } catch (error) {
                    console.error('Error getting files from directory:', error);
                    return [];
                }
            };

            // Get all files in the directory
            getAllFiles(folderPath).then(files => {
                console.log('Files in directory:', files);

                // Check if all files are already selected
                const allSelected = files.every(file =>
                    selectedResumes.some(selected => selected.id === file.id)
                );

                if (allSelected) {
                    // If all files are selected, deselect them all
                    files.forEach(file => {
                        onResumeSelect(file);
                    });
                } else {
                    // If not all files are selected, select only the unselected ones
                    files.forEach(file => {
                        const isSelected = selectedResumes.some(selected => selected.id === file.id);
                        if (!isSelected) {
                            onResumeSelect(file);
                        }
                    });
                }
            });
        } else {
            // If it's a file, select it
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
                                startIcon={<ArrowBackIcon />}
                                onClick={handleBackClick}
                                sx={{
                                    color: 'primary.main',
                                    '&:hover': {
                                        backgroundColor: 'primary.light',
                                    }
                                }}
                            >
                                Back
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
                                            checked={selectedItems.has(resume.id) || selectedResumes?.some(r => r.id === resume.id)}
                                            onChange={() => handleItemSelect(resume)}
                                        />
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {resume.type === 'directory' ? <FolderIcon color="primary" /> : <DescriptionIcon />}
                                                    {resume.name}
                                                </Box>
                                            }
                                            secondary={resume.type === 'file' ? `Uploaded: ${new Date(resume.uploadDate).toLocaleDateString()}` : 'Folder'}
                                            onClick={() => resume.type === 'directory' && handleFolderClick(resume.name)}
                                            sx={{
                                                cursor: resume.type === 'directory' ? 'pointer' : 'default',
                                                '& .MuiListItemText-primary': {
                                                    color: 'text.primary',
                                                    fontWeight: resume.type === 'directory' ? 600 : 400
                                                }
                                            }}
                                        />
                                        <ListItemSecondaryAction>
                                            {resume.type === 'file' && (
                                                <>
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
                                                </>
                                            )}
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